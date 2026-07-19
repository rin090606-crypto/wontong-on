import Link from "next/link";
import { homeNotices } from "@/data/homeNotices";

const categoryStyle = {
  학생회: "bg-blue-50 text-blue-600",
  학교: "bg-green-50 text-green-600",
  행사: "bg-purple-50 text-purple-600",
};

export default function NoticeCard() {
  const recentNotices = homeNotices.slice(0, 3);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-blue-600">
            새로운 소식
          </p>

          <h2 className="mt-1 text-lg font-bold text-gray-900">
            최신 공지
          </h2>
        </div>

        <Link
          href="/notice"
          className="text-sm font-semibold text-blue-600"
        >
          전체보기 ›
        </Link>
      </div>

      <div className="mt-5 divide-y divide-gray-100">
        {recentNotices.map((notice) => (
          <Link
            key={notice.id}
            href="/notice"
            className="block py-4 first:pt-0 last:pb-0"
          >
            <div className="flex items-start gap-3">
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                  categoryStyle[notice.category]
                }`}
              >
                {notice.category}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-gray-900">
                    {notice.title}
                  </h3>

                  {notice.isNew && (
                    <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      NEW
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-gray-400">
                  {notice.date}
                </p>
              </div>

              <span
                aria-hidden="true"
                className="text-lg text-gray-300"
              >
                ›
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}