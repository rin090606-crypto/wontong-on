interface Props {
  children: React.ReactNode;
}

export default function SectionTitle({
  children,
}: Props) {
  return (
    <h2 className="text-2xl font-bold mb-4">
      {children}
    </h2>
  );
}