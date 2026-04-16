export function StitchPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="stitch-pattern"
          x="0"
          y="0"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 0 10 L 10 0 M 10 20 L 20 10"
            stroke="#2D2D2D"
            strokeWidth="0.5"
            fill="none"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#stitch-pattern)" />
    </svg>
  );
}
