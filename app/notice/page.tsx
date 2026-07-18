import Link from "next/link";
import { notices } from "../../data/notice";

export default function NoticePage() {
  return (
    <main className="min-h-screen bg-slate-100 pb-24">
      <div className="bg-blue-600 rounded-b-[40px] p-8 text-white">
        <h1 className="text-3xl font-bold">📢 공지사항</h1>
        <p className="text-blue-100 mt-2">
          학교의 새로운 소식을 확인하세요.
        </p>
      </div>

      <div className="p-5 space-y-4">
        {notices.map((notice) => (
          <Link
            key={notice.id}
            href={`/notice/${notice.id}`}
            className="block bg-white rounded-3xl shadow p-5 hover:shadow-xl transition"
          >
            <h2 className="font-bold text-lg">
              {notice.title}
            </h2>

            <p className="text-gray-400 mt-2">
              {notice.date}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}