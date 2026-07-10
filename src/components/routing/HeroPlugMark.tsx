export function HeroPlugMark() {
  return (
    <svg viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="translate(512, 512) scale(8.8) translate(-50, -45)">
        <g className="hero-socket hero-socket--1">
          <circle cx="35" cy="30" r="10" fill="none" stroke="#e5e5e5" strokeWidth="4" />
          <circle cx="35" cy="30" r="3" fill="#e5e5e5" />
        </g>
        <g className="hero-socket hero-socket--2">
          <circle cx="65" cy="30" r="10" fill="none" stroke="#e5e5e5" strokeWidth="4" />
          <circle cx="65" cy="30" r="3" fill="#e5e5e5" />
        </g>
        <g className="hero-socket hero-socket--3">
          <circle cx="35" cy="60" r="10" fill="none" stroke="#e5e5e5" strokeWidth="4" />
          <circle cx="35" cy="60" r="3" fill="#e5e5e5" />
        </g>
        <g className="hero-plug">
          <circle cx="65" cy="60" r="14" fill="#ff6600" />
          <circle className="hero-plug-led" cx="65" cy="60" r="4" fill="#0f0e12" />
          <path
            className="hero-plug-cable"
            d="M 65 60 L 65 95"
            fill="none"
            stroke="#d95700"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  );
}
