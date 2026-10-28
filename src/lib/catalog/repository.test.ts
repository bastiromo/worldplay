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

describe("catálogo oficial", () => {
  it("cumple la política: https, sitio oficial, URL permitida y procedencia oficial", () => {
    expect(OFFICIAL_CHANNELS.length).toBeGreaterThan(0);
    for (const c of OFFICIAL_CHANNELS) {
      expect(isAllowedStreamUrl(c.stream.url)).toBe(true);
      expect(c.stream.url.startsWith("https://")).toBe(true);
      expect(c.officialSite?.startsWith("https://")).toBe(true);
      expect(c.provenance.source).toBe("official");
      expect(c.rightsStatus).toBe("public-official");
    }
  });

  it("no incluye parámetros de token o firma en las URL", () => {
    for (const c of OFFICIAL_CHANNELS) {
      expect(new URL(c.stream.url).search).toBe("");
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

  it("lista solo países y categorías con señales visibles", async () => {
    const countries = await catalog.listCountries();
    expect(countries.length).toBe(DEMO_COUNTRIES.length);
    expect(await catalog.listCategories("radio")).toEqual(["Cultura", "Deportes", "Música", "Noticias"]);
  });
});
