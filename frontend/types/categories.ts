export type AssetCategory = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
  assetCount: number;
};

export type CategoryFormState = {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
};

export type CreateCategoryRequest = {
  code: string;
  name: string;
  description: string;
};

export type UpdateCategoryRequest = {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
};