import { notices } from "../../../data/notice";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function NoticeDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const notice = notices.find((n) => n.id === Number(id));

  if (!notice) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-5">

      <Link href="/notice" className="text-blue-600">
        ← 목록으로
      </Link>

      <div className="bg-white rounded-3xl shadow p-6 mt-5">

        <h1 className="text-3xl font-bold">
          {notice.title}
        </h1>

        <p className="text-gray-400 mt-2">
          {notice.date}
        </p>

        <div className="mt-6 whitespace-pre-line leading-8">
          {notice.content}
        </div>

      </div>

    </main>
  );
}