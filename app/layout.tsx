import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/toast-provider";
import { RotatingBadge } from "@/components/rotating-badge";
import "./globals.css";

const BASE_URL = "https://decide-for-me-bay.vercel.app";

export const metadata: Metadata = {
  title: "대신결정해줘",
  description: "공부하다 막히면 우리한테 맡겨 — 익명 투표 앱",
  openGraph: {
    title: "대신결정해줘",
    description: "공부하다 막히면 우리한테 맡겨 — 익명 투표 앱",
    url: BASE_URL,
    siteName: "대신결정해줘",
    images: [
      {
        url: `${BASE_URL}/api/og-default`,
        width: 1200,
        height: 630,
        alt: "대신결정해줘",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "대신결정해줘",
    description: "공부하다 막히면 우리한테 맡겨",
    images: [`${BASE_URL}/api/og-default`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "'Pretendard', sans-serif" }}
      >
        <ToastProvider>{children}</ToastProvider>
        <RotatingBadge />
      </body>
    </html>
  );
}
