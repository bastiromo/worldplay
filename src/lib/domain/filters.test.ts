import { describe, expect, it } from "vitest";
import { DEMO_CHANNELS, DEMO_COUNTRIES } from "@/lib/catalog/demo-data";
import { filterChannels, normalizeText, parseFilterParams } from "./filters";

const allowed = { countryCodes: ["CL", "AR", "PE"], categories: ["Noticias", "Música"] };

describe("normalizeText", () => {
  it("ignora tildes y mayúsculas", () => {
    expect(normalizeText("  Perú Ibérica ")).toBe("peru iberica");
  });
});

describe("filterChannels", () => {
  it("nunca devuelve señales sin derechos aprobados", () => {
    const result = filterChannels(DEMO_CHANNELS, {}, DEMO_COUNTRIES);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((c) => c.rightsStatus === "approved")).toBe(true);
    expect(result.some((c) => c.name === "Señal en revisión")).toBe(false);
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
