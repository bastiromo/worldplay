import { describe, expect, it } from "vitest";
import { DEMO_CHANNELS, DEMO_COUNTRIES } from "@/lib/catalog/demo-data";
import { ALL_CHANNELS } from "@/lib/catalog/repository";
import { filterChannels, isDemo, isPubliclyVisible, normalizeText, parseFilterParams, withoutRedundantDemos } from "./filters";

const allowed = { countryCodes: ["CL", "AR", "PE"], categories: ["Noticias", "Música"] };

describe("normalizeText", () => {
  it("ignora tildes y mayúsculas", () => {
    expect(normalizeText("  Perú Ibérica ")).toBe("peru iberica");
  });
});

describe("filterChannels", () => {
  it("solo devuelve señales autorizadas o emisiones públicas oficiales", () => {
    const result = filterChannels(ALL_CHANNELS, {}, DEMO_COUNTRIES);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((c) => ["approved", "public-official", "public-listed"].includes(c.rightsStatus))).toBe(true);
    expect(result.some((c) => c.name === "Señal en revisión")).toBe(false);
  });

  it.each(["pending", "rejected", "withdrawn"] as const)("oculta señales con estado %s", (status) => {
    const [base] = DEMO_CHANNELS;
    expect(isPubliclyVisible({ ...base, rightsStatus: status })).toBe(false);
  });

  it("filtra por tipo y país", () => {
    const result = filterChannels(DEMO_CHANNELS, { kind: "radio", countryCode: "CL" }, DEMO_COUNTRIES);
    expect(result.map((c) => c.name)).toEqual(["Brisa Andina", "Nocturna Santiago"]);
  });

  it("busca sin tildes por nombre de país", () => {
    const result = filterChannels(DEMO_CHANNELS, { query: "peru" }, DEMO_COUNTRIES);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((c) => c.countryCode === "PE")).toBe(true);
  });

  it("exige que coincidan todos los términos", () => {
    const result = filterChannels(DEMO_CHANNELS, { query: "noticias chile" }, DEMO_COUNTRIES);
    expect(result.map((c) => c.name)).toEqual(["Cordillera Noticias"]);
  });
});

describe("withoutRedundantDemos", () => {
  it("oculta la demo de un tipo cuando hay señales reales de ese tipo", () => {
    const result = withoutRedundantDemos(ALL_CHANNELS);
    expect(result.some((c) => c.kind === "tv" && isDemo(c))).toBe(false);
    expect(result.some((c) => c.kind === "tv" && !isDemo(c))).toBe(true);
  });

  it("mantiene la demo de un tipo sin señales reales", () => {
    const onlyRealTv = ALL_CHANNELS.filter((c) => isDemo(c) || c.kind === "tv");
    const result = withoutRedundantDemos(onlyRealTv);
    expect(result.filter((c) => c.kind === "radio").every(isDemo)).toBe(true);
    expect(result.some((c) => c.kind === "radio")).toBe(true);
  });

  it("una señal real no visible no oculta la demo", () => {
    const real = ALL_CHANNELS.filter((c) => !isDemo(c)).map((c) => ({ ...c, rightsStatus: "pending" as const }));
    const result = withoutRedundantDemos([...real, ...DEMO_CHANNELS]);
    expect(result.some((c) => c.kind === "tv" && isDemo(c))).toBe(true);
  });

  it("ordena por número de canal", () => {
    const numbers = filterChannels(DEMO_CHANNELS, {}, DEMO_COUNTRIES).map((c) => c.number);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  });
});

describe("parseFilterParams", () => {
  it("acepta valores conocidos y normaliza el país", () => {
    expect(parseFilterParams({ pais: "cl", categoria: "Noticias", q: " brisa " }, allowed)).toEqual({
      countryCode: "CL",
      category: "Noticias",
      query: "brisa",
    });
  });

  it("descarta valores desconocidos o manipulados", () => {
    expect(
      parseFilterParams({ pais: "<script>", categoria: "Hackeo", q: "   " }, allowed),
    ).toEqual({ countryCode: undefined, category: undefined, query: undefined });
  });

  it("usa el primer valor si el parámetro se repite y limita la longitud", () => {
    const result = parseFilterParams({ pais: ["AR", "CL"], q: "x".repeat(500) }, allowed);
    expect(result.countryCode).toBe("AR");
    expect(result.query?.length).toBe(80);
  });
});
