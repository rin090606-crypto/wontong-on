"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    }

    void logout();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
        <p className="text-lg font-black text-slate-900">
          로그아웃하는 중이에요
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          잠시만 기다려 주세요.
        </p>
      </div>
    </main>
  );
}
