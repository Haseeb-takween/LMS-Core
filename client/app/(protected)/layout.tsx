export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="min-h-dvh">{children}</main>;
}
