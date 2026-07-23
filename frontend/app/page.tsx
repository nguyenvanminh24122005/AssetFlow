"use client";

import { useEffect, useState } from "react";

type Asset = {
  id: number;
  assetCode: string;
  name: string;
  brand: string | null;
  model: string | null;
  statusValue: number;
  status: string;
  categoryCode: string;
  categoryName: string;
};

export default function Home() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAssets() {
      try {
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL;

        if (!apiBaseUrl) {
          throw new Error(
            "Chưa cấu hình NEXT_PUBLIC_API_BASE_URL."
          );
        }

        const response = await fetch(
          `${apiBaseUrl}/api/assets`
        );

        if (!response.ok) {
          throw new Error(
            `Backend trả về lỗi HTTP ${response.status}.`
          );
        }

        const data: Asset[] = await response.json();
        setAssets(data);
      } catch (error: unknown) {
        setError(
          error instanceof Error
            ? error.message
            : "Không thể kết nối đến Backend."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAssets();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-2xl bg-slate-900 p-8 text-white shadow-lg">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
            AssetFlow
          </p>

          <h1 className="text-3xl font-bold">
            Hệ thống quản lý tài sản công ty
          </h1>

          <p className="mt-3 text-slate-300">
            Next.js kết nối ASP.NET Core Web API
          </p>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Danh sách tài sản
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Dữ liệu được lấy trực tiếp từ Backend
              </p>
            </div>

            {!loading && !error && (
              <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                Đã kết nối API
              </span>
            )}
          </div>

          {loading && (
            <div className="rounded-xl bg-slate-50 p-5 text-slate-600">
              Đang tải dữ liệu...
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
              <p className="font-semibold">
                Không thể kết nối Backend
              </p>

              <p className="mt-1 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="mb-6 rounded-xl bg-blue-50 p-5">
                <p className="text-sm font-medium text-blue-700">
                  Tổng số tài sản
                </p>

                <p className="mt-1 text-3xl font-bold text-blue-950">
                  {assets.length}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b bg-slate-50 text-sm text-slate-600">
                      <th className="p-4">Mã tài sản</th>
                      <th className="p-4">Tên thiết bị</th>
                      <th className="p-4">Hãng</th>
                      <th className="p-4">Danh mục</th>
                      <th className="p-4">Trạng thái</th>
                    </tr>
                  </thead>

                  <tbody>
                    {assets.map((asset) => (
                      <tr
                        key={asset.id}
                        className="border-b text-sm text-slate-700"
                      >
                        <td className="p-4 font-semibold text-blue-700">
                          {asset.assetCode}
                        </td>

                        <td className="p-4">{asset.name}</td>

                        <td className="p-4">
                          {asset.brand ?? "—"}
                        </td>

                        <td className="p-4">
                          {asset.categoryName}
                        </td>

                        <td className="p-4">
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {asset.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {assets.length === 0 && (
                  <p className="py-10 text-center text-slate-500">
                    Chưa có tài sản trong hệ thống.
                  </p>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}