import { KNOB_ARC_LEN, KNOB_CIRC } from "./constants";

export function DemoKnob({ label, value, amount }: { label: string; value: string; amount: number }) {
  const clamped = Math.max(0, Math.min(1, amount));
  const valueArcLen = clamped * KNOB_ARC_LEN;
  const needleRotation = clamped * 270 - 135;

  return (
    <div className="demo-knob">
      <svg className="demo-knob__svg" width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="3.5"
          strokeDasharray={`${KNOB_ARC_LEN} ${KNOB_CIRC}`}
          transform="rotate(135 24 24)"
          strokeLinecap="butt"
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="#ff6600"
          strokeWidth="3.5"
          strokeDasharray={`${valueArcLen} ${KNOB_CIRC}`}
          transform="rotate(135 24 24)"
          strokeLinecap="butt"
        />
        <circle cx="24" cy="24" r="16" fill="#0f0e12" stroke="rgba(229, 229, 229, 0.1)" strokeWidth="0.5" />
        <line
          x1="24"
          y1="24"
          x2="24"
          y2="8"
          stroke="#ffffff"
          strokeWidth="1.75"
          strokeLinecap="round"
          transform={`rotate(${needleRotation} 24 24)`}
        />
        <circle cx="24" cy="24" r="1.5" fill="#ff6600" />
      </svg>
      <span className="demo-knob__label">{label}</span>
      <span className="demo-knob__value">{value}</span>
    </div>
  );
}
