export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-md items-center justify-between px-5 py-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-blue-600">
            원통ON
          </h1>

          <p className="mt-0.5 text-xs text-gray-500">
            학생과 학교를 연결하다
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
          ON
        </div>
      </div>
    </header>
  );
}