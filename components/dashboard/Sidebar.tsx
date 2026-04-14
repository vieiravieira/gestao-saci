"use client";
// components/dashboard/Sidebar.tsx
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";
import {
  LayoutDashboard, Users, CalendarDays, CheckSquare,
  Bell, BarChart2, Map, LogOut, ChevronRight,
} from "lucide-react";

interface SidebarProps {
  profile: Profile | null;
}

type NavItem = { label: string; href: string; icon: React.ReactNode };

const admLinks: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/adm-rh", icon: <LayoutDashboard size={18} /> },
  { label: "Funcionários", href: "/dashboard/adm-rh/funcionarios", icon: <Users size={18} /> },
  { label: "Escalas", href: "/dashboard/adm-rh/escalas", icon: <CalendarDays size={18} /> },
  { label: "Presenças", href: "/dashboard/adm-rh/presencas", icon: <CheckSquare size={18} /> },
  { label: "Notificações", href: "/dashboard/notificacoes", icon: <Bell size={18} /> },
  { label: "Relatórios", href: "/dashboard/adm-rh/relatorios", icon: <BarChart2 size={18} /> },
  { label: "Rotas", href: "/dashboard/adm-rh/rotas", icon: <Map size={18} /> },
];

const supervisorLinks: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/supervisor", icon: <LayoutDashboard size={18} /> },
  { label: "Escala", href: "/dashboard/supervisor/escala", icon: <CalendarDays size={18} /> },
  { label: "Presenças", href: "/dashboard/supervisor/presenca", icon: <CheckSquare size={18} /> },
  { label: "Desempenho", href: "/dashboard/supervisor/desempenho", icon: <BarChart2 size={18} /> },
  { label: "Notificações", href: "/dashboard/notificacoes", icon: <Bell size={18} /> },
];

const coordenadorLinks: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/coordenador", icon: <LayoutDashboard size={18} /> },
  { label: "Grade Escolar", href: "/dashboard/coordenador/grade", icon: <CalendarDays size={18} /> },
  { label: "Faltas", href: "/dashboard/coordenador/faltas", icon: <CheckSquare size={18} /> },
  { label: "Relatórios", href: "/dashboard/coordenador/relatorios", icon: <BarChart2 size={18} /> },
  { label: "Notificações", href: "/dashboard/notificacoes", icon: <Bell size={18} /> },
];

const roleLabels: Record<string, string> = {
  adm_rh: "ADM RH",
  supervisor: "Supervisor",
  coordenador: "Coordenador",
};

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const links =
    profile?.role === "adm_rh"
      ? admLinks
      : profile?.role === "supervisor"
      ? supervisorLinks
      : coordenadorLinks;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <aside className="w-64 bg-slate-900 flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <h1 className="text-white font-bold text-lg">Gestão SACI</h1>
        <p className="text-slate-400 text-xs mt-0.5">
          {profile ? roleLabels[profile.role] : ""}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {profile?.nome_completo?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {profile?.nome_completo ?? "Usuário"}
            </p>
            <p className="text-slate-400 text-xs">{profile?.matricula ?? ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-slate-400 hover:text-white text-sm px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}
