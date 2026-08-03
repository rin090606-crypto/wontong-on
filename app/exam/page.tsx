import Link from "next/link";
import { exams } from "../../data/exam";

export default function ExamPage() {
  return (
    <main className="min-h-screen bg-slate-100 pb-24 text-slate-900">
      {/* 헤더 */}
      <div className="rounded-b-[40px] bg-blue-600 p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold text-white">📖 시험범위</h1>

        <p className="mt-2 font-medium text-blue-100">
          학년별 시험범위를 확인하세요.
        </p>
      </div>

      <div className="space-y-6 p-5">
        {Object.entries(exams).map(([grade, subjects]) => (
          <div
            key={grade}
            className="rounded-3xl bg-white p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-blue-600">
                {grade}학년
              </h2>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                {subjects.length}과목
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {subjects.map((subject, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-slate-100 p-4 font-semibold text-slate-900"
                >
                  {subject}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 하단 메뉴 */}
      <div className="fixed bottom-0 left-0 w-full border-t bg-white shadow-lg">
        <div className="grid grid-cols-4 py-3 text-center font-medium text-slate-700">
          <Link href="/">
            🏠
            <br />
            홈
          </Link>

          <Link href="/notice">
            📢
            <br />
            공지
          </Link>

          <Link href="/exam" className="font-semibold text-blue-600">
            📖
            <br />
            시험
          </Link>

          <Link href="/my">
            👤
            <br />
            마이
          </Link>
        </div>
      </div>
    </main>
  );
}