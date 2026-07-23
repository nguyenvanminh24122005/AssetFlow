"use client";

import {
  Boxes,
  CircleCheckBig,
  CircleOff,
  FolderTree,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import CategoryModal from "@/components/categories/CategoryModal";
import {
  apiDelete,
  apiGet,
} from "@/lib/api";
import type {
  AssetCategory,
} from "@/types/categories";

type CategoryStatusFilter =
  | "all"
  | "active"
  | "inactive";

export default function CategoriesPage() {
  const [categories, setCategories] =
    useState<AssetCategory[]>([]);

  const [keyword, setKeyword] =
    useState("");

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState<CategoryStatusFilter>(
    "all"
  );

  const [loading, setLoading] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<AssetCategory | null>(
    null
  );

  const loadCategories =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await apiGet<
            AssetCategory[]
          >("/api/asset-categories");

        setCategories(data);
      } catch (error: unknown) {
        setError(
          error instanceof Error
            ? error.message
            : "Không thể tải danh mục."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const statistics = useMemo(() => {
    const active = categories.filter(
      (category) => category.isActive
    ).length;

    const inactive = categories.filter(
      (category) => !category.isActive
    ).length;

    const categoriesWithAssets =
      categories.filter(
        (category) =>
          category.assetCount > 0
      ).length;

    return {
      total: categories.length,
      active,
      inactive,
      categoriesWithAssets,
    };
  }, [categories]);

  const filteredCategories =
    useMemo(() => {
      const normalizedKeyword =
        keyword
          .trim()
          .toLowerCase();

      return categories.filter(
        (category) => {
          const matchesKeyword =
            normalizedKeyword.length === 0 ||
            category.code
              .toLowerCase()
              .includes(
                normalizedKeyword
              ) ||
            category.name
              .toLowerCase()
              .includes(
                normalizedKeyword
              ) ||
            category.description
              ?.toLowerCase()
              .includes(
                normalizedKeyword
              );

          const matchesStatus =
            selectedStatus === "all" ||
            (selectedStatus ===
              "active" &&
              category.isActive) ||
            (selectedStatus ===
              "inactive" &&
              !category.isActive);

          return Boolean(
            matchesKeyword &&
              matchesStatus
          );
        }
      );
    }, [
      categories,
      keyword,
      selectedStatus,
    ]);

  function openCreateModal() {
    setSelectedCategory(null);
    setModalOpen(true);
  }

  function openEditModal(
    category: AssetCategory
  ) {
    setSelectedCategory(category);
    setModalOpen(true);
  }

  function handleSaved(
    savedCategory: AssetCategory
  ) {
    setCategories((current) => {
      const exists = current.some(
        (category) =>
          category.id ===
          savedCategory.id
      );

      if (!exists) {
        return [
          savedCategory,
          ...current,
        ];
      }

      return current.map(
        (category) =>
          category.id ===
          savedCategory.id
            ? savedCategory
            : category
      );
    });
  }

  async function deactivateCategory(
    category: AssetCategory
  ) {
    if (!category.isActive) {
      return;
    }

    if (category.assetCount > 0) {
      setError(
        `Danh mục ${category.code} đang có ${category.assetCount} tài sản nên chưa thể ngừng hoạt động.`
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Bạn có chắc muốn ngừng hoạt động danh mục ${category.code} không?`
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(category.id);
    setError("");

    try {
      await apiDelete(
        `/api/asset-categories/${category.id}`
      );

      await loadCategories();
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Không thể ngừng hoạt động danh mục."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            Danh mục tài sản
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Phân loại và quản lý các nhóm thiết bị trong hệ thống
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus size={18} />
          Thêm danh mục
        </button>
      </section>

      {!loading && !error && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Tổng danh mục
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {statistics.total}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <FolderTree size={22} />
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
                  Có tài sản
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {
                    statistics.categoriesWithAssets
                  }
                </p>
              </div>

              <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
                <Boxes size={22} />
              </div>
            </div>
          </article>
        </section>
      )}

      {error && (
        <section className="flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <div>
            <p className="font-semibold">
              Không thể thực hiện
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-sm font-semibold"
          >
            Đóng
          </button>
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
                  setKeyword(
                    event.target.value
                  )
                }
                placeholder="Tìm mã, tên hoặc mô tả danh mục..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(
                  event.target
                    .value as CategoryStatusFilter
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
              onClick={() =>
                void loadCategories()
              }
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Làm mới
            </button>
          </div>
        </div>

        {loading && (
          <div className="p-12 text-center text-slate-500">
            Đang tải danh mục tài sản...
          </div>
        )}

        {!loading && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-6 py-4">
              <p className="text-sm text-slate-500">
                Đang hiển thị{" "}
                <strong className="text-slate-900">
                  {
                    filteredCategories.length
                  }
                </strong>{" "}
                trên{" "}
                <strong className="text-slate-900">
                  {categories.length}
                </strong>{" "}
                danh mục
              </p>

              {(keyword ||
                selectedStatus !==
                  "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setKeyword("");
                    setSelectedStatus(
                      "all"
                    );
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
                      Mã danh mục
                    </th>

                    <th className="px-6 py-4">
                      Tên danh mục
                    </th>

                    <th className="px-6 py-4">
                      Mô tả
                    </th>

                    <th className="px-6 py-4">
                      Số tài sản
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
                  {filteredCategories.map(
                    (category) => (
                      <tr
                        key={category.id}
                        className="border-b text-sm text-slate-700 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 font-semibold text-blue-700">
                          {category.code}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                              <FolderTree
                                size={19}
                              />
                            </div>

                            <p className="font-semibold text-slate-900">
                              {category.name}
                            </p>
                          </div>
                        </td>

                        <td className="max-w-xs px-6 py-4">
                          <p className="line-clamp-2">
                            {category.description ||
                              "Chưa có mô tả"}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            {
                              category.assetCount
                            }{" "}
                            tài sản
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={[
                              "whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold",
                              category.isActive
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-200 text-slate-600",
                            ].join(" ")}
                          >
                            {category.isActive
                              ? "Đang hoạt động"
                              : "Ngừng hoạt động"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  category
                                )
                              }
                              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              <Pencil
                                size={14}
                              />
                              Sửa
                            </button>

                            {category.isActive && (
                              <button
                                type="button"
                                onClick={() =>
                                  void deactivateCategory(
                                    category
                                  )
                                }
                                disabled={
                                  deletingId ===
                                    category.id ||
                                  category.assetCount >
                                    0
                                }
                                title={
                                  category.assetCount >
                                  0
                                    ? "Danh mục đang có tài sản"
                                    : "Ngừng hoạt động danh mục"
                                }
                                className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Power
                                  size={14}
                                />

                                {deletingId ===
                                category.id
                                  ? "Đang xử lý"
                                  : "Ngừng"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>

              {filteredCategories.length ===
                0 && (
                <div className="p-12 text-center">
                  <FolderTree
                    size={40}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 font-semibold text-slate-700">
                    Không tìm thấy danh mục
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

      <CategoryModal
        open={modalOpen}
        category={selectedCategory}
        onClose={() => {
          setModalOpen(false);
          setSelectedCategory(null);
        }}
        onSaved={handleSaved}
      />
    </div>
  );
}