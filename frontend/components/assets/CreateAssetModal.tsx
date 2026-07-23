"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import type {
  AssetCategory,
  AssetFormState,
  CreateAssetRequest,
} from "@/types/assets";
import type { Asset } from "@/types/dashboard";

type CreateAssetModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (asset: Asset) => void;
};

const initialFormState: AssetFormState = {
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
};

export default function CreateAssetModal({
  open,
  onClose,
  onCreated,
}: CreateAssetModalProps) {
  const [form, setForm] =
    useState<AssetFormState>(initialFormState);

  const [categories, setCategories] =
    useState<AssetCategory[]>([]);

  const [loadingCategories, setLoadingCategories] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    async function loadCategories() {
      setLoadingCategories(true);
      setError("");

      try {
        const data = await apiGet<AssetCategory[]>(
          "/api/asset-categories"
        );

        setCategories(
          data.filter((category) => category.isActive)
        );
      } catch (error: unknown) {
        setError(
          error instanceof Error
            ? error.message
            : "Không thể tải danh mục tài sản."
        );
      } finally {
        setLoadingCategories(false);
      }
    }

    void loadCategories();
  }, [open]);

  function updateField(
    field: keyof AssetFormState,
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

    setForm(initialFormState);
    setError("");
    onClose();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!form.categoryId) {
      setError("Bạn chưa chọn danh mục tài sản.");
      return;
    }

    const purchasePrice = Number(form.purchasePrice);

    if (
      Number.isNaN(purchasePrice) ||
      purchasePrice < 0
    ) {
      setError("Giá mua tài sản không hợp lệ.");
      return;
    }

    const request: CreateAssetRequest = {
      assetCode: form.assetCode.trim(),
      name: form.name.trim(),
      serialNumber: form.serialNumber.trim(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      purchaseDate: form.purchaseDate,
      purchasePrice,
      warrantyExpirationDate:
        form.warrantyExpirationDate,
      categoryId: Number(form.categoryId),
      description: form.description.trim(),
    };

    setSubmitting(true);

    try {
      const createdAsset = await apiPost<
        Asset,
        CreateAssetRequest
      >("/api/assets", request);

      onCreated(createdAsset);
      setForm(initialFormState);
      onClose();
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Không thể thêm tài sản."
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
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Thêm tài sản mới
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Nhập thông tin thiết bị cần quản lý
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
        </div>

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
                maxLength={50}
                value={form.assetCode}
                onChange={(event) =>
                  updateField(
                    "assetCode",
                    event.target.value
                  )
                }
                placeholder="Ví dụ: LT-002"
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
                placeholder="Ví dụ: Dell Latitude 5430"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Serial Number *
              </span>

              <input
                required
                value={form.serialNumber}
                onChange={(event) =>
                  updateField(
                    "serialNumber",
                    event.target.value
                  )
                }
                placeholder="Ví dụ: DELL-5430-002"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Danh mục *
              </span>

              <select
                required
                disabled={loadingCategories}
                value={form.categoryId}
                onChange={(event) =>
                  updateField(
                    "categoryId",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  {loadingCategories
                    ? "Đang tải danh mục..."
                    : "Chọn danh mục"}
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.code} - {category.name}
                  </option>
                ))}
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
                placeholder="Ví dụ: Dell"
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
                placeholder="Ví dụ: Latitude 5430"
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
                value={form.purchaseDate}
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
                step="1000"
                type="number"
                value={form.purchasePrice}
                onChange={(event) =>
                  updateField(
                    "purchasePrice",
                    event.target.value
                  )
                }
                placeholder="Ví dụ: 19000000"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">
                Ngày hết hạn bảo hành *
              </span>

              <input
                required
                type="date"
                value={form.warrantyExpirationDate}
                onChange={(event) =>
                  updateField(
                    "warrantyExpirationDate",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">
                Mô tả
              </span>

              <textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                placeholder="Mô tả tình trạng hoặc mục đích sử dụng..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
              disabled={
                submitting || loadingCategories
              }
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              )}

              {submitting
                ? "Đang lưu..."
                : "Thêm tài sản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}