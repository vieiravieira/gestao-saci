"use client";
// components/escalas/ModalMembros.tsx
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Escala, Profile } from "@/types";
import { X, Check } from "lucide-react";

interface Props {
  escala: Escala;
  todosProfiles: Profile[];
  onClose: () => void;
  onSaved: () => void;
}

export default function ModalMembros({ escala, todosProfiles, onClose, onSaved }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [membros, setMembros] = useState<string[]>(escala.membros ?? []);
  const [busca, setBusca] = useState("");

  function toggle(id: string) {
    setMembros((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  async function salvar() {
    setLoading(true);
    await supabase.from("escalas").update({ membros }).eq("id", escala.id);
    setLoading(false);
    onSaved();
  }

  const filtrados = todosProfiles.filter((p) =>
    p.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
    p.matricula.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-800">Membros — {escala.nome}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{membros.length} selecionado(s)</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
        </div>

        <div className="px-6 py-3 border-b border-slate-100">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar funcionário..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1">
          {filtrados.map((p) => {
            const selecionado = membros.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  selecionado ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                  selecionado ? "bg-blue-600" : "border-2 border-slate-300"
                }`}>
                  {selecionado && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.nome_completo}</p>
                  <p className="text-xs text-slate-500">{p.matricula} · {p.cargo}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
          <button onClick={salvar} disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-lg transition-colors">
            {loading ? "Salvando..." : "Salvar membros"}
          </button>
        </div>
      </div>
    </div>
  );
}
