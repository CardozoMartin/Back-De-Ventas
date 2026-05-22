export interface CreateClientCommand {
  name: string;
  phone?: string;
  email?: string;
  maxCredit?: number;
}

export interface UpdateClientCommand {
  name?: string;
  phone?: string;
  email?: string;
  maxCredit?: number;
  debt?: number; // Para poder ajustar manualmente o registrar pagos
  active?: boolean;
}

export interface ClientDto {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  debt: number;
  maxCredit?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
