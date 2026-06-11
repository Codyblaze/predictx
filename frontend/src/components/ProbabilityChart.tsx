"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export function ProbabilityChart({ yesPercent }: { yesPercent: number }) {
  const data = [
    { name: "YES", value: yesPercent },
    { name: "NO", value: 100 - yesPercent },
  ];

  return (
    <div className="card space-y-3">
      <h3 className="font-semibold">Market Distribution</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            <Cell fill="#00C896" />
            <Cell fill="#EF4444" />
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#111827",
              border: "1px solid #1F2937",
              borderRadius: "8px",
              color: "#F9FAFB",
            }}
            formatter={(v) => [`${v}%`]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 text-sm">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-x1-green" /> YES
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" /> NO
        </span>
      </div>
    </div>
  );
}
