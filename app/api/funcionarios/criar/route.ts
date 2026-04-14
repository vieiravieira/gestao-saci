// app/api/funcionarios/criar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  // Verifica se quem chama é ADM RH
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("user_id", user.id).single();
  if (profile?.role !== "adm_rh") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const { email, senha, nome_completo, matricula, cargo, role, supervisor_id, coordenador_id } = body;

  if (!email || !senha || !nome_completo || !matricula || !cargo || !role) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  // Usa service role para criar usuário no Auth
  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: newUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  });

  if (authError || !newUser.user) {
    return NextResponse.json({ error: authError?.message ?? "Erro ao criar usuário" }, { status: 400 });
  }

  const { error: profileError } = await admin.from("profiles").insert({
    user_id: newUser.user.id,
    nome_completo,
    matricula,
    cargo,
    role,
    supervisor_id: supervisor_id || null,
    coordenador_id: coordenador_id || null,
  });

  if (profileError) {
    // Rollback: remove o usuário do Auth se o profile falhou
    await admin.auth.admin.deleteUser(newUser.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
