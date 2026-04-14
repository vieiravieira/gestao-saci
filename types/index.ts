// types/index.ts

export type Role = "adm_rh" | "supervisor" | "coordenador";

export interface Profile {
  id: string;
  user_id: string;
  nome_completo: string;
  matricula: string;
  cargo: string;
  role: Role;
  supervisor_id: string | null;
  coordenador_id: string | null;
  ativo: boolean;
  ferias: boolean;
  created_at: string;
}

export interface Escala {
  id: string;
  nome: string;
  horario_inicio: string;
  horario_fim: string;
  dias_semana: number[];
  cor: string;
  membros: string[];
  ativo: boolean;
  created_at: string;
}

export interface RegistroPresenca {
  id: string;
  profile_id: string;
  escala_id: string;
  data: string;
  hora_entrada: string | null;
  hora_saida: string | null;
  justificativa: string | null;
  anexo_url: string | null;
  status: "presente" | "ausente" | "justificado" | "pendente";
  validado_por: string | null;
  created_at: string;
}

export interface Notificacao {
  id: string;
  para_profile_id: string;
  de_profile_id: string | null;
  tipo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
}

export interface Rota {
  id: string;
  nome: string;
  tipo: string;
  descricao: string | null;
  carga_horaria: number;
  crea_centena: boolean;
  ativo: boolean;
}

export interface HistoricoStatus {
  id: string;
  profile_id: string;
  escala_id: string | null;
  status_anterior: string;
  novo_status: string;
  alterado_por: string;
  motivo: string | null;
  created_at: string;
}
