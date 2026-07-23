"use client";

import { ReactNode, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

type AdminShellProps = {
  children: ReactNode;
};

export default function AdminShell({
  children,
}: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onToggleCollapse={() =>
          setCollapsed((current) => !current)
        }
      />

      {mobileOpen && (
        <button
          type="button"
          aria-label="Đóng lớp phủ điều hướng"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 md:hidden"
        />
      )}

      <div
        className={[
          "min-h-screen transition-[padding] duration-300",
          collapsed ? "md:pl-20" : "md:pl-72",
        ].join(" ")}
      >
        <Header
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <main className="p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}