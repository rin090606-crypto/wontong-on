import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const publicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ??
    process.env.VAPID_PUBLIC_KEY;

  if (!publicKey) {
    return NextResponse.json(
      { message: "VAPID 공개키가 서버에 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({ publicKey });
}