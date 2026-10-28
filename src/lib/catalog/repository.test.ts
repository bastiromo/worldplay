import { describe, expect, it } from "vitest";
import { isAllowedStreamUrl } from "@/lib/domain/stream-url";
import { DEMO_CHANNELS, DEMO_COUNTRIES } from "./demo-data";
import { OFFICIAL_CHANNELS } from "./official-data";
import { ALL_CHANNELS, catalog, createInMemoryCatalog } from "./repository";

describe("catálogo de demostración", () => {
  it("tiene slugs, ids y números de canal únicos en todo el catálogo", () => {
    for (const key of ["slug", "id", "number"] as const) {
      const values = ALL_CHANNELS.map((c) => c[key]);
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it("todos los países usados existen en la lista de países", () => {
    const codes = new Set(DEMO_COUNTRIES.map((c) => c.code));
    expect(ALL_CHANNELS.every((c) => codes.has(c.countryCode))).toBe(true);
  });

  it("todas las señales tienen procedencia y, si se comprobaron, una fecha válida", () => {
    for (const c of ALL_CHANNELS) {
      expect(c.provenance.note.length).toBeGreaterThan(0);
      if (c.lastCheckedAt !== null) expect(Number.isNaN(Date.parse(c.lastCheckedAt))).toBe(false);
    }
  });
});

describe("catálogo real de Chile", () => {
  it("tiene televisión y radio", () => {
    expect(OFFICIAL_CHANNELS.some((c) => c.kind === "tv")).toBe(true);
    expect(OFFICIAL_CHANNELS.some((c) => c.kind === "radio")).toBe(true);
  });

  it("cumple la política: https, URL permitida, procedencia y estado público", () => {
    for (const c of OFFICIAL_CHANNELS) {
      expect(isAllowedStreamUrl(c.stream.url), c.name).toBe(true);
      expect(c.stream.url.startsWith("https://"), c.name).toBe(true);
      expect(c.countryCode).toBe("CL");
      expect(["public-official", "public-listed"]).toContain(c.rightsStatus);
      expect(c.provenance.source).toBe("directory");
      expect(c.lastCheckedAt).not.toBeNull();
    }
  });

  it("usa el reproductor correcto según el tipo", () => {
    for (const c of OFFICIAL_CHANNELS) {
      expect(c.stream.format, c.name).toBe(c.kind === "tv" ? "hls" : "audio");
    }
  });

  it("toda radio tiene sitio web propio", () => {
    for (const c of OFFICIAL_CHANNELS.filter((x) => x.kind === "radio")) {
      expect(c.officialSite?.startsWith("https://"), c.name).toBe(true);
    }
  });

  it("no incluye parámetros de token o firma en las URL", () => {
    for (const c of OFFICIAL_CHANNELS) {
      expect(new URL(c.stream.url).search, c.name).not.toMatch(/token|sig|auth|key|hdnts|expires/i);
    }
  });
});

describe("repositorio en memoria", () => {
  it("no expone señales pendientes ni por slug", async () => {
    expect(await catalog.getChannelBySlug("senal-en-revision")).toBeNull();
    expect(await catalog.listPublicSlugs()).not.toContain("senal-en-revision");
  });

  it("devuelve una señal visible por slug", async () => {
    const channel = await catalog.getChannelBySlug("tv-senado");
    expect(channel?.name).toBe("TV Senado");
  });

  it("no expone la TV de demostración cuando hay canales reales", async () => {
    expect(await catalog.getChannelBySlug("cordillera-noticias")).toBeNull();
  });

  it("descarta señales con URL de stream no permitida", async () => {
    const [base] = DEMO_CHANNELS;
    const unsafe = { ...base, id: "x", slug: "inseguro", stream: { url: "javascript:alert(1)", format: "hls" as const } };
    const repo = createInMemoryCatalog([base, unsafe], DEMO_COUNTRIES);
    expect(await repo.getChannelBySlug("inseguro")).toBeNull();
    expect((await repo.listChannels()).map((c) => c.slug)).toEqual([base.slug]);
  });

  it("con señales reales de ambos tipos, solo lista los países que las tienen", async () => {
    const countries = await catalog.listCountries();
    expect(countries.map((c) => c.code)).toEqual(["CL"]);
  });

  it("lista categorías de las señales visibles", async () => {
    const radio = await catalog.listCategories("radio");
    expect(radio).toContain("Música");
    expect(radio).toEqual([...radio].sort((a, b) => a.localeCompare(b, "es")));
  });
});
