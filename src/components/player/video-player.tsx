"use client";

import { useRef, useState } from "react";
import { ExpandIcon, MuteIcon, PauseIcon, PlayIcon, RetryIcon, VolumeIcon } from "@/components/ui/icons";
import { ERROR_MESSAGES, useMediaSource } from "./use-media-source";

interface VideoPlayerProps {
  src: string;
  title: string;
  autoPlay?: boolean;
}

export function VideoPlayer({ src, title, autoPlay = true }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { status, error, mutedByPolicy, setMutedByPolicy, play, pause, retry } = useMediaSource({
    mediaRef: videoRef,
    src,
    format: "hls",
    autoPlay,
  });
  const [userMuted, setUserMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  // El autoplay puede silenciar el vídeo por política del navegador: se refleja en la interfaz.
  const muted = userMuted || mutedByPolicy;

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !muted;
    setUserMuted(video.muted);
    setMutedByPolicy(false);
  }

  function changeVolume(value: number) {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    video.muted = value === 0;
    setVolume(value);
    setUserMuted(value === 0);
    setMutedByPolicy(false);
  }

  function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else if (el.requestFullscreen) void el.requestFullscreen();
    // iOS Safari solo permite pantalla completa nativa sobre el elemento <video>.
    else (videoRef.current as HTMLVideoElement & { webkitEnterFullscreen?: () => void })?.webkitEnterFullscreen?.();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.target !== event.currentTarget) return;
    if (event.key === " " || event.key === "k") {
      event.preventDefault();
      if (status === "playing") pause();
      else void play();
    } else if (event.key === "m") toggleMute();
    else if (event.key === "f") toggleFullscreen();
  }

  const isPlaying = status === "playing";

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      role="region"
      aria-label={`Reproductor: ${title}`}
      className="group/player relative aspect-video overflow-hidden rounded-[var(--radius-screen)] bg-black ring-1 ring-ink-700 [&:fullscreen]:rounded-none"
    >
      <video
        ref={videoRef}
        className="size-full object-contain"
        playsInline
        preload="metadata"
        onClick={() => (isPlaying ? pause() : void play())}
        aria-label={title}
      />

      {status === "loading" && (
        <div className="absolute inset-0 grid place-items-center bg-black/30" role="status">
          <span className="sr-only">Cargando señal</span>
          <span
            aria-hidden="true"
            className="size-12 animate-spin rounded-full border-[3px] border-paper/20 border-t-dial motion-reduce:animate-none"
          />
        </div>
      )}

      {status === "paused" && (
        <button
          type="button"
          onClick={() => void play()}
          className="absolute inset-0 grid place-items-center bg-black/35"
          aria-label={`Reproducir ${title}`}
        >
          <span className="grid size-18 place-items-center rounded-full bg-dial text-3xl text-ink-950 shadow-lg">
            <PlayIcon className="translate-x-0.5" />
          </span>
        </button>
      )}

      {status === "error" && error && (
        <div className="absolute inset-0 grid place-items-center bg-ink-950/92 p-6 text-center" role="alert">
          <div className="max-w-sm">
            <p className="font-display text-3xl font-bold">Señal no disponible</p>
            <p className="mt-2 text-sm leading-relaxed text-mist">{ERROR_MESSAGES[error]}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-dial px-5 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-dial-strong"
            >
              <RetryIcon /> Reintentar
            </button>
          </div>
        </div>
      )}

      {mutedByPolicy && isPlaying && (
        <button
          type="button"
          onClick={toggleMute}
          className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-ink-950/85 px-3.5 py-1.5 text-sm font-medium backdrop-blur hover:bg-ink-900"
        >
          <MuteIcon /> Activar sonido
        </button>
      )}

      {status !== "error" && (
        <div
          className={`absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/85 to-transparent px-3 pt-10 pb-3 transition-opacity duration-200 sm:gap-3 sm:px-4 ${
            isPlaying
              ? "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/player:opacity-100 [@media(hover:hover)]:group-focus-within/player:opacity-100"
              : ""
          }`}
        >
          <ControlButton label={isPlaying ? "Pausar" : "Reproducir"} onClick={() => (isPlaying ? pause() : void play())}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </ControlButton>
          <ControlButton label={muted ? "Activar sonido" : "Silenciar"} onClick={toggleMute}>
            {muted ? <MuteIcon /> : <VolumeIcon />}
          </ControlButton>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            aria-label="Volumen"
            className="hidden w-24 accent-dial sm:block"
          />
          <span className="ml-1 inline-flex items-center gap-1.5 text-xs font-semibold">
            <span className="live-dot size-1.5 rounded-full bg-live" aria-hidden="true" />
            En vivo
          </span>
          <ControlButton label="Pantalla completa" onClick={toggleFullscreen} className="ml-auto">
            <ExpandIcon />
          </ControlButton>
        </div>
      )}
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
  className = "",
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid size-10 place-items-center rounded-full text-xl text-paper transition-colors hover:bg-white/15 ${className}`}
    >
      {children}
    </button>
  );
}
