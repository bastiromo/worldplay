import type { CSSProperties } from "react";
import type { Channel } from "@/lib/domain/types";

/**
 * Identidad visual generada para cada canal a partir de su tono.
 * Mientras no haya logos con licencia, evita usar marcas de terceros.
 */

export function monogram(name: string): string {
  const tokens = name.split(/\s+/).filter(Boolean);
  const number = tokens.find((t) => /^\d+$/.test(t));
  const words = tokens.filter((t) => /\p{L}/u.test(t));
  // Los números forman parte de la identidad: "La 1" → L1, "24 Horas" → 24.
  if (number) return (tokens[0] === number ? number.slice(0, 2) : words[0][0] + number.slice(0, 1)).toUpperCase();
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
}

export function channelNumber(n: number): string {
  return String(n).padStart(3, "0");
}

export function screenStyle(channel: Pick<Channel, "hue">): CSSProperties {
  const h = channel.hue;
  return {
    backgroundImage: [
      `radial-gradient(90% 80% at 18% 12%, hsl(${h} 75% 58% / 0.55), transparent 62%)`,
      `radial-gradient(70% 70% at 95% 100%, hsl(${(h + 45) % 360} 70% 50% / 0.35), transparent 60%)`,
      `linear-gradient(140deg, hsl(${h} 45% 20%), hsl(${(h + 30) % 360} 40% 11%))`,
    ].join(","),
  };
}

export function discStyle(channel: Pick<Channel, "hue">): CSSProperties {
  const h = channel.hue;
  return {
    // Surcos concéntricos, como un disco o la escala de un dial.
    backgroundImage: `repeating-radial-gradient(circle at 50% 50%, hsl(${h} 35% 17%) 0 2px, hsl(${h} 35% 12%) 2px 4px)`,
  };
}

export function labelStyle(channel: Pick<Channel, "hue">): CSSProperties {
  const h = channel.hue;
  return {
    backgroundImage: `linear-gradient(150deg, hsl(${h} 80% 62%), hsl(${(h + 35) % 360} 70% 42%))`,
  };
}
