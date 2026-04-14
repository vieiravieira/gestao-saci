# 🚀 Gestão SACI — Sistema de Escalas e Presença

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)

---

## ⚙️ Configuração Inicial (passo a passo)

### 1. Clone o repositório
```bash
git clone https://github.com/SEU_USUARIO/gestao-saci.git
cd gestao-saci
npm install
```

### 2. Configure o Supabase

#### 2.1 — Crie o banco de dados
1. Acesse o painel do Supabase → SQL Editor
2. Cole e execute **todo** o conteúdo de `supabase/schema.sql`

#### 2.2 — Crie o Storage Bucket para justificativas
1. Vá em **Storage > New Bucket**
2. Nome: `justificativas`, marque como **Public**

#### 2.3 — Crie o primeiro usuário ADM RH
1. Vá em **Authentication > Users > Add User**
2. Copie o UUID gerado e execute no SQL Editor:
```sql
INSERT INTO profiles (user_id, nome_completo, matricula, cargo, role)
VALUES ('COLE_O_UUID_AQUI', 'Admin RH', 'MAT001', 'Analista RH', 'adm_rh');
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais (Supabase Dashboard → Settings → API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> ⚠️ **Nunca suba `.env.local` para o GitHub!** Já está no `.gitignore`.

### 4. Rode localmente

```bash
npm run dev
```

---

## 🚀 Deploy no GitHub + Vercel

### Subindo para o GitHub (primeira vez)

```bash
git init
git add .
git commit -m "feat: projeto gestao-saci"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/gestao-saci.git
git push -u origin main
```

### Atualizações futuras

```bash
git add .
git commit -m "sua mensagem aqui"
git push
```

### Deploy na Vercel (gratuito)

1. Acesse [vercel.com](https://vercel.com) → login com GitHub
2. **Add New Project** → importe `gestao-saci`
3. Em **Environment Variables**, adicione as 3 variáveis do `.env.local`
4. Clique em **Deploy**

---

## 👤 Roles do Sistema

| Role | Acesso |
|------|--------|
| `adm_rh` | Funcionários, Escalas, Presenças, Rotas |
| `supervisor` | Equipe, Escalas, Presenças da equipe |
| `coordenador` | Relatórios, visão geral |

---

## 🐛 Problemas Comuns

**Loop de login**
→ Verifique as variáveis de ambiente no `.env.local`
→ Confirme que o usuário tem registro na tabela `profiles`

**Erro "relation does not exist"**
→ Execute novamente o `supabase/schema.sql` no SQL Editor

**Erro ao criar funcionário**
→ Confirme que `SUPABASE_SERVICE_ROLE_KEY` está correta
