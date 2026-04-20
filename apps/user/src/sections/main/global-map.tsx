import { useTheme } from "@workspace/ui/integrations/theme";
import { motion } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
} from "react-simple-maps";
import { useTranslation } from "react-i18next";
import worldAtlasUrl from "world-atlas/countries-110m.json?url";

interface MapLocation {
  key: string;
  labelKey: string;
  coordinates: [number, number];
  labelOffset: [number, number];
  isHub?: boolean;
}

interface MapRoute {
  from: string;
  to: string;
  hub: "hong_kong" | "tokyo";
}

const MAP_LOCATIONS: MapLocation[] = [
  {
    key: "hong_kong",
    labelKey: "map_location_hong_kong",
    coordinates: [114.1694, 22.3193],
    labelOffset: [10, -12],
    isHub: true,
  },
  {
    key: "tokyo",
    labelKey: "map_location_tokyo",
    coordinates: [139.6917, 35.6895],
    labelOffset: [10, -12],
    isHub: true,
  },
  {
    key: "los_angeles",
    labelKey: "map_location_los_angeles",
    coordinates: [-118.2437, 34.0522],
    labelOffset: [10, -12],
  },
  {
    key: "london",
    labelKey: "map_location_london",
    coordinates: [-0.1276, 51.5072],
    labelOffset: [10, -12],
  },
  {
    key: "paris",
    labelKey: "map_location_paris",
    coordinates: [2.3522, 48.8566],
    labelOffset: [10, 16],
  },
  {
    key: "frankfurt",
    labelKey: "map_location_frankfurt",
    coordinates: [8.6821, 50.1109],
    labelOffset: [10, -12],
  },
  {
    key: "delhi",
    labelKey: "map_location_delhi",
    coordinates: [77.1025, 28.7041],
    labelOffset: [10, -12],
  },
  {
    key: "singapore",
    labelKey: "map_location_singapore",
    coordinates: [103.8198, 1.3521],
    labelOffset: [10, 16],
  },
  {
    key: "macau",
    labelKey: "map_location_macau",
    coordinates: [113.5439, 22.1987],
    labelOffset: [10, 18],
  },
];

const MAP_ROUTES: MapRoute[] = [
  { from: "hong_kong", to: "london", hub: "hong_kong" },
  { from: "hong_kong", to: "paris", hub: "hong_kong" },
  { from: "hong_kong", to: "frankfurt", hub: "hong_kong" },
  { from: "hong_kong", to: "delhi", hub: "hong_kong" },
  { from: "hong_kong", to: "singapore", hub: "hong_kong" },
  { from: "hong_kong", to: "macau", hub: "hong_kong" },
  { from: "hong_kong", to: "tokyo", hub: "hong_kong" },
  { from: "tokyo", to: "los_angeles", hub: "tokyo" },
  { from: "tokyo", to: "frankfurt", hub: "tokyo" },
  { from: "tokyo", to: "delhi", hub: "tokyo" },
  { from: "tokyo", to: "singapore", hub: "tokyo" },
  { from: "tokyo", to: "hong_kong", hub: "tokyo" },
];

const MAP_LOCATION_LOOKUP = Object.fromEntries(
  MAP_LOCATIONS.map((item) => [item.key, item])
) as Record<string, MapLocation>;

function getMapLocation(key: string): MapLocation {
  const location = MAP_LOCATION_LOOKUP[key];

  if (!location) {
    throw new Error(`Unknown map location: ${key}`);
  }

  return location;
}

