"use client";

import {
  Boxes,
  CircleCheckBig,
  ClipboardList,
  RefreshCw,
  Users,
  Wrench,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiGet } from "@/lib/api";
import type {
  Asset,
  AssetHandover,
  Employee,
} from "@/types/dashboard";

const handoverStatusLabels:
  Record<string, string> = {
    Draft: "Phiếu nháp",
    Completed: "Đã bàn giao",
    PartiallyReturned: "Đã trả một phần",
    Returned: "Đã trả",
    Cancelled: "Đã hủy",
  };

const handoverStatusClasses:
  Record<string, string> = {
    Draft:
      "bg-amber-100 text-amber-700",
    Completed:
      "bg-blue-100 text-blue-700",
    PartiallyReturned:
      "bg-violet-100 text-violet-700",
    Returned:
      "bg-emerald-100 text-emerald-700",
    Cancelled:
      "bg-slate-200 text-slate-600",
  };

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "vi-VN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(new Date(value));
}

type StatisticCardProps = {
  label: string;
  value: number;
  description: string;
  icon: React.ComponentType<{
    size?: number;
  }>;
};

function StatisticCard({
  label,
  value,
  description,
  icon: Icon,
}: StatisticCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
          <Icon size={22} />
        </div>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const [assets, setAssets] =
    useState<Asset[]>([]);
  const [employees, setEmployees] =
    useState<Employee[]>([]);
  const [handovers, setHandovers] =
    useState<AssetHandover[]>([]);

  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  const loadDashboard = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const [
          assetData,
          employeeData,
          handoverData,
        ] = await Promise.all([
          apiGet<Asset[]>("/api/assets"),
          apiGet<Employee[]>(
            "/api/employees"
          ),
          apiGet<AssetHandover[]>(
            "/api/asset-handovers"
          ),
        ]);

        setAssets(assetData);
        setEmployees(employeeData);
        setHandovers(handoverData);
      } catch (error: unknown) {
        setError(
          error instanceof Error
            ? error.message
            : "Không thể tải dữ liệu Dashboard."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const availableAssets =
    assets.filter(
      (asset) =>
        asset.status === "Available"
    ).length;

  const inUseAssets =
    assets.filter(
      (asset) =>
        asset.status === "InUse"
    ).length;

  const maintenanceAssets =
    assets.filter(
      (asset) =>
        asset.status === "Maintenance"
    ).length;

  const activeEmployees =
    employees.filter(
      (employee) => employee.isActive
    ).length;

  const recentHandovers = useMemo(
    () =>
      [...handovers]
        .sort(
          (first, second) =>
            new Date(
              second.handoverDate
            ).getTime() -
            new Date(
              first.handoverDate
            ).getTime()
        )
        .slice(0, 5),
    [handovers]
  );

  return (
    <div className="space-y-7">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            Tổng quan hệ thống
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Theo dõi tài sản, nhân viên và
            hoạt động bàn giao
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadDashboard()
          }
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Làm mới dữ liệu
        </button>
      </section>

      {error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="font-semibold">
            Không thể tải Dashboard
          </p>

          <p className="mt-1 text-sm">
            {error}
          </p>
        </section>
      )}

      {loading && !error && (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Đang tải dữ liệu tổng quan...
        </section>
      )}

      {!loading && !error && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatisticCard
              label="Tổng tài sản"
              value={assets.length}
              description="Tất cả thiết bị trong hệ thống"
              icon={Boxes}
            />

            <StatisticCard
              label="Sẵn sàng bàn giao"
              value={availableAssets}
              description="Tài sản có thể cấp phát"
              icon={CircleCheckBig}
            />

            <StatisticCard
              label="Đang sử dụng"
              value={inUseAssets}
              description="Tài sản đã bàn giao"
              icon={Boxes}
            />

            <StatisticCard
              label="Đang bảo trì"
              value={maintenanceAssets}
              description="Thiết bị cần kiểm tra"
              icon={Wrench}
            />

            <StatisticCard
              label="Nhân viên hoạt động"
              value={activeEmployees}
              description="Nhân viên có thể nhận tài sản"
              icon={Users}
            />

            <StatisticCard
              label="Phiếu bàn giao"
              value={handovers.length}
              description="Tổng số phiếu đã lập"
              icon={ClipboardList}
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-950">
                Phiếu bàn giao gần đây
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Năm phiếu được lập gần nhất
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-4">
                      Mã phiếu
                    </th>

                    <th className="px-6 py-4">
                      Nhân viên
                    </th>

                    <th className="px-6 py-4">
                      Ngày bàn giao
                    </th>

                    <th className="px-6 py-4">
                      Số tài sản
                    </th>

                    <th className="px-6 py-4">
                      Trạng thái
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentHandovers.map(
                    (handover) => (
                      <tr
                        key={handover.id}
                        className="border-b text-sm text-slate-700 last:border-0"
                      >
                        <td className="px-6 py-4 font-semibold text-blue-700">
                          {
                            handover.handoverCode
                          }
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">
                            {
                              handover.employeeName
                            }
                          </p>

                          <p className="text-xs text-slate-500">
                            {
                              handover.employeeCode
                            }
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          {formatDate(
                            handover.handoverDate
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {
                            handover.totalAssets
                          }
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={[
                              "rounded-full px-3 py-1 text-xs font-semibold",
                              handoverStatusClasses[
                                handover.status
                              ] ??
                                "bg-slate-100 text-slate-700",
                            ].join(" ")}
                          >
                            {handoverStatusLabels[
                              handover.status
                            ] ??
                              handover.status}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>

              {recentHandovers.length ===
                0 && (
                <p className="p-10 text-center text-sm text-slate-500">
                  Chưa có phiếu bàn giao.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}