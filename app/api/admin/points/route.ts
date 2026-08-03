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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const profileId = String(body.profileId ?? "");
    const amount = Number(body.amount);
    const reason = String(body.reason ?? "").trim();
    const actorProfileId = body.actorProfileId
      ? String(body.actorProfileId)
      : null;

    if (!profileId || !Number.isInteger(amount) || amount === 0 || !reason) {
      return NextResponse.json(
        { message: "학생, 포인트, 사유를 모두 확인해 주세요." },
        { status: 400 },
      );
    }

    const { data, error } = await adminClient().rpc(
      "adjust_student_points",
      {
        target_profile_id: profileId,
        change_amount: amount,
        change_reason: reason,
        actor_profile_id: actorProfileId,
      },
    );

    if (error) throw error;

    return NextResponse.json({
      balance: data,
      message: amount > 0 ? "포인트를 지급했습니다." : "포인트를 차감했습니다.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "포인트 처리에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}
