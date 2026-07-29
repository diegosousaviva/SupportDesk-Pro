export interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description: string;
  color: string;
  active: boolean;
}

export interface UpdateCategoryData {
  name: string;
  description: string;
  color: string;
  active: boolean;
}