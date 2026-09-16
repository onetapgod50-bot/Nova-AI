export default function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 420" className="w-full max-w-md" role="img" aria-labelledby="hero-illustration-title">
      <title id="hero-illustration-title">
        A schematic building under construction with a live progress status card
      </title>

      {/* crane */}
      <line x1="368" y1="380" x2="368" y2="70" stroke="var(--ink-muted)" strokeWidth="3" />
      <line x1="368" y1="78" x2="452" y2="78" stroke="var(--ink-muted)" strokeWidth="3" />
      <line x1="368" y1="78" x2="330" y2="110" stroke="var(--ink-muted)" strokeWidth="3" />
      <rect x="358" y="70" width="20" height="14" fill="var(--ink-muted)" />
      <line x1="430" y1="78" x2="430" y2="140" stroke="var(--ink-muted)" strokeWidth="2" />
      <rect x="418" y="140" width="24" height="14" rx="2" fill="var(--amber)" />

      {/* building floors, bottom-up, progress reflected in fill */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const floorH = 42;
        const y = 380 - (i + 1) * floorH;
        const filled = i < 4;
        const partial = i === 4;
        return (
          <g key={i}>
            <rect
              x={60}
              y={y}
              width={230}
              height={floorH - 6}
              fill={filled ? "var(--brand)" : "var(--surface)"}
              stroke="var(--ink-muted)"
              strokeWidth="1.5"
            />
            {partial && (
              <rect x={60} y={y} width={230 * 0.75} height={floorH - 6} fill="var(--brand)" opacity="0.55" />
            )}
            {/* windows */}
            {[0, 1, 2, 3, 4, 5].map((w) => (
              <rect
                key={w}
                x={72 + w * 36}
                y={y + 8}
                width={16}
                height={floorH - 22}
                fill={filled || partial ? "var(--surface)" : "var(--line)"}
                opacity="0.75"
              />
            ))}
          </g>
        );
      })}

      {/* ground */}
      <line x1="30" y1="380" x2="320" y2="380" stroke="var(--ink-muted)" strokeWidth="3" />

      {/* status card */}
      <g transform="translate(150,200)">
        <rect x="0" y="0" width="230" height="118" rx="8" fill="var(--surface)" stroke="var(--line)" />
        <rect x="0" y="0" width="230" height="118" rx="8" fill="none" stroke="var(--brand)" strokeOpacity="0.15" />
        <text x="16" y="26" fontSize="13" fontWeight="600" fill="var(--ink)" fontFamily="var(--font-plex-sans)">
          Construction Site A
        </text>
        <text x="16" y="44" fontSize="10" fill="var(--ink-muted)" fontFamily="var(--font-plex-sans)">
          Austin, Texas
        </text>

        <rect x="16" y="56" width="198" height="8" rx="4" fill="var(--surface-2)" />
        <rect x="16" y="56" width="134" height="8" rx="4" fill="var(--brand-bright)" />
        <text x="16" y="82" fontSize="18" fontWeight="700" fill="var(--brand)" fontFamily="var(--font-plex-mono)">
          68%
        </text>
        <text x="16" y="98" fontSize="10" fill="var(--ink-muted)" fontFamily="var(--font-plex-sans)">
          Foundation done · Structural 75% · Electrical 40%
        </text>
      </g>
    </svg>
  );
}
