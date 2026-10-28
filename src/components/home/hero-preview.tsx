"use client";

import { useEffect, useRef, useState } from "react";
import { monogram, screenStyle } from "@/components/catalog/channel-art";
import { useMediaSource } from "@/components/player/use-media-source";

interface HeroPreviewProps {
  src: string;
  name: string;
  hue: number;
}

/**
 * Vista previa silenciada de la señal destacada. Si la persona prefiere menos
 * movimiento, o la señal falla, se muestra la carátula estática del canal.
 */
export function HeroPreview({ src, name, hue }: HeroPreviewProps) {
  const [allowMotion, setAllowMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAllowMotion(!query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <div
      className="relative aspect-video overflow-hidden rounded-[var(--radius-screen)] ring-1 ring-ink-700"
      style={screenStyle({ hue })}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 grid place-items-center font-display text-8xl font-extrabold text-paper/70"
      >
        {monogram(name)}
      </span>
      {allowMotion && <PreviewVideo src={src} />}
    </div>
  );
}

function PreviewVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { status } = useMediaSource({ mediaRef: videoRef, src, format: "hls", autoPlay: true });

  return (
    <video
      ref={videoRef}
      muted
      playsInline
      aria-hidden="true"
      tabIndex={-1}
      className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
        status === "playing" ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
