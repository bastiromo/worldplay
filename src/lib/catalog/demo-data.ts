import type { Channel, Country } from "@/lib/domain/types";

/**
 * Catálogo de demostración.
 *
 * Todos los canales y emisoras son ficticios. Sus streams son medios sintéticos
 * generados por scripts/generate-demo-media.sh, sin material de terceros.
 */

/** Países del catálogo (reales y de demostración). */
export const DEMO_COUNTRIES: Country[] = [
  { code: "CL", name: "Chile", timeZone: "America/Santiago" },
  { code: "AR", name: "Argentina", timeZone: "America/Argentina/Buenos_Aires" },
  { code: "PE", name: "Perú", timeZone: "America/Lima" },
  { code: "CO", name: "Colombia", timeZone: "America/Bogota" },
  { code: "MX", name: "México", timeZone: "America/Mexico_City" },
  { code: "BR", name: "Brasil", timeZone: "America/Sao_Paulo" },
  { code: "ES", name: "España", timeZone: "Europe/Madrid" },
  { code: "PT", name: "Portugal", timeZone: "Europe/Lisbon" },
];

const VIDEO = {
  aurora: "/demo/video/aurora/index.m3u8",
  fractal: "/demo/video/fractal/index.m3u8",
  pulso: "/demo/video/pulso/index.m3u8",
} as const;

const AUDIO = {
  brisa: "/demo/audio/brisa.mp3",
  nocturno: "/demo/audio/nocturno.mp3",
  costa: "/demo/audio/costa.mp3",
} as const;

const CHECKED_AT = "2026-10-28T12:00:00-03:00";
const DEMO_PROVENANCE = {
  source: "demo",
  note: "Señal sintética de demostración generada por WorldPlay. No corresponde a ningún canal real.",
} as const;

type DemoSeed = Pick<
  Channel,
  "number" | "name" | "kind" | "countryCode" | "language" | "category" | "description" | "hue"
> & {
  stream: string;
  rightsStatus?: Channel["rightsStatus"];
  availability?: Channel["availability"];
};

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toChannel(seed: DemoSeed): Channel {
  const slug = slugify(seed.name);
  return {
    id: `demo-${slug}`,
    slug,
    number: seed.number,
    name: seed.name,
    kind: seed.kind,
    countryCode: seed.countryCode,
    language: seed.language,
    category: seed.category,
    description: seed.description,
    stream: { url: seed.stream, format: seed.kind === "tv" ? "hls" : "audio" },
    officialSite: null,
    provenance: DEMO_PROVENANCE,
    rightsStatus: seed.rightsStatus ?? "approved",
    availability: seed.availability ?? "online",
    lastCheckedAt: CHECKED_AT,
    hue: seed.hue,
  };
}

