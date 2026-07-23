"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  LoaderCircle,
  Pencil,
  Save,
  X,
} from "lucide-react";
import {
  apiGet,
  apiPut,
} from "@/lib/api";
import type {
  AssetCategory,
  AssetDetail,
  AssetFormState,
  UpdateAssetRequest,
} from "@/types/assets";

type AssetDetailModalProps = {
  assetId: number | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (asset: AssetDetail) => void;
};

const statusOptions = [
  {
    value: 1,
    label: "Sẵn sàng",
  },
  {
    value: 2,
    label: "Chờ bàn giao",
  },
  {
    value: 3,
    label: "Đang sử dụng",
  },
  {
    value: 4,
    label: "Đang bảo trì",
  },
  {
    value: 5,
    label: "Hư hỏng",
  },
  {
    value: 6,
    label: "Đã mất",
  },
  {
    value: 7,
    label: "Đã thanh lý",
  },
];

type EditFormState = AssetFormState & {
  status: string;
};

const initialFormState: EditFormState = {
  assetCode: "",
  name: "",
  serialNumber: "",
  brand: "",
  model: "",
  purchaseDate: "",
  purchasePrice: "",
  warrantyExpirationDate: "",
  categoryId: "",
  description: "",
  status: "1",
};

function getDateInputValue(
  value: string | null
) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(
    "vi-VN",
    {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }
  ).format(value);
}

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
    }
  ).format(new Date(value));
}

