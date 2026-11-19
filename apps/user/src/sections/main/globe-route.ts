import type { Vector3 } from "three";

export function createGlobeRoutePoints(start: Vector3, end: Vector3) {
  const radius = start.length();
  const direction = start.clone().normalize();
  const destination = end.clone().normalize();
  const axis = direction.clone().cross(destination);
  const angle = direction.angleTo(destination);
  const altitude = Math.min(4, start.distanceTo(end) / 2.8);

  // Coincident and antipodal endpoints need a stable great-circle plane.
  if (axis.lengthSq() < 1e-12) {
    const reference = direction
      .clone()
      .set(
        Math.abs(direction.y) < 0.9 ? 0 : 1,
        Math.abs(direction.y) < 0.9 ? 1 : 0,
        0
      );
    axis.crossVectors(direction, reference);
  }
  axis.normalize();

  const segments = 64;
  return Array.from({ length: segments + 1 }, (_, sample) => {
    if (sample === 0) return start.clone();
    if (sample === segments) return end.clone();
    const progress = sample / segments;
    return direction
      .clone()
      .applyAxisAngle(axis, angle * progress)
      .multiplyScalar(radius + Math.sin(progress * Math.PI) * altitude);
  });
}
