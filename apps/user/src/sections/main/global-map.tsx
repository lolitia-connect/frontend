"use client";

import { useTheme } from "@workspace/ui/integrations/theme";
import { useEffect, useRef } from "react";
import countries from "world-atlas/countries-110m.json";
import { createGlobeRoutePoints } from "./globe-route";
import "./global-map.css";

interface MapLocation {
  coordinates: [number, number];
  isHub?: boolean;
  key: string;
}

const MAP_LOCATIONS: MapLocation[] = [
  { key: "hong_kong", coordinates: [114.1694, 22.3193], isHub: true },
  { key: "tokyo", coordinates: [139.6917, 35.6895], isHub: true },
  { key: "los_angeles", coordinates: [-118.2437, 34.0522] },
  { key: "london", coordinates: [-0.1276, 51.5072] },
  { key: "paris", coordinates: [2.3522, 48.8566] },
  { key: "frankfurt", coordinates: [8.6821, 50.1109] },
  { key: "delhi", coordinates: [77.1025, 28.7041] },
  { key: "singapore", coordinates: [103.8198, 1.3521] },
  { key: "macau", coordinates: [113.5439, 22.1987] },
  { key: "sofia", coordinates: [23.3219, 42.6977] },
  { key: "manila", coordinates: [120.9842, 14.5995] },
  { key: "changhua", coordinates: [120.544, 24.0756] },
];

const MAP_ROUTES = [
  { from: "hong_kong", to: "london" },
  { from: "hong_kong", to: "paris" },
  { from: "hong_kong", to: "frankfurt" },
  { from: "hong_kong", to: "delhi" },
  { from: "hong_kong", to: "singapore" },
  { from: "hong_kong", to: "macau" },
  { from: "hong_kong", to: "tokyo" },
  { from: "tokyo", to: "los_angeles" },
  { from: "tokyo", to: "frankfurt" },
  { from: "tokyo", to: "delhi" },
  { from: "tokyo", to: "singapore" },
  { from: "tokyo", to: "hong_kong" },
  { from: "hong_kong", to: "sofia" },
  { from: "hong_kong", to: "manila" },
  { from: "hong_kong", to: "changhua" },
];

const ROUTE_COLOR_TOKENS = [
  "--globe-route-yellow",
  "--globe-route-green",
  "--globe-route-blue",
];

function getMapLocation(key: string) {
  const location = MAP_LOCATIONS.find((item) => item.key === key);
  if (!location) throw new Error(`Unknown map location: ${key}`);
  return location;
}

