import Link from "next/link";
import type { Channel, Country } from "@/lib/domain/types";
import { channelNumber, discStyle, labelStyle, monogram, screenStyle } from "./channel-art";
import { LiveBadge } from "./live-badge";

interface ChannelCardProps {
  channel: Channel;
  country?: Country;
}

/** La forma comunica el tipo: pantalla 16:9 para TV, disco para radio. */
export function ChannelCard({ channel, country }: ChannelCardProps) {
  return channel.kind === "tv" ? (
    <TvCard channel={channel} country={country} />
  ) : (
    <RadioCard channel={channel} country={country} />
  );
}

function TvCard({ channel, country }: ChannelCardProps) {
  return (
    <Link href={`/ver/${channel.slug}`} className="group block rounded-[var(--radius-screen)] focus-visible:outline-offset-4">
      <div
        className="relative aspect-video overflow-hidden rounded-[var(--radius-screen)] ring-1 ring-ink-700 transition-[box-shadow] duration-200 group-hover:ring-2 group-hover:ring-dial"
        style={screenStyle(channel)}
      >
        <span className="tabular absolute top-2.5 left-3 font-display text-lg leading-none font-bold text-paper/85">
          {channelNumber(channel.number)}
        </span>
        <LiveBadge availability={channel.availability} className="absolute top-2 right-2" />
        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center font-display text-[3.4rem] leading-none font-extrabold text-paper/70"
        >
          {monogram(channel.name)}
        </span>
      </div>
      <h3 className="mt-3 truncate text-[0.98rem] font-semibold text-paper group-hover:text-dial-strong">
        {channel.name}
      </h3>
      <p className="mt-0.5 flex items-center gap-2 text-sm text-mist">
        <span className="truncate">{country?.name ?? channel.countryCode}</span>
        <span aria-hidden="true" className="h-3 w-px bg-ink-600" />
        <span className="truncate">{channel.category}</span>
        <DemoTag channel={channel} />
      </p>
    </Link>
  );
}

function RadioCard({ channel, country }: ChannelCardProps) {
  return (
    <Link href={`/ver/${channel.slug}`} className="group block rounded-xl text-center focus-visible:outline-offset-4">
      <div
        className="relative mx-auto aspect-square w-full max-w-44 rounded-full ring-1 ring-ink-700 transition-[box-shadow] duration-200 group-hover:ring-2 group-hover:ring-dial"
        style={discStyle(channel)}
      >
        <span
          className="absolute inset-[27%] grid place-items-center rounded-full font-display text-2xl font-extrabold text-ink-950 shadow-[0_0_0_4px_rgba(12,21,38,0.6)]"
          style={labelStyle(channel)}
          aria-hidden="true"
        >
          {monogram(channel.name)}
        </span>
      </div>
      <h3 className="mt-3 truncate text-[0.98rem] font-semibold text-paper group-hover:text-dial-strong">
        {channel.name}
      </h3>
      <p className="mt-0.5 truncate text-sm text-mist">
        {channel.category}, {country?.name ?? channel.countryCode}
        <DemoTag channel={channel} />
      </p>
    </Link>
  );
}

/** Distingue las señales ficticias de demostración de las emisiones reales. */
function DemoTag({ channel }: { channel: Channel }) {
  if (channel.provenance.source !== "demo") return null;
  return (
    <span className="ml-1.5 shrink-0 rounded border border-ink-600 px-1 py-px align-middle text-[0.65rem] font-medium text-mist">
      Demo
    </span>
  );
}
