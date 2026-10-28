import type { Availability } from "@/lib/domain/types";

/** Indicador de estado. El rojo se reserva exclusivamente para "En vivo". */
export function LiveBadge({ availability, className = "" }: { availability: Availability; className?: string }) {
  if (availability === "online") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-ink-950/75 px-2 py-0.5 text-[0.7rem] font-semibold text-paper backdrop-blur ${className}`}
      >
        <span className="live-dot size-1.5 rounded-full bg-live" aria-hidden="true" />
        En vivo
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-ink-950/75 px-2 py-0.5 text-[0.7rem] font-semibold text-mist backdrop-blur ${className}`}
    >
      <span className="size-1.5 rounded-full bg-mist" aria-hidden="true" />
      {availability === "offline" ? "Fuera del aire" : "Sin comprobar"}
    </span>
  );
}
