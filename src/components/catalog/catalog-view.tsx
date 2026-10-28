import Link from "next/link";
import { Suspense } from "react";
import { SearchIcon } from "@/components/ui/icons";
import { catalog } from "@/lib/catalog/repository";
import { MAX_QUERY_LENGTH, parseFilterParams } from "@/lib/domain/filters";
import type { ChannelKind } from "@/lib/domain/types";
import { CategoryFilter } from "./category-filter";
import { ChannelGrid } from "./channel-grid";
import { CountryTuner } from "./country-tuner";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

interface CatalogViewProps {
  title: string;
  intro: string;
  basePath: "/tv" | "/radio" | "/explorar";
  kind?: ChannelKind;
  /** Muestra un buscador dentro de la página (solo en Explorar). */
  withSearch?: boolean;
  searchParams: SearchParams;
}

/**
 * El encabezado no depende de la URL y forma parte del armazón prerenderizado;
 * los filtros y resultados dependen de searchParams y se transmiten dentro de Suspense.
 */
export function CatalogView({ title, intro, basePath, kind, withSearch = false, searchParams }: CatalogViewProps) {
  return (
    <div className="mx-auto max-w-[96rem]">
      <header className="max-w-2xl">
        <h1 className="font-display text-5xl leading-[0.95] font-extrabold sm:text-6xl">{title}</h1>
        <p className="mt-3 text-[1.05rem] leading-relaxed text-mist">{intro}</p>
      </header>
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogResults basePath={basePath} kind={kind} withSearch={withSearch} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CatalogResults({
  basePath,
  kind,
  withSearch,
  searchParams,
}: Pick<CatalogViewProps, "basePath" | "kind" | "withSearch" | "searchParams">) {
  const [params, countries, categories] = await Promise.all([
    searchParams,
    catalog.listCountries(),
    catalog.listCategories(kind),
  ]);
  const filters = parseFilterParams(params, {
    countryCodes: countries.map((c) => c.code),
    categories,
  });
  const channels = await catalog.listChannels({ kind, ...filters });
  const countryName = countries.find((c) => c.code === filters.countryCode)?.name;
  const hasFilters = Boolean(filters.countryCode || filters.category || filters.query);

  return (
    <>
      {withSearch && (
        <form action={basePath} className="relative mt-7 max-w-2xl" role="search">
          <label htmlFor="catalog-search" className="sr-only">
            Buscar en el catálogo
          </label>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-xl text-mist" />
          <input
            // La clave fuerza a reiniciar el campo cuando la búsqueda cambia desde fuera.
            key={filters.query ?? ""}
            id="catalog-search"
            type="search"
            name="q"
            defaultValue={filters.query}
            maxLength={MAX_QUERY_LENGTH}
            placeholder="Nombre, país, idioma o categoría"
            className="h-14 w-full rounded-xl border border-ink-700 bg-ink-900 pr-28 pl-12 text-lg text-paper placeholder:text-mist/70 focus:border-dial focus:outline-none"
          />
          {filters.countryCode && <input type="hidden" name="pais" value={filters.countryCode} />}
          {filters.category && <input type="hidden" name="categoria" value={filters.category} />}
          <button
            type="submit"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg bg-dial px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-dial-strong"
          >
            Buscar
          </button>
        </form>
      )}

      {countries.length > 1 && (
      <div className="mt-8">
        <CountryTuner
          countries={countries}
          basePath={basePath}
          activeCode={filters.countryCode}
          keepParams={{ q: filters.query, categoria: filters.category }}
        />
      </div>
      )}
      <div className={countries.length > 1 ? "mt-5" : "mt-8"}>
        <CategoryFilter
          categories={categories}
          basePath={basePath}
          active={filters.category}
          keepParams={{ q: filters.query, pais: filters.countryCode }}
        />
      </div>

      <p className="mt-8 text-sm text-mist" aria-live="polite">
        {resultSummary(channels.length, filters.query, countryName)}
      </p>

      <div className="mt-5">
        {channels.length > 0 ? (
          <ChannelGrid channels={channels} countries={countries} />
        ) : (
          <div className="rounded-2xl border border-dashed border-ink-700 px-6 py-14 text-center">
            <p className="font-display text-3xl font-bold">Ninguna señal coincide</p>
            <p className="mx-auto mt-2 max-w-md text-mist">
              Prueba con otro término o quita algún filtro para ver más canales y emisoras.
            </p>
            {hasFilters && (
              <Link
                href={basePath}
                className="mt-6 inline-block rounded-full border border-ink-600 px-5 py-2 text-sm font-medium transition-colors hover:border-dial hover:text-dial"
              >
                Quitar filtros
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function resultSummary(count: number, query?: string, countryName?: string) {
  const noun = count === 1 ? "señal" : "señales";
  let text = `${count} ${noun}`;
  if (query) text += ` para «${query}»`;
  if (countryName) text += ` en ${countryName}`;
  return text;
}

function CatalogSkeleton() {
  return (
    <div className="mt-8 animate-pulse motion-reduce:animate-none" aria-hidden="true">
      <div className="flex gap-1">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-[4.6rem] w-[5.5rem] rounded-lg bg-ink-900" />
        ))}
      </div>
      <div className="mt-14 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="aspect-video rounded-[var(--radius-screen)] bg-ink-900" />
        ))}
      </div>
    </div>
  );
}
