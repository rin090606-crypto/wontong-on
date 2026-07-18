export default function ManagerPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-5 py-8">
      <section>
        <h1 className="text-3xl font-bold text-blue-600">
          관리자 페이지
        </h1>

        <p className="mt-3 text-gray-500">
          원통ON 관리자 전용 페이지입니다.
        </p>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">
          관리 기능
        </h2>

        <div className="mt-4 space-y-3">
          <button className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white">
            공지사항 관리
          </button>

          <button className="w-full rounded-xl bg-blue-100 py-3 font-semibold text-blue-700">
            학생 건의 확인
          </button>

          <button className="w-full rounded-xl bg-blue-100 py-3 font-semibold text-blue-700">
            일정 관리
          </button>
        </div>
      </section>
    </main>
  );
}