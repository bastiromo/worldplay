import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { channelNumber } from "@/components/catalog/channel-art";
import { ChannelRow } from "@/components/catalog/channel-grid";
import { LiveBadge } from "@/components/catalog/live-badge";
import { ChannelPlayer } from "@/components/player/channel-player";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { catalog } from "@/lib/catalog/repository";
import type { Channel, Country } from "@/lib/domain/types";

export async function generateStaticParams() {
  const slugs = await catalog.listPublicSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/ver/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const channel = await catalog.getChannelBySlug(slug);
  if (!channel) return { title: "Señal no encontrada" };
  return {
    title: channel.name,
    description: channel.description,
  };
}

export default function WatchPage({ params }: PageProps<"/ver/[slug]">) {
  return (
    <div className="mx-auto max-w-[96rem]">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full py-1 pr-3 text-sm font-medium text-mist transition-colors hover:text-paper"
      >
        <ArrowLeftIcon /> Volver al inicio
      </Link>
      <Suspense fallback={<WatchSkeleton />}>
        <WatchContent params={params} />
      </Suspense>
    </div>
  );
}

async function WatchContent({ params }: Pick<PageProps<"/ver/[slug]">, "params">) {
  const { slug } = await params;
  const channel = await catalog.getChannelBySlug(slug);
  if (!channel) notFound();

  const [countries, sameCountry, sameCategory] = await Promise.all([
    catalog.listCountries(),
    catalog.listChannels({ countryCode: channel.countryCode }),
    catalog.listChannels({ kind: channel.kind, category: channel.category }),
  ]);
  const country = countries.find((c) => c.code === channel.countryCode);
  const countryName = country?.name ?? channel.countryCode;
  const fromCountry = sameCountry.filter((c) => c.id !== channel.id);
  const alike = sameCategory.filter((c) => c.id !== channel.id && c.countryCode !== channel.countryCode);

  return (
    <>
      <div className="mt-4 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <ChannelPlayer channel={channel} countryName={countryName} />
        <ChannelInfo channel={channel} country={country} />
      </div>

      {fromCountry.length > 0 && (
        <section aria-labelledby="mas-pais" className="mt-14">
          <h2 id="mas-pais" className="font-display text-3xl font-bold">
            Más de {countryName}
          </h2>
          <div className="mt-5">
            <ChannelRow channels={fromCountry} countries={countries} />
          </div>
        </section>
      )}

      {alike.length > 0 && (
        <section aria-labelledby="mas-categoria" className="mt-12">
          <h2 id="mas-categoria" className="font-display text-3xl font-bold">
            Otras señales de {channel.category.toLowerCase()}
          </h2>
          <div className="mt-5">
            <ChannelRow channels={alike} countries={countries} />
          </div>
        </section>
      )}
    </>
  );
}

const dateFormat = new Intl.DateTimeFormat("es", { dateStyle: "long", timeZone: "America/Santiago" });

const SOURCE_LABEL: Record<Channel["provenance"]["source"], string> = {
  demo: "Demostración",
  official: "Emisión oficial",
  licensed: "Con licencia",
};

function ChannelInfo({ channel, country }: { channel: Channel; country?: Country }) {
  return (
    <aside className="xl:pt-1">
      <div className="flex items-center gap-3">
        <span className="tabular font-display text-2xl font-bold text-dial">{channelNumber(channel.number)}</span>
        <LiveBadge availability={channel.availability} />
      </div>
      <h1 className="mt-2 font-display text-5xl leading-[0.95] font-extrabold text-balance">{channel.name}</h1>

      <dl className="mt-5 flex flex-wrap gap-2 text-sm">
        {[
          ["País", country?.name ?? channel.countryCode],
          ["Idioma", channel.language],
          ["Categoría", channel.category],
        ].map(([label, value]) => (
          <div key={label} className="rounded-full border border-ink-700 px-3 py-1">
            <dt className="sr-only">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 leading-relaxed text-paper/85">{channel.description}</p>

      <section aria-labelledby="fuente" className="mt-7 rounded-xl border border-ink-700 p-4 text-sm">
        <h2 id="fuente" className="font-semibold">
          Fuente de la señal
        </h2>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          <dt className="text-mist">Origen</dt>
          <dd>{SOURCE_LABEL[channel.provenance.source]}</dd>
          <dt className="text-mist">Comprobada</dt>
          <dd>{dateFormat.format(new Date(channel.lastCheckedAt))}</dd>
          <dt className="text-mist">Sitio oficial</dt>
          <dd>
            {channel.officialSite ? (
              <a href={channel.officialSite} rel="noopener noreferrer" target="_blank" className="text-dial underline">
                Visitar
              </a>
            ) : (
              "No aplica"
            )}
          </dd>
        </dl>
        <p className="mt-3 leading-relaxed text-mist">{channel.provenance.note}</p>
      </section>
    </aside>
  );
}

function WatchSkeleton() {
  return (
    <div className="mt-4 grid animate-pulse gap-8 motion-reduce:animate-none xl:grid-cols-[minmax(0,1fr)_22rem]" aria-hidden="true">
      <div className="aspect-video rounded-[var(--radius-screen)] bg-ink-900" />
      <div className="space-y-4">
        <div className="h-6 w-24 rounded bg-ink-900" />
        <div className="h-12 w-3/4 rounded bg-ink-900" />
        <div className="h-24 rounded bg-ink-900" />
      </div>
    </div>
  );
}
