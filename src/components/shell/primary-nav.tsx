"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

/**
 * Navegación principal. Se usa el segmento de primer nivel (y no la ruta completa)
 * para marcar el elemento activo: no depende de parámetros de la URL, así que
 * el armazón puede prerenderizarse y compartirse entre rutas.
 */
export function PrimaryNav({ variant }: { variant: "sidebar" | "bottom" }) {
  const segment = useSelectedLayoutSegment();

  if (variant === "bottom") {
    return (
      <nav aria-label="Principal" className="grid grid-cols-4">
        {NAV_ITEMS.map(({ href, label, segment: s, icon: Icon }) => {
          const active = segment === s;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 py-2.5 text-[0.7rem] font-medium transition-colors ${
                active ? "text-dial" : "text-mist hover:text-paper"
              }`}
            >
              <Icon className="text-[1.35rem]" />
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav aria-label="Principal">
      <ul className="space-y-1">
        {NAV_ITEMS.map(({ href, label, segment: s, icon: Icon }) => {
          const active = segment === s;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.95rem] font-medium transition-colors ${
                  active
                    ? "bg-ink-800 text-paper before:absolute before:inset-y-2 before:-left-4 before:w-1 before:rounded-r before:bg-dial"
                    : "text-mist hover:bg-ink-900 hover:text-paper"
                }`}
              >
                <Icon className={`text-xl ${active ? "text-dial" : ""}`} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
