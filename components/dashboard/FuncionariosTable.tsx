"use client";
// components/dashboard/FuncionariosTable.tsx
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

const roleLabels: Record<string, string> = {
  adm_rh: "ADM RH",
  supervisor: "Supervisor",
  coordenador: "Coordenador",
};

export default function FuncionariosTable() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("nome_completo");
      setProfiles(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-700">Funcionários</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-6 py-3 font-medium text-slate-600">Nome</th>
              <th className="text-left px-6 py-3 font-medium text-slate-600">Matrícula</th>
              <th className="text-left px-6 py-3 font-medium text-slate-600">Cargo</th>
              <th className="text-left px-6 py-3 font-medium text-slate-600">Perfil</th>
              <th className="text-left px-6 py-3 font-medium text-slate-600">Status</th>
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
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">Inativo</span>
                  )}
                </td>
              </tr>
            ))}
            {profiles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  Nenhum funcionário cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
