"use client";
// app/dashboard/adm-rh/escalas/page.tsx
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Escala, Profile } from "@/types";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import ModalEscala from "@/components/escalas/ModalEscala";
import ModalMembros from "@/components/escalas/ModalMembros";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function EscalasPage() {
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalEscala, setModalEscala] = useState(false);
  const [modalMembros, setModalMembros] = useState(false);
  const [editando, setEditando] = useState<Escala | null>(null);
  const [escalaMembrosSel, setEscalaMembrosSel] = useState<Escala | null>(null);
  const supabase = createClient();

  async function load() {
    const [{ data: e }, { data: p }] = await Promise.all([
      supabase.from("escalas").select("*").order("nome"),
      supabase.from("profiles").select("*").eq("ativo", true).order("nome_completo"),
    ]);
    setEscalas(e ?? []);
    setProfiles(p ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function deletar(id: string) {
    if (!confirm("Deseja excluir esta escala?")) return;
    await supabase.from("escalas").delete().eq("id", id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Escalas</h1>
          <p className="text-slate-500 mt-1">Gerencie turnos e horários</p>
        </div>
        <button
          onClick={() => { setEditando(null); setModalEscala(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} /> Nova Escala
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : escalas.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-slate-500">Nenhuma escala cadastrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {escalas.map((e) => (
            <div key={e.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: e.cor }}
                  />
                  <div>
                    <h3 className="font-semibold text-slate-800">{e.nome}</h3>
                    <p className="text-sm text-slate-500">
                      {e.horario_inicio} → {e.horario_fim}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEscalaMembrosSel(e); setModalMembros(true); }}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                    title="Gerenciar membros"
                  >
                    <Users size={15} />
                  </button>
                  <button
                    onClick={() => { setEditando(e); setModalEscala(true); }}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                    title="Editar"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => deletar(e.id)}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-red-600 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="flex gap-1 flex-wrap mb-3">
                {DIAS.map((d, i) => (
                  <span
                    key={i}
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      e.dias_semana?.includes(i)
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {d}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Users size={14} />
                <span>{e.membros?.length ?? 0} membros</span>
                <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${
                  e.ativo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                }`}>
                  {e.ativo ? "Ativa" : "Inativa"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalEscala && (
        <ModalEscala
          escala={editando}
          onClose={() => setModalEscala(false)}
          onSaved={() => { setModalEscala(false); load(); }}
        />
      )}

      {modalMembros && escalaMembrosSel && (
        <ModalMembros
          escala={escalaMembrosSel}
          todosProfiles={profiles}
          onClose={() => setModalMembros(false)}
          onSaved={() => { setModalMembros(false); load(); }}
        />
      )}
    </div>
  );
}
