"use client";
// components/presenca/ModalRegistroPresenca.tsx
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X } from "lucide-react";

interface Props {
  data: Date;
  escala: any;
  profileId: string;
  registroExistente?: any;
  onClose: () => void;
  onSaved: () => void;
}

const STATUS_OPTIONS = [
  { value: "presente", label: "✅ Presente" },
  { value: "ausente", label: "❌ Ausente" },
  { value: "justificado", label: "📄 Justificado" },
  { value: "pendente", label: "⏳ Pendente" },
];

export default function ModalRegistroPresenca({
  data, escala, profileId, registroExistente, onClose, onSaved
}: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    status: registroExistente?.status ?? "presente",
    hora_entrada: registroExistente?.hora_entrada ?? "",
    hora_saida: registroExistente?.hora_saida ?? "",
    justificativa: registroExistente?.justificativa ?? "",
  });

  async function salvar() {
    setLoading(true);

    const payload = {
      profile_id: profileId,
      escala_id: escala?.id ?? null,
      data: format(data, "yyyy-MM-dd"),
      status: form.status,
      hora_entrada: form.hora_entrada || null,
      hora_saida: form.hora_saida || null,
      justificativa: form.justificativa || null,
    };

    if (registroExistente) {
      await supabase.from("registro_presenca").update(payload).eq("id", registroExistente.id);
    } else {
      await supabase.from("registro_presenca").insert(payload);
    }

    setLoading(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-800">
              {registroExistente ? "Editar Registro" : "Novo Registro"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {format(data, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              {escala && ` · ${escala.nome}`}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setForm({ ...form, status: s.value })}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                    form.status === s.value
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {form.status === "presente" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Entrada</label>
                <input type="time" value={form.hora_entrada}
                  onChange={(e) => setForm({ ...form, hora_entrada: e.target.value })}
                  className={cls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Saída</label>
                <input type="time" value={form.hora_saida}
                  onChange={(e) => setForm({ ...form, hora_saida: e.target.value })}
                  className={cls} />
              </div>
            </div>
          )}

          {(form.status === "ausente" || form.status === "justificado") && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Justificativa</label>
              <textarea
                value={form.justificativa}
                onChange={(e) => setForm({ ...form, justificativa: e.target.value })}
                rows={3}
                placeholder="Descreva o motivo..."
                className={`${cls} resize-none`}
              />
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
          <button onClick={salvar} disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-lg transition-colors">
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

const cls = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500";
