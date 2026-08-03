import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase 관리자 환경변수가 필요합니다.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
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
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("approved", false),

      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("approved", true),

      supabase
        .from("profiles")
        .select("points")
        .eq("approved", true),

      supabase
        .from("suggestions")
        .select("id", { count: "exact", head: true })
        .neq("status", "처리 완료"),

      supabase
        .from("profiles")
        .select(
          "id, student_id, name, grade, class_no, student_number, approved, role, points, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const firstError =
      waitingResult.error ??
      approvedResult.error ??
      pointsResult.error ??
      recentStudentsResult.error;

    if (firstError) throw firstError;

    const totalPoints = (pointsResult.data ?? []).reduce(
      (sum, profile) => sum + Number(profile.points ?? 0),
      0,
    );

    return NextResponse.json({
      stats: {
        waiting: waitingResult.count ?? 0,
        approved: approvedResult.count ?? 0,
        totalPoints,
        unresolvedSuggestions: suggestionsResult.error
          ? 0
          : suggestionsResult.count ?? 0,
      },
      recentStudents: recentStudentsResult.data ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "관리자 현황을 불러오지 못했습니다.",
      },
      { status: 500 },
    );
  }
}
