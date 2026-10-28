import Link from "next/link";

/** Marca de WorldPlay: un dial de sintonía con la aguja sobre el globo. */
export function Logo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="WorldPlay, ir al inicio">
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
        <circle cx="16" cy="16" r="14" fill="none" stroke="var(--color-ink-600)" strokeWidth="2" />
        <path d="M2 16h28M16 2c4.5 4 4.5 24 0 28M16 2c-4.5 4-4.5 24 0 28" fill="none" stroke="var(--color-ink-600)" strokeWidth="1.5" />
        <path
          d="M16 16 25 7"
          stroke="var(--color-dial)"
          strokeWidth="2.6"
          strokeLinecap="round"
          className="origin-center transition-transform duration-500 group-hover:rotate-[60deg] motion-reduce:transition-none"
        />
        <circle cx="16" cy="16" r="3" fill="var(--color-dial)" />
      </svg>
      <span className="font-display text-[1.65rem] leading-none font-extrabold tracking-wide text-paper">
        WorldPlay
      </span>
    </Link>
  );
}
