"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Users, Smile, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "ホーム", labelKids: "ホーム" },
  { href: "/family", icon: Users, label: "かぞく", labelKids: "かぞく" },
  { href: "/character", icon: Smile, label: "キャラ", labelKids: "キャラ" },
  { href: "/report", icon: BarChart3, label: "きろく", labelKids: "きろく" },
  { href: "/settings", icon: Settings, label: "せってい", labelKids: "せってい" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const uiMode = useUserStore((s) => s.settings.uiMode);

  return (
    <div data-mode={uiMode} className="flex min-h-dvh flex-col">
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>

      {/* Bottom Navigation */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40",
          "border-t border-[var(--border)] bg-[var(--surface)]",
          "lg:hidden"
        )}
        aria-label="メインナビゲーション"
      >
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-[var(--radius-md)] px-3 py-2",
                  "transition-colors duration-150",
                  "min-w-[48px] min-h-[48px] justify-center",
                  isActive
                    ? "text-[var(--primary)]"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground-secondary)]"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
                <span className="font-ui text-[10px]">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
