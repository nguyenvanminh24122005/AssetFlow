"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  LoaderCircle,
  Plus,
  Save,
  X,
} from "lucide-react";
import {
  apiPost,
  apiPut,
} from "@/lib/api";
import type {
  AssetCategory,
  CategoryFormState,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/categories";

type CategoryModalProps = {
  open: boolean;
  category: AssetCategory | null;
  onClose: () => void;
  onSaved: (category: AssetCategory) => void;
};

const initialForm: CategoryFormState = {
  code: "",
  name: "",
  description: "",
  isActive: true,
};

export default function CategoryModal({
  open,
  category,
  onClose,
  onSaved,
}: CategoryModalProps) {
  const [form, setForm] =
    useState<CategoryFormState>(initialForm);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const editing = category !== null;

  useEffect(() => {
    if (!open) {
      return;
    }

    setError("");

    if (category) {
      setForm({
        code: category.code,
        name: category.name,
        description:
          category.description ?? "",
        isActive: category.isActive,
      });

      return;
    }

    setForm(initialForm);
  }, [open, category]);

  function updateTextField(
    field: "code" | "name" | "description",
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

    setError("");
    setForm(initialForm);
    onClose();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    const code = form.code
      .trim()
      .toUpperCase();

    const name = form.name.trim();
    const description =
      form.description.trim();

    if (!code) {
      setError("Bạn chưa nhập mã danh mục.");
      return;
    }

    if (!name) {
      setError("Bạn chưa nhập tên danh mục.");
      return;
    }

    setSubmitting(true);

    try {
      let savedCategory: AssetCategory;

      if (category) {
        const request: UpdateCategoryRequest = {
          code,
          name,
          description,
          isActive: form.isActive,
        };

        savedCategory = await apiPut<
          AssetCategory,
          UpdateCategoryRequest
        >(
          `/api/asset-categories/${category.id}`,
          request
        );
      } else {
        const request: CreateCategoryRequest = {
          code,
          name,
          description,
        };

        savedCategory = await apiPost<
          AssetCategory,
          CreateCategoryRequest
        >(
          "/api/asset-categories",
          request
        );
      }

      onSaved(savedCategory);
      setForm(initialForm);
      onClose();
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : editing
            ? "Không thể cập nhật danh mục."
            : "Không thể thêm danh mục."
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
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              {editing
                ? "Cập nhật danh mục"
                : "Thêm danh mục"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editing
                ? "Chỉnh sửa thông tin danh mục tài sản"
                : "Tạo nhóm phân loại cho tài sản"}
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
          className="space-y-5 p-6"
        >
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Mã danh mục *
            </span>

            <input
              required
              maxLength={50}
              value={form.code}
              onChange={(event) =>
                updateTextField(
                  "code",
                  event.target.value
                )
              }
              placeholder="Ví dụ: MONITOR"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="text-xs text-slate-500">
              Mã danh mục phải duy nhất trong hệ thống.
            </p>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Tên danh mục *
            </span>

            <input
              required
              value={form.name}
              onChange={(event) =>
                updateTextField(
                  "name",
                  event.target.value
                )
              }
              placeholder="Ví dụ: Màn hình máy tính"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Mô tả
            </span>

            <textarea
              rows={4}
              value={form.description}
              onChange={(event) =>
                updateTextField(
                  "description",
                  event.target.value
                )
              }
              placeholder="Mô tả các loại tài sản thuộc danh mục..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          {editing && (
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Đang hoạt động
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Danh mục hoạt động có thể được chọn khi thêm tài sản.
                </p>
              </div>

              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isActive:
                      event.target.checked,
                  }))
                }
                className="h-5 w-5 rounded border-slate-300 accent-blue-600"
              />
            </label>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white pt-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : editing ? (
                <Save size={17} />
              ) : (
                <Plus size={17} />
              )}

              {submitting
                ? "Đang lưu..."
                : editing
                  ? "Lưu thay đổi"
                  : "Thêm danh mục"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}