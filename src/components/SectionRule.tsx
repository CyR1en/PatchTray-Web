import type { ReactNode } from "react";

export function SectionRule({ children }: { children: ReactNode }) {
  return (
    <div className="section-rule">
      <span>{children}</span>
      <i />
    </div>
  );
}
