import type { ComponentType, SVGProps } from "react";
import { CompassIcon, HomeIcon, RadioIcon, TvIcon } from "@/components/ui/icons";

export interface NavItem {
  href: "/" | "/tv" | "/radio" | "/explorar";
  label: string;
  /** Segmento de primer nivel que activa el elemento (null = inicio). */
  segment: string | null;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Inicio", segment: null, icon: HomeIcon },
  { href: "/tv", label: "Televisión", segment: "tv", icon: TvIcon },
  { href: "/radio", label: "Radio", segment: "radio", icon: RadioIcon },
  { href: "/explorar", label: "Explorar", segment: "explorar", icon: CompassIcon },
];
