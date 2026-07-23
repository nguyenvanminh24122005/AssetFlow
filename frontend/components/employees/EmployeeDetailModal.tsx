"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  CircleOff,
  LoaderCircle,
  Pencil,
  Save,
  X,
} from "lucide-react";
import {
  apiDelete,
  apiGet,
  apiPut,
} from "@/lib/api";
import type {
  Employee,
  EmployeeFormState,
  UpdateEmployeeRequest,
} from "@/types/employees";

type EmployeeDetailModalProps = {
  employeeId: number | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (employee: Employee) => void;
};

const initialForm: EmployeeFormState = {
  employeeCode: "",
  fullName: "",
  email: "",
  phoneNumber: "",
  department: "",
  position: "",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Chưa cập nhật";
  }

  return new Intl.DateTimeFormat(
    "vi-VN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(value));
}

export default function EmployeeDetailModal({
  employeeId,
  open,
  onClose,
  onUpdated,
}: EmployeeDetailModalProps) {
  const [employee, setEmployee] =
    useState<Employee | null>(null);

  const [form, setForm] =
    useState<EmployeeFormState>(initialForm);

  const [editing, setEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [deactivating, setDeactivating] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!open || employeeId === null) {
      return;
    }

    async function loadEmployee() {
      setLoading(true);
      setError("");
      setEditing(false);

      try {
        const data = await apiGet<Employee>(
          `/api/employees/${employeeId}`
        );

        setEmployee(data);

        setForm({
          employeeCode: data.employeeCode,
          fullName: data.fullName,
          email: data.email ?? "",
          phoneNumber:
            data.phoneNumber ?? "",
          department:
            data.department ?? "",
          position:
            data.position ?? "",
        });
      } catch (error: unknown) {
        setError(
          error instanceof Error
            ? error.message
            : "Không thể tải thông tin nhân viên."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadEmployee();
  }, [open, employeeId]);

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
    if (submitting || deactivating) {
      return;
    }

    setEmployee(null);
    setEditing(false);
    setError("");
    onClose();
  }

  function cancelEditing() {
    if (!employee) {
      return;
    }

    setForm({
      employeeCode:
        employee.employeeCode,
      fullName:
        employee.fullName,
      email:
        employee.email ?? "",
      phoneNumber:
        employee.phoneNumber ?? "",
      department:
        employee.department ?? "",
      position:
        employee.position ?? "",
    });

    setEditing(false);
    setError("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      employeeId === null ||
      !employee
    ) {
      return;
    }

    setSubmitting(true);
    setError("");

    const request: UpdateEmployeeRequest = {
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
      isActive:
        employee.isActive,
    };

    try {
      const updatedEmployee = await apiPut<
        Employee,
        UpdateEmployeeRequest
      >(
        `/api/employees/${employeeId}`,
        request
      );

      setEmployee(updatedEmployee);
      setEditing(false);
      onUpdated(updatedEmployee);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật nhân viên."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function deactivateEmployee() {
    if (
      employeeId === null ||
      !employee ||
      !employee.isActive
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn ngừng hoạt động nhân viên ${employee.employeeCode} không?`
    );

    if (!confirmed) {
      return;
    }

    setDeactivating(true);
    setError("");

    try {
      await apiDelete(
        `/api/employees/${employeeId}`
      );

      const updatedEmployee =
        await apiGet<Employee>(
          `/api/employees/${employeeId}`
        );

      setEmployee(updatedEmployee);
      onUpdated(updatedEmployee);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Không thể ngừng hoạt động nhân viên."
      );
    } finally {
      setDeactivating(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Chi tiết nhân viên
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Xem và cập nhật hồ sơ nhân viên
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={21} />
          </button>
        </header>

        {loading && (
          <div className="flex min-h-72 items-center justify-center gap-3 text-slate-500">
            <LoaderCircle
              size={22}
              className="animate-spin"
            />

            Đang tải thông tin nhân viên...
          </div>
        )}

        {!loading && error && !employee && (
          <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {!loading &&
          employee &&
          !editing && (
          <div className="space-y-6 p-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <section className="flex flex-wrap items-start justify-between gap-4 rounded-2xl bg-slate-950 p-6 text-white">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
                  {employee.employeeCode}
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {employee.fullName}
                </h3>

                <p className="mt-2 text-sm text-slate-300">
                  {employee.department ??
                    "Chưa có phòng ban"}
                  {" · "}
                  {employee.position ??
                    "Chưa có chức vụ"}
                </p>
              </div>

              <span
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold",
                  employee.isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-700 text-slate-200",
                ].join(" ")}
              >
                {employee.isActive
                  ? "Đang hoạt động"
                  : "Ngừng hoạt động"}
              </span>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <article className="rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {employee.email ??
                    "Chưa cập nhật"}
                </p>
              </article>

              <article className="rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Số điện thoại
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {employee.phoneNumber ??
                    "Chưa cập nhật"}
                </p>
              </article>

              <article className="rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Ngày tạo
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {formatDate(
                    employee.createdAt
                  )}
                </p>
              </article>

              <article className="rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Cập nhật gần nhất
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {formatDate(
                    employee.updatedAt
                  )}
                </p>
              </article>
            </section>

            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
              {employee.isActive && (
                <button
                  type="button"
                  onClick={() =>
                    void deactivateEmployee()
                  }
                  disabled={deactivating}
                  className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                >
                  {deactivating ? (
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <CircleOff size={17} />
                  )}

                  Ngừng hoạt động
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  setEditing(true)
                }
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Pencil size={17} />
                Chỉnh sửa
              </button>
            </div>
          </div>
        )}

        {!loading &&
          employee &&
          editing && (
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
              {(
                [
                  [
                    "employeeCode",
                    "Mã nhân viên",
                    "NV002",
                  ],
                  [
                    "fullName",
                    "Họ và tên",
                    "Trần Thị Lan",
                  ],
                  [
                    "email",
                    "Email",
                    "lan.tran@assetflow.vn",
                  ],
                  [
                    "phoneNumber",
                    "Số điện thoại",
                    "0901234567",
                  ],
                  [
                    "department",
                    "Phòng ban",
                    "Phòng Kế toán",
                  ],
                  [
                    "position",
                    "Chức vụ",
                    "Kế toán viên",
                  ],
                ] as const
              ).map(
                ([field, label, placeholder]) => (
                  <label
                    key={field}
                    className="space-y-2"
                  >
                    <span className="text-sm font-semibold text-slate-700">
                      {label}
                    </span>

                    <input
                      required={
                        field ===
                          "employeeCode" ||
                        field ===
                          "fullName" ||
                        field === "email"
                      }
                      type={
                        field === "email"
                          ? "email"
                          : "text"
                      }
                      value={form[field]}
                      onChange={(event) =>
                        updateField(
                          field,
                          event.target.value
                        )
                      }
                      placeholder={placeholder}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                )
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={submitting}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hủy chỉnh sửa
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
                  <Save size={17} />
                )}

                {submitting
                  ? "Đang lưu..."
                  : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}