import type { ReactNode } from "react";

export default function MomentsLayout({ children }: { children: ReactNode }) {
  return <div className="w-full">{children}</div>;
}