const SEEDS: DemoSeed[] = [
  // --- Televisión -----------------------------------------------------------
  { number: 801, name: "Cordillera Noticias", kind: "tv", countryCode: "CL", language: "Español", category: "Noticias", hue: 212, stream: VIDEO.aurora, description: "Informativo continuo con boletines cada hora y cobertura regional de norte a sur." },
  { number: 802, name: "Pacífico Deportes", kind: "tv", countryCode: "CL", language: "Español", category: "Deportes", hue: 140, stream: VIDEO.pulso, description: "Fútbol, básquetbol y deportes de montaña, con resúmenes y programas de análisis." },
  { number: 803, name: "Pampa Cultural", kind: "tv", countryCode: "AR", language: "Español", category: "Cultura", hue: 32, stream: VIDEO.fractal, description: "Cine de autor, teatro filmado y entrevistas con escritores del Río de la Plata." },
  { number: 804, name: "Rioplatense 24", kind: "tv", countryCode: "AR", language: "Español", category: "Noticias", hue: 200, stream: VIDEO.aurora, description: "Actualidad nacional e internacional con mesas de debate por la noche." },
  { number: 805, name: "Altiplano Kids", kind: "tv", countryCode: "PE", language: "Español", category: "Infantil", hue: 48, stream: VIDEO.pulso, description: "Animación y programas educativos para niñas y niños de 4 a 10 años." },
  { number: 806, name: "Inca Visión", kind: "tv", countryCode: "PE", language: "Español", category: "Entretenimiento", hue: 350, stream: VIDEO.fractal, description: "Series, concursos y magazines de tarde con público en estudio." },
  { number: 807, name: "Caribe Vivo", kind: "tv", countryCode: "CO", language: "Español", category: "Música", hue: 170, stream: VIDEO.pulso, description: "Conciertos, videoclips y sesiones en vivo de cumbia, vallenato y nuevas bandas." },
  { number: 808, name: "Meseta Noticias", kind: "tv", countryCode: "MX", language: "Español", category: "Noticias", hue: 0, stream: VIDEO.aurora, description: "Cobertura de última hora desde la capital con corresponsales en todo el país." },
  { number: 809, name: "Sierra Madre TV", kind: "tv", countryCode: "MX", language: "Español", category: "Cultura", hue: 280, stream: VIDEO.fractal, description: "Documentales de naturaleza, historia y gastronomía regional." },
  { number: 810, name: "Faro Atlântico", kind: "tv", countryCode: "BR", language: "Portugués", category: "Entretenimiento", hue: 190, stream: VIDEO.aurora, description: "Telenovelas, humor y programas de variedades para toda la familia." },
  { number: 811, name: "Arena Esporte", kind: "tv", countryCode: "BR", language: "Portugués", category: "Deportes", hue: 110, stream: VIDEO.pulso, description: "Fútbol brasileño, vóley de playa y automovilismo con transmisiones comentadas." },
  { number: 812, name: "Ibérica Directo", kind: "tv", countryCode: "ES", language: "Español", category: "Noticias", hue: 225, stream: VIDEO.aurora, description: "Información continua con conexiones desde las comunidades autónomas." },
  { number: 813, name: "Tejo Cultura", kind: "tv", countryCode: "PT", language: "Portugués", category: "Cultura", hue: 20, stream: VIDEO.fractal, description: "Fado en directo, arte contemporáneo y patrimonio de Lisboa a Oporto." },
  { number: 814, name: "Canal de prueba sin conexión", kind: "tv", countryCode: "ES", language: "Español", category: "Entretenimiento", hue: 260, stream: VIDEO.aurora, availability: "offline", description: "Señal de demostración marcada como fuera del aire, para mostrar cómo se informa." },
  { number: 815, name: "Canal de prueba con fallo", kind: "tv", countryCode: "CO", language: "Español", category: "Entretenimiento", hue: 320, stream: "/demo/video/inexistente/index.m3u8", description: "Señal de demostración cuyo stream no responde, para mostrar el estado de error." },
  { number: 816, name: "Señal en revisión", kind: "tv", countryCode: "CL", language: "Español", category: "Noticias", hue: 60, stream: VIDEO.aurora, rightsStatus: "pending", description: "No debe aparecer en la interfaz: sus derechos aún no se han aprobado." },

  // --- Radio ---------------------------------------------------------------
  { number: 901, name: "Brisa Andina", kind: "radio", countryCode: "CL", language: "Español", category: "Música", hue: 38, stream: AUDIO.brisa, description: "Folk, cantautores y nueva canción latinoamericana las 24 horas." },
  { number: 902, name: "Nocturna Santiago", kind: "radio", countryCode: "CL", language: "Español", category: "Música", hue: 250, stream: AUDIO.nocturno, description: "Jazz, ambient y música instrumental para la noche." },
  { number: 903, name: "Radio Ombú", kind: "radio", countryCode: "AR", language: "Español", category: "Noticias", hue: 205, stream: AUDIO.costa, description: "Informativos, entrevistas y la columna de economía de las mañanas." },
  { number: 904, name: "Tango Eterno", kind: "radio", countryCode: "AR", language: "Español", category: "Música", hue: 0, stream: AUDIO.nocturno, description: "Grandes orquestas, milongas y tango contemporáneo." },
  { number: 905, name: "Costa Verde Radio", kind: "radio", countryCode: "PE", language: "Español", category: "Música", hue: 150, stream: AUDIO.costa, description: "Música criolla, chicha y fusión peruana." },
  { number: 906, name: "Bogotá Hablada", kind: "radio", countryCode: "CO", language: "Español", category: "Noticias", hue: 215, stream: AUDIO.brisa, description: "Debate, opinión y llamadas de oyentes sobre la actualidad." },
  { number: 907, name: "Mariachi Sur", kind: "radio", countryCode: "MX", language: "Español", category: "Música", hue: 15, stream: AUDIO.costa, description: "Mariachi, ranchera y son jarocho, con dedicatorias en vivo." },
  { number: 908, name: "Bossa Litoral", kind: "radio", countryCode: "BR", language: "Portugués", category: "Música", hue: 175, stream: AUDIO.brisa, description: "Bossa nova, MPB y samba suave frente al mar." },
  { number: 909, name: "Onda Mediterránea", kind: "radio", countryCode: "ES", language: "Español", category: "Cultura", hue: 195, stream: AUDIO.nocturno, description: "Literatura, ciencia y radioteatro con invitados especiales." },
  { number: 910, name: "Gol Ibérico", kind: "radio", countryCode: "ES", language: "Español", category: "Deportes", hue: 125, stream: AUDIO.costa, description: "Carrusel deportivo con todos los partidos de la jornada." },
  { number: 911, name: "Rádio Alfama", kind: "radio", countryCode: "PT", language: "Portugués", category: "Música", hue: 330, stream: AUDIO.nocturno, description: "Fado clásico y nuevas voces portuguesas." },
];

export const DEMO_CHANNELS: Channel[] = SEEDS.map(toChannel);
