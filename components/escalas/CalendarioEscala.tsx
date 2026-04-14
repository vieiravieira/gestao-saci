"use client";
// components/escalas/CalendarioEscala.tsx
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Escala, RegistroPresenca } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  escalas: Escala[];
  registros: RegistroPresenca[];
  profileId?: string;
  onDiaClick?: (data: Date, escala?: Escala) => void;
}

export default function CalendarioEscala({ escalas, registros, profileId, onDiaClick }: Props) {
  const [mes, setMes] = useState(new Date());

  const inicio = startOfMonth(mes);
  const fim = endOfMonth(mes);
  const dias = eachDayOfInterval({ start: inicio, end: fim });

  // padding antes do primeiro dia
  const primeiroWeekday = getDay(inicio); // 0=dom
  const padding = Array(primeiroWeekday).fill(null);

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  function getEscalaDoDia(data: Date): Escala | undefined {
    const weekday = getDay(data);
    if (!profileId) return undefined;
    return escalas.find(
      (e) => e.ativo && e.dias_semana?.includes(weekday) && e.membros?.includes(profileId)
    );
  }

  function getRegistroDoDia(data: Date): RegistroPresenca | undefined {
    const dateStr = format(data, "yyyy-MM-dd");
    return registros.find((r) => r.data === dateStr);
  }

  const statusColor: Record<string, string> = {
    presente: "bg-green-500",
    ausente: "bg-red-500",
    justificado: "bg-amber-500",
    pendente: "bg-slate-300",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header mês */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <button onClick={() => setMes(subMonths(mes, 1))} className="p-1.5 hover:bg-slate-100 rounded-lg">
          <ChevronLeft size={18} />
        </button>
        <h2 className="font-semibold text-slate-800 capitalize">
          {format(mes, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <button onClick={() => setMes(addMonths(mes, 1))} className="p-1.5 hover:bg-slate-100 rounded-lg">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 mb-2">
          {diasSemana.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {padding.map((_, i) => <div key={`pad-${i}`} />)}

          {dias.map((dia) => {
            const escala = getEscalaDoDia(dia);
            const registro = getRegistroDoDia(dia);
            const hoje = isSameDay(dia, new Date());

            return (
              <button
                key={dia.toISOString()}
                onClick={() => onDiaClick?.(dia, escala)}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors ${
                  hoje ? "ring-2 ring-blue-500" : ""
                } ${
                  escala
                    ? "hover:opacity-80 cursor-pointer"
                    : "cursor-default"
                }`}
                style={escala ? { backgroundColor: escala.cor + "22" } : undefined}
              >
                <span className={`font-medium ${hoje ? "text-blue-600" : "text-slate-700"}`}>
                  {format(dia, "d")}
                </span>

                {registro && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${statusColor[registro.status] ?? "bg-slate-300"}`} />
                )}

                {escala && !registro && (
                  <span className="w-1.5 h-1.5 rounded-full mt-0.5 bg-slate-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="px-6 py-3 border-t border-slate-100 flex gap-4 flex-wrap">
        {[
          { cor: "bg-green-500", label: "Presente" },
          { cor: "bg-red-500", label: "Ausente" },
          { cor: "bg-amber-500", label: "Justificado" },
          { cor: "bg-slate-300", label: "Pendente" },
        ].map(({ cor, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className={`w-2 h-2 rounded-full ${cor}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
