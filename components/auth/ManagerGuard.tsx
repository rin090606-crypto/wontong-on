"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ManagerGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkManager() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, approved")
        .eq("auth_user_id", user.id)
        .single();

      if (!profile?.approved || profile.role !== "admin") {
        router.replace("/");
        return;
      }

      setAllowed(true);
    }

    void checkManager();
  }, [router]);

  if (!allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-3xl bg-white px-6 py-5 font-bold text-slate-600 shadow-sm">
          관리자 권한을 확인하는 중이에요.
        </div>
      </main>
    );
  }

  return children;
}
