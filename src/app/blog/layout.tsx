import { notFound } from "next/navigation";

export default function HiddenBlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  notFound();

  return children;
}
