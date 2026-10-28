"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Country } from "@/lib/domain/types";

interface CountryTunerProps {
  countries: Country[];
  /** Ruta a la que apunta cada país, p. ej. "/explorar" o "/tv". */
  basePath: string;
  activeCode?: string;
  /** Parámetros que se conservan al cambiar de país (p. ej. la búsqueda). */
  keepParams?: Record<string, string | undefined>;
}

function buildHref(basePath: string, code: string | undefined, keep: CountryTunerProps["keepParams"]) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(keep ?? {})) {
    if (value) params.set(key, value);
  }
  if (code) params.set("pais", code);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Hora actual de cada zona; se calcula solo en el cliente para evitar desajustes de hidratación. */
function useLocalTimes(countries: Country[]) {
  const [times, setTimes] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const formatters = countries.map(
      (c) => [c.code, new Intl.DateTimeFormat("es", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: c.timeZone })] as const,
    );
    const tick = () => {
      const now = new Date();
      setTimes(Object.fromEntries(formatters.map(([code, f]) => [code, f.format(now)])));
    };
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [countries]);

  return times;
}

/**
 * Sintonizador de países: una franja como la escala de un dial de radio,
 * con la hora local de cada país. Funciona también como filtro.
 */
export function CountryTuner({ countries, basePath, activeCode, keepParams }: CountryTunerProps) {
  const times = useLocalTimes(countries);

  return (
    <nav aria-label="Filtrar por país" className="relative">
      <div className="scroll-row -mx-4 flex gap-1 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        <TunerStop href={buildHref(basePath, undefined, keepParams)} active={!activeCode} code="Todos" name="Todos los países" caption="El mundo" />
        {countries.map((country) => (
          <TunerStop
            key={country.code}
            href={buildHref(basePath, country.code, keepParams)}
            active={activeCode === country.code}
            code={country.code}
            name={country.name}
            time={times?.[country.code]}
          />
        ))}
      </div>
      {/* Escala del dial: marcas finas bajo las estaciones. */}
      <div
        aria-hidden="true"
        className="mt-1 h-2 bg-[repeating-linear-gradient(90deg,var(--color-ink-700)_0_1px,transparent_1px_10px)] [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]"
      />
    </nav>
  );
}

function TunerStop({
  href,
  active,
  code,
  name,
  time,
  caption,
}: {
  href: string;
  active: boolean;
  code: string;
  name: string;
  time?: string;
  caption?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      aria-label={time ? `${name}, hora local ${time}` : name}
      className={`relative flex min-w-[5.5rem] shrink-0 flex-col rounded-lg px-3 pt-2 pb-2.5 transition-colors ${
        active ? "bg-ink-800 text-paper" : "text-mist hover:bg-ink-900 hover:text-paper"
      }`}
    >
      <span className={`font-display text-2xl leading-none font-bold ${active ? "text-dial" : ""}`}>{code}</span>
      <span className="mt-1 truncate text-xs">{caption ?? name}</span>
      <span className={`tabular mt-0.5 text-xs ${active ? "text-paper/80" : "text-mist/70"}`} aria-hidden="true">
        {caption ? " " : (time ?? "--:--")}
      </span>
      {active && (
        <span aria-hidden="true" className="absolute inset-x-3 -bottom-[3px] h-[3px] rounded-full bg-dial" />
      )}
    </Link>
  );
}
