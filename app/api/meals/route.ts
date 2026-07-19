import { NextRequest, NextResponse } from "next/server";

const EDUCATION_OFFICE_CODE = "K10";
const SCHOOL_NAME = "원통고등학교";

type NeisSchoolRow = {
  ATPT_OFCDC_SC_CODE?: string;
  ATPT_OFCDC_SC_NM?: string;
  SD_SCHUL_CODE?: string;
  SCHUL_NM?: string;
  SCHUL_KND_SC_NM?: string;
  ORG_RDNMA?: string;
};

type NeisMealRow = {
  MLSV_YMD?: string;
  MMEAL_SC_NM?: string;
  DDISH_NM?: string;
  CAL_INFO?: string;
  ORPLC_INFO?: string;
  NTR_INFO?: string;
};

function isValidDate(value: string | null): value is string {
  return typeof value === "string" && /^\d{8}$/.test(value);
}

function getResultCode(data: any): string | null {
  return (
    data?.RESULT?.CODE ??
    data?.schoolInfo?.[0]?.head?.[1]?.RESULT?.CODE ??
    data?.mealServiceDietInfo?.[0]?.head?.[1]?.RESULT?.CODE ??
    null
  );
}

function getResultMessage(data: any): string | null {
  return (
    data?.RESULT?.MESSAGE ??
    data?.schoolInfo?.[0]?.head?.[1]?.RESULT?.MESSAGE ??
    data?.mealServiceDietInfo?.[0]?.head?.[1]?.RESULT?.MESSAGE ??
    null
  );
}

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function cleanMenu(rawMenu: string | undefined): string[] {
  if (!rawMenu) return [];

  const normalized = decodeHtml(rawMenu)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\d+(?:\.\d+)*/g, "")
    .replace(/[★☆]/g, "")
    .trim();

  return normalized
    .split(/\r?\n|,/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

async function findSchool(apiKey: string): Promise<NeisSchoolRow | null> {
  const params = new URLSearchParams({
    KEY: apiKey,
    Type: "json",
    pIndex: "1",
    pSize: "100",
    ATPT_OFCDC_SC_CODE: EDUCATION_OFFICE_CODE,
    SCHUL_NM: SCHOOL_NAME,
  });

  const response = await fetch(
    `https://open.neis.go.kr/hub/schoolInfo?${params.toString()}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`학교 검색 요청 실패 (${response.status})`);
  }

  const data = await response.json();
  const code = getResultCode(data);

  if (code === "INFO-200") {
    return null;
  }

  if (code && code !== "INFO-000") {
    throw new Error(getResultMessage(data) ?? "학교 검색 중 오류가 발생했습니다.");
  }

  const rows: NeisSchoolRow[] = data?.schoolInfo?.[1]?.row ?? [];

  return (
    rows.find(
      (school) =>
        school.SCHUL_NM === SCHOOL_NAME &&
        school.SCHUL_KND_SC_NM?.includes("고등학교"),
    ) ??
    rows.find((school) => school.SCHUL_NM === SCHOOL_NAME) ??
    null
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!isValidDate(from) || !isValidDate(to)) {
    return NextResponse.json(
      { message: "날짜는 YYYYMMDD 형식으로 입력해야 합니다." },
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

  try {
    const school = await findSchool(apiKey);

    if (!school?.SD_SCHUL_CODE) {
      return NextResponse.json(
        {
          message: "나이스에서 원통고등학교 정보를 찾지 못했습니다.",
          meals: [],
          debug: {
            schoolName: SCHOOL_NAME,
            educationOfficeCode: EDUCATION_OFFICE_CODE,
          },
        },
        { status: 404 },
      );
    }

    const mealParams = new URLSearchParams({
      KEY: apiKey,
      Type: "json",
      pIndex: "1",
      pSize: "100",
      ATPT_OFCDC_SC_CODE:
        school.ATPT_OFCDC_SC_CODE ?? EDUCATION_OFFICE_CODE,
      SD_SCHUL_CODE: school.SD_SCHUL_CODE,
      MLSV_FROM_YMD: from,
      MLSV_TO_YMD: to,
    });

    const mealResponse = await fetch(
      `https://open.neis.go.kr/hub/mealServiceDietInfo?${mealParams.toString()}`,
      { cache: "no-store" },
    );

    if (!mealResponse.ok) {
      throw new Error(`급식 조회 요청 실패 (${mealResponse.status})`);
    }

    const mealData = await mealResponse.json();
    const resultCode = getResultCode(mealData);
    const resultMessage = getResultMessage(mealData);

    if (resultCode === "INFO-200") {
      return NextResponse.json({
        meals: [],
        debug: {
          resultCode,
          resultMessage,
          discoveredSchool: school,
          from,
          to,
        },
      });
    }

    if (resultCode && resultCode !== "INFO-000") {
      return NextResponse.json(
        {
          message: resultMessage ?? "나이스 급식 조회 오류",
          code: resultCode,
          meals: [],
          debug: {
            discoveredSchool: school,
            from,
            to,
          },
        },
        { status: 502 },
      );
    }

    const rows: NeisMealRow[] =
      mealData?.mealServiceDietInfo?.[1]?.row ?? [];

    const meals = rows.map((row) => ({
      date: row.MLSV_YMD ?? "",
      mealType: row.MMEAL_SC_NM ?? "급식",
      menu: cleanMenu(row.DDISH_NM),
      calories: row.CAL_INFO ?? "",
      originInfo: row.ORPLC_INFO ?? "",
      nutritionInfo: row.NTR_INFO ?? "",
    }));

    return NextResponse.json({
      meals,
      debug: {
        resultCode,
        resultMessage,
        rowCount: rows.length,
        discoveredSchool: school,
        from,
        to,
      },
    });
  } catch (error) {
    console.error("급식 API 오류:", error);

    return NextResponse.json(
      {
        message: "급식 정보를 불러오는 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 },
    );
  }
}