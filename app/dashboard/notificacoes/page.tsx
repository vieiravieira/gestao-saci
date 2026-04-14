"use client";
// app/dashboard/notificacoes/page.tsx
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Notificacao } from "@/types";

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return;

      const { data } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("para_profile_id", profile.id)
        .order("created_at", { ascending: false });

      setNotificacoes(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function marcarLida(id: string) {
    await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Notificações</h1>
        <p className="text-slate-500 mt-1">Alertas e avisos do sistema</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : notificacoes.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-slate-500">Nenhuma notificação</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notificacoes.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-xl border p-4 flex items-start gap-4 ${
                n.lida ? "border-slate-100 opacity-60" : "border-blue-200"
              }`}
            >
              <div
                className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                  n.lida ? "bg-slate-300" : "bg-blue-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{n.tipo}</p>
                <p className="text-sm text-slate-600 mt-0.5">{n.mensagem}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(n.created_at).toLocaleString("pt-BR")}
                </p>
              </div>
              {!n.lida && (
                <button
                  onClick={() => marcarLida(n.id)}
                  className="text-xs text-blue-600 hover:underline flex-shrink-0"
                >
                  Marcar lida
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
