import Link from "next/link";

const menuItems = [
  {
    href: "/exam",
    icon: "📚",
    title: "시험 일정",
    description: "시험 범위와 D-day를 확인하세요.",
  },
  {
    href: "/notice",
    icon: "📢",
    title: "학교 소식",
    description: "학생자치회와 학교 공지를 확인하세요.",
  },
  {
    href: "/calendar",
    icon: "📅",
    title: "학사 일정",
    description: "주요 학교 일정을 확인하세요.",
  },
  {
    href: "/suggestion",
    icon: "💬",
    title: "학생 건의",
    description: "학교생활 의견을 전달하세요.",
  },
];

export default function QuickMenu() {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          빠른 메뉴
        </h2>

        <span className="text-xs font-medium text-gray-400">
          자주 쓰는 기능
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-2xl">
              {item.icon}
            </span>

            <h3 className="mt-3 font-bold text-gray-900">
              {item.title}
            </h3>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}