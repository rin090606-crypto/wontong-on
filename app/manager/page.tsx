import Link from "next/link";

const menus = [
  {
    href: "/manager/notices",
    icon: "📢",
    title: "공지 관리",
    desc: "새 공지를 등록하고 푸시 알림을 보냅니다.",
    badge: "운영 중",
  },
  {
    href: "/manager/suggestions",
    icon: "💬",
    title: "건의 관리",
    desc: "학생 건의를 확인하고 답변과 상태를 관리합니다.",
    badge: "운영 중",
  },
  {
    href: "/calendar",
    icon: "📅",
    title: "일정 관리",
    desc: "학교 및 학생회 일정을 확인합니다.",
    badge: "연결됨",
  },
  {
    href: "/manager/members",
    icon: "👥",
    title: "회원 관리",
    desc: "학생 가입 승인과 권한 관리를 준비 중입니다.",
    badge: "준비 중",
  },
];

export default function ManagerPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <section className="overflow-hidden rounded-[32px] border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 p-7 text-white shadow-xl shadow-blue-100 sm:p-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-extrabold tracking-[0.18em] text-blue-100">
                WONTONG ON · ADMIN
              </p>
              <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                학생회 관리자 센터
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">
                공지, 일정, 학생 건의와 회원 정보를 한곳에서 관리합니다.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex w-fit items-center justify-center rounded-2xl bg-white/95 px-4 py-3 text-sm font-black text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
            >
              학생 홈 보기
            </Link>
          </div>
        </section>

        <section className="mt-7 grid gap-4 sm:grid-cols-2">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/70"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl ring-1 ring-blue-100">
                  {menu.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {menu.title}
                    </h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold text-slate-500">
                      {menu.badge}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {menu.desc}
                  </p>
                </div>

                <span className="mt-1 text-xl font-bold text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500">
                  →
                </span>
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-7 rounded-3xl border border-blue-100 bg-blue-50 p-5 sm:p-6">
          <p className="text-sm font-extrabold text-blue-700">관리자 안내</p>
          <p className="mt-2 text-sm leading-6 text-blue-900/80">
            공지 등록 시 푸시 알림 보내기를 선택하면 알림을 허용한 학생들에게
            즉시 전송됩니다.
          </p>
        </section>
      </div>
    </main>
  );
}
