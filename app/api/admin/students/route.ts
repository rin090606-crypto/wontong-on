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
      .from("profiles")
      .select(
        "id, auth_user_id, student_id, name, grade, class_no, student_number, role, approved, points, created_at",
      )
      .order("approved", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ students: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "학생 목록을 불러오지 못했습니다.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const profileId = String(body.profileId ?? "");
    const action = String(body.action ?? "");

    if (!profileId || !["approve", "make_admin", "make_student"].includes(action)) {
      return NextResponse.json(
        { message: "올바른 요청이 아닙니다." },
        { status: 400 },
      );
    }

    const updates =
      action === "approve"
        ? { approved: true }
        : action === "make_admin"
          ? { role: "admin", approved: true }
          : { role: "student" };

    const { data, error } = await adminClient()
      .from("profiles")
      .update(updates)
      .eq("id", profileId)
      .select(
        "id, student_id, name, grade, class_no, student_number, role, approved, points",
      )
      .single();

    if (error) throw error;

    return NextResponse.json({ student: data });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "학생 승인에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const profileId = String(body.profileId ?? "");

    if (!profileId) {
      return NextResponse.json(
        { message: "학생 정보가 필요합니다." },
        { status: 400 },
      );
    }

    const supabase = adminClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("auth_user_id")
      .eq("id", profileId)
      .single();

    if (profileError) throw profileError;

    const { error: deleteError } =
      await supabase.auth.admin.deleteUser(profile.auth_user_id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "학생 거절에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}
