import type { Channel, Country } from "@/lib/domain/types";
import { ChannelCard } from "./channel-card";

interface ChannelCollectionProps {
  channels: Channel[];
  countries: Country[];
}

function countryOf(countries: Country[], code: string) {
  return countries.find((c) => c.code === code);
}

/** Cuadrícula para listados completos. TV y radio usan columnas distintas. */
export function ChannelGrid({ channels, countries }: ChannelCollectionProps) {
  const tv = channels.filter((c) => c.kind === "tv");
  const radio = channels.filter((c) => c.kind === "radio");

  return (
    <div className="space-y-10">
      {tv.length > 0 && (
        <ul className="grid grid-cols-1 gap-x-5 gap-y-7 min-[480px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {tv.map((channel) => (
            <li key={channel.id}>
              <ChannelCard channel={channel} country={countryOf(countries, channel.countryCode)} />
            </li>
          ))}
        </ul>
      )}
      {radio.length > 0 && (
        <ul className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {radio.map((channel) => (
            <li key={channel.id}>
              <ChannelCard channel={channel} country={countryOf(countries, channel.countryCode)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Fila horizontal desplazable para la portada. */
export function ChannelRow({ channels, countries }: ChannelCollectionProps) {
  return (
    <ul className="scroll-row -mx-4 flex gap-5 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
      {channels.map((channel) => (
        <li key={channel.id} className={channel.kind === "radio" ? "w-36 shrink-0 sm:w-40" : "w-64 shrink-0 sm:w-72"}>
          <ChannelCard channel={channel} country={countryOf(countries, channel.countryCode)} />
        </li>
      ))}
    </ul>
  );
}
