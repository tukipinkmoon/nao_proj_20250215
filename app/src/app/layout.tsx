import type { Metadata, Viewport } from "next";
import { Zen_Maru_Gothic, Nunito, Noto_Sans_JP, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const zenMaru = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-heading-loaded",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "のうかつ - 3世代つながる脳トレアプリ",
  description: "家族みんなで楽しく脳を鍛えよう。離れていても毎日つながる認知症予防アプリ。",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF8F3" },
    { media: "(prefers-color-scheme: dark)", color: "#1A2332" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={cn(zenMaru.variable, notoSansJP.variable, "min-h-dvh antialiased")}>
        {children}
      </body>
    </html>
  );
}
