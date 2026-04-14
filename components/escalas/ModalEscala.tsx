"use client";
// components/escalas/ModalEscala.tsx
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Escala } from "@/types";
import { X } from "lucide-react";

interface Props {
  escala: Escala | null;
  onClose: () => void;
  onSaved: () => void;
}

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const CORES = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316"];

export default function ModalEscala({ escala, onClose, onSaved }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [form, setForm] = useState({
    nome: escala?.nome ?? "",
    horario_inicio: escala?.horario_inicio ?? "08:00",
    horario_fim: escala?.horario_fim ?? "17:00",
    dias_semana: escala?.dias_semana ?? [1, 2, 3, 4, 5],
    cor: escala?.cor ?? "#3b82f6",
    ativo: escala?.ativo ?? true,
  });

  function toggleDia(dia: number) {
    setForm((prev) => ({
      ...prev,
      dias_semana: prev.dias_semana.includes(dia)
        ? prev.dias_semana.filter((d) => d !== dia)
        : [...prev.dias_semana, dia].sort(),
    }));
  }

  async function handleSalvar() {
    if (!form.nome) { setErro("Informe o nome da escala"); return; }
    if (form.dias_semana.length === 0) { setErro("Selecione ao menos um dia"); return; }

    setLoading(true);
    setErro(null);

    const payload = {
      nome: form.nome,
      horario_inicio: form.horario_inicio,
      horario_fim: form.horario_fim,
      dias_semana: form.dias_semana,
      cor: form.cor,
      ativo: form.ativo,
    };

    const { error } = escala
      ? await supabase.from("escalas").update(payload).eq("id", escala.id)
      : await supabase.from("escalas").insert(payload);

    if (error) { setErro(error.message); setLoading(false); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">{escala ? "Editar Escala" : "Nova Escala"}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome da escala</label>
            <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className={cls} placeholder="Ex: Turno Manhã" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Início</label>
              <input type="time" value={form.horario_inicio} onChange={(e) => setForm({ ...form, horario_inicio: e.target.value })}
                className={cls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fim</label>
              <input type="time" value={form.horario_fim} onChange={(e) => setForm({ ...form, horario_fim: e.target.value })}
                className={cls} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Dias da semana</label>
            <div className="flex gap-2 flex-wrap">
              {DIAS.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDia(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    form.dias_semana.includes(i)
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Cor</label>
            <div className="flex gap-2">
              {CORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, cor: c })}
                  className={`w-7 h-7 rounded-full transition-all ${form.cor === c ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} className="w-4 h-4 rounded" />
            Escala ativa
          </label>

          {erro && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2">{erro}</p>}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
          <button onClick={handleSalvar} disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-lg transition-colors">
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

const cls = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500";
