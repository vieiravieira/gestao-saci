-- supabase/schema.sql
-- Execute este arquivo no SQL Editor do Supabase

-- =============================================
-- 1. TABELA PROFILES (estende auth.users)
-- =============================================
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome_completo TEXT NOT NULL,
  matricula TEXT UNIQUE NOT NULL,
  cargo TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('adm_rh', 'supervisor', 'coordenador')),
  supervisor_id UUID REFERENCES profiles(id),
  coordenador_id UUID REFERENCES profiles(id),
  ativo BOOLEAN DEFAULT true NOT NULL,
  ferias BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- 2. TABELA ESCALAS
-- =============================================
CREATE TABLE escalas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  dias_semana INTEGER[] NOT NULL, -- 0=Dom, 1=Seg ... 6=Sab
  cor TEXT DEFAULT '#3b82f6',
  membros UUID[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- 3. TABELA REGISTRO_PRESENCA
-- =============================================
CREATE TABLE registro_presenca (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  escala_id UUID REFERENCES escalas(id) ON DELETE SET NULL,
  data DATE NOT NULL,
  hora_entrada TIME,
  hora_saida TIME,
  justificativa TEXT,
  anexo_url TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('presente','ausente','justificado','pendente')) NOT NULL,
  validado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(profile_id, data)
);

-- =============================================
-- 4. TABELA NOTIFICACOES
-- =============================================
CREATE TABLE notificacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  para_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  de_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- 5. TABELA ROTAS
-- =============================================
CREATE TABLE rotas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  descricao TEXT,
  carga_horaria INTEGER DEFAULT 0,
  crea_centena BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- 6. TABELA HISTORICO_STATUS
-- =============================================
CREATE TABLE historico_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  escala_id UUID REFERENCES escalas(id) ON DELETE SET NULL,
  status_anterior TEXT,
  novo_status TEXT NOT NULL,
  alterado_por UUID REFERENCES profiles(id) NOT NULL,
  motivo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- RLS (Row Level Security)
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalas ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_presenca ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_status ENABLE ROW LEVEL SECURITY;

-- Função helper: pega a role do usuário logado
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Função helper: pega o profile_id do usuário logado
CREATE OR REPLACE FUNCTION get_my_profile_id()
RETURNS UUID AS $$
  SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- POLICIES: profiles
CREATE POLICY "Usuários veem próprio perfil"
  ON profiles FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "ADM RH vê todos os perfis"
  ON profiles FOR SELECT USING (get_my_role() = 'adm_rh');

CREATE POLICY "Supervisor vê equipe"
  ON profiles FOR SELECT USING (
    supervisor_id = get_my_profile_id()
    OR coordenador_id = get_my_profile_id()
  );

CREATE POLICY "ADM RH gerencia perfis"
  ON profiles FOR ALL USING (get_my_role() = 'adm_rh');

-- POLICIES: escalas
CREATE POLICY "Todos autenticados veem escalas ativas"
  ON escalas FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "ADM RH gerencia escalas"
  ON escalas FOR ALL USING (get_my_role() = 'adm_rh');

-- POLICIES: registro_presenca
CREATE POLICY "Usuário vê próprias presenças"
  ON registro_presenca FOR SELECT USING (profile_id = get_my_profile_id());

CREATE POLICY "Supervisor vê presenças da equipe"
  ON registro_presenca FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles
      WHERE supervisor_id = get_my_profile_id()
         OR coordenador_id = get_my_profile_id()
    )
  );

CREATE POLICY "ADM RH vê todas presenças"
  ON registro_presenca FOR SELECT USING (get_my_role() = 'adm_rh');

CREATE POLICY "Usuário insere própria presença"
  ON registro_presenca FOR INSERT WITH CHECK (profile_id = get_my_profile_id());

CREATE POLICY "Supervisor e ADM validam presenças"
  ON registro_presenca FOR UPDATE USING (
    get_my_role() IN ('adm_rh', 'supervisor', 'coordenador')
  );

-- POLICIES: notificacoes
CREATE POLICY "Usuário vê próprias notificações"
  ON notificacoes FOR SELECT USING (para_profile_id = get_my_profile_id());

CREATE POLICY "ADM RH vê todas notificações"
  ON notificacoes FOR SELECT USING (get_my_role() = 'adm_rh');

CREATE POLICY "Sistema e ADM inserem notificações"
  ON notificacoes FOR INSERT WITH CHECK (get_my_role() = 'adm_rh');

CREATE POLICY "Usuário marca notificação como lida"
  ON notificacoes FOR UPDATE USING (para_profile_id = get_my_profile_id());

-- POLICIES: rotas
CREATE POLICY "Todos autenticados veem rotas"
  ON rotas FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "ADM RH gerencia rotas"
  ON rotas FOR ALL USING (get_my_role() = 'adm_rh');

-- POLICIES: historico_status
CREATE POLICY "ADM RH vê histórico"
  ON historico_status FOR SELECT USING (get_my_role() = 'adm_rh');

CREATE POLICY "Usuário vê próprio histórico"
  ON historico_status FOR SELECT USING (profile_id = get_my_profile_id());

-- =============================================
-- TRIGGER: cria perfil após signup
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- O perfil é criado manualmente pelo ADM RH
  -- Esta função apenas garante que o auth.users existe
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- DADOS DE EXEMPLO (opcional)
-- =============================================
-- Descomente para inserir dados de teste após criar os usuários no Auth do Supabase
/*
INSERT INTO profiles (user_id, nome_completo, matricula, cargo, role)
VALUES
  ('UUID_DO_USER_ADM', 'Admin RH', 'MAT001', 'Analista RH', 'adm_rh'),
  ('UUID_DO_USER_SUPERVISOR', 'João Supervisor', 'MAT002', 'Supervisor', 'supervisor'),
  ('UUID_DO_USER_COORD', 'Maria Coordenadora', 'MAT003', 'Coordenadora', 'coordenador');
*/
