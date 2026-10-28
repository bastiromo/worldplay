"use client";

import { useState } from "react";
import type { StreamFormat } from "@/lib/domain/types";

export interface CheckTarget {
  slug: string;
  name: string;
  countryCode: string;
  url: string;
  format: StreamFormat;
}

type Outcome = "ok" | "blocked" | "forbidden" | "not-found" | "timeout" | "error";

interface CheckResult {
  slug: string;
  outcome: Outcome;
  detail: string;
  ms: number;
  resolution?: string;
}

const TIMEOUT_MS = 20_000;
const CONCURRENCY = 3;

const OUTCOME_LABEL: Record<Outcome, string> = {
  ok: "Funciona",
  blocked: "Bloqueada (CORS o red)",
  forbidden: "Acceso denegado (posible geobloqueo)",
  "not-found": "No existe",
  timeout: "Sin respuesta",
  error: "Error de reproducción",
};

function classifyHttp(code: number | undefined): Outcome {
  if (code === 0 || code === undefined) return "blocked";
  if (code === 401 || code === 403 || code === 451) return "forbidden";
  if (code === 404 || code === 410) return "not-found";
  return "error";
}

/** Comprueba una señal HLS: el manifiesto y el primer segmento deben descargarse. */
async function checkHls(target: CheckTarget): Promise<Omit<CheckResult, "slug" | "ms">> {
  const { default: Hls } = await import("hls.js");
  if (!Hls.isSupported()) return { outcome: "error", detail: "Este navegador no admite MSE/hls.js" };

  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.muted = true;
    const hls = new Hls({ enableWorker: true, autoStartLoad: true });
    let resolution: string | undefined;
    let done = false;

    const finish = (result: Omit<CheckResult, "slug" | "ms">) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      hls.destroy();
      resolve(result);
    };
    const timer = window.setTimeout(() => finish({ outcome: "timeout", detail: `Más de ${TIMEOUT_MS / 1000} s` }), TIMEOUT_MS);

    hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
      const best = data.levels.reduce((a, b) => (b.height > a.height ? b : a), data.levels[0]);
      if (best?.height) resolution = `${best.width}×${best.height}`;
    });
    hls.on(Hls.Events.FRAG_LOADED, () => finish({ outcome: "ok", detail: "Manifiesto y primer segmento descargados", resolution }));
    hls.on(Hls.Events.ERROR, (_e, data) => {
      if (!data.fatal) return;
      const code = data.response?.code;
      finish({ outcome: classifyHttp(code), detail: `${data.details}${code !== undefined ? ` (HTTP ${code})` : ""}` });
    });

    hls.loadSource(target.url);
    hls.attachMedia(video);
  });
}

/** Comprueba una señal de audio: el navegador debe poder empezar a reproducirla. */
function checkAudio(target: CheckTarget): Promise<Omit<CheckResult, "slug" | "ms">> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.muted = true;
    let done = false;
    const finish = (result: Omit<CheckResult, "slug" | "ms">) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      audio.removeAttribute("src");
      audio.load();
      resolve(result);
    };
    const timer = window.setTimeout(() => finish({ outcome: "timeout", detail: `Más de ${TIMEOUT_MS / 1000} s` }), TIMEOUT_MS);
    audio.addEventListener("canplay", () => finish({ outcome: "ok", detail: "El audio se puede reproducir" }));
    audio.addEventListener("error", () =>
      finish({ outcome: "error", detail: `MediaError ${audio.error?.code ?? "desconocido"}` }),
    );
    audio.src = target.url;
  });
}

async function runCheck(target: CheckTarget): Promise<CheckResult> {
  const start = performance.now();
  const result = target.format === "hls" ? await checkHls(target) : await checkAudio(target);
  return { slug: target.slug, ms: Math.round(performance.now() - start), ...result };
}

export function StreamChecker({ targets }: { targets: CheckTarget[] }) {
  const [results, setResults] = useState<Record<string, CheckResult>>({});
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  async function start() {
    setRunning(true);
    setResults({});
    setCopied(false);
    const queue = [...targets];
    const worker = async () => {
      for (let t = queue.shift(); t; t = queue.shift()) {
        const result = await runCheck(t);
        setResults((prev) => ({ ...prev, [t.slug]: result }));
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    setCheckedAt(new Date().toISOString());
    setRunning(false);
  }

  const finished = Object.keys(results).length;
  const report = JSON.stringify(
    {
      checkedAt,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      results: targets.map((t) => results[t.slug]).filter(Boolean),
    },
    null,
    1,
  );

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={start}
          disabled={running}
          className="rounded-full bg-dial px-6 py-3 font-semibold text-ink-950 hover:bg-dial-strong disabled:opacity-60"
        >
          {running ? `Comprobando… ${finished}/${targets.length}` : finished ? "Volver a comprobar" : "Comprobar señales"}
        </button>
        {finished === targets.length && !running && (
          <button
            type="button"
            onClick={copyReport}
            className="rounded-full border border-ink-600 px-6 py-3 font-medium hover:border-dial hover:text-dial"
          >
            {copied ? "Informe copiado" : "Copiar informe"}
          </button>
        )}
      </div>

      <ul className="mt-6 divide-y divide-ink-800 rounded-xl border border-ink-700">
        {targets.map((t) => {
          const r = results[t.slug];
          return (
            <li key={t.slug} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-3">
              <span className="w-48 font-medium">{t.name}</span>
              <span className="w-8 text-sm text-mist">{t.countryCode}</span>
              <span
                className={`text-sm font-semibold ${
                  !r ? "text-mist" : r.outcome === "ok" ? "text-emerald-400" : "text-live"
                }`}
              >
                {r ? OUTCOME_LABEL[r.outcome] : running ? "En cola" : "Sin comprobar"}
              </span>
              {r && (
                <span className="tabular text-xs text-mist">
                  {r.ms} ms{r.resolution ? `, ${r.resolution}` : ""}, {r.detail}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {finished === targets.length && !running && (
        <textarea
          readOnly
          value={report}
          aria-label="Informe en formato JSON"
          className="mt-6 h-48 w-full rounded-xl border border-ink-700 bg-ink-900 p-3 font-mono text-xs text-mist"
        />
      )}
    </div>
  );
}
