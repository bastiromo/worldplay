import { filterChannels, isPubliclyVisible } from "@/lib/domain/filters";
import { isAllowedStreamUrl } from "@/lib/domain/stream-url";
import type { Channel, ChannelFilters, ChannelKind, Country } from "@/lib/domain/types";
import { DEMO_CHANNELS, DEMO_COUNTRIES } from "./demo-data";

/**
 * Contrato de acceso al catálogo. La interfaz depende solo de esto, de modo que
 * la implementación de demostración pueda sustituirse por Supabase sin tocar
 * componentes ni páginas.
 */
export interface CatalogRepository {
  listCountries(): Promise<Country[]>;
  listCategories(kind?: ChannelKind): Promise<string[]>;
  listChannels(filters?: ChannelFilters): Promise<Channel[]>;
  /** Devuelve null si no existe o no es visible públicamente. */
  getChannelBySlug(slug: string): Promise<Channel | null>;
  /** Slugs visibles, para prerenderizar las fichas. */
  listPublicSlugs(): Promise<string[]>;
}

export function createInMemoryCatalog(
  channels: Channel[],
  countries: Country[],
): CatalogRepository {
  // Una señal con URL no permitida nunca llega a la interfaz.
  const safeChannels = channels.filter((c) => isAllowedStreamUrl(c.stream.url));

  return {
    async listCountries() {
      const used = new Set(safeChannels.filter(isPubliclyVisible).map((c) => c.countryCode));
      return countries.filter((c) => used.has(c.code));
    },

    async listCategories(kind) {
      const categories = new Set(
        safeChannels
          .filter(isPubliclyVisible)
          .filter((c) => !kind || c.kind === kind)
          .map((c) => c.category),
      );
      return [...categories].sort((a, b) => a.localeCompare(b, "es"));
    },

    async listChannels(filters = {}) {
      return filterChannels(safeChannels, filters, countries);
    },

    async getChannelBySlug(slug) {
      const channel = safeChannels.find((c) => c.slug === slug);
      return channel && isPubliclyVisible(channel) ? channel : null;
    },

    async listPublicSlugs() {
      return safeChannels.filter(isPubliclyVisible).map((c) => c.slug);
    },
  };
}

export const catalog: CatalogRepository = createInMemoryCatalog(DEMO_CHANNELS, DEMO_COUNTRIES);
