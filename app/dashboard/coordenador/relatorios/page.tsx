"use client";
// app/dashboard/coordenador/relatorios/page.tsx
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import GraficosPresenca from "@/components/dashboard/GraficosPresenca";

export default function RelatoriosCoordenadorPage() {
  const [loading, setLoading] = useState(true);
  const [mes, setMes] = useState(format(new Date(), "yyyy-MM"));
  const [dados, setDados] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => { buscar(); }, [mes]);

  async function buscar() {
    setLoading(true);
    const mesDate = new Date(mes + "-01");
    const ini = format(startOfMonth(mesDate), "yyyy-MM-dd");
    const fim = format(endOfMonth(mesDate), "yyyy-MM-dd");

    const { data: registros } = await supabase
      .from("registro_presenca")
      .select(`
        status,
        data,
        profiles:profile_id (nome_completo, matricula, cargo)
      `)
      .gte("data", ini)
      .lte("data", fim);

    if (!registros) { setLoading(false); return; }

    // Agrupa por funcionário
    const porFunc: Record<string, any> = {};
    for (const r of registros) {
      const nome = (r.profiles as any)?.nome_completo ?? "?";
      if (!porFunc[nome]) porFunc[nome] = { nome, presente: 0, ausente: 0, justificado: 0, total: 0 };
      porFunc[nome][r.status] = (porFunc[nome][r.status] ?? 0) + 1;
      porFunc[nome].total++;
    }

    const tabela = Object.values(porFunc).sort((a: any, b: any) =>
      (b.presente / b.total) - (a.presente / a.total)
    );

    const totalPresente = registros.filter(r => r.status === "presente").length;
    const totalAusente = registros.filter(r => r.status === "ausente").length;
    const totalJustificado = registros.filter(r => r.status === "justificado").length;

    setDados(tabela);
    setBarData(tabela.slice(0, 8).map((f: any) => ({
      label: f.nome.split(" ")[0],
      presente: f.presente,
      ausente: f.ausente,
      justificado: f.justificado,
    })));
    setPieData([
      { name: "Presente", value: totalPresente, color: "#22c55e" },
      { name: "Ausente", value: totalAusente, color: "#ef4444" },
      { name: "Justificado", value: totalJustificado, color: "#f59e0b" },
    ]);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Relatórios</h1>
          <p className="text-slate-500 mt-1">Visão consolidada por coordenadoria</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mês de referência</label>
          <input
            type="month"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-48 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          <GraficosPresenca barData={barData} pieData={pieData} />

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-700">Resumo por funcionário</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 font-medium text-slate-600">Funcionário</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Presenças</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Ausências</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Justificadas</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Taxa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dados.map((f: any, i: number) => {
                  const taxa = f.total > 0 ? Math.round((f.presente / f.total) * 100) : 0;
                  return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium text-slate-800">{f.nome}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-medium">{f.presente}</td>
                      <td className="px-4 py-3 text-center text-red-600 font-medium">{f.ausente}</td>
                      <td className="px-4 py-3 text-center text-amber-600 font-medium">{f.justificado}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          taxa >= 80 ? "bg-green-100 text-green-700" :
                          taxa >= 60 ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {taxa}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {dados.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                      Nenhum dado para o período selecionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
