import { CatmullRomCurve3, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { createGlobeRoutePoints } from "./globe-route";

function location(longitude: number, latitude: number) {
  return new Vector3().setFromSphericalCoords(
    101.6,
    ((90 - latitude) * Math.PI) / 180,
    (longitude * Math.PI) / 180
  );
}

function sampleRoute(start: Vector3, end: Vector3) {
  const curve = new CatmullRomCurve3(createGlobeRoutePoints(start, end));
  return Array.from({ length: 1001 }, (_, sample) =>
    curve.getPoint(sample / 1000)
  );
}

describe("globe routes", () => {
  it.each([
    [
      "Hong Kong to London",
      location(114.1694, 22.3193),
      location(-0.1276, 51.5072),
    ],
    [
      "Tokyo to Los Angeles",
      location(139.6917, 35.6895),
      location(-118.2437, 34.0522),
    ],
  ])("keeps %s close to the surface along the shortest great circle", (_, start, end) => {
    const samples = sampleRoute(start, end);
    const angle = start.angleTo(end);
    const normal = start.clone().cross(end).normalize();

    expect(samples[0]!.distanceTo(start)).toBeLessThan(1e-9);
    expect(samples.at(-1)!.distanceTo(end)).toBeLessThan(1e-9);
    samples.forEach((point, index) => {
      expect(point.length()).toBeGreaterThanOrEqual(101.59);
      expect(point.length()).toBeLessThanOrEqual(105.61);
      expect(Math.abs(point.dot(normal))).toBeLessThan(1e-8);
      expect(start.angleTo(point)).toBeCloseTo((angle * index) / 1000, 3);
    });
  });

  it("preserves the small local arc and endpoint coordinates for Hong Kong to Macau", () => {
    const start = location(114.1694, 22.3193);
    const end = location(113.5439, 22.1987);
    const originalStart = start.clone();
    const originalEnd = end.clone();
    const samples = sampleRoute(start, end);
    const oldPeak = 101.6 + (start.distanceTo(end) / 280) * 100;

    expect(Math.max(...samples.map((point) => point.length()))).toBeCloseTo(
      oldPeak,
      5
    );
    expect(samples[0]!.distanceTo(start)).toBeLessThan(1e-9);
    expect(samples.at(-1)!.distanceTo(end)).toBeLessThan(1e-9);
    expect(start).toEqual(originalStart);
    expect(end).toEqual(originalEnd);
  });

  it.each([
    Math.PI,
    Math.PI - 1e-7,
    0,
  ])("avoids origin crossings and spikes for an endpoint angle of %s", (angle) => {
    const start = new Vector3(0, 101.6, 0);
    const end = new Vector3(
      Math.sin(angle) * 101.6,
      Math.cos(angle) * 101.6,
      0
    );
    const samples = sampleRoute(start, end);

    for (const point of samples) {
      expect(Number.isFinite(point.length())).toBe(true);
      expect(point.length()).toBeGreaterThanOrEqual(101.59);
      expect(point.length()).toBeLessThanOrEqual(105.61);
    }
    expect(samples.at(-1)!.distanceTo(end)).toBeLessThan(1e-9);
  });
});
