export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 px-5 py-8">
      <section>
        <h1 className="text-4xl font-bold text-blue-600">
          원통ON
        </h1>

        <p className="mt-2 text-gray-500">
          학생과 학교를 연결하다.
        </p>
      </section>

      <section className="mt-8 grid gap-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800">
            📚 시험 일정
          </h2>
          <p className="mt-2 text-gray-500">
            시험 범위와 D-day를 확인하세요.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800">
            🍚 급식 정보
          </h2>
          <p className="mt-2 text-gray-500">
            오늘의 급식과 학생 식사 정보를 확인하세요.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800">
            📢 학교 소식
          </h2>
          <p className="mt-2 text-gray-500">
            학생자치회와 학교 공지를 확인하세요.
          </p>
        </div>
      </section>
    </main>
  );
}