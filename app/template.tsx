"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type TemplateProps = {
  children: ReactNode;
};

const publicPages = ["/login"];

export default function Template({ children }: TemplateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkLogin() {
      const isPublicPage = publicPages.some(
        (page) => pathname === page || pathname.startsWith(`${page}/`),
      );

      if (isPublicPage) {
        if (active) {
          setChecking(false);
        }
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (!session) {
        router.replace("/login");
        return;
      }

      setChecking(false);
    }

    void checkLogin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const isPublicPage = publicPages.some(
        (page) => pathname === page || pathname.startsWith(`${page}/`),
      );

      if (!session && !isPublicPage) {
        router.replace("/login");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="mt-4 font-bold text-slate-700">
            로그인 상태를 확인하고 있어요.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}