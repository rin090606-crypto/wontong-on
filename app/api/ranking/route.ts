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

function maskName(name: string) {
  const clean = name.trim();

  if (clean.length <= 1) return "○";
  if (clean.length === 2) return `${clean[0]}○`;

  return `${clean[0]}${"○".repeat(clean.length - 2)}${clean.at(-1)}`;
}

export async function GET() {
  try {
    const { data, error } = await adminClient()
      .from("profiles")
      .select("id, name, grade, class_no, points")
      .eq("approved", true)
      .eq("role", "student")
      .order("points", { ascending: false })
      .order("name", { ascending: true })
      .limit(10);

    if (error) throw error;

    const ranking = (data ?? []).map((student, index) => ({
      rank: index + 1,
      id: student.id,
      name: maskName(student.name),
      grade: student.grade,
      classNo: student.class_no,
      points: student.points ?? 0,
    }));

    return NextResponse.json({ ranking });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "포인트 랭킹을 불러오지 못했습니다.",
      },
      { status: 500 },
    );
  }
}
