export default function RecruitPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-5 py-8">
      <section>
        <h1 className="text-3xl font-bold text-blue-600">
          학생자치회 모집
        </h1>

        <p className="mt-2 text-gray-500">
          원통ON에서 학생자치회 모집 정보를 확인하세요.
        </p>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">
          모집 안내
        </h2>

        <div className="mt-4 space-y-3 text-gray-600">
          <p>📌 모집 기간: 공지 확인</p>
          <p>📌 모집 대상: 원통고등학교 학생</p>
          <p>📌 지원 방법: 신청서 제출</p>
        </div>
      </section>

      <button className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white">
        지원하기
      </button>
    </main>
  );
}