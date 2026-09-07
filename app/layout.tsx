import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "캠퍼스몽 · 근무편성표",
  description: "대학교 경비 근무·휴무·연가 편성 도우미",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
