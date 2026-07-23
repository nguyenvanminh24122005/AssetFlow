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
export type AssetDetail = {
  id: number;
  assetCode: string;
  name: string;
  serialNumber: string | null;
  brand: string | null;
  model: string | null;
  purchaseDate: string | null;
  purchasePrice: number;
  warrantyExpirationDate: string | null;
  statusValue: number;
  status: string;
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type UpdateAssetRequest = {
  assetCode: string;
  name: string;
  serialNumber: string;
  brand: string;
  model: string;
  purchaseDate: string;
  purchasePrice: number;
  warrantyExpirationDate: string;
  categoryId: number;
  status: number;
  description: string;
};