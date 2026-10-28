import { describe, expect, it } from "vitest";
import { channelNumber, monogram } from "./channel-art";

describe("monogram", () => {
  it.each([
    ["La 1", "L1"],
    ["La 2", "L2"],
    ["24 Horas", "24"],
    ["TV Senado", "TS"],
    ["Señal Colombia", "SC"],
    ["Folklore", "FO"],
  ])("%s → %s", (name, expected) => {
    expect(monogram(name)).toBe(expected);
  });
});

describe("channelNumber", () => {
  it("rellena con ceros a tres cifras", () => {
    expect(channelNumber(7)).toBe("007");
    expect(channelNumber(101)).toBe("101");
  });
});
