"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    href: "/",
    label: "홈",
    icon: "🏠",
  },
  {
    href: "/notice",
    label: "공지",
    icon: "📢",
  },
  {
    href: "/calendar",
    label: "일정",
    icon: "📅",
  },
  {
    href: "/suggestion",
    label: "건의",
    icon: "💬",
  },
  {
    href: "/my",
    label: "마이",
    icon: "👤",
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto grid w-full max-w-md grid-cols-5">
        {navigationItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition ${
                isActive
                  ? "text-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}