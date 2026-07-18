import Link from "next/link";

export default function MealPage() {
  return (
    <main className="min-h-screen bg-slate-100 pb-24">

      <div className="bg-blue-600 rounded-b-[40px] p-8 text-white">

        <h1 className="text-3xl font-bold">
          🍱 오늘 급식
        </h1>

        <p className="text-blue-100 mt-2">
          원통고등학교 급식정보
        </p>

      </div>

      <div className="p-5">

        <div className="bg-white rounded-3xl shadow p-6">

          <p className="text-gray-400">
            2026년 7월 19일 (일)
          </p>

          <div className="mt-5 space-y-3 text-lg">

            <p>🍚 흰쌀밥</p>

            <p>🥩 제육볶음</p>

            <p>🥣 미역국</p>

            <p>🥬 배추김치</p>

            <p>🥛 우유</p>

          </div>

        </div>

      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t">

        <div className="grid grid-cols-4 text-center py-3">

          <Link href="/">
            🏠<br />홈
          </Link>

          <Link href="/notice">
            📢<br />공지
          </Link>

          <Link href="/exam">
            📖<br />시험
          </Link>

          <Link href="/my">
            👤<br />마이
          </Link>

        </div>

      </div>

    </main>
  );
}