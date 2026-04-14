// app/dashboard/coordenador/page.tsx
import { createClient } from "@/lib/supabase/server";
import StatsCard from "@/components/dashboard/StatsCard";

export default async function CoordenadorPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nome_completo")
    .eq("user_id", user!.id)
    .single();

  const [{ count: totalSupervisores }, { count: totalFaltas }, { data: feriasProximas }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("coordenador_id", profile?.id)
        .eq("role", "supervisor"),
      supabase
        .from("registro_presenca")
        .select("*", { count: "exact", head: true })
        .eq("status", "ausente"),
      supabase
        .from("profiles")
        .select("nome_completo")
        .eq("ferias", true)
        .eq("ativo", true),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Painel Coordenador</h1>
        <p className="text-slate-500 mt-1">Olá, {profile?.nome_completo}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Supervisores" value={totalSupervisores ?? 0} color="blue" />
        <StatsCard title="Total Faltas" value={totalFaltas ?? 0} color="red" />
        <StatsCard title="Em Férias" value={feriasProximas?.length ?? 0} color="amber" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-700 mb-4">Ações rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          <a href="/dashboard/coordenador/relatorios" className="block p-4 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 transition-colors">
            <p className="font-medium text-slate-700">📋 Relatórios</p>
            <p className="text-xs text-slate-500 mt-1">Por coordenadoria, filtros</p>
          </a>
          <a href="/dashboard/coordenador/faltas" className="block p-4 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 transition-colors">
            <p className="font-medium text-slate-700">❌ Faltas</p>
            <p className="text-xs text-slate-500 mt-1">Validar justificativas</p>
          </a>
          <a href="/dashboard/coordenador/grade" className="block p-4 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 transition-colors">
            <p className="font-medium text-slate-700">🗓️ Grade Escolar</p>
            <p className="text-xs text-slate-500 mt-1">Calendário geral</p>
          </a>
          <a href="/dashboard/notificacoes" className="block p-4 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 transition-colors">
            <p className="font-medium text-slate-700">🔔 Notificações</p>
            <p className="text-xs text-slate-500 mt-1">Alertas pendentes</p>
          </a>
        </div>
      </div>
    </div>
  );
}
