export type StoreStatus =
  | "Ativa"
  | "Inativa";

export interface Store {
  id: number;

  code: string;

  name: string;

  status: StoreStatus;

  address: string;

  city: string;

  state: string;

  zipCode: string;

  phone: string;

  email: string;

  manager: string;

  notes: string;

  createdAt: string;

  updatedAt: string;
}