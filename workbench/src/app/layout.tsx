import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { WorkbenchShell } from "@/components/workbench-shell";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { catalog } from "@/lib/repo";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 视频工作台",
  description: "把仓库里的 Skills、路由和交付物放在一个本地只读界面里。",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const index = catalog();
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} dark h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased">
        <ThemeProvider>
          <TooltipProvider>
            <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">正在读取仓库…</div>}>
              <WorkbenchShell catalog={index}>{children}</WorkbenchShell>
            </Suspense>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
