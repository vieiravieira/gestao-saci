// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/auth/login");

  // Redireciona para o painel correto baseado na role
  switch (profile.role) {
    case "adm_rh":
      redirect("/dashboard/adm-rh");
    case "supervisor":
      redirect("/dashboard/supervisor");
    case "coordenador":
      redirect("/dashboard/coordenador");
    default:
      redirect("/auth/login");
  }
}
