import type { Metadata, Viewport } from "next";
import { Onest } from "next/font/google";
import { headers } from "next/headers";
import { SvgDefs } from "@/components/SvgDefs";
import "./globals.css";

// Self-hosted at build time: no request to Google at runtime, no layout shift while the font loads.
const onest = Onest({ subsets: ["latin", "cyrillic"], variable: "--font-onest", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Хишиг ус", template: "%s · Хишиг ус" },
  description: "Арвайхээр сум дотор байгалийн цэвэр ус хаалган дээр тань хүргэнэ.",
  applicationName: "Хишиг ус",
  // Bank accounts and ids must not turn into tap-to-call links on iOS; real phone links are explicit tel: anchors.
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = { themeColor: "#22224F", viewportFit: "cover" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Reading the request headers renders every route per request, which the nonce-based CSP set in proxy.ts needs
  // (Next.js stamps that nonce on its own scripts during rendering).
  await headers();
  return (
    <html lang="mn" className={onest.variable}>
      <body>
        <SvgDefs />
        {children}
      </body>
    </html>
  );
}