export default function AssetDetailModal({
  assetId,
  open,
  onClose,
  onUpdated,
}: AssetDetailModalProps) {
  const [asset, setAsset] =
    useState<AssetDetail | null>(null);

  const [categories, setCategories] =
    useState<AssetCategory[]>([]);

  const [form, setForm] =
    useState<EditFormState>(
      initialFormState
    );

  const [editing, setEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!open || assetId === null) {
      return;
    }

    async function loadData() {
      setLoading(true);
      setError("");
      setEditing(false);

      try {
        const [
          assetData,
          categoryData,
        ] = await Promise.all([
          apiGet<AssetDetail>(
            `/api/assets/${assetId}`
          ),
          apiGet<AssetCategory[]>(
            "/api/asset-categories"
          ),
        ]);

        setAsset(assetData);

        setCategories(
          categoryData.filter(
            (category) =>
              category.isActive ||
              category.id ===
                assetData.categoryId
          )
        );

        setForm({
          assetCode:
            assetData.assetCode ?? "",
          name:
            assetData.name ?? "",
          serialNumber:
            assetData.serialNumber ?? "",
          brand:
            assetData.brand ?? "",
          model:
            assetData.model ?? "",
          purchaseDate:
            getDateInputValue(
              assetData.purchaseDate
            ),
          purchasePrice:
            String(
              assetData.purchasePrice ?? 0
            ),
          warrantyExpirationDate:
            getDateInputValue(
              assetData.warrantyExpirationDate
            ),
          categoryId:
            String(assetData.categoryId),
          description:
            assetData.description ?? "",
          status:
            String(assetData.statusValue),
        });
      } catch (error: unknown) {
        setError(
          error instanceof Error
            ? error.message
            : "Không thể tải thông tin tài sản."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [open, assetId]);

  function updateField(
    field: keyof EditFormState,
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

    setAsset(null);
    setEditing(false);
    setError("");
    onClose();
  }

  function cancelEditing() {
    if (!asset) {
      return;
    }

    setForm({
      assetCode:
        asset.assetCode ?? "",
      name:
        asset.name ?? "",
      serialNumber:
        asset.serialNumber ?? "",
      brand:
        asset.brand ?? "",
      model:
        asset.model ?? "",
      purchaseDate:
        getDateInputValue(
          asset.purchaseDate
        ),
      purchasePrice:
        String(asset.purchasePrice ?? 0),
      warrantyExpirationDate:
        getDateInputValue(
          asset.warrantyExpirationDate
        ),
      categoryId:
        String(asset.categoryId),
      description:
        asset.description ?? "",
      status:
        String(asset.statusValue),
    });

    setEditing(false);
    setError("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      assetId === null ||
      !asset
    ) {
      return;
    }

    setError("");

    if (!form.categoryId) {
      setError(
        "Bạn chưa chọn danh mục tài sản."
      );
      return;
    }

    const purchasePrice =
      Number(form.purchasePrice);

    if (
      Number.isNaN(purchasePrice) ||
      purchasePrice < 0
    ) {
      setError(
        "Giá mua tài sản không hợp lệ."
      );
      return;
    }

    const request: UpdateAssetRequest = {
      assetCode:
        form.assetCode.trim(),
      name:
        form.name.trim(),
      serialNumber:
        form.serialNumber.trim(),
      brand:
        form.brand.trim(),
      model:
        form.model.trim(),
      purchaseDate:
        form.purchaseDate,
      purchasePrice,
      warrantyExpirationDate:
        form.warrantyExpirationDate,
      categoryId:
        Number(form.categoryId),
      status:
        Number(form.status),
      description:
        form.description.trim(),
    };

    setSubmitting(true);

    try {
      const updatedAsset = await apiPut<
        AssetDetail,
        UpdateAssetRequest
      >(
        `/api/assets/${assetId}`,
        request
      );

      setAsset(updatedAsset);
      setEditing(false);
      onUpdated(updatedAsset);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật tài sản."
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
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Chi tiết tài sản
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Xem và cập nhật thông tin thiết bị
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

        {loading && (
          <div className="flex min-h-72 items-center justify-center gap-3 text-slate-500">
            <LoaderCircle
              size={22}
              className="animate-spin"
            />

            Đang tải thông tin tài sản...
          </div>
        )}

        {!loading && error && !asset && (
          <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {!loading && asset && !editing && (
          <div className="space-y-6 p-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <section className="flex flex-wrap items-start justify-between gap-4 rounded-2xl bg-slate-950 p-6 text-white">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
                  {asset.assetCode}
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {asset.name}
                </h3>

                <p className="mt-2 text-sm text-slate-300">
                  {asset.categoryCode} -{" "}
                  {asset.categoryName}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditing(true)
                }
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                <Pencil size={17} />
                Chỉnh sửa
              </button>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <article className="rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Serial Number
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {asset.serialNumber ??
                    "Chưa cập nhật"}
                </p>
              </article>

              <article className="rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Trạng thái
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {asset.status}
                </p>
              </article>

              <article className="rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Hãng
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {asset.brand ??
                    "Chưa cập nhật"}
                </p>
              </article>

              <article className="rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Model
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {asset.model ??
                    "Chưa cập nhật"}
                </p>
              </article>

              <article className="rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Ngày mua
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {formatDate(
                    asset.purchaseDate
                  )}
                </p>
              </article>

              <article className="rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Giá mua
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {formatCurrency(
                    asset.purchasePrice
                  )}
                </p>
              </article>

              <article className="rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Hạn bảo hành
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {formatDate(
                    asset.warrantyExpirationDate
                  )}
                </p>
              </article>

              <article className="rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Cập nhật gần nhất
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {formatDate(
                    asset.updatedAt
                  )}
                </p>
              </article>
            </section>

            <section className="rounded-xl border border-slate-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Mô tả
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {asset.description ||
                  "Chưa có mô tả."}
              </p>
            </section>
          </div>
        )}

        {!loading && asset && editing && (
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
                  Mã tài sản *
                </span>

                <input
                  required
                  value={form.assetCode}
                  onChange={(event) =>
                    updateField(
                      "assetCode",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  Tên tài sản *
                </span>

                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  Serial Number *
                </span>

                <input
                  required
                  value={
                    form.serialNumber
                  }
                  onChange={(event) =>
                    updateField(
                      "serialNumber",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  Danh mục *
                </span>

                <select
                  required
                  value={form.categoryId}
                  onChange={(event) =>
                    updateField(
                      "categoryId",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.code} -{" "}
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  Hãng
                </span>

                <input
                  value={form.brand}
                  onChange={(event) =>
                    updateField(
                      "brand",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  Model
                </span>

                <input
                  value={form.model}
                  onChange={(event) =>
                    updateField(
                      "model",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  Ngày mua *
                </span>

                <input
                  required
                  type="date"
                  value={
                    form.purchaseDate
                  }
                  onChange={(event) =>
                    updateField(
                      "purchaseDate",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  Giá mua *
                </span>

                <input
                  required
                  min="0"
                  type="number"
                  value={
                    form.purchasePrice
                  }
                  onChange={(event) =>
                    updateField(
                      "purchasePrice",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  Hạn bảo hành *
                </span>

                <input
                  required
                  type="date"
                  value={
                    form.warrantyExpirationDate
                  }
                  onChange={(event) =>
                    updateField(
                      "warrantyExpirationDate",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  Trạng thái *
                </span>

                <select
                  required
                  value={form.status}
                  onChange={(event) =>
                    updateField(
                      "status",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {statusOptions.map(
                    (status) => (
                      <option
                        key={status.value}
                        value={status.value}
                      >
                        {status.label}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">
                  Mô tả
                </span>

                <textarea
                  rows={4}
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
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