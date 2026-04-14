"use client";
// app/dashboard/adm-rh/rotas/page.tsx
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Rota } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function RotasPage() {
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Rota | null>(null);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from("rotas").select("*").order("nome");
    setRotas(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function deletar(id: string) {
    if (!confirm("Deseja excluir esta rota?")) return;
    await supabase.from("rotas").delete().eq("id", id);
    load();
  }

  async function salvar(form: Partial<Rota>) {
    if (editando) {
      await supabase.from("rotas").update(form).eq("id", editando.id);
    } else {
      await supabase.from("rotas").insert(form);
    }
    setModalAberto(false);
    setEditando(null);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rotas de Transporte</h1>
          <p className="text-slate-500 mt-1">Gerencie rotas, veículos e horários</p>
        </div>
        <button
          onClick={() => { setEditando(null); setModalAberto(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} /> Nova Rota
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 font-medium text-slate-600">Nome</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Tipo</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Carga horária</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">CREA Centena</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rotas.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-800">{r.nome}</td>
                  <td className="px-6 py-3 text-slate-600">{r.tipo}</td>
                  <td className="px-6 py-3 text-slate-600">{r.carga_horaria}h</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      r.crea_centena ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {r.crea_centena ? "Sim" : "Não"}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      r.ativo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {r.ativo ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditando(r); setModalAberto(true); }}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => deletar(r.id)}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-red-600 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rotas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">Nenhuma rota cadastrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modalAberto && (
        <ModalRota
          rota={editando}
          onClose={() => { setModalAberto(false); setEditando(null); }}
          onSalvar={salvar}
        />
      )}
    </div>
  );
}

function ModalRota({ rota, onClose, onSalvar }: { rota: Rota | null; onClose: () => void; onSalvar: (f: any) => void }) {
  const [form, setForm] = useState({
    nome: rota?.nome ?? "",
    tipo: rota?.tipo ?? "",
    descricao: rota?.descricao ?? "",
    carga_horaria: rota?.carga_horaria ?? 0,
    crea_centena: rota?.crea_centena ?? false,
    ativo: rota?.ativo ?? true,
  });

  const { X } = require("lucide-react");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">{rota ? "Editar Rota" : "Nova Rota"}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {[
            { label: "Nome", key: "nome", type: "text", placeholder: "Ex: Linha Centro" },
            { label: "Tipo", key: "tipo", type: "text", placeholder: "Ex: Ônibus, Van..." },
            { label: "Carga Horária (horas)", key: "carga_horaria", type: "number", placeholder: "Ex: 8" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <input type={type} value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={placeholder} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.crea_centena} onChange={(e) => setForm({ ...form, crea_centena: e.target.checked })} className="w-4 h-4 rounded" />
              CREA Centena
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} className="w-4 h-4 rounded" />
              Ativa
            </label>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
          <button onClick={() => onSalvar(form)} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">Salvar</button>
        </div>
      </div>
    </div>
  );
}
