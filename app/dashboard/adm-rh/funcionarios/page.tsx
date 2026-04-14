"use client";
// app/dashboard/adm-rh/funcionarios/page.tsx
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";
import { Plus, Pencil, UserX, UserCheck } from "lucide-react";
import ModalFuncionario from "@/components/dashboard/ModalFuncionario";

export default function FuncionariosPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Profile | null>(null);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("nome_completo");
    setProfiles(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleAtivo(p: Profile) {
    await supabase.from("profiles").update({ ativo: !p.ativo }).eq("id", p.id);
    load();
  }

  function abrirCriar() { setEditando(null); setModalOpen(true); }
  function abrirEditar(p: Profile) { setEditando(p); setModalOpen(true); }

  const roleLabels: Record<string, string> = {
    adm_rh: "ADM RH",
    supervisor: "Supervisor",
    coordenador: "Coordenador",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Funcionários</h1>
          <p className="text-slate-500 mt-1">Gerencie todos os funcionários</p>
        </div>
        <button
          onClick={abrirCriar}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} /> Novo Funcionário
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 font-medium text-slate-600">Nome</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Matrícula</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Cargo</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Perfil</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-slate-800">{p.nome_completo}</td>
                  <td className="px-6 py-3 text-slate-600">{p.matricula}</td>
                  <td className="px-6 py-3 text-slate-600">{p.cargo}</td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {roleLabels[p.role] ?? p.role}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {p.ferias ? (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">Férias</span>
                    ) : p.ativo ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Ativo</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-medium">Inativo</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => abrirEditar(p)}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => toggleAtivo(p)}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-red-600 transition-colors"
                        title={p.ativo ? "Desativar" : "Ativar"}
                      >
                        {p.ativo ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    Nenhum funcionário cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <ModalFuncionario
          perfil={editando}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load(); }}
          todosProfiles={profiles}
        />
      )}
    </div>
  );
}
