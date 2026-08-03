"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  name: string;
  points: number;
};

type Transaction = {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
};

export default function PointPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPoints() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, name, points")
        .eq("auth_user_id", user.id)
        .single();

      if (!profileData) {
        setLoading(false);
        return;
      }

      setProfile(profileData);

      const { data: history } = await supabase
        .from("point_transactions")
        .select("id, amount, reason, created_at")
        .eq("profile_id", profileData.id)
        .order("created_at", { ascending: false })
        .limit(30);

      setTransactions(history ?? []);
      setLoading(false);
    }

    void loadPoints();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        포인트를 불러오는 중이에요.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-lg">
        <section className="rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-500 p-7 text-white shadow-xl">
          <p className="text-sm font-black tracking-[0.18em] text-blue-100">
            MY POINT
          </p>
          <p className="mt-4 text-blue-50">
            {profile?.name ?? "학생"}님의 현재 포인트
          </p>
          <h1 className="mt-1 text-5xl font-black">
            {profile?.points ?? 0}
            <span className="ml-1 text-2xl">P</span>
          </h1>
          <p className="mt-4 text-sm leading-6 text-blue-100">
            운동화·교복 캠페인에서 적립하고 학생회 매점에서 사용할 수
            있어요.
          </p>
        </section>

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">최근 내역</h2>

          <div className="mt-4 divide-y divide-slate-100">
            {transactions.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                아직 포인트 내역이 없습니다.
              </p>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="font-bold text-slate-800">
                      {transaction.reason}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(transaction.created_at).toLocaleString(
                        "ko-KR",
                      )}
                    </p>
                  </div>
                  <span
                    className={`text-lg font-black ${
                      transaction.amount > 0
                        ? "text-blue-600"
                        : "text-red-500"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount}P
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <Link
          href="/"
          className="mt-5 block text-center text-sm font-bold text-slate-500"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
