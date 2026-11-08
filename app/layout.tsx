import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/geist-latin.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico?v=sajati",
    shortcut: "/favicon.ico?v=sajati",
    apple: "/img/SAJATI_Logo.png",
  },
  title: "SAJATI — Sistem Jejaring Sampah Bernilai dan Terintegrasi",
  description:
    "Prototype pengalaman pengguna sistem pengelolaan sampah bernilai untuk Kabupaten Tasikmalaya. Jejaring pengelolaan sampah terintegrasi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
