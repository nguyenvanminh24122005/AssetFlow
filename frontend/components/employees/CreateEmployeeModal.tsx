"use client";

import {
  FormEvent,
  useState,
} from "react";
import {
  LoaderCircle,
  UserPlus,
  X,
} from "lucide-react";
import { apiPost } from "@/lib/api";
import type {
  CreateEmployeeRequest,
  Employee,
  EmployeeFormState,
} from "@/types/employees";

type CreateEmployeeModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (employee: Employee) => void;
};

const initialForm: EmployeeFormState = {
  employeeCode: "",
  fullName: "",
  email: "",
  phoneNumber: "",
  department: "",
  position: "",
};

export default function CreateEmployeeModal({
  open,
  onClose,
  onCreated,
}: CreateEmployeeModalProps) {
  const [form, setForm] =
    useState<EmployeeFormState>(initialForm);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  function updateField(
    field: keyof EmployeeFormState,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleClose() {
    if (submitting) {
      return;
    }

    setForm(initialForm);
    setError("");
    onClose();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    const request: CreateEmployeeRequest = {
      employeeCode:
        form.employeeCode.trim(),
      fullName:
        form.fullName.trim(),
      email:
        form.email.trim().toLowerCase(),
      phoneNumber:
        form.phoneNumber.trim(),
      department:
        form.department.trim(),
      position:
        form.position.trim(),
    };

    setSubmitting(true);

    try {
      const createdEmployee = await apiPost<
        Employee,
        CreateEmployeeRequest
      >("/api/employees", request);

      onCreated(createdEmployee);
      setForm(initialForm);
      onClose();
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Không thể thêm nhân viên."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Thêm nhân viên
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tạo nhân viên có thể nhận tài sản
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Đóng"
          >
            <X size={21} />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Mã nhân viên *
              </span>

              <input
                required
                maxLength={50}
                value={form.employeeCode}
                onChange={(event) =>
                  updateField(
                    "employeeCode",
                    event.target.value
                  )
                }
                placeholder="Ví dụ: NV002"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Họ và tên *
              </span>

              <input
                required
                value={form.fullName}
                onChange={(event) =>
                  updateField(
                    "fullName",
                    event.target.value
                  )
                }
                placeholder="Ví dụ: Trần Thị Lan"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Email *
              </span>

              <input
                required
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
                placeholder="lan.tran@assetflow.vn"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Số điện thoại
              </span>

              <input
                value={form.phoneNumber}
                onChange={(event) =>
                  updateField(
                    "phoneNumber",
                    event.target.value
                  )
                }
                placeholder="Ví dụ: 0901234567"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Phòng ban
              </span>

              <input
                value={form.department}
                onChange={(event) =>
                  updateField(
                    "department",
                    event.target.value
                  )
                }
                placeholder="Ví dụ: Phòng Kế toán"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Chức vụ
              </span>

              <input
                value={form.position}
                onChange={(event) =>
                  updateField(
                    "position",
                    event.target.value
                  )
                }
                placeholder="Ví dụ: Kế toán viên"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <UserPlus size={17} />
              )}

              {submitting
                ? "Đang lưu..."
                : "Thêm nhân viên"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}