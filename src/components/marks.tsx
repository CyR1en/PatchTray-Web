export function Mark({ className = "" }: { className?: string }) {
  return <img className={className} src="/assets/patchtray-mark.svg" alt="PatchTray mark" />;
}

export function WindowsMark() {
  return (
    <svg aria-hidden="true" className="windows-mark" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 4.2 10.2 3v8H2V4.2Zm0 8.7h8.2v8L2 19.7v-6.8ZM11.8 2.8 22 1.3V11h-10.2V2.8Zm0 10.1H22v9.8l-10.2-1.5v-8.3Z" />
    </svg>
  );
}

export function MenuMark({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`menu-mark ${open ? "is-open" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <line className="menu-mark__line menu-mark__line--top" x1="4" y1="7" x2="20" y2="7" />
      <line className="menu-mark__line menu-mark__line--mid" x1="4" y1="12" x2="20" y2="12" />
      <line className="menu-mark__line menu-mark__line--bot" x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

export function ArrowMark() {
  return (
    <span aria-hidden="true" className="arrow-mark">
      →
    </span>
  );
}
