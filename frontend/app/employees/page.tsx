"use client";

import {
  BriefcaseBusiness,
  CircleCheckBig,
  CircleOff,
  Plus,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiGet } from "@/lib/api";
import type { Employee } from "@/types/employees";
import CreateEmployeeModal from "@/components/employees/CreateEmployeeModal";
import EmployeeDetailModal from "@/components/employees/EmployeeDetailModal";
type EmployeeStatusFilter =
  | "all"
  | "active"
  | "inactive";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [keyword, setKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<EmployeeStatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createModalOpen, setCreateModalOpen] =
    useState(false);

  const [detailModalOpen, setDetailModalOpen] =
    useState(false);

  const [selectedEmployeeId, setSelectedEmployeeId] =
    useState<number | null>(null);
  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiGet<Employee[]>(
        "/api/employees"
      );

      setEmployees(data);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách nhân viên."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  const statistics = useMemo(() => {
    const active = employees.filter(
      (employee) => employee.isActive
    ).length;

    const inactive = employees.filter(
      (employee) => !employee.isActive
    ).length;

    const departments = new Set(
      employees
        .map((employee) => employee.department)
        .filter(
          (department): department is string =>
            Boolean(department)
        )
    ).size;

    return {
      total: employees.length,
      active,
      inactive,
      departments,
    };
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const normalizedKeyword = keyword
      .trim()
      .toLowerCase();

    return employees.filter((employee) => {
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        employee.employeeCode
          .toLowerCase()
          .includes(normalizedKeyword) ||
        employee.fullName
          .toLowerCase()
          .includes(normalizedKeyword) ||
        employee.email
          ?.toLowerCase()
          .includes(normalizedKeyword) ||
        employee.phoneNumber
          ?.toLowerCase()
          .includes(normalizedKeyword) ||
        employee.department
          ?.toLowerCase()
          .includes(normalizedKeyword) ||
        employee.position
          ?.toLowerCase()
          .includes(normalizedKeyword);

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" &&
          employee.isActive) ||
        (selectedStatus === "inactive" &&
          !employee.isActive);

      return Boolean(matchesKeyword && matchesStatus);
    });
  }, [employees, keyword, selectedStatus]);

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            Quản lý nhân viên
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Quản lý nhân viên có thể nhận và sử dụng tài sản
          </p>
        </div>

        <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
            <Plus size={18} />
            Thêm nhân viên
            </button>
      </section>

      {!loading && !error && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Tổng nhân viên
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {statistics.total}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <Users size={22} />
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Đang hoạt động
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {statistics.active}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                <CircleCheckBig size={22} />
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Ngừng hoạt động
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {statistics.inactive}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                <CircleOff size={22} />
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Phòng ban
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {statistics.departments}
                </p>
              </div>

              <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
                <BriefcaseBusiness size={22} />
              </div>
            </div>
          </article>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-64 flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={keyword}
                onChange={(event) =>
                  setKeyword(event.target.value)
                }
                placeholder="Tìm mã, tên, email, phòng ban hoặc chức vụ..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(
                  event.target.value as EmployeeStatusFilter
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">
                Tất cả trạng thái
              </option>

              <option value="active">
                Đang hoạt động
              </option>

              <option value="inactive">
                Ngừng hoạt động
              </option>
            </select>

            <button
              type="button"
              onClick={() => void loadEmployees()}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />

              Làm mới
            </button>
          </div>
        </div>

        {error && (
          <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">
              Không thể tải nhân viên
            </p>

            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {loading && !error && (
          <div className="p-12 text-center text-slate-500">
            Đang tải danh sách nhân viên...
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-6 py-4">
              <p className="text-sm text-slate-500">
                Đang hiển thị{" "}
                <strong className="text-slate-900">
                  {filteredEmployees.length}
                </strong>{" "}
                trên{" "}
                <strong className="text-slate-900">
                  {employees.length}
                </strong>{" "}
                nhân viên
              </p>

              {(keyword || selectedStatus !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setKeyword("");
                    setSelectedStatus("all");
                  }}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-4">
                      Mã nhân viên
                    </th>

                    <th className="px-6 py-4">
                      Nhân viên
                    </th>

                    <th className="px-6 py-4">
                      Liên hệ
                    </th>

                    <th className="px-6 py-4">
                      Phòng ban
                    </th>

                    <th className="px-6 py-4">
                      Chức vụ
                    </th>

                    <th className="px-6 py-4">
                      Trạng thái
                    </th>

                    <th className="px-6 py-4 text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="border-b text-sm text-slate-700 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-semibold text-blue-700">
                        {employee.employeeCode}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                            {employee.fullName
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <p className="font-medium text-slate-900">
                            {employee.fullName}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p>{employee.email ?? "—"}</p>

                        <p className="mt-1 text-xs text-slate-500">
                          {employee.phoneNumber ??
                            "Chưa có số điện thoại"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        {employee.department ??
                          "Chưa cập nhật"}
                      </td>

                      <td className="px-6 py-4">
                        {employee.position ??
                          "Chưa cập nhật"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={[
                            "whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold",
                            employee.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600",
                          ].join(" ")}
                        >
                          {employee.isActive
                            ? "Đang hoạt động"
                            : "Ngừng hoạt động"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedEmployeeId(employee.id);
                                setDetailModalOpen(true);
                            }}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                            Chi tiết
                            </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredEmployees.length === 0 && (
                <div className="p-12 text-center">
                  <Users
                    size={38}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 font-semibold text-slate-700">
                    Không tìm thấy nhân viên
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Hãy thay đổi từ khóa hoặc trạng thái lọc.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </section>
      <CreateEmployeeModal
        open={createModalOpen}
        onClose={() =>
            setCreateModalOpen(false)
        }
        onCreated={(createdEmployee) => {
            setEmployees((current) => [
            createdEmployee,
            ...current,
            ]);
        }}
        />

        <EmployeeDetailModal
        employeeId={selectedEmployeeId}
        open={detailModalOpen}
        onClose={() => {
            setDetailModalOpen(false);
            setSelectedEmployeeId(null);
        }}
        onUpdated={(updatedEmployee) => {
            setEmployees((current) =>
            current.map((employee) =>
                employee.id === updatedEmployee.id
                ? updatedEmployee
                : employee
            )
            );
        }}
        />
    </div>
  );
}