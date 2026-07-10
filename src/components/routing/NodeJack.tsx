import type { RefObject } from "react";

export function NodeJack({
  side,
  placement,
  jackRef,
}: {
  side: "left" | "right";
  placement: "port" | "footer";
  jackRef?: RefObject<HTMLSpanElement | null>;
}) {
  return (
    <span
      ref={jackRef}
      className={`node-jack node-jack--${side} node-jack--${placement}`}
      aria-hidden="true"
    />
  );
}
