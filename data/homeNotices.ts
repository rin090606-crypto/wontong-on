export type HomeNotice = {
  id: number;
  category: "학생회" | "학교" | "행사";
  title: string;
  date: string;
  isNew?: boolean;
};

export const homeNotices: HomeNotice[] = [
  {
    id: 1,
    category: "학생회",
    title: "제52대 학생자치회 활동 안내",
    date: "2026.07.19",
    isNew: true,
  },
  {
    id: 2,
    category: "학교",
    title: "2학기 주요 학사일정 안내",
    date: "2026.07.18",
  },
  {
    id: 3,
    category: "행사",
    title: "원통고등학교 교내 행사 안내",
    date: "2026.07.17",
  },
];