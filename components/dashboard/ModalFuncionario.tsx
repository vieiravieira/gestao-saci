"use client";
// components/dashboard/ModalFuncionario.tsx
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Role } from "@/types";
import { X } from "lucide-react";

interface Props {
  perfil: Profile | null;
  onClose: () => void;
  onSaved: () => void;
  todosProfiles: Profile[];
}

export default function ModalFuncionario({ perfil, onClose, onSaved, todosProfiles }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [form, setForm] = useState({
    nome_completo: perfil?.nome_completo ?? "",
    matricula: perfil?.matricula ?? "",
    cargo: perfil?.cargo ?? "",
    role: perfil?.role ?? "supervisor" as Role,
    supervisor_id: perfil?.supervisor_id ?? "",
    coordenador_id: perfil?.coordenador_id ?? "",
    ferias: perfil?.ferias ?? false,
    ativo: perfil?.ativo ?? true,
    email: "",
    senha: "",
  });

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSalvar() {
    setLoading(true);
    setErro(null);

    try {
      if (perfil) {
        // EDITAR
        const { error } = await supabase
          .from("profiles")
          .update({
            nome_completo: form.nome_completo,
            matricula: form.matricula,
            cargo: form.cargo,
            role: form.role,
            supervisor_id: form.supervisor_id || null,
            coordenador_id: form.coordenador_id || null,
            ferias: form.ferias,
            ativo: form.ativo,
          })
          .eq("id", perfil.id);

        if (error) throw error;
      } else {
        // CRIAR — precisa criar no Auth primeiro via API route
        const res = await fetch("/api/funcionarios/criar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            senha: form.senha,
            nome_completo: form.nome_completo,
            matricula: form.matricula,
            cargo: form.cargo,
            role: form.role,
            supervisor_id: form.supervisor_id || null,
            coordenador_id: form.coordenador_id || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erro ao criar funcionário");
      }

      onSaved();
    } catch (e: any) {
      setErro(e.message ?? "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  const supervisores = todosProfiles.filter((p) => p.role === "supervisor");
  const coordenadores = todosProfiles.filter((p) => p.role === "coordenador");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">
            {perfil ? "Editar Funcionário" : "Novo Funcionário"}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {!perfil && (
            <>
              <Field label="E-mail">
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                  className={inputCls} placeholder="email@exemplo.com" />
              </Field>
              <Field label="Senha inicial">
                <input type="password" value={form.senha} onChange={(e) => set("senha", e.target.value)}
                  className={inputCls} placeholder="Mínimo 6 caracteres" />
              </Field>
            </>
          )}

          <Field label="Nome completo">
            <input type="text" value={form.nome_completo} onChange={(e) => set("nome_completo", e.target.value)}
              className={inputCls} placeholder="Nome Sobrenome" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Matrícula">
              <input type="text" value={form.matricula} onChange={(e) => set("matricula", e.target.value)}
                className={inputCls} placeholder="MAT001" />
            </Field>
            <Field label="Cargo">
              <input type="text" value={form.cargo} onChange={(e) => set("cargo", e.target.value)}
                className={inputCls} placeholder="Ex: Assistente" />
            </Field>
          </div>

          <Field label="Perfil (role)">
            <select value={form.role} onChange={(e) => set("role", e.target.value as Role)} className={inputCls}>
              <option value="supervisor">Supervisor</option>
              <option value="coordenador">Coordenador</option>
              <option value="adm_rh">ADM RH</option>
            </select>
          </Field>

          <Field label="Supervisor responsável (opcional)">
            <select value={form.supervisor_id} onChange={(e) => set("supervisor_id", e.target.value)} className={inputCls}>
              <option value="">— Nenhum —</option>
              {supervisores.map((s) => (
                <option key={s.id} value={s.id}>{s.nome_completo}</option>
              ))}
            </select>
          </Field>

          <Field label="Coordenador responsável (opcional)">
            <select value={form.coordenador_id} onChange={(e) => set("coordenador_id", e.target.value)} className={inputCls}>
              <option value="">— Nenhum —</option>
              {coordenadores.map((c) => (
                <option key={c.id} value={c.id}>{c.nome_completo}</option>
              ))}
            </select>
          </Field>

          {perfil && (
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={form.ativo} onChange={(e) => set("ativo", e.target.checked)}
                  className="w-4 h-4 rounded" />
                Ativo
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={form.ferias} onChange={(e) => set("ferias", e.target.checked)}
                  className="w-4 h-4 rounded" />
                Em férias
              </label>
            </div>
          )}

          {erro && (
            <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2">{erro}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
