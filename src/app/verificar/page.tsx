import type { Metadata } from "next";
import { isDemo } from "@/lib/domain/filters";
import { ALL_CHANNELS } from "@/lib/catalog/repository";
import { StreamChecker, type CheckTarget } from "./stream-checker";

// Herramienta interna: no debe indexarse ni enlazarse desde la navegación.
export const metadata: Metadata = {
  title: "Verificar señales",
  robots: { index: false, follow: false },
};

const targets: CheckTarget[] = ALL_CHANNELS.filter((c) => !isDemo(c) && c.rightsStatus !== "withdrawn").map((c) => ({
  slug: c.slug,
  name: c.name,
  countryCode: c.countryCode,
  url: c.stream.url,
  format: c.stream.format,
}));

export default function VerifyPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-5xl font-extrabold">Verificar señales</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-mist">
        Comprueba desde tu navegador y tu conexión que cada señal real responde: se descargan el manifiesto y el primer
        segmento de vídeo. Los resultados dependen del país desde el que se hace la prueba.
      </p>
      <StreamChecker targets={targets} />
    </div>
  );
}
