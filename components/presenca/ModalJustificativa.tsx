"use client";
// components/presenca/ModalJustificativa.tsx
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, CheckCircle, XCircle, FileText, Image } from "lucide-react";
import { format } from "date-fns";

interface Props {
  registro: any;
  onClose: () => void;
  onSaved: () => void;
}

export default function ModalJustificativa({ registro, onClose, onSaved }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [justificativa, setJustificativa] = useState(registro.justificativa ?? "");
  const [arquivo, setArquivo] = useState<File | null>(null);

  async function validar(novoStatus: "justificado" | "ausente") {
    setLoading(true);

    let anexo_url = registro.anexo_url;

    // Upload do arquivo se selecionado
    if (arquivo) {
      const ext = arquivo.name.split(".").pop();
      const path = `justificativas/${registro.id}.${ext}`;
      const { data: uploaded } = await supabase.storage
        .from("justificativas")
        .upload(path, arquivo, { upsert: true });

      if (uploaded) {
        const { data: url } = supabase.storage.from("justificativas").getPublicUrl(path);
        anexo_url = url.publicUrl;
      }
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles").select("id").eq("user_id", user!.id).single();

    await supabase.from("registro_presenca").update({
      status: novoStatus,
      justificativa,
      anexo_url,
      validado_por: profile?.id,
    }).eq("id", registro.id);

    setLoading(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Justificativa de Ausência</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-slate-50 rounded-lg p-4 space-y-1">
            <p className="text-sm font-medium text-slate-800">{registro.profiles?.nome_completo}</p>
            <p className="text-xs text-slate-500">
              {format(new Date(registro.data + "T00:00:00"), "dd/MM/yyyy")} ·{" "}
              {registro.escalas?.nome ?? "Sem escala"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Justificativa
            </label>
            <textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Descreva o motivo da ausência..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Anexo (atestado, documento...)
            </label>
            {registro.anexo_url && (
              <a
                href={registro.anexo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-2"
              >
                <FileText size={14} /> Ver anexo atual
              </a>
            )}
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700 file:text-sm cursor-pointer"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-between gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancelar
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => validar("ausente")}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg transition-colors disabled:opacity-60"
            >
              <XCircle size={15} /> Reprovar
            </button>
            <button
              onClick={() => validar("justificado")}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-60"
            >
              <CheckCircle size={15} /> Aprovar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
