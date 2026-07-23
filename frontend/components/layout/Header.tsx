"use client";

import { usePathname } from "next/navigation";
import { Bell, Menu, Search } from "lucide-react";

type HeaderProps = {
  onOpenMobileMenu: () => void;
};

const pageTitles: Record<string, string> = {
  "/dashboard": "Tổng quan",
  "/categories": "Danh mục tài sản",
  "/assets": "Quản lý tài sản",
  "/employees": "Quản lý nhân viên",
  "/handovers": "Phiếu bàn giao",
};

function getPageTitle(pathname: string) {
  const matchedPath = Object.keys(pageTitles).find(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`)
  );

  return matchedPath
    ? pageTitles[matchedPath]
    : "AssetFlow";
}

export default function Header({
  onOpenMobileMenu,
}: HeaderProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-20 items-center justify-between gap-4 px-5 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Mở thanh điều hướng"
          >
            <Menu size={21} />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-slate-900">
              {pageTitle}
            </h1>

            <p className="hidden text-sm text-slate-500 sm:block">
              Hệ thống quản lý và bàn giao tài sản công ty
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            className="hidden rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-100 sm:block"
            aria-label="Tìm kiếm"
          >
            <Search size={20} />
          </button>

          <button
            type="button"
            className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-100"
            aria-label="Thông báo"
          >
            <Bell size={20} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <div className="ml-1 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              AD
            </div>

            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-slate-900">
                Quản trị viên
              </p>

              <p className="text-xs text-slate-500">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}