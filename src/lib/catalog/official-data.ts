import type { Channel } from "@/lib/domain/types";

/**
 * Señales oficiales de televisión.
 *
 * Criterio de inclusión (política de señales, nivel "public-official"):
 * - El stream lo sirve el propio emisor desde su infraestructura (dominio del
 *   emisor o de la institución pública a la que pertenece).
 * - Es accesible sin token, sin cabeceras falsificadas y por https.
 * - No figura en la lista de retirada a petición del titular de iptv-org,
 *   directorio usado solo para descubrir candidatos.
 * - No se eluden geobloqueos ni otras restricciones: si una señal no está
 *   disponible desde el país del espectador, el reproductor lo informa.
 *
 * Revisado el 28 de octubre de 2026. Ninguna tiene acuerdo expreso con WorldPlay;
 * cualquier titular puede pedir la retirada (ver /fuentes).
 */

type OfficialSeed = Pick<
  Channel,
  "slug" | "number" | "name" | "countryCode" | "language" | "category" | "description" | "hue"
> & {
  stream: string;
  officialSite: string;
  owner: string;
};

const SEEDS: OfficialSeed[] = [
  {
    slug: "la-1", number: 1, name: "La 1", countryCode: "ES", language: "Español", category: "General", hue: 4,
    owner: "RTVE", officialSite: "https://www.rtve.es/play/videos/directo/",
    stream: "https://ztnr.rtve.es/ztnr/1688877.m3u8",
    description: "Primer canal de RTVE, la televisión pública de España: informativos, entretenimiento y grandes eventos.",
  },
  {
    slug: "la-2", number: 2, name: "La 2", countryCode: "ES", language: "Español", category: "Cultura", hue: 215,
    owner: "RTVE", officialSite: "https://www.rtve.es/play/videos/directo/",
    stream: "https://rtvelivestream.rtve.es/rtvesec/la2/la2_main.m3u8",
    description: "Segundo canal de RTVE, con documentales, cine, divulgación y programación cultural.",
  },
  {
    slug: "24-horas-rtve", number: 3, name: "24 Horas", countryCode: "ES", language: "Español", category: "Noticias", hue: 350,
    owner: "RTVE", officialSite: "https://www.rtve.es/play/videos/directo/",
    stream: "https://ztnr.rtve.es/ztnr/1694255.m3u8",
    description: "Canal de noticias de RTVE que emite información de actualidad las 24 horas.",
  },
  {
    slug: "tv-senado", number: 4, name: "TV Senado", countryCode: "CL", language: "Español", category: "Institucional", hue: 200,
    owner: "Senado de Chile", officialSite: "https://www.senado.cl/",
    stream: "https://janus-tv-ply.senado.cl/playlist/playlist.m3u8",
    description: "Canal del Senado de Chile: sesiones de sala, comisiones y programas sobre la labor legislativa.",
  },
  {
    slug: "senal-colombia", number: 5, name: "Señal Colombia", countryCode: "CO", language: "Español", category: "Cultura", hue: 48,
    owner: "RTVC Sistema de Medios Públicos", officialSite: "https://www.senalcolombia.tv/",
    stream: "https://streaming.rtvc.gov.co/TV_Senal_Colombia_live/smil:live.smil/playlist.m3u8",
    description: "Canal público de RTVC con programación cultural, educativa, infantil y deportiva.",
  },
  {
    slug: "canal-institucional", number: 6, name: "Canal Institucional", countryCode: "CO", language: "Español", category: "Institucional", hue: 165,
    owner: "RTVC Sistema de Medios Públicos", officialSite: "https://www.canalinstitucional.tv/",
    stream: "https://streaming.rtvc.gov.co/TV_CanalInstitucional_live/smil:live.smil/playlist.m3u8",
    description: "Canal público de RTVC dedicado a la información de las instituciones del Estado colombiano.",
  },
  {
    slug: "tv-universidad-unlp", number: 7, name: "TV Universidad", countryCode: "AR", language: "Español", category: "Educación", hue: 190,
    owner: "Universidad Nacional de La Plata", officialSite: "https://tv.unlp.edu.ar/",
    stream: "https://stratus.stream.cespi.unlp.edu.ar/hls/tvunlp.m3u8",
    description: "Canal de la Universidad Nacional de La Plata, con producción universitaria, cultural y periodística.",
  },
  {
    slug: "folklore-tv", number: 8, name: "Folklore TV", countryCode: "PE", language: "Español", category: "Música", hue: 22,
    owner: "Folklore TV", officialSite: "https://www.folkloretv.pe/",
    stream: "https://play.folkloretv.pe/StreamSD/index.m3u8",
    description: "Canal peruano dedicado a la música y las danzas folclóricas.",
  },
  {
    slug: "tv-buap", number: 9, name: "TV BUAP", countryCode: "MX", language: "Español", category: "Educación", hue: 222,
    owner: "Benemérita Universidad Autónoma de Puebla", officialSite: "https://radioytv.buap.mx/",
    stream: "https://tvenvivo.buap.mx/livestream/stream/index.m3u8",
    description: "Canal de la Benemérita Universidad Autónoma de Puebla, con contenidos educativos y culturales.",
  },
  {
    slug: "tv-brasil", number: 10, name: "TV Brasil", countryCode: "BR", language: "Portugués", category: "General", hue: 140,
    owner: "Empresa Brasil de Comunicação (EBC)", officialSite: "https://tvbrasil.ebc.com.br/",
    stream: "https://tvbrasil-stream.ebc.com.br/index.m3u8",
    description: "Televisión pública federal de Brasil, operada por la Empresa Brasil de Comunicação.",
  },
  {
    slug: "tv-cultura", number: 11, name: "TV Cultura", countryCode: "BR", language: "Portugués", category: "Cultura", hue: 270,
    owner: "Fundação Padre Anchieta", officialSite: "https://cultura.uol.com.br/",
    stream: "https://player-tvcultura.stream.uol.com.br/live/tvcultura.m3u8",
    description: "Televisión educativa y cultural de la Fundação Padre Anchieta, en São Paulo.",
  },
  {
    slug: "tv-camara", number: 12, name: "TV Câmara", countryCode: "BR", language: "Portugués", category: "Institucional", hue: 120,
    owner: "Cámara de Diputados de Brasil", officialSite: "https://www.camara.leg.br/tv",
    stream: "https://stream3.camara.gov.br/tv1/manifest.m3u8",
    description: "Canal de la Cámara de Diputados de Brasil: sesiones, comisiones y programas informativos.",
  },
];

export const OFFICIAL_CHANNELS: Channel[] = SEEDS.map((seed) => ({
  id: `official-${seed.slug}`,
  slug: seed.slug,
  number: seed.number,
  name: seed.name,
  kind: "tv",
  countryCode: seed.countryCode,
  language: seed.language,
  category: seed.category,
  description: seed.description,
  stream: { url: seed.stream, format: "hls" },
  officialSite: seed.officialSite,
  provenance: {
    source: "official",
    note: `Emisión publicada por ${seed.owner} en su propia infraestructura (${new URL(seed.stream).hostname}). WorldPlay solo la enlaza: no la almacena ni la retransmite.`,
  },
  rightsStatus: "public-official",
  availability: "unknown",
  lastCheckedAt: null,
  hue: seed.hue,
}));
