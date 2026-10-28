import { SignalOffIcon } from "@/components/ui/icons";
import type { Channel } from "@/lib/domain/types";
import { AudioPlayer } from "./audio-player";
import { VideoPlayer } from "./video-player";

/**
 * Elige el reproductor según el formato. Si la última comprobación marcó la
 * señal como fuera del aire, no se intenta reproducir: se informa directamente.
 */
export function ChannelPlayer({ channel, countryName }: { channel: Channel; countryName: string }) {
  if (channel.availability === "offline") {
    return (
      <div
        role="status"
        className={`grid place-items-center rounded-[var(--radius-screen)] bg-ink-900 p-8 text-center ring-1 ring-ink-700 ${
          channel.kind === "tv" ? "aspect-video" : "min-h-72"
        }`}
      >
        <div className="max-w-sm">
          <SignalOffIcon className="mx-auto text-4xl text-mist" />
          <p className="mt-4 font-display text-3xl font-bold">Fuera del aire</p>
          <p className="mt-2 text-sm leading-relaxed text-mist">
            La última comprobación no encontró emisión. Vuelve a intentarlo más tarde o prueba una de las señales
            sugeridas.
          </p>
        </div>
      </div>
    );
  }

  if (channel.stream.format === "audio") {
    return (
      <AudioPlayer
        src={channel.stream.url}
        name={channel.name}
        subtitle={`${channel.category}, ${countryName}`}
        hue={channel.hue}
      />
    );
  }

  return <VideoPlayer src={channel.stream.url} title={channel.name} />;
}
