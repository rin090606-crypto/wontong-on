"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Profile = {
  name: string;
  student_id: string;
  grade: number;
  class_no: number;
  student_number: number;
  role: "student" | "admin";
  approved: boolean;
  points?: number;
};

export default function MyPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "name, student_id, grade, class_no, student_number, role, approved, points",
        )
        .eq("auth_user_id", user.id)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setProfile(data as Profile);
      setLoading(false);
    }

    void loadProfile();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="font-bold text-slate-700">
          학생 정보를 불러오는 중이에요.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-lg">
        <section className="rounded-[32px] bg-gradient-to-br from-blue-700 to-indigo-600 p-7 text-white shadow-xl">
          <p className="text-sm font-black tracking-[0.18em] text-blue-100">
            MY WONTONG ON
          </p>
          <h1 className="mt-3 text-3xl font-black">
            {profile?.name ?? "학생"} 님
          </h1>
          <p className="mt-2 font-semibold text-blue-50">
            {profile
              ? `${profile.grade}학년 ${profile.class_no}반 ${profile.student_number}번`
              : "학생 정보를 확인하지 못했습니다."}
          </p>
          <p className="mt-4 text-2xl font-black">
            {profile?.points ?? 0}P
          </p>
        </section>

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="font-bold text-slate-600">학번</span>
              <span className="font-black text-slate-900">
                {profile?.student_id ?? "-"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-bold text-slate-600">계정 유형</span>
              <span className="font-black text-slate-900">
                {profile?.role === "admin" ? "학생회 관리자" : "학생"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-bold text-slate-600">승인 상태</span>
              <span
                className={`font-black ${
                  profile?.approved ? "text-emerald-700" : "text-orange-700"
                }`}
              >
                {profile?.approved ? "승인 완료" : "승인 대기"}
              </span>
            </div>
          </div>

          {profile?.role === "admin" && profile.approved && (
            <Link
              href="/manager"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3.5 font-black text-white shadow-lg shadow-blue-200"
            >
              <span aria-hidden="true">👑</span>
              관리자 센터
            </Link>
          )}

          <Link
            href="/point"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-50 px-4 py-3.5 font-black text-amber-800"
          >
            <span aria-hidden="true">⭐</span>
            내 포인트 보기
          </Link>

          <button
            type="button"
            onClick={logout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 font-black text-red-700"
          >
            <span aria-hidden="true">🚪</span>
            로그아웃
          </button>
        </section>

        <Link
          href="/"
          className="mt-5 block text-center text-sm font-bold text-slate-700"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
