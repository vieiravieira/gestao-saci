"use client";
// app/dashboard/adm-rh/presencas/page.tsx
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import CalendarioEscala from "@/components/escalas/CalendarioEscala";
import ModalRegistroPresenca from "@/components/presenca/ModalRegistroPresenca";

export default function PresencasAdmPage() {
  const [escalas, setEscalas] = useState<any[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [profileSel, setProfileSel] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [diaSel, setDiaSel] = useState<Date | null>(null);
  const [escalaSel, setEscalaSel] = useState<any>(null);
  const supabase = createClient();

  async function load(pid?: string) {
    const [{ data: e }, { data: p }] = await Promise.all([
      supabase.from("escalas").select("*").eq("ativo", true),
      supabase.from("profiles").select("*").eq("ativo", true).order("nome_completo"),
    ]);
    setEscalas(e ?? []);
    setProfiles(p ?? []);

    const selectedId = pid ?? profileSel;
    if (selectedId) {
      const { data: r } = await supabase
        .from("registro_presenca")
        .select("*")
        .eq("profile_id", selectedId)
        .order("data", { ascending: false });
      setRegistros(r ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleProfileChange(id: string) {
    setProfileSel(id);
    if (id) {
      const { data: r } = await supabase
        .from("registro_presenca")
        .select("*")
        .eq("profile_id", id)
        .order("data", { ascending: false });
      setRegistros(r ?? []);
    } else {
      setRegistros([]);
    }
  }

  function handleDiaClick(data: Date, escala?: any) {
    setDiaSel(data);
    setEscalaSel(escala ?? null);
    setModalAberto(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Registro de Presenças</h1>
        <p className="text-slate-500 mt-1">Visualize e gerencie presenças por funcionário</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <label className="block text-sm font-medium text-slate-700 mb-1">Funcionário</label>
          <select
            value={profileSel}
            onChange={(e) => handleProfileChange(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione um funcionário...</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.nome_completo} ({p.matricula})</option>
            ))}
          </select>
        </div>
      </div>

      {profileSel ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CalendarioEscala
            escalas={escalas}
            registros={registros}
            profileId={profileSel}
            onDiaClick={handleDiaClick}
          />

          {/* Tabela de registros recentes */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-700">Registros recentes</h3>
            </div>
            <div className="overflow-y-auto max-h-96">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-2.5 font-medium text-slate-600">Data</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-600">Status</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-600">Horário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registros.slice(0, 20).map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-600">
                        {format(new Date(r.data + "T00:00:00"), "dd/MM/yy")}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          r.status === "presente" ? "bg-green-100 text-green-700" :
                          r.status === "ausente" ? "bg-red-100 text-red-700" :
                          r.status === "justificado" ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs">
                        {r.hora_entrada ? `${r.hora_entrada}${r.hora_saida ? ` → ${r.hora_saida}` : ""}` : "—"}
                      </td>
                    </tr>
                  ))}
                  {registros.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                        Nenhum registro
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-4xl mb-3">👆</p>
          <p className="text-slate-500">Selecione um funcionário para ver o calendário</p>
        </div>
      )}

      {modalAberto && diaSel && (
        <ModalRegistroPresenca
          data={diaSel}
          escala={escalaSel}
          profileId={profileSel}
          registroExistente={registros.find(
            (r) => r.data === format(diaSel, "yyyy-MM-dd")
          )}
          onClose={() => setModalAberto(false)}
          onSaved={() => { setModalAberto(false); handleProfileChange(profileSel); }}
        />
      )}
    </div>
  );
}
