import { NextRequest, NextResponse } from "next/server";

const EDUCATION_OFFICE_CODE = "K10";
const SCHOOL_CODE = "7801170";

export const dynamic = "force-dynamic";

type NeisTimetableRow = {
  AY?: string;
  SEM?: string;
  ALL_TI_YMD?: string;
  GRADE?: string;
  CLASS_NM?: string;
  CLRM_NM?: string;
  PERIO?: string;
  ITRT_CNTNT?: string;
  DDDEP_NM?: string;
  ORD_SC_NM?: string;
  DGHT_CRSE_SC_NM?: string;
};

function isCompactDate(value: string | null): value is string {
  return typeof value === "string" && /^\d{8}$/.test(value);
}

function getResultCode(data: unknown): string | null {
  const value = data as {
    RESULT?: { CODE?: string };
    hisTimetable?: Array<{
      head?: Array<{ RESULT?: { CODE?: string } }>;
    }>;
  };

  return (
    value?.RESULT?.CODE ??
    value?.hisTimetable?.[0]?.head?.[1]?.RESULT?.CODE ??
    null
  );
}

function getResultMessage(data: unknown): string | null {
  const value = data as {
    RESULT?: { MESSAGE?: string };
    hisTimetable?: Array<{
      head?: Array<{ RESULT?: { MESSAGE?: string } }>;
    }>;
  };

  return (
    value?.RESULT?.MESSAGE ??
    value?.hisTimetable?.[0]?.head?.[1]?.RESULT?.MESSAGE ??
    null
  );
}

function getAcademicYear(date: string) {
  return Number(date.slice(0, 4));
}

function getSemester(date: string) {
  const month = Number(date.slice(4, 6));
  return month <= 7 ? "1" : "2";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const grade = searchParams.get("grade");

  if (!isCompactDate(from) || !isCompactDate(to)) {
    return NextResponse.json(
      { message: "날짜는 YYYYMMDD 형식으로 입력해야 합니다." },
      { status: 400 },
    );
  }

  if (!grade || !/^[1-3]$/.test(grade)) {
    return NextResponse.json(
      { message: "학년은 1, 2, 3 중 하나여야 합니다." },
      { status: 400 },
    );
  }

  const apiKey = process.env.NEIS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { message: "NEIS_API_KEY 환경변수가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const params = new URLSearchParams({
    KEY: apiKey.trim(),
    Type: "json",
    pIndex: "1",
    pSize: "1000",
    ATPT_OFCDC_SC_CODE: EDUCATION_OFFICE_CODE,
    SD_SCHUL_CODE: SCHOOL_CODE,
    AY: String(getAcademicYear(from)),
    SEM: getSemester(from),
    TI_FROM_YMD: from,
    TI_TO_YMD: to,
    GRADE: grade,
  });

  try {
    const response = await fetch(
      `https://open.neis.go.kr/hub/hisTimetable?${params.toString()}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      throw new Error(`나이스 시간표 요청 실패 (${response.status})`);
    }

    const data = await response.json();
    const resultCode = getResultCode(data);
    const resultMessage = getResultMessage(data);

    if (resultCode === "INFO-200") {
      return NextResponse.json({ lessons: [] });
    }

    if (resultCode && resultCode !== "INFO-000") {
      return NextResponse.json(
        {
          message: resultMessage ?? "나이스 시간표 조회 중 오류가 발생했습니다.",
          code: resultCode,
        },
        { status: 502 },
      );
    }

    const rows: NeisTimetableRow[] = data?.hisTimetable?.[1]?.row ?? [];

    const lessons = rows
      .map((row) => ({
        id: [
          row.ALL_TI_YMD ?? "",
          row.PERIO ?? "",
          row.GRADE ?? "",
          row.CLASS_NM ?? "",
          row.CLRM_NM ?? "",
          row.ITRT_CNTNT ?? "",
          row.DDDEP_NM ?? "",
          row.ORD_SC_NM ?? "",
        ].join("-"),
        date: row.ALL_TI_YMD ?? "",
        grade: row.GRADE ?? grade,
        className: row.CLASS_NM ?? "",
        roomName: row.CLRM_NM ?? "",
        period: Number(row.PERIO ?? 0),
        subject: row.ITRT_CNTNT?.trim() || "수업 정보 없음",
        department: row.DDDEP_NM ?? "",
        courseType: row.DGHT_CRSE_SC_NM ?? "",
        orderName: row.ORD_SC_NM ?? "",
      }))
      .filter(
        (lesson) =>
          lesson.date &&
          Number.isInteger(lesson.period) &&
          lesson.period > 0,
      );

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error("시간표 API 오류:", error);

    return NextResponse.json(
      {
        message: "시간표를 불러오는 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 },
    );
  }
}