export function GlobalMap({ paused = false }: { paused?: boolean }) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;
    container.dataset.state = "loading";

    const initialize = async () => {
      const [THREE, { default: ThreeGlobe }, { OrbitControls }, { feature }] =
        await Promise.all([
          import("three"),
          import("three-globe"),
          import("three/addons/controls/OrbitControls.js"),
          import("topojson-client"),
        ]);
      if (disposed) return;

      const isDark = resolvedTheme === "dark";
      const theme = getComputedStyle(container);
      const colorContext = document.createElement("canvas").getContext("2d", {
        colorSpace: "srgb",
        willReadFrequently: true,
      });
      if (!colorContext) {
        container.dataset.state = "fallback";
        return;
      }
      const palette = new Map<string, string>();
      const colorToken = (name: string) => {
        const cached = palette.get(name);
        if (cached) return cached;
        // WebGL cannot resolve CSS variables or OKLCH/color-mix colours.
        // Convert the scoped CSS palette to sRGB before creating materials.
        colorContext.clearRect(0, 0, 1, 1);
        colorContext.fillStyle = theme.getPropertyValue(name).trim();
        colorContext.fillRect(0, 0, 1, 1);
        const [red, green, blue] = colorContext.getImageData(0, 0, 1, 1).data;
        const color = `rgb(${red}, ${green}, ${blue})`;
        palette.set(name, color);
        return color;
      };
      const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.setClearColor(0x00_00_00, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1500);
      const topology = countries as never;
      const land = feature(topology, "countries") as unknown as {
        features?: object[];
      };
      const landColor = colorToken("--globe-land");
      const landSideColor = colorToken("--globe-land-side");
      const landCapMaterial = new THREE.MeshBasicMaterial({
        color: landColor,
        depthTest: true,
        depthWrite: true,
        side: THREE.DoubleSide,
      });
      const landSideMaterial = new THREE.MeshBasicMaterial({
        color: landSideColor,
        depthTest: true,
        depthWrite: true,
        side: THREE.DoubleSide,
      });
      const globe = new ThreeGlobe({ animateIn: false })
        .showAtmosphere(true)
        .atmosphereColor(colorToken("--globe-atmosphere"))
        .atmosphereAltitude(isDark ? 0.13 : 0.16)
        .polygonsData(land.features ?? [])
        .polygonCapMaterial(() => landCapMaterial)
        .polygonSideMaterial(() => landSideMaterial)
        .polygonStrokeColor(() => colorToken("--globe-border"))
        .polygonAltitude(0.01)
        .polygonsTransitionDuration(0)
        .pointsData(MAP_LOCATIONS)
        .pointLat((location) => (location as MapLocation).coordinates[1])
        .pointLng((location) => (location as MapLocation).coordinates[0])
        .pointColor((location) =>
          (location as MapLocation).isHub
            ? colorToken("--globe-hub")
            : colorToken("--globe-node")
        )
        .pointRadius((location) =>
          (location as MapLocation).isHub ? 0.65 : 0.38
        )
        .pointAltitude(0.016)
        .pointsMerge(true);

      globe.globeMaterial(
        new THREE.MeshPhongMaterial({
          color: colorToken("--globe-ocean"),
          emissive: colorToken("--globe-emissive"),
          emissiveIntensity: isDark ? 0.12 : 0.08,
          shininess: isDark ? 8 : 24,
          specular: colorToken("--globe-specular"),
        })
      );
      globe.pauseAnimation();
      scene.add(globe);
      scene.add(
        new THREE.AmbientLight(
          colorToken("--globe-ambient-light"),
          isDark ? 2 : 1.65
        )
      );
      const light = new THREE.DirectionalLight(
        colorToken("--globe-directional-light"),
        isDark ? 2.5 : 1.8
      );
      light.position.set(-200, 300, 400);
      scene.add(light);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.autoRotateSpeed = 0.48;
      controls.minPolarAngle = Math.PI * 0.24;
      controls.maxPolarAngle = Math.PI * 0.65;
      renderer.domElement.style.touchAction = "pan-y";

      let isCompactLayout = false;
      const applyGlobeLayout = () => {
        const { width } = container.getBoundingClientRect();
        const nextIsCompactLayout = width < 1024;
        isCompactLayout = nextIsCompactLayout;
        const globeOffsetY = isCompactLayout ? -108 : -120;
        const targetWidthRatio = isCompactLayout ? 0.92 : 0.48;
        const horizontalFov =
          2 *
          Math.atan(
            Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect
          );
        const cameraDistance =
          100 / (targetWidthRatio * Math.tan(horizontalFov / 2));
        const globeAltitude = Math.max(cameraDistance / 100 - 1, 0.5);
        const coordinates = globe.getCoords(24, 112, globeAltitude);
        globe.position.y = globeOffsetY;
        camera.position.set(
          coordinates.x,
          coordinates.y + globeOffsetY,
          coordinates.z
        );
        controls.target.set(0, globeOffsetY + (isCompactLayout ? 92 : 0), 0);
        controls.update();
      };
      applyGlobeLayout();

      const particleGeometry = new THREE.SphereGeometry(0.72, 10, 8);
      const routes = MAP_ROUTES.map((route, index) => {
        const from = getMapLocation(route.from);
        const to = getMapLocation(route.to);
        const source = globe.getCoords(
          from.coordinates[1],
          from.coordinates[0],
          0.016
        );
        const target = globe.getCoords(
          to.coordinates[1],
          to.coordinates[0],
          0.016
        );
        const start = new THREE.Vector3(source.x, source.y, source.z);
        const end = new THREE.Vector3(target.x, target.y, target.z);
        const path = new THREE.CatmullRomCurve3(
          createGlobeRoutePoints(start, end)
        );
        const color = colorToken(
          ROUTE_COLOR_TOKENS[index % ROUTE_COLOR_TOKENS.length]!
        );
        const material = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.45,
        });
        const geometry = new THREE.TubeGeometry(path, 96, 0.13, 4, false);
        const line = new THREE.Mesh(geometry, material);
        const particles = Array.from({ length: 3 }, (_, particle) => {
          const dot = new THREE.Mesh(
            particleGeometry,
            new THREE.MeshBasicMaterial({
              color: particle === 0 ? colorToken("--globe-particle") : color,
              transparent: true,
              opacity: 1 - particle * 0.25,
            })
          );
          dot.scale.setScalar(1 - particle * 0.2);
          globe.add(dot);
          return dot;
        });
        globe.add(line);
        return {
          path,
          geometry,
          material,
          line,
          particles,
          offset: index * 0.73,
        };
      });

      const resize = () => {
        const { width, height } = container.getBoundingClientRect();
        renderer.setSize(width, height);
        camera.aspect = width / Math.max(height, 1);
        camera.updateProjectionMatrix();
        applyGlobeLayout();
      };
      const observer = new ResizeObserver(resize);
      observer.observe(container);
      resize();

      let inView = true;
      const intersection = new IntersectionObserver(([entry]) => {
        inView = entry?.isIntersecting ?? false;
      });
      intersection.observe(container);
      let frame = 0;
      let elapsed = 2;
      let previousTime = 0;
      let renderCount = 0;
      const animate = (time: number) => {
        if (disposed) return;
        frame = requestAnimationFrame(animate);
        const delta = previousTime
          ? Math.min((time - previousTime) / 1000, 0.05)
          : 0;
        previousTime = time;
        if (!inView || document.hidden) return;
        const moving = !(pausedRef.current || reducedMotion.matches);
        if (moving) elapsed += delta;
        controls.autoRotate = moving;
        controls.update(delta);
        let activeRoutes = 0;
        for (const route of routes) {
          const age = (elapsed + route.offset) % 9;
          const visible = age < 6.6;
          route.line.visible = visible;
          if (visible) activeRoutes += 1;
          route.material.opacity =
            0.6 * Math.min(age / 0.7, 1, (6.6 - age) / 0.8);
          route.geometry.setDrawRange(
            0,
            Math.floor(96 * Math.min(age / 0.9, 1)) * 24
          );
          route.particles.forEach((particle, index) => {
            const progress = ((age - 0.5) / 2.6 - index * 0.025) % 1;
            particle.visible = visible && age > 0.6 && progress >= 0;
            if (particle.visible) {
              particle.position.copy(route.path.getPoint(progress));
            }
          });
        }
        renderer.render(scene, camera);
        renderCount += 1;
        if (renderCount % 30 === 0) {
          container.dataset.frame = String(renderCount);
          container.dataset.activeRoutes = String(activeRoutes);
          container.dataset.rotation = camera.position.x.toFixed(2);
        }
      };
      frame = requestAnimationFrame(animate);
      container.dataset.state = "ready";

      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        intersection.disconnect();
        controls.dispose();
        globe._destructor();
        const geometries = new Set<import("three").BufferGeometry>();
        const materials = new Set<import("three").Material>();
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            geometries.add(object.geometry);
            for (const material of Array.isArray(object.material)
              ? object.material
              : [object.material]) {
              materials.add(material);
            }
          }
        });
        for (const geometry of geometries) geometry.dispose();
        for (const material of materials) material.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    };

    initialize().catch(() => {
      cleanup?.();
      if (!disposed) container.dataset.state = "fallback";
    });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [resolvedTheme]);

  return (
    <div
      aria-hidden="true"
      className="landing-globe absolute top-0 left-0 h-[calc(100%+19rem)] w-full lg:left-[18%] lg:h-[calc(100%+17rem)] lg:w-[112%] [&>canvas]:block [&>canvas]:max-w-full"
      ref={containerRef}
    />
  );
}
