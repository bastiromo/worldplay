"use client";

import { useEffect, useRef, useState } from "react";
import { discStyle, labelStyle, monogram } from "@/components/catalog/channel-art";
import { MuteIcon, PauseIcon, PlayIcon, RetryIcon, VolumeIcon } from "@/components/ui/icons";
import { ERROR_MESSAGES, useMediaSource } from "./use-media-source";

interface AudioPlayerProps {
  src: string;
  name: string;
  subtitle: string;
  hue: number;
}

const BARS = [0.9, 0.55, 1, 0.7, 0.85, 0.5, 0.95, 0.65, 0.8];

/** Reproductor de radio. Nunca arranca solo: el sonido lo inicia siempre la persona. */
export function AudioPlayer({ src, name, subtitle, hue }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { status, error, play, pause, retry } = useMediaSource({
    mediaRef: audioRef,
    src,
    format: "audio",
    autoPlay: false,
  });
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const isPlaying = status === "playing";

  // Controles del sistema (pantalla de bloqueo, teclas multimedia).
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: name, artist: subtitle, album: "WorldPlay" });
    navigator.mediaSession.setActionHandler("play", () => void play());
    navigator.mediaSession.setActionHandler("pause", () => pause());
    return () => {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
    };
  }, [name, subtitle, play, pause]);

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  }

  function changeVolume(value: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = value;
    audio.muted = value === 0;
    setVolume(value);
    setMuted(value === 0);
  }

  return (
    <section
      aria-label={`Reproductor de radio: ${name}`}
      data-playing={isPlaying}
      className="relative overflow-hidden rounded-[var(--radius-screen)] bg-ink-900 ring-1 ring-ink-700"
    >
      <audio ref={audioRef} preload="none" loop />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60"
        style={{ backgroundImage: `radial-gradient(70% 90% at 15% 50%, hsl(${hue} 70% 45% / 0.35), transparent 70%)` }}
      />

      <div className="relative flex flex-col items-center gap-8 p-6 sm:flex-row sm:p-10">
        <div
          className={`relative aspect-square w-48 shrink-0 rounded-full ring-1 ring-ink-600 sm:w-56 ${
            isPlaying ? "animate-[spin_9s_linear_infinite] motion-reduce:animate-none" : ""
          }`}
          style={discStyle({ hue })}
          aria-hidden="true"
        >
          <span
            className="absolute inset-[27%] grid place-items-center rounded-full font-display text-4xl font-extrabold text-ink-950"
            style={labelStyle({ hue })}
          >
            {monogram(name)}
          </span>
        </div>

        <div className="w-full min-w-0 text-center sm:text-left">
          <div className="flex h-10 items-end justify-center gap-1 sm:justify-start" aria-hidden="true">
            {BARS.map((h, i) => (
              <span
                key={i}
                className="eq-bar w-1.5 rounded-full bg-dial"
                style={{ height: `${h * 100}%`, animationDelay: `${i * 110}ms` }}
              />
            ))}
          </div>

          <p className="mt-4 text-sm text-mist" role="status" aria-live="polite">
            {status === "playing" && "Sonando ahora"}
            {status === "loading" && "Sintonizando…"}
            {status === "paused" && "Lista para escuchar"}
            {status === "error" && "Sin señal"}
          </p>

          {status === "error" && error ? (
            <div role="alert" className="mt-3">
              <p className="max-w-md text-sm leading-relaxed text-mist">{ERROR_MESSAGES[error]}</p>
              <button
                type="button"
                onClick={retry}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-dial px-5 py-2 text-sm font-semibold text-ink-950 hover:bg-dial-strong"
              >
                <RetryIcon /> Reintentar
              </button>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-center gap-3 sm:justify-start">
              <button
                type="button"
                onClick={() => (isPlaying ? pause() : void play())}
                aria-label={isPlaying ? "Pausar" : `Escuchar ${name}`}
                className="grid size-16 place-items-center rounded-full bg-dial text-2xl text-ink-950 shadow-lg transition-colors hover:bg-dial-strong"
              >
                {status === "loading" ? (
                  <span className="size-6 animate-spin rounded-full border-[3px] border-ink-950/25 border-t-ink-950 motion-reduce:animate-none" />
                ) : isPlaying ? (
                  <PauseIcon />
                ) : (
                  <PlayIcon className="translate-x-0.5" />
                )}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Activar sonido" : "Silenciar"}
                title={muted ? "Activar sonido" : "Silenciar"}
                className="grid size-11 place-items-center rounded-full text-xl text-paper hover:bg-white/10"
              >
                {muted ? <MuteIcon /> : <VolumeIcon />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => changeVolume(Number(e.target.value))}
                aria-label="Volumen"
                className="w-28 accent-dial"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
