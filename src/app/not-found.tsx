import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <p className="font-display text-7xl font-extrabold text-dial">Sin señal</p>
      <h1 className="mt-4 text-xl font-semibold">No encontramos esta página</h1>
      <p className="mt-2 text-mist">
        Puede que el canal se haya retirado del catálogo o que el enlace esté incompleto.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="rounded-full bg-dial px-5 py-2.5 font-semibold text-ink-950 hover:bg-dial-strong">
          Ir al inicio
        </Link>
        <Link href="/explorar" className="rounded-full border border-ink-600 px-5 py-2.5 font-medium hover:border-dial hover:text-dial">
          Explorar canales
        </Link>
      </div>
    </div>
  );
}
