export interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  name: string;
  description: string;
  color: string;
  active: boolean;
}

export type CategoryPayload = CategoryInput;
