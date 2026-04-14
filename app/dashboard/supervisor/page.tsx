// app/dashboard/supervisor/page.tsx
import { createClient } from "@/lib/supabase/server";
import StatsCard from "@/components/dashboard/StatsCard";

export default async function SupervisorPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nome_completo")
    .eq("user_id", user!.id)
    .single();

  const [{ count: totalEquipe }, { data: ausentes }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("supervisor_id", profile?.id)
      .eq("ativo", true),
    supabase
      .from("registro_presenca")
      .select("profiles(nome_completo)")
      .eq("status", "ausente")
      .gte("data", new Date().toISOString().split("T")[0]),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Painel Supervisor</h1>
        <p className="text-slate-500 mt-1">Olá, {profile?.nome_completo}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard title="Membros na Equipe" value={totalEquipe ?? 0} color="blue" />
        <StatsCard title="Ausências Hoje" value={ausentes?.length ?? 0} color="red" />
      </div>

      {ausentes && ausentes.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h2 className="font-semibold text-red-800 mb-2">Ausências hoje</h2>
          <ul className="space-y-1">
            {ausentes.map((a: any, i: number) => (
              <li key={i} className="text-red-700 text-sm">
                • {a.profiles?.nome_completo}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-700 mb-4">Ações rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          <a href="/dashboard/supervisor/escala" className="block p-4 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 transition-colors">
            <p className="font-medium text-slate-700">📅 Ver Escala</p>
            <p className="text-xs text-slate-500 mt-1">Calendário da equipe</p>
          </a>
          <a href="/dashboard/supervisor/presenca" className="block p-4 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 transition-colors">
            <p className="font-medium text-slate-700">✅ Presenças</p>
            <p className="text-xs text-slate-500 mt-1">Validar justificativas</p>
          </a>
          <a href="/dashboard/supervisor/desempenho" className="block p-4 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 transition-colors">
            <p className="font-medium text-slate-700">📊 Desempenho</p>
            <p className="text-xs text-slate-500 mt-1">Métricas da equipe</p>
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
