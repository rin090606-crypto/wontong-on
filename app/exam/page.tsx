import Link from "next/link";
import { exams } from "../../data/exam";

export default function ExamPage() {
  return (
    <main className="min-h-screen bg-slate-100 pb-24">

      {/* 헤더 */}
      <div className="bg-blue-600 rounded-b-[40px] p-8 text-white shadow-lg">

        <h1 className="text-3xl font-bold">
          📖 시험범위
        </h1>

        <p className="text-blue-100 mt-2">
          학년별 시험범위를 확인하세요.
        </p>

      </div>

      <div className="p-5 space-y-6">

        {Object.entries(exams).map(([grade, subjects]) => (

          <div
            key={grade}
            className="bg-white rounded-3xl shadow-lg p-6"
          >

            <div className="flex justify-between items-center">

              <h2 className="text-2xl font-bold text-blue-600">
                {grade}학년
              </h2>

              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                {subjects.length}과목
              </span>

            </div>

            <div className="mt-5 space-y-3">

              {subjects.map((subject, index) => (

                <div
                  key={index}
                  className="bg-slate-100 rounded-2xl p-4"
                >
                  {subject}
                </div>

              ))}

            </div>

          </div>

        ))}

      </div>

      {/* 하단 메뉴 */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg">

        <div className="grid grid-cols-4 text-center py-3">

          <Link href="/">
            🏠<br />
            홈
          </Link>

          <Link href="/notice">
            📢<br />
            공지
          </Link>

          <Link
            href="/exam"
            className="text-blue-600 font-semibold"
          >
            📖<br />
            시험
          </Link>

          <Link href="/my">
            👤<br />
            마이
          </Link>

        </div>

      </div>

    </main>
  );
}