export function GlobalMap() {
  const { t } = useTranslation("main");
  const { t: mapT } = useTranslation("main_map");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const colors = {
    land: isDark ? "#3f2b43" : "#f9d7e7",
    landStroke: isDark ? "#7d5069" : "#edafc9",
    routeHongKong: isDark ? "#fb7185" : "#f43f5e",
    routeTokyo: isDark ? "#c084fc" : "#a855f7",
    markerNode: isDark ? "#f9a8d4" : "#ec4899",
    markerHongKong: isDark ? "#fb7185" : "#f43f5e",
    markerTokyo: isDark ? "#c084fc" : "#a855f7",
    markerRing: isDark ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.95)",
    label: isDark ? "#f8fafc" : "#111827",
    labelHalo: isDark ? "#111827" : "#ffffff",
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1 }}
    >
      <motion.h2
        className="mb-2 text-center font-bold text-3xl"
        initial={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        {t("global_map_itle", "Global Connection, Easy and Worry-free")}
      </motion.h2>
      <motion.p
        className="mb-8 text-center text-lg text-muted-foreground"
        initial={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        {t(
          "global_map_description",
          "Explore seamless global connectivity. Choose network services that suit your needs and stay connected anytime, anywhere."
        )}
      </motion.p>
      <motion.div
        animate={{ scale: 1, opacity: 1 }}
        className="overflow-hidden rounded-[2rem] border bg-gradient-to-b from-rose-50/70 via-background to-background p-3 shadow-sm dark:from-rose-950/10 dark:via-background dark:to-background sm:p-5"
        initial={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.25 }}
      >
        <div className="aspect-[16/9] w-full overflow-hidden rounded-[1.5rem] bg-transparent">
          <ComposableMap
            className="size-full"
            height={430}
            projection="geoEqualEarth"
            projectionConfig={{ scale: 175 }}
            width={980}
          >
            <Geographies geography={worldAtlasUrl}>
              {({
                geographies,
              }: {
                geographies: Array<{ rsmKey: string }>;
              }) =>
                geographies.map((geo: { rsmKey: string }) => (
                  <Geography
                    geography={geo}
                    key={geo.rsmKey}
                    style={{
                      default: {
                        fill: colors.land,
                        outline: "none",
                        stroke: colors.landStroke,
                        strokeWidth: 0.45,
                      },
                      hover: {
                        fill: colors.land,
                        outline: "none",
                        stroke: colors.landStroke,
                        strokeWidth: 0.45,
                      },
                      pressed: {
                        fill: colors.land,
                        outline: "none",
                        stroke: colors.landStroke,
                        strokeWidth: 0.45,
                      },
                    }}
                  />
                ))
              }
            </Geographies>

            {MAP_ROUTES.map((route) => {
              const from = getMapLocation(route.from);
              const to = getMapLocation(route.to);

              return (
                <Line
                  from={from.coordinates}
                  key={`${route.from}-${route.to}-${route.hub}`}
                  stroke={
                    route.hub === "hong_kong"
                      ? colors.routeHongKong
                      : colors.routeTokyo
                  }
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                  strokeOpacity={0.72}
                  strokeWidth={1.6}
                  to={to.coordinates}
                />
              );
            })}

            {MAP_LOCATIONS.map((item) => {
              const markerColor = item.isHub
                ? item.key === "tokyo"
                  ? colors.markerTokyo
                  : colors.markerHongKong
                : colors.markerNode;

              return (
                <Marker coordinates={item.coordinates} key={item.key}>
                  <g>
                    <circle
                      fill={markerColor}
                      opacity={0.22}
                      r={item.isHub ? 11 : 8}
                    />
                    <circle
                      fill={markerColor}
                      r={item.isHub ? 4.5 : 3.5}
                      stroke={colors.markerRing}
                      strokeWidth={1.4}
                    />
                    <text
                      fill={colors.label}
                      fontSize={item.isHub ? 12 : 11}
                      fontWeight={item.isHub ? 700 : 600}
                      paintOrder="stroke fill"
                      stroke={colors.labelHalo}
                      strokeLinejoin="round"
                      strokeWidth={4}
                      style={{ userSelect: "none" }}
                      textAnchor={item.labelOffset[0] >= 0 ? "start" : "end"}
                      x={item.labelOffset[0]}
                      y={item.labelOffset[1]}
                    >
                      {mapT(item.labelKey)}
                    </text>
                  </g>
                </Marker>
              );
            })}
          </ComposableMap>
        </div>
      </motion.div>
    </motion.section>
  );
}
