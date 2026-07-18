import Link from "next/link";

export default function MyPage() {
  return (
    <main className="min-h-screen bg-slate-100 pb-24">

      <div className="bg-blue-600 rounded-b-[40px] p-8 text-white">
        <h1 className="text-3xl font-bold">👤 마이페이지</h1>
        <p className="text-blue-100 mt-2">
          내 정보를 확인해보세요.
        </p>
      </div>

      <div className="p-5">

        <div className="bg-white rounded-3xl shadow p-6">

          <div className="flex items-center gap-4">

            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl">
              👤
            </div>

            <div>
              <h2 className="text-xl font-bold">
                김세린
              </h2>

              <p className="text-gray-500">
                2학년
              </p>
            </div>

          </div>

        </div>

        <div className="bg-white rounded-3xl shadow p-5 mt-5 space-y-4">

          <div className="flex justify-between">
            <span>💎 내 포인트</span>
            <span>125P</span>
          </div>

          <div className="flex justify-between">
            <span>📚 시험 D-Day</span>
            <span>D-12</span>
          </div>

          <div className="flex justify-between">
            <span>🏫 학교</span>
            <span>원통고등학교</span>
          </div>

        </div>

      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t">
        <div className="grid grid-cols-4 text-center py-3">
          <Link href="/">🏠<br />홈</Link>
          <Link href="/notice">📢<br />공지</Link>
          <Link href="/exam">📖<br />시험</Link>
          <Link href="/my" className="text-blue-600 font-bold">
            👤<br />마이
          </Link>
        </div>
      </div>

    </main>
  );
}