"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg">
      <div className="grid grid-cols-4 text-center py-3">

        <Link
          href="/"
          className={pathname === "/" ? "text-blue-600 font-bold" : ""}
        >
          🏠<br />
          홈
        </Link>

        <Link
          href="/notice"
          className={pathname.startsWith("/notice") ? "text-blue-600 font-bold" : ""}
        >
          📢<br />
          공지
        </Link>

        <Link
          href="/exam"
          className={pathname.startsWith("/exam") ? "text-blue-600 font-bold" : ""}
        >
          📖<br />
          시험
        </Link>

        <Link
          href="/my"
          className={pathname.startsWith("/my") ? "text-blue-600 font-bold" : ""}
        >
          👤<br />
          마이
        </Link>

      </div>
    </div>
  );
}