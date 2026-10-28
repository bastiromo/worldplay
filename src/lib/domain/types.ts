/**
 * Modelo de dominio del catálogo de WorldPlay.
 *
 * Los campos de procedencia, derechos y disponibilidad existen desde el primer día
 * porque son los que deciden si una señal puede mostrarse al público: una señal
 * técnicamente funcional no es lo mismo que una señal autorizada.
 */

export type ChannelKind = "tv" | "radio";

/** Formato técnico del stream; determina qué reproductor se usa. */
export type StreamFormat = "hls" | "audio";

/** Estado de la revisión de derechos y condiciones de uso. */
export type RightsStatus =
  | "approved" // autorizada para publicarse
  | "pending" // en revisión, no se muestra
  | "rejected" // no autorizada
  | "withdrawn"; // retirada (p. ej. a petición del titular)

/** Resultado de la última comprobación técnica de la señal. */
export type Availability = "online" | "offline" | "unknown";

export type CountryCode = string; // ISO 3166-1 alfa-2, en mayúsculas

export interface Country {
  code: CountryCode;
  name: string;
  /** Zona horaria IANA representativa, para mostrar la hora local. */
  timeZone: string;
}

export interface Provenance {
  /** "demo" para contenido sintético generado por el proyecto. */
  source: "demo" | "official" | "licensed";
  note: string;
}

export interface Channel {
  id: string;
  slug: string;
  /** Número de canal mostrado en la interfaz, como en un decodificador. */
  number: number;
  name: string;
  kind: ChannelKind;
  countryCode: CountryCode;
  language: string;
  category: string;
  description: string;
  stream: {
    url: string;
    format: StreamFormat;
  };
  officialSite: string | null;
  provenance: Provenance;
  rightsStatus: RightsStatus;
  availability: Availability;
  /** Fecha ISO 8601 de la última comprobación técnica. */
  lastCheckedAt: string;
  /** Tono (0-360) para la identidad visual generada del canal. */
  hue: number;
}

export interface ChannelFilters {
  kind?: ChannelKind;
  countryCode?: CountryCode;
  category?: string;
  query?: string;
}
