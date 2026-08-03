export default function CalendarPage() {
  const schedules = [
    {
      date: "8월 10일",
      title: "개학일",
      type: "학사",
    },
    {
      date: "8월 17일",
      title: "대체휴무",
      type: "휴일",
    },
    {
      date: "8월 26일",
      title: "학생 대상 교육과정 설명회",
      type: "학사",
    },
    {
      date: "9월 8일",
      title: "영어듣기평가 · 1학년",
      type: "평가",
    },
    {
      date: "9월 9일",
      title: "영어듣기평가 · 2학년",
      type: "평가",
    },
    {
      date: "9월 10일",
      title: "영어듣기평가 · 3학년",
      type: "평가",
    },
    {
      date: "9월 15일 ~ 9월 18일",
      title: "1회고사",
      type: "시험",
    },
    {
      date: "9월 24일 ~ 9월 25일",
      title: "추석 연휴",
      type: "휴일",
    },
    {
      date: "9월 28일",
      title: "2차 선택과목 수강 신청 마감",
      type: "학사",
    },
    {
      date: "10월 1일",
      title: "수업 공개의 날",
      type: "행사",
    },
    {
      date: "10월 5일",
      title: "대체휴무",
      type: "휴일",
    },
    {
      date: "10월 9일",
      title: "한글날",
      type: "휴일",
    },
    {
      date: "10월 20일",
      title: "전국연합학력평가",
      type: "평가",
    },
    {
      date: "11월 19일",
      title: "대학수학능력시험 · 휴업일",
      type: "학사",
    },
    {
      date: "11월 23일 ~ 11월 27일",
      title: "2회고사 · 3학년",
      type: "시험",
    },
    {
      date: "12월 1일 ~ 12월 4일",
      title: "2회고사 · 1·2학년",
      type: "시험",
    },
    {
      date: "12월 22일",
      title: "진급 및 졸업 사정회",
      type: "학사",
    },
    {
      date: "12월 23일",
      title: "동아리 발표회",
      type: "행사",
    },
    {
      date: "12월 25일",
      title: "성탄절",
      type: "휴일",
    },
    {
      date: "12월 28일",
      title: "학교 교육과정 평가회",
      type: "학사",
    },
    {
      date: "12월 31일",
      title: "제51회 졸업식 및 종업식",
      type: "행사",
    },
  ];

  const typeStyle: Record<string, string> = {
    학사: "bg-blue-600 text-white",
    평가: "bg-violet-600 text-white",
    시험: "bg-red-600 text-white",
    행사: "bg-emerald-600 text-white",
    휴일: "bg-orange-500 text-white",
  };

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-8 pb-24 text-slate-900">
      <section className="mb-6">
        <p className="text-sm font-black tracking-[0.15em] text-blue-600">
          2026 SECOND SEMESTER
        </p>

        <h1 className="mt-2 text-3xl font-black text-blue-700">
          📅 학교 일정
        </h1>

        <p className="mt-2 font-medium text-gray-700">
          2026학년도 2학기 주요 학사 일정을 확인하세요.
        </p>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="space-y-4">
          {schedules.map((schedule, index) => (
            <div
              key={`${schedule.date}-${index}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-black text-slate-900">
                    {schedule.title}
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-600">
                    {schedule.date}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
                    typeStyle[schedule.type] ??
                    "bg-slate-600 text-white"
                  }`}
                >
                  {schedule.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}