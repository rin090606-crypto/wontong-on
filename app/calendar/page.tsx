export default function CalendarPage() {
  const schedules = [
    {
      date: "7월 20일",
      title: "학생자치회 회의",
      type: "학생회",
    },
    {
      date: "7월 25일",
      title: "여름방학식",
      type: "학사",
    },
    {
      date: "8월 17일",
      title: "개학일",
      type: "학사",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-8">
      <section className="mb-6">
        <h1 className="text-3xl font-bold text-blue-600">
          학교 일정
        </h1>
        <p className="mt-2 text-gray-500">
          원통ON에서 학교 주요 일정을 확인하세요.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-gray-800">
          📅 예정된 일정
        </h2>

        <div className="space-y-4">
          {schedules.map((schedule, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl bg-blue-50 p-4"
            >
              <div>
                <p className="font-semibold text-gray-800">
                  {schedule.title}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {schedule.date}
                </p>
              </div>

              <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                {schedule.type}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}