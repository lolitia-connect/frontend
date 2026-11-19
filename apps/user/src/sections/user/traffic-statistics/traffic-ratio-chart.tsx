"use client";

import { useTranslation } from "react-i18next";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface TrafficRatioChartProps {
  download: number;
  upload: number;
}

export default function TrafficRatioChart({
  upload,
  download,
}: TrafficRatioChartProps) {
  const { t } = useTranslation("traffic");

  const data = [
    { name: t("upload", "Upload"), value: upload },
    { name: t("download", "Download"), value: download },
  ];

  // Tonal rose pair rather than the previous green/blue, which belonged to no
  // palette the rest of the app uses.
  const COLORS = ["var(--color-primary-500)", "var(--color-primary-300)"];

  // 格式化流量显示
  const formatTraffic = (value: number) => {
    if (value >= 1024 * 1024 * 1024) {
      return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    if (value >= 1024 * 1024) {
      return `${(value / (1024 * 1024)).toFixed(2)} MB`;
    }
    if (value >= 1024) {
      return `${(value / 1024).toFixed(2)} KB`;
    }
    return `${value} B`;
  };

  return (
    <ResponsiveContainer height={300} width="100%">
      <PieChart>
        <Pie
          cx="50%"
          cy="50%"
          data={data}
          dataKey="value"
          fill="var(--color-primary-500)"
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(1)}%`
          }
          labelLine={false}
          outerRadius={80}
        >
          {data.map((_, index) => (
            <Cell fill={COLORS[index % COLORS.length]} key={`cell-${index}`} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatTraffic(value)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
