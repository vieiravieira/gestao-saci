"use client";
// components/dashboard/GraficosPresenca.tsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

interface BarData {
  label: string;
  presente: number;
  ausente: number;
  justificado: number;
}

interface PieData {
  name: string;
  value: number;
  color: string;
}

interface Props {
  barData: BarData[];
  pieData: PieData[];
}

export default function GraficosPresenca({ barData, pieData }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Barras - presenças por período */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-700 mb-4">Presenças por semana</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            />
            <Bar dataKey="presente" fill="#22c55e" radius={[4, 4, 0, 0]} name="Presente" />
            <Bar dataKey="ausente" fill="#ef4444" radius={[4, 4, 0, 0]} name="Ausente" />
            <Bar dataKey="justificado" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Justificado" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pizza - distribuição */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-700 mb-4">Distribuição de status</h3>
        {pieData.some(d => d.value > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
            Sem dados suficientes
          </div>
        )}
      </div>
    </div>
  );
}
