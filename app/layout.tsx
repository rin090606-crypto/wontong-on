import type { Metadata } from "next";
import BottomNavigation from "@/components/BottomNavigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "원통ON",
  description: "학생과 학교를 연결하다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900">
        {children}
        <BottomNavigation />
      </body>
    </html>
  );
}