import type { Channel, ChannelFilters, Country } from "./types";

/** Una señal solo es visible para el público si sus derechos están aprobados. */
export function isPubliclyVisible(channel: Channel): boolean {
  return channel.rightsStatus === "approved";
}

/** Minúsculas y sin tildes, para que "Peru" encuentre "Perú". */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function matchesQuery(channel: Channel, query: string, countries: Country[]): boolean {
  const terms = normalizeText(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const countryName = countries.find((c) => c.code === channel.countryCode)?.name ?? "";
  const haystack = normalizeText(
    [
      channel.name,
      channel.category,
      channel.language,
      countryName,
      channel.countryCode,
      String(channel.number),
    ].join(" "),
  );

  // Todos los términos deben aparecer: "noticias chile" acota, no amplía.
  return terms.every((term) => haystack.includes(term));
}

export function filterChannels(
  channels: Channel[],
  filters: ChannelFilters,
  countries: Country[],
): Channel[] {
  return channels
    .filter(isPubliclyVisible)
    .filter((c) => !filters.kind || c.kind === filters.kind)
    .filter((c) => !filters.countryCode || c.countryCode === filters.countryCode)
    .filter((c) => !filters.category || c.category === filters.category)
    .filter((c) => !filters.query || matchesQuery(c, filters.query, countries))
    .sort((a, b) => a.number - b.number);
}

export const MAX_QUERY_LENGTH = 80;

type RawParam = string | string[] | undefined;

function firstValue(value: RawParam): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Convierte los parámetros de la URL en filtros válidos.
 * Todo lo que no corresponda a un valor conocido se descarta en silencio:
 * la URL es entrada del usuario y no se confía en ella.
 */
export function parseFilterParams(
  params: Record<string, RawParam>,
  allowed: { countryCodes: string[]; categories: string[] },
): Pick<ChannelFilters, "countryCode" | "category" | "query"> {
  const country = firstValue(params.pais)?.toUpperCase();
  const category = firstValue(params.categoria);
  const query = firstValue(params.q)?.slice(0, MAX_QUERY_LENGTH).trim();

  return {
    countryCode: country && allowed.countryCodes.includes(country) ? country : undefined,
    category: category && allowed.categories.includes(category) ? category : undefined,
    query: query ? query : undefined,
  };
}
