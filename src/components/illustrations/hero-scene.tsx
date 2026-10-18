/**
 * Calm, slightly out-of-focus interior for the hero, split into wall and
 * floor so the floor line can be placed exactly on a layout line.
 */

export function SceneWall({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1600 730" preserveAspectRatio="xMaxYMax slice" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hs-wall" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#F5F1E6" />
          <stop offset="0.6" stopColor="#EFE9DC" />
          <stop offset="1" stopColor="#E9E3D5" />
        </linearGradient>
        <filter id="hs-far" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <rect width="1600" height="730" fill="url(#hs-wall)" />
      <ellipse cx="1500" cy="300" rx="520" ry="460" fill="#FFFDF6" opacity="0.55" filter="url(#hs-far)" />
      <g filter="url(#hs-far)">
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={1150 + i * 15} y="0" width="9" height="730" fill={i % 2 ? "#8B5E3F" : "#7A5034"} />
        ))}
        <rect x="0" y="0" width="1600" height="26" fill="#E2DACB" />
        <rect x="560" y="60" width="14" height="670" fill="#DDD5C4" />
        <rect x="574" y="60" width="300" height="670" fill="#F1ECE0" />
      </g>
    </svg>
  );
}

export function SceneFloor({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true" style={{ background: "linear-gradient(to bottom, #E4DDCE, #EEE9DE 70%, #F5F1E6)" }}>
      <div className="absolute inset-x-0 top-0 h-px bg-[#D3CBBA]" />
      <div className="absolute right-[10%] bottom-[10%] left-[35%] h-1/2 rounded-[50%] bg-white/40 blur-2xl" />
    </div>
  );
}
