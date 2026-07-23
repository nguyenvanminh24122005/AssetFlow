export type Employee = {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  department: string | null;
  position: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type EmployeeFormState = {
  employeeCode: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
  position: string;
};

export type CreateEmployeeRequest = {
  employeeCode: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
  position: string;
};

export type UpdateEmployeeRequest = {
  employeeCode: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
  position: string;
  isActive: boolean;
};