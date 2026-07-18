interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({
  title,
  subtitle,
}: HeaderProps) {
  return (
    <div className="bg-blue-600 rounded-b-[40px] p-8 text-white shadow-lg">

      <h1 className="text-3xl font-bold">
        {title}
      </h1>

      {subtitle && (
        <p className="text-blue-100 mt-2">
          {subtitle}
        </p>
      )}

    </div>
  );
}