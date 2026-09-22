import type { Metadata, Viewport } from "next";
import { SvgDefs } from "@/components/SvgDefs";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Хишиг ус", template: "%s · Хишиг ус" },
  description: "Арвайхээр сум дотор байгалийн цэвэр ус хаалган дээр тань хүргэнэ.",
  icons: { icon: "/logo.svg" },
};

export const viewport: Viewport = { themeColor: "#22224F", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // suppressHydrationWarning: the inline script below may add a class to <html> before React hydrates.
  return (
    <html lang="mn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SvgDefs />
        {children}
        <script
          // Real refraction only where it is supported and cheap enough (desktop Chromium).
          dangerouslySetInnerHTML={{ __html: "if(/Chrome\\//.test(navigator.userAgent)&&matchMedia('(hover: hover)').matches)document.documentElement.classList.add('refract')" }}
        />
      </body>
    </html>
  );
}
