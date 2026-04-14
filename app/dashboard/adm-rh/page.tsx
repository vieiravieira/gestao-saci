// app/dashboard/adm-rh/page.tsx
import { createClient } from "@/lib/supabase/server";
import StatsCard from "@/components/dashboard/StatsCard";
import FuncionariosTable from "@/components/dashboard/FuncionariosTable";

export default async function AdmRhPage() {
  const supabase = createClient();

  const [{ count: totalFuncionarios }, { count: totalEscalas }, { data: ferias }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("ativo", true),
      supabase.from("escalas").select("*", { count: "exact", head: true }).eq("ativo", true),
      supabase.from("profiles").select("nome_completo").eq("ferias", true).eq("ativo", true),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Painel ADM RH</h1>
        <p className="text-slate-500 mt-1">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Funcionários Ativos"
          value={totalFuncionarios ?? 0}
          color="blue"
        />
        <StatsCard
          title="Escalas Ativas"
          value={totalEscalas ?? 0}
          color="green"
        />
        <StatsCard
          title="Em Férias"
          value={ferias?.length ?? 0}
          color="amber"
        />
      </div>

      {ferias && ferias.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h2 className="font-semibold text-amber-800 mb-2">
            ⚠️ Funcionários em Férias
          </h2>
          <ul className="space-y-1">
            {ferias.map((f, i) => (
              <li key={i} className="text-amber-700 text-sm">
                • {f.nome_completo}
              </li>
            ))}
          </ul>
        </div>
      )}

      <FuncionariosTable />
    </div>
  );
}
