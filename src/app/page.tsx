import Link from "next/link";
import { ChannelRow } from "@/components/catalog/channel-grid";
import { CountryTuner } from "@/components/catalog/country-tuner";
import { LiveBadge } from "@/components/catalog/live-badge";
import { HeroPreview } from "@/components/home/hero-preview";
import { PlayIcon } from "@/components/ui/icons";
import { catalog } from "@/lib/catalog/repository";

const FEATURED_SLUG = "cordillera-noticias";

export default async function HomePage() {
  const [countries, tv, radio, featured] = await Promise.all([
    catalog.listCountries(),
    catalog.listChannels({ kind: "tv" }),
    catalog.listChannels({ kind: "radio" }),
    catalog.getChannelBySlug(FEATURED_SLUG),
  ]);
  const hero = featured ?? tv[0];
  const heroCountry = countries.find((c) => c.code === hero?.countryCode);

  return (
    <div className="mx-auto max-w-[96rem]">
      {hero && (
        <section aria-labelledby="destacado" className="grid items-center gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
          <div className="order-2 lg:order-1">
            <LiveBadge availability={hero.availability} className="!bg-ink-800" />
            <h1
              id="destacado"
              className="mt-4 font-display text-6xl leading-[0.9] font-extrabold text-balance sm:text-7xl 2xl:text-8xl"
            >
              {hero.name}
            </h1>
            <p className="mt-3 text-mist">
              {heroCountry?.name}, {hero.category.toLowerCase()} en {hero.language.toLowerCase()}
            </p>
            <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-paper/85">{hero.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={`/ver/${hero.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-dial px-6 py-3 font-semibold text-ink-950 transition-colors hover:bg-dial-strong"
              >
                <PlayIcon /> Ver ahora
              </Link>
              <Link
                href="/explorar"
                className="inline-flex items-center rounded-full border border-ink-600 px-6 py-3 font-medium transition-colors hover:border-dial hover:text-dial"
              >
                Explorar el catálogo
              </Link>
            </div>
          </div>
          <Link
            href={`/ver/${hero.slug}`}
            className="order-1 block rounded-[var(--radius-screen)] lg:order-2"
            aria-label={`Ver ${hero.name}`}
          >
            <HeroPreview src={hero.stream.url} name={hero.name} hue={hero.hue} />
          </Link>
        </section>
      )}

      <section aria-labelledby="sintonizador" className="mt-14">
        <h2 id="sintonizador" className="font-display text-3xl font-bold">
          Sintoniza un país
        </h2>
        <p className="mt-1 text-sm text-mist">Con la hora local de cada lugar, para saber qué se está emitiendo.</p>
        <div className="mt-4">
          <CountryTuner countries={countries} basePath="/explorar" />
        </div>
      </section>

      <RowSection id="fila-tv" title="Televisión en vivo" href="/tv" linkLabel="Ver todos los canales">
        <ChannelRow channels={tv} countries={countries} />
      </RowSection>

      <RowSection id="fila-radio" title="Radio" href="/radio" linkLabel="Ver todas las emisoras">
        <ChannelRow channels={radio} countries={countries} />
      </RowSection>
    </div>
  );
}

function RowSection({
  id,
  title,
  href,
  linkLabel,
  children,
}: {
  id: string;
  title: string;
  href: "/tv" | "/radio";
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-12">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={id} className="font-display text-3xl font-bold">
          {title}
        </h2>
        <Link href={href} className="shrink-0 text-sm font-medium text-dial hover:text-dial-strong hover:underline">
          {linkLabel}
        </Link>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
