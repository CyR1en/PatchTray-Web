export function Meter({ active = 7 }: { active?: number }) {
  return (
    <div className="meter" aria-label={`${active} of 10 meter segments active`} role="img">
      {Array.from({ length: 10 }, (_, index) => (
        <span key={index} className={index < active ? "is-active" : ""} />
      ))}
    </div>
  );
}
