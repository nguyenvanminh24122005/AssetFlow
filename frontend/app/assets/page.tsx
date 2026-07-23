"use client";

import {
  Boxes,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  Plus,
  Wrench,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiGet } from "@/lib/api";
import type { Asset } from "@/types/dashboard";
import CreateAssetModal from "@/components/assets/CreateAssetModal";
import AssetDetailModal from "@/components/assets/AssetDetailModal";
import type { AssetDetail } from "@/types/assets";

const statusLabels: Record<string, string> = {
  Available: "Sẵn sàng",
  PendingHandover: "Chờ bàn giao",
  InUse: "Đang sử dụng",
  Maintenance: "Đang bảo trì",
  Damaged: "Hư hỏng",
  Lost: "Đã mất",
  Liquidated: "Đã thanh lý",
};

const statusClasses: Record<string, string> = {
  Available: "bg-emerald-100 text-emerald-700",
  PendingHandover: "bg-amber-100 text-amber-700",
  InUse: "bg-blue-100 text-blue-700",
  Maintenance: "bg-violet-100 text-violet-700",
  Damaged: "bg-red-100 text-red-700",
  Lost: "bg-rose-100 text-rose-700",
  Liquidated: "bg-slate-200 text-slate-600",
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [keyword, setKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState("all");
  const [createModalOpen, setCreateModalOpen] =
    useState(false);
  const [selectedAssetId, setSelectedAssetId] =
    useState<number | null>(null);

  const [detailModalOpen, setDetailModalOpen] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiGet<Asset[]>(
        "/api/assets"
      );

      setAssets(data);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách tài sản."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  const filteredAssets = useMemo(() => {
    const normalizedKeyword = keyword
      .trim()
      .toLowerCase();

    return assets.filter((asset) => {
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        asset.assetCode
          .toLowerCase()
          .includes(normalizedKeyword) ||
        asset.name
          .toLowerCase()
          .includes(normalizedKeyword) ||
        asset.brand
          ?.toLowerCase()
          .includes(normalizedKeyword) ||
        asset.model
          ?.toLowerCase()
          .includes(normalizedKeyword) ||
        asset.categoryName
          .toLowerCase()
          .includes(normalizedKeyword);

      const matchesStatus =
        selectedStatus === "all" ||
        asset.status === selectedStatus;

      return Boolean(
        matchesKeyword && matchesStatus
      );
    });
  }, [assets, keyword, selectedStatus]);

  const statistics = useMemo(
    () => ({
      total: assets.length,

      available: assets.filter(
        (asset) =>
          asset.status === "Available"
      ).length,

      pending: assets.filter(
        (asset) =>
          asset.status === "PendingHandover"
      ).length,

      maintenance: assets.filter(
        (asset) =>
          asset.status === "Maintenance"
      ).length,
    }),
    [assets]
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            Quản lý tài sản
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Theo dõi thiết bị và trạng thái sử dụng
            trong công ty
          </p>
        </div>

        <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
            <Plus size={18} />
            Thêm tài sản
            </button>
      </section>

      {!loading && !error && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Tổng tài sản
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {statistics.total}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <Boxes size={22} />
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Sẵn sàng
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {statistics.available}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Chờ bàn giao
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {statistics.pending}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                <Clock3 size={22} />
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Đang bảo trì
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {statistics.maintenance}
                </p>
              </div>

              <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
                <Wrench size={22} />
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
                placeholder="Tìm mã, tên, hãng, model hoặc danh mục..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">
                Tất cả trạng thái
              </option>

              <option value="Available">
                Sẵn sàng
              </option>

              <option value="PendingHandover">
                Chờ bàn giao
              </option>

              <option value="InUse">
                Đang sử dụng
              </option>

              <option value="Maintenance">
                Đang bảo trì
              </option>

              <option value="Damaged">
                Hư hỏng
              </option>

              <option value="Lost">
                Đã mất
              </option>

              <option value="Liquidated">
                Đã thanh lý
              </option>
            </select>

            <button
              type="button"
              onClick={() => void loadAssets()}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  loading ? "animate-spin" : ""
                }
              />

              Làm mới
            </button>
          </div>
        </div>

        {error && (
          <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">
              Không thể tải tài sản
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {loading && !error && (
          <div className="p-12 text-center text-slate-500">
            Đang tải danh sách tài sản...
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-6 py-4">
              <p className="text-sm text-slate-500">
                Đang hiển thị{" "}
                <strong className="text-slate-900">
                  {filteredAssets.length}
                </strong>{" "}
                trên{" "}
                <strong className="text-slate-900">
                  {assets.length}
                </strong>{" "}
                tài sản
              </p>

              {(keyword ||
                selectedStatus !== "all") && (
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
                      Mã tài sản
                    </th>

                    <th className="px-6 py-4">
                      Thiết bị
                    </th>

                    <th className="px-6 py-4">
                      Hãng / Model
                    </th>

                    <th className="px-6 py-4">
                      Danh mục
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
                  {filteredAssets.map(
                    (asset) => (
                      <tr
                        key={asset.id}
                        className="border-b text-sm text-slate-700 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 font-semibold text-blue-700">
                          {asset.assetCode}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                              <Boxes size={19} />
                            </div>

                            <p className="font-medium text-slate-900">
                              {asset.name}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p>
                            {asset.brand ?? "—"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {asset.model ??
                              "Chưa có model"}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-800">
                            {asset.categoryName}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {asset.categoryCode}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={[
                              "whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold",
                              statusClasses[
                                asset.status
                              ] ??
                                "bg-slate-100 text-slate-700",
                            ].join(" ")}
                          >
                            {statusLabels[
                              asset.status
                            ] ?? asset.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                                setSelectedAssetId(asset.id);
                                setDetailModalOpen(true);
                            }}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                            Chi tiết
                            </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>

              {filteredAssets.length === 0 && (
                <div className="p-12 text-center">
                  <Boxes
                    size={38}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 font-semibold text-slate-700">
                    Không tìm thấy tài sản
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Hãy thay đổi từ khóa hoặc trạng
                    thái lọc.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
        </section>
      <CreateAssetModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={(createdAsset) => {
          setAssets((currentAssets) => [
            createdAsset,
            ...currentAssets,
          ]);
        }}
      />
      <AssetDetailModal
        assetId={selectedAssetId}
        open={detailModalOpen}
        onClose={() => {
            setDetailModalOpen(false);
            setSelectedAssetId(null);
        }}
        onUpdated={(updatedAsset: AssetDetail) => {
            setAssets((currentAssets) =>
            currentAssets.map((asset) =>
                asset.id === updatedAsset.id
                ? {
                    ...asset,
                    assetCode:
                        updatedAsset.assetCode,
                    name:
                        updatedAsset.name,
                    brand:
                        updatedAsset.brand,
                    model:
                        updatedAsset.model,
                    statusValue:
                        updatedAsset.statusValue,
                    status:
                        updatedAsset.status,
                    categoryId:
                        updatedAsset.categoryId,
                    categoryCode:
                        updatedAsset.categoryCode,
                    categoryName:
                        updatedAsset.categoryName,
                    }
                : asset
            )
            );
        }}
        />
    </div>
  );
}