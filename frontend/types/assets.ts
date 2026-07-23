export type AssetCategory = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  assetCount: number;
};

export type CreateAssetRequest = {
  assetCode: string;
  name: string;
  serialNumber: string;
  brand: string;
  model: string;
  purchaseDate: string;
  purchasePrice: number;
  warrantyExpirationDate: string;
  categoryId: number;
  description: string;
};

export type AssetFormState = {
  assetCode: string;
  name: string;
  serialNumber: string;
  brand: string;
  model: string;
  purchaseDate: string;
  purchasePrice: string;
  warrantyExpirationDate: string;
  categoryId: string;
  description: string;
};