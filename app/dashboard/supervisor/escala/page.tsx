"use client";
// app/dashboard/supervisor/escala/page.tsx
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CalendarioEscala from "@/components/escalas/CalendarioEscala";
import { Users } from "lucide-react";

export default function SupervisorEscalaPage() {
  const [escalas, setEscalas] = useState<any[]>([]);
  const [membros, setMembros] = useState<any[]>([]);
  const [membroSel, setMembroSel] = useState<string>("");
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles").select("id").eq("user_id", user.id).single();

      const [{ data: e }, { data: m }] = await Promise.all([
        supabase.from("escalas").select("*").eq("ativo", true),
        supabase.from("profiles").select("*").eq("supervisor_id", profile?.id).eq("ativo", true),
      ]);

      setEscalas(e ?? []);
      setMembros(m ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function selecionarMembro(id: string) {
    setMembroSel(id);
    if (id) {
      const { data } = await supabase
        .from("registro_presenca")
        .select("*")
        .eq("profile_id", id)
        .order("data", { ascending: false });
      setRegistros(data ?? []);
    } else {
      setRegistros([]);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Escala da Equipe</h1>
        <p className="text-slate-500 mt-1">Visualize o calendário de cada membro</p>
      </div>

      {/* Seletor de membros */}
      <div className="flex gap-2 flex-wrap">
        {membros.map((m) => (
          <button
            key={m.id}
            onClick={() => selecionarMembro(m.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              membroSel === m.id
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
              {m.nome_completo[0]}
            </div>
            {m.nome_completo.split(" ")[0]}
          </button>
        ))}
        {membros.length === 0 && !loading && (
          <p className="text-slate-400 text-sm flex items-center gap-2">
            <Users size={16} /> Nenhum membro na equipe
          </p>
        )}
      </div>

      {membroSel ? (
        <CalendarioEscala
          escalas={escalas}
          registros={registros}
          profileId={membroSel}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-4xl mb-3">👆</p>
          <p className="text-slate-500">Selecione um membro para ver o calendário</p>
        </div>
      )}
    </div>
  );
}
