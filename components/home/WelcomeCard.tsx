export default function WelcomeCard() {
  return (
    <section className="rounded-3xl bg-blue-600 p-6 text-white shadow-lg">
      <p className="text-sm font-medium text-blue-100">
        원통고등학교 학생 플랫폼
      </p>

      <h2 className="mt-2 text-2xl font-bold">
        오늘도 원통ON과 함께해요 👋
      </h2>

      <p className="mt-2 text-sm leading-6 text-blue-100">
        학교 일정과 공지, 학생자치회 소식을 한곳에서 확인할 수 있어요.
      </p>
    </section>
  );
}