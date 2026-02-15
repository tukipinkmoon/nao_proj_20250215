"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "ホーム" },
  { href: "/report", icon: BarChart3, label: "きろく" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 pb-24 lg:pb-0">{children}</main>

      {/* Bottom Navigation - 超シンプル2タブ */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40",
          "border-t-2 border-[var(--border)] bg-[var(--surface)]",
          "lg:hidden"
        )}
        aria-label="メインナビゲーション"
      >
        <div className="mx-auto flex max-w-lg items-center justify-around px-4 py-2">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-[var(--radius-lg)] px-8 py-3",
                  "transition-colors duration-150",
                  "min-w-[80px] min-h-[64px] justify-center",
                  isActive
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground-secondary)]"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-7 w-7" strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-heading text-sm font-bold">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
