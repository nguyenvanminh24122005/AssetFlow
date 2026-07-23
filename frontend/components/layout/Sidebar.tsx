"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Tags,
  Users,
  X,
} from "lucide-react";

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleCollapse: () => void;
};

const navigationItems = [
  {
    label: "Tổng quan",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Danh mục tài sản",
    href: "/categories",
    icon: Tags,
  },
  {
    label: "Quản lý tài sản",
    href: "/assets",
    icon: Boxes,
  },
  {
    label: "Quản lý nhân viên",
    href: "/employees",
    icon: Users,
  },
  {
    label: "Phiếu bàn giao",
    href: "/handovers",
    icon: ClipboardList,
  },
];

export default function Sidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-50 flex w-72 flex-col",
        "border-r border-slate-800 bg-slate-950 text-white",
        "transition-all duration-300",
        mobileOpen
          ? "translate-x-0"
          : "-translate-x-full md:translate-x-0",
        collapsed ? "md:w-20" : "md:w-72",
      ].join(" ")}
    >
      <div className="flex h-20 items-center justify-between border-b border-slate-800 px-5">
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-3"
          onClick={onCloseMobile}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-bold">
            AF
          </div>

          {(!collapsed || mobileOpen) && (
            <div className="min-w-0">
              <p className="truncate text-lg font-bold">
                AssetFlow
              </p>

              <p className="truncate text-xs text-slate-400">
                Quản lý tài sản
              </p>
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={onCloseMobile}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
          aria-label="Đóng thanh điều hướng"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-6">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              title={collapsed ? item.label : undefined}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-3",
                "text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
                collapsed ? "md:justify-center" : "",
              ].join(" ")}
            >
              <Icon size={20} className="shrink-0" />

              {(!collapsed || mobileOpen) && (
                <span>{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-slate-800 p-3 md:block">
        <button
          type="button"
          onClick={onToggleCollapse}
          className={[
            "flex w-full items-center rounded-xl px-3 py-3",
            "text-sm text-slate-300",
            "hover:bg-slate-800 hover:text-white",
            collapsed
              ? "justify-center"
              : "justify-between",
          ].join(" ")}
        >
          {!collapsed && <span>Thu gọn menu</span>}

          {collapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>
    </aside>
  );
}