import Link from "next/link";

export default function PointPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-5 pb-24">

      <h1 className="text-3xl font-bold">
        💎 내 포인트
      </h1>

      <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-3xl p-6 mt-6 shadow-xl">

        <p>현재 보유 포인트</p>

        <h2 className="text-5xl font-bold mt-2">
          125P
        </h2>

      </div>

      <div className="bg-white rounded-3xl shadow p-5 mt-6">

        <h2 className="font-bold text-xl">
          포인트 사용 내역
        </h2>

        <div className="mt-4 space-y-3">

          <div className="flex justify-between">
            <span>교복 착용 캠페인</span>
            <span className="text-blue-600">+10P</span>
          </div>

          <div className="flex justify-between">
            <span>운동화 착용 캠페인</span>
            <span className="text-blue-600">+15P</span>
          </div>

          <div className="flex justify-between">
            <span>매점 사용</span>
            <span className="text-red-500">-20P</span>
          </div>

        </div>

      </div>

    </main>
  );
}