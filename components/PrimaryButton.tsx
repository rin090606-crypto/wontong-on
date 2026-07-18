import Link from "next/link";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
}

export default function PrimaryButton({
  href,
  children,
}: ButtonProps) {
  return (
    <Link
      href={href}
      className="block w-full bg-blue-600 text-white text-center rounded-2xl py-3 font-semibold hover:bg-blue-700 transition"
    >
      {children}
    </Link>
  );
}