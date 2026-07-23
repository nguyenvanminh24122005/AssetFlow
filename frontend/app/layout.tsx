import type { Metadata } from "next";
import "./globals.css";
import AdminShell from "@/components/layout/AdminShell";

export const metadata: Metadata = {
  title: "AssetFlow - Quản lý tài sản",
  description:
    "Hệ thống quản lý thiết bị và bàn giao tài sản công ty",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}