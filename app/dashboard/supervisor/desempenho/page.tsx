"use client";
// app/dashboard/supervisor/desempenho/page.tsx
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, subWeeks, startOfWeek, endOfWeek, eachWeekOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import GraficosPresenca from "@/components/dashboard/GraficosPresenca";

export default function DesempenhoPage() {
  const [loading, setLoading] = useState(true);
  const [barData, setBarData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [stats, setStats] = useState({ presente: 0, ausente: 0, justificado: 0, total: 0 });
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles").select("id").eq("user_id", user.id).single();
      if (!profile) return;

      const { data: membros } = await supabase
        .from("profiles").select("id").eq("supervisor_id", profile.id);
      const ids = membros?.map((m: any) => m.id) ?? [];
      if (ids.length === 0) { setLoading(false); return; }

      const inicio = subWeeks(new Date(), 8);
      const { data: registros } = await supabase
        .from("registro_presenca")
        .select("data, status")
        .in("profile_id", ids)
        .gte("data", format(inicio, "yyyy-MM-dd"));

      if (!registros) { setLoading(false); return; }

      // Agrupa por semana
      const semanas = eachWeekOfInterval({ start: inicio, end: new Date() }, { weekStartsOn: 1 });
      const bar = semanas.map((semana) => {
        const fim = endOfWeek(semana, { weekStartsOn: 1 });
        const da = format(semana, "yyyy-MM-dd");
        const ate = format(fim, "yyyy-MM-dd");
        const semanaRegs = registros.filter((r) => r.data >= da && r.data <= ate);
        return {
          label: format(semana, "dd/MM", { locale: ptBR }),
          presente: semanaRegs.filter((r) => r.status === "presente").length,
          ausente: semanaRegs.filter((r) => r.status === "ausente").length,
          justificado: semanaRegs.filter((r) => r.status === "justificado").length,
        };
      });

      const totalPresente = registros.filter(r => r.status === "presente").length;
      const totalAusente = registros.filter(r => r.status === "ausente").length;
      const totalJustificado = registros.filter(r => r.status === "justificado").length;
      const total = registros.length;

      setBarData(bar);
      setPieData([
        { name: "Presente", value: totalPresente, color: "#22c55e" },
        { name: "Ausente", value: totalAusente, color: "#ef4444" },
        { name: "Justificado", value: totalJustificado, color: "#f59e0b" },
      ]);
      setStats({ presente: totalPresente, ausente: totalAusente, justificado: totalJustificado, total });
      setLoading(false);
    }
    load();
  }, []);

  const taxa = stats.total > 0
    ? Math.round((stats.presente / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Desempenho da Equipe</h1>
        <p className="text-slate-500 mt-1">Últimas 8 semanas</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
              <p className="text-3xl font-bold text-blue-600">{taxa}%</p>
              <p className="text-sm text-slate-500 mt-1">Taxa de presença</p>
            </div>
            <div className="bg-green-50 rounded-xl border border-green-200 p-5 text-center">
              <p className="text-3xl font-bold text-green-600">{stats.presente}</p>
              <p className="text-sm text-green-600 mt-1">Presenças</p>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-200 p-5 text-center">
              <p className="text-3xl font-bold text-red-600">{stats.ausente}</p>
              <p className="text-sm text-red-600 mt-1">Ausências</p>
            </div>
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 text-center">
              <p className="text-3xl font-bold text-amber-600">{stats.justificado}</p>
              <p className="text-sm text-amber-600 mt-1">Justificadas</p>
            </div>
          </div>

          <GraficosPresenca barData={barData} pieData={pieData} />
        </>
      )}
    </div>
  );
}
