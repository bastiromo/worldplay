import { describe, expect, it } from "vitest";
import { DEMO_CHANNELS, DEMO_COUNTRIES } from "./demo-data";
import { catalog, createInMemoryCatalog } from "./repository";

describe("catálogo de demostración", () => {
  it("tiene slugs, ids y números de canal únicos", () => {
    for (const key of ["slug", "id", "number"] as const) {
      const values = DEMO_CHANNELS.map((c) => c[key]);
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it("todos los países usados existen en la lista de países", () => {
    const codes = new Set(DEMO_COUNTRIES.map((c) => c.code));
    expect(DEMO_CHANNELS.every((c) => codes.has(c.countryCode))).toBe(true);
  });

  it("todas las señales tienen procedencia y fecha de comprobación válida", () => {
    for (const c of DEMO_CHANNELS) {
      expect(c.provenance.note.length).toBeGreaterThan(0);
      expect(Number.isNaN(Date.parse(c.lastCheckedAt))).toBe(false);
    }
  });
});

describe("repositorio en memoria", () => {
  it("no expone señales pendientes ni por slug", async () => {
    expect(await catalog.getChannelBySlug("senal-en-revision")).toBeNull();
    expect(await catalog.listPublicSlugs()).not.toContain("senal-en-revision");
  });

  it("devuelve una señal aprobada por slug", async () => {
    const channel = await catalog.getChannelBySlug("cordillera-noticias");
    expect(channel?.name).toBe("Cordillera Noticias");
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
