import type { Channel } from "@/lib/domain/types";
import chile from "./data/chile.json";

/**
 * Señales reales de Chile (televisión y radio).
 *
 * Los datos se generan con scripts/catalogo/generar_chile.py a partir de:
 * - iptv-org (TV): solo enlaces https, sin token ni cabeceras falsificadas, fuera de
 *   la lista de retirada, sin geobloqueo declarado y sin retransmisiones de
 *   cableoperadores, ISP o agregadores.
 * - Radio Browser (radio): solo enlaces https con sitio web propio de la emisora.
 *
 * Cada señal se comprobó desde un navegador en Chile el 28 de octubre de 2026
 * (manifiesto y primer segmento en TV; inicio de reproducción en radio).
 * Ninguna tiene acuerdo expreso con WorldPlay; cualquier titular puede pedir la
 * retirada (ver /fuentes). No se elude ningún geobloqueo, DRM ni restricción.
 */

interface ChileSeed {
  slug: string;
  number: number;
  name: string;
  kind: Channel["kind"];
  category: string;
  description: string;
  stream: string;
  format: Channel["stream"]["format"];
  officialSite: string | null;
  streamHost: string;
  rightsStatus: "public-official" | "public-listed";
  sourceRef: string;
  hue: number;
  countryCode: string;
  language: string;
  lastCheckedAt: string;
}

function provenanceNote(seed: ChileSeed): string {
  const directory = seed.sourceRef.startsWith("radio-browser:") ? "Radio Browser" : "iptv-org";
  const owner =
    seed.rightsStatus === "public-official"
      ? "servida desde la infraestructura de la propia emisora"
      : "servida por un proveedor de streaming no verificado como de la emisora";
  return `Emisión pública ${owner} (${seed.streamHost}), encontrada en el directorio abierto ${directory}. WorldPlay solo la enlaza: no la almacena ni la retransmite.`;
}

export const OFFICIAL_CHANNELS: Channel[] = (chile as ChileSeed[]).map((seed) => ({
  id: `cl-${seed.kind}-${seed.slug}`,
  slug: seed.slug,
  number: seed.number,
  name: seed.name,
  kind: seed.kind,
  countryCode: seed.countryCode,
  language: seed.language,
  category: seed.category,
  description: seed.description,
  stream: { url: seed.stream, format: seed.format },
  officialSite: seed.officialSite,
  provenance: { source: "directory", note: provenanceNote(seed) },
  rightsStatus: seed.rightsStatus,
  availability: "online",
  lastCheckedAt: seed.lastCheckedAt,
  hue: seed.hue,
}));
