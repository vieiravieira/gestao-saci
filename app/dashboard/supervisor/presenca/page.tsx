"use client";
// app/dashboard/supervisor/presenca/page.tsx
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RegistroPresenca, Profile, Escala } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import ModalJustificativa from "@/components/presenca/ModalJustificativa";

export default function SupervisorPresencaPage() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [registroSel, setRegistroSel] = useState<any>(null);
  const supabase = createClient();

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles").select("id").eq("user_id", user.id).single();

    if (!profile) return;

    // Busca registros da equipe do supervisor
    const { data } = await supabase
      .from("registro_presenca")
      .select(`
        *,
        profiles:profile_id (nome_completo, matricula, cargo),
        escalas:escala_id (nome, cor)
      `)
      .in("profile_id", (
        await supabase.from("profiles").select("id").eq("supervisor_id", profile.id)
      ).data?.map((p: any) => p.id) ?? [])
      .order("data", { ascending: false })
      .limit(100);

    setRegistros(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtrados = filtroStatus === "todos"
    ? registros
    : registros.filter((r) => r.status === filtroStatus);

  const statusIcon: Record<string, React.ReactNode> = {
    presente: <CheckCircle size={16} className="text-green-500" />,
    ausente: <XCircle size={16} className="text-red-500" />,
    justificado: <FileText size={16} className="text-amber-500" />,
    pendente: <Clock size={16} className="text-slate-400" />,
  };

  const statusLabel: Record<string, string> = {
    presente: "Presente",
    ausente: "Ausente",
    justificado: "Justificado",
    pendente: "Pendente",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Presenças da Equipe</h1>
        <p className="text-slate-500 mt-1">Valide justificativas e acompanhe presenças</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {["todos", "pendente", "ausente", "justificado", "presente"].map((s) => (
          <button
            key={s}
            onClick={() => setFiltroStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filtroStatus === s
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {s === "todos" ? "Todos" : statusLabel[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-slate-500">Nenhum registro encontrado</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 font-medium text-slate-600">Funcionário</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Data</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Escala</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Horários</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3">
                    <p className="font-medium text-slate-800">{r.profiles?.nome_completo}</p>
                    <p className="text-xs text-slate-500">{r.profiles?.matricula}</p>
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {format(new Date(r.data + "T00:00:00"), "dd/MM/yyyy")}
                  </td>
                  <td className="px-6 py-3">
                    {r.escalas ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.escalas.cor }} />
                        <span className="text-slate-600">{r.escalas.nome}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <span className="flex items-center gap-1.5">
                      {statusIcon[r.status]}
                      <span className="text-slate-700">{statusLabel[r.status]}</span>
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-600 text-xs">
                    {r.hora_entrada && r.hora_saida
                      ? `${r.hora_entrada} → ${r.hora_saida}`
                      : r.hora_entrada
                      ? `Entrada: ${r.hora_entrada}`
                      : "—"}
                  </td>
                  <td className="px-6 py-3">
                    {(r.status === "ausente" || r.status === "pendente" || r.justificativa) && (
                      <button
                        onClick={() => { setRegistroSel(r); setModalAberto(true); }}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        {r.justificativa ? "Ver justificativa" : "Validar"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAberto && registroSel && (
        <ModalJustificativa
          registro={registroSel}
          onClose={() => setModalAberto(false)}
          onSaved={() => { setModalAberto(false); load(); }}
        />
      )}
    </div>
  );
}
