import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

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
    const { data, error } = await adminClient()
      .from("exam_scopes")
      .select("id, grade, subject, scope, created_at, updated_at")
      .order("grade", { ascending: true })
      .order("subject", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ exams: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "시험범위를 불러오지 못했습니다.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const grade = Number(body.grade);
    const subject = String(body.subject ?? "").trim();
    const scope = String(body.scope ?? "").trim();

    if (![1, 2, 3].includes(grade) || !subject || !scope) {
      return NextResponse.json(
        { message: "학년, 과목, 시험범위를 모두 입력해 주세요." },
        { status: 400 },
      );
    }

    const { data, error } = await adminClient()
      .from("exam_scopes")
      .upsert(
        {
          grade,
          subject,
          scope,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "grade,subject",
        },
      )
      .select("id, grade, subject, scope, created_at, updated_at")
      .single();

    if (error) throw error;

    return NextResponse.json({
      exam: data,
      message: "시험범위를 저장했습니다.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "시험범위 저장에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const examId = String(body.examId ?? "").trim();

    if (!examId) {
      return NextResponse.json(
        { message: "삭제할 시험범위 정보가 없습니다." },
        { status: 400 },
      );
    }

    const { error } = await adminClient()
      .from("exam_scopes")
      .delete()
      .eq("id", examId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "시험범위를 삭제했습니다.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "시험범위 삭제에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}
