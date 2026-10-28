import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fuentes y retirada de señales",
  description: "Cómo elige WorldPlay las señales que enlaza y cómo un titular puede pedir su retirada.",
};

const REPO_ISSUES = "https://github.com/bastiromo/worldplay/issues/new";

export default function SourcesPage() {
  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="font-display text-5xl leading-[0.95] font-extrabold sm:text-6xl">Fuentes y retirada de señales</h1>
      <p className="mt-4 text-[1.05rem] leading-relaxed text-paper/85">
        WorldPlay es un directorio: reproduce en tu navegador las emisiones que cada canal publica en su propia
        infraestructura. No almacenamos, grabamos ni retransmitimos ninguna señal desde nuestros servidores.
      </p>

      <section aria-labelledby="criterios" className="mt-10">
        <h2 id="criterios" className="font-display text-3xl font-bold">
          Qué señales incluimos
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-paper/85 marker:text-dial">
          <li>Emisiones que el propio canal sirve desde su dominio o el de la institución a la que pertenece.</li>
          <li>Accesibles sin registro, sin claves de acceso y mediante conexión cifrada.</li>
          <li>
            Nunca eludimos geobloqueos, DRM ni restricciones de reproducción: si un canal no está disponible en tu país,
            te lo indicamos.
          </li>
          <li>Excluimos los canales cuyos titulares han pedido no aparecer en directorios públicos.</li>
        </ul>
        <p className="mt-4 leading-relaxed text-mist">
          Cada ficha indica quién emite la señal, su sitio oficial y si contamos con una autorización expresa o se trata
          de una emisión pública del titular.
        </p>
      </section>

      <section aria-labelledby="retirada" className="mt-10 rounded-2xl border border-ink-700 p-6">
        <h2 id="retirada" className="font-display text-3xl font-bold">
          Pedir la retirada de una señal
        </h2>
        <p className="mt-3 leading-relaxed text-paper/85">
          Si eres titular o representante de un canal y no quieres que aparezca en WorldPlay, escríbenos indicando el
          nombre del canal. La retiramos sin necesidad de más trámites.
        </p>
        <Link
          href={REPO_ISSUES}
          rel="noopener noreferrer"
          target="_blank"
          className="mt-5 inline-block rounded-full bg-dial px-5 py-2.5 font-semibold text-ink-950 hover:bg-dial-strong"
        >
          Solicitar una retirada
        </Link>
      </section>
    </article>
  );
}
