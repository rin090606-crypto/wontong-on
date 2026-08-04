import type { Metadata, Viewport } from "next";
import BottomNavigation from "@/components/BottomNavigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "원통ON",
  description: "학생과 학교를 연결하다.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/wontong-on-icon-192-v2.png", sizes: "192x192", type: "image/png" },
      { url: "/wontong-on-icon-512-v2.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon-v2.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "원통ON",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900">
        {children}
        <BottomNavigation />
      </body>
    </html>
  );
}
