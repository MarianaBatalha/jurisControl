export enum UserRole {
  Admin = 'Admin',
  Advogado = 'Advogado',
}

export enum UserStatus {
  Active = 'Ativo',
  Inactive = 'Inativo',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  password?: string; // For mock API purposes
}

// Re-add password fields for user creation
export type UserFormData = Omit<User, 'id' | 'createdAt' | 'password'> & {
  password?: string;
  confirmPassword?: string;
};

export enum ProcessStatus {
  InProgress = 'Em Andamento',
  Agreement = 'Acordo',
  Completed = 'Concluído',
}

export enum PaymentStatus {
  Pending = 'Pendente',
  Paid = 'Pago',
  Overdue = 'Em Atraso',
  Canceled = 'Cancelado',
}

export enum PaymentOrigin {
  Trade = 'Trade',
  Talento = 'Talento',
}

export interface Process {
  id: string;
  processNumber: string;
  court: string;
  claimant: string;
  cpf?: string;
  company: string;
  cnpj?: string;
  lawFirm?: string;
  lawyer?: string;
  actionType: string;
  status: ProcessStatus;
  caseValue: number;
  agreementValue?: number;
  sentenceValue?: number;
  distributionDate: string;
  agreementDate?: string;
  sentenceDate?: string;
  documents?: { name: string }[];
  observations?: string;
  origin: PaymentOrigin;
}


export type ProcessFormData = Omit<Process, 'id'>;

export interface Payment {
  id: string;
  processId: string;
  processNumber: string;
  type: string;
  value: number; // Represents installment value
  installmentNumber?: number;
  totalInstallments?: number;
  dueDate: string;
  paymentDate?: string;
  status: PaymentStatus;
  paymentMethod: string;
  documents?: { name: string }[];
  observations: string;
  isOverdue?: boolean;
  idPortalGps?: string;
  crCentroCusto?: string;
  origin: PaymentOrigin;
}

export type PaymentFormData = Omit<Payment, 'id' | 'processNumber' | 'isOverdue'>;