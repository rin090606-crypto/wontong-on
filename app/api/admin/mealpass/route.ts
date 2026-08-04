import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase 관리자 환경변수가 필요합니다.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET() {
  try {
    const { data, error } = await adminClient()
      .from("meal_pass_requests")
      .select("id, request_date, reason, status, created_at, profiles(name, student_id, grade, class_no, student_number)")
      .order("request_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ requests: data ?? [] });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "신청 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const requestId = String(body.requestId ?? "");
    const status = String(body.status ?? "");
    if (!requestId || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ message: "올바른 처리 요청이 아닙니다." }, { status: 400 });
    }
    const { data, error } = await adminClient()
      .from("meal_pass_requests")
      .update({ status, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", requestId)
      .select("id, status")
      .single();
    if (error) throw error;
    return NextResponse.json({ request: data });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "처리에 실패했습니다." }, { status: 500 });
  }
}
