export interface User {
  id: string;
  email: string | null | undefined;
  phone?: string | null; // Добавлено для совместимости с Firebase
  phoneNumber?: string | null; // Альтернативное имя из Firebase
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  displayName?: string; // Из Firebase User
  photoURL?: string; // Из Firebase User
}

// Упрощенное определение Session для Firebase
export interface Session {
  user: {
    id: string;
    email: string | null | undefined;
    phone?: string | null;
  };
  // Опциональные поля для совместимости с существующим кодом
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface ThemeState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  debtAmount: number;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
  isNew?: boolean;
  documentUrl?: string;
}

export type ClientStatus = 
  | 'Создан'
  | 'Отправлено сообщение'
  | 'Просмотрено'
  | 'Просмотрел документ'
  | 'Договор подписан';

export interface ClientsState {
  clients: Client[];
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<Client>;
  updateClientStatus: (id: string, status: ClientStatus) => Promise<void>;
  sendSms: (client: Client) => Promise<boolean>;
  getClientByPhone: (phone: string) => Client | undefined;
  getClientById: (id: string) => Client | undefined;
}