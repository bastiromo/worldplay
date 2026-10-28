"use client";

import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import type { StreamFormat } from "@/lib/domain/types";

export type PlaybackStatus = "loading" | "playing" | "paused" | "error";

export type PlaybackError = "network" | "unsupported" | "timeout" | "media";

interface UseMediaSourceOptions {
  mediaRef: RefObject<HTMLMediaElement | null>;
  src: string;
  format: StreamFormat;
  /** Intenta reproducir al cargar (con fallback a silencio si el navegador lo bloquea). */
  autoPlay: boolean;
  /** Para emisiones simuladas con archivos finitos: reinicia al terminar. */
  loopAsLive?: boolean;
}

const LOAD_TIMEOUT_MS = 15_000;

/**
 * Conecta un elemento <video>/<audio> a un stream.
 * - HLS: usa el soporte nativo si existe (Safari, iOS); si no, carga hls.js bajo demanda.
 * - Audio: asignación directa de src.
 * Expone un estado explícito para que la interfaz siempre muestre carga, error o reproducción.
 */
export function useMediaSource({ mediaRef, src, format, autoPlay, loopAsLive = true }: UseMediaSourceOptions) {
  const [status, setStatus] = useState<PlaybackStatus>(autoPlay ? "loading" : "paused");
  const [error, setError] = useState<PlaybackError | null>(null);
  const [mutedByPolicy, setMutedByPolicy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const startedRef = useRef(autoPlay);

  const fail = useCallback((reason: PlaybackError) => {
    setError(reason);
    setStatus("error");
  }, []);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    let cancelled = false;
    let destroyHls: (() => void) | undefined;
    let timeout: number | undefined;

    setError(null);

    const armTimeout = () => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        if (!cancelled && media.readyState < 2) fail("timeout");
      }, LOAD_TIMEOUT_MS);
    };

    const tryPlay = async () => {
      if (!startedRef.current) return;
      setStatus("loading");
      armTimeout();
      try {
        await media.play();
      } catch (err) {
        if (cancelled) return;
        // Políticas de autoplay: se reintenta en silencio y se ofrece activar el sonido.
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          media.muted = true;
          setMutedByPolicy(true);
          try {
            await media.play();
          } catch {
            if (!cancelled) setStatus("paused");
          }
        }
      }
    };

    const onPlaying = () => {
      window.clearTimeout(timeout);
      setStatus("playing");
    };
    const onPause = () => {
      if (media.error) return;
      setStatus((s) => (s === "error" ? s : "paused"));
    };
    const onWaiting = () => setStatus((s) => (s === "error" ? s : "loading"));
    const onEnded = () => {
      if (loopAsLive) {
        media.currentTime = 0;
        void media.play().catch(() => undefined);
      }
    };
    const onMediaError = () => fail(media.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED ? "network" : "media");

    media.addEventListener("playing", onPlaying);
    media.addEventListener("pause", onPause);
    media.addEventListener("waiting", onWaiting);
    media.addEventListener("ended", onEnded);
    media.addEventListener("error", onMediaError);

    const attach = async () => {
      const nativeHls = media.canPlayType("application/vnd.apple.mpegurl") !== "";
      if (format === "audio" || nativeHls) {
        media.src = src;
        void tryPlay();
        return;
      }

      const { default: Hls } = await import("hls.js");
      if (cancelled) return;
      if (!Hls.isSupported()) {
        fail("unsupported");
        return;
      }

      const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
      destroyHls = () => hls.destroy();
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        hls.destroy();
        destroyHls = undefined;
        fail(data.type === Hls.ErrorTypes.NETWORK_ERROR ? "network" : "media");
      });
      hls.on(Hls.Events.MANIFEST_PARSED, () => void tryPlay());
      hls.loadSource(src);
      hls.attachMedia(media);
      if (startedRef.current) armTimeout();
    };

    void attach();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      media.removeEventListener("playing", onPlaying);
      media.removeEventListener("pause", onPause);
      media.removeEventListener("waiting", onWaiting);
      media.removeEventListener("ended", onEnded);
      media.removeEventListener("error", onMediaError);
      destroyHls?.();
      media.pause();
      media.removeAttribute("src");
      media.load();
    };
  }, [mediaRef, src, format, attempt, fail, loopAsLive]);

  const play = useCallback(async () => {
    const media = mediaRef.current;
    if (!media) return;
    startedRef.current = true;
    setStatus("loading");
    try {
      await media.play();
    } catch {
      setStatus((s) => (s === "error" ? s : "paused"));
    }
  }, [mediaRef]);

  const pause = useCallback(() => mediaRef.current?.pause(), [mediaRef]);

  const retry = useCallback(() => {
    startedRef.current = true;
    setStatus("loading");
    setAttempt((n) => n + 1);
  }, []);

  return { status, error, mutedByPolicy, setMutedByPolicy, play, pause, retry };
}

export const ERROR_MESSAGES: Record<PlaybackError, string> = {
  network: "No se pudo conectar con la señal. Puede estar fuera del aire o no estar disponible desde tu país.",
  timeout: "La señal tarda demasiado en responder. Revisa tu conexión o inténtalo de nuevo.",
  media: "La señal se interrumpió o llegó con un formato dañado.",
  unsupported: "Tu navegador no puede reproducir este formato. Prueba con una versión reciente de Chrome, Firefox, Edge o Safari.",
};
