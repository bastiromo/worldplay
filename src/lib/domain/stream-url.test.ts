import { describe, expect, it } from "vitest";
import { isAllowedStreamUrl } from "./stream-url";

describe("isAllowedStreamUrl", () => {
  it.each([
    "/demo/video/aurora/index.m3u8",
    "/demo/audio/brisa.mp3",
    "https://example.org/live/master.m3u8",
  ])("acepta %s", (url) => {
    expect(isAllowedStreamUrl(url)).toBe(true);
  });

  it.each([
    "",
    "javascript:alert(1)",
    "data:application/x-mpegURL;base64,AAAA",
    "http://example.org/live.m3u8",
    "//evil.example/live.m3u8",
    "/demo/../../etc/passwd",
    "https://user:pass@example.org/live.m3u8",
    "ftp://example.org/a.mp3",
    "/demo/<script>.m3u8",
    "no-es-una-url",
  ])("rechaza %s", (url) => {
    expect(isAllowedStreamUrl(url)).toBe(false);
  });
});
