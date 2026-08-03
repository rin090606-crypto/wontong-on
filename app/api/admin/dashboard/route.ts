import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // service role 키를 우선 사용하고,
  // 없을 때만 새 방식의 secret 키를 사용합니다.
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL 환경변수가 없습니다.");
  }

  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY 또는 SUPABASE_SECRET_KEY 환경변수가 없습니다.",
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function GET() {
  try {
    const supabase = adminClient();

    const [
      waitingResult,
      approvedResult,
      pointsResult,
      suggestionsResult,
      recentStudentsResult,
    ] = await Promise.all([
      // 승인 대기 학생
      supabase
        .from("profiles")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("approved", false),

      // 승인 완료 학생
      supabase
        .from("profiles")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("approved", true),

      // 승인 학생 포인트
      supabase
        .from("profiles")
        .select("points")
        .eq("approved", true),

      // 처리 완료가 아닌 건의
      supabase
        .from("suggestions")
        .select("id", {
          count: "exact",
          head: true,
        })
        .neq("status", "처리 완료"),

      // 최근 가입 학생 5명
      supabase
        .from("profiles")
        .select(
          `
            id,
            student_id,
            name,
            grade,
            class_no,
            student_number,
            approved,
            role,
            points,
            created_at
          `,
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(5),
    ]);

    // profiles 관련 조회 오류 확인
    const profileError =
      waitingResult.error ??
      approvedResult.error ??
      pointsResult.error ??
      recentStudentsResult.error;

    if (profileError) {
      console.error("관리자 대시보드 profiles 조회 오류:", profileError);
      throw new Error(
        `학생 정보 조회 실패: ${profileError.message}`,
      );
    }

    // 건의 테이블 오류는 학생 통계 전체를 막지 않도록 별도 처리
    if (suggestionsResult.error) {
      console.error(
        "관리자 대시보드 suggestions 조회 오류:",
        suggestionsResult.error,
      );
    }

    const totalPoints = (pointsResult.data ?? []).reduce(
      (sum, profile) => {
        return sum + Number(profile.points ?? 0);
      },
      0,
    );

    return NextResponse.json(
      {
        stats: {
          waiting: waitingResult.count ?? 0,
          approved: approvedResult.count ?? 0,
          totalPoints,
          unresolvedSuggestions: suggestionsResult.error
            ? 0
            : suggestionsResult.count ?? 0,
        },
        recentStudents: recentStudentsResult.data ?? [],
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("관리자 대시보드 API 오류:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "관리자 현황을 불러오지 못했습니다.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}