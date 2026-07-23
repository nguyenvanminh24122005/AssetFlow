export type Asset = {
  id: number;
  assetCode: string;
  name: string;
  brand: string | null;
  model: string | null;
  statusValue: number;
  status: string;
  categoryId: number;
  categoryCode: string;
  categoryName: string;
};

export type Employee = {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string | null;
  department: string | null;
  position: string | null;
  isActive: boolean;
};

export type AssetHandover = {
  id: number;
  handoverCode: string;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  department: string | null;
  handoverDate: string;
  statusValue: number;
  status: string;
  totalAssets: number;
  returnedAssets: number;
};