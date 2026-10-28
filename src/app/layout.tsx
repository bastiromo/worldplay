import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Logo } from "@/components/shell/logo";
import { PrimaryNav } from "@/components/shell/primary-nav";
import { SearchBox } from "@/components/shell/search-box";
import { SidebarCountries } from "@/components/shell/sidebar-countries";
import { bigShoulders, onest } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "WorldPlay · Televisión y radio del mundo en vivo",
    template: "%s · WorldPlay",
  },
  description:
    "Descubre y reproduce canales de televisión y emisoras de radio de distintos países desde un solo lugar.",
};

export const viewport: Viewport = {
  themeColor: "#0c1526",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${onest.variable} ${bigShoulders.variable} antialiased`}>
      <body className="min-h-dvh">
        <a
          href="#contenido"
          className="sr-only z-50 rounded-md bg-dial px-4 py-2 font-medium text-ink-950 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Saltar al contenido
        </a>

        <div className="lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
          <aside className="sticky top-0 hidden h-dvh flex-col overflow-y-auto border-r border-ink-800 px-4 py-6 lg:flex">
            <div className="px-3">
              <Logo />
            </div>
            <div className="mt-8">
              <PrimaryNav variant="sidebar" />
            </div>
            <SidebarCountries />
            <p className="mt-auto px-3 pt-8 text-xs leading-relaxed text-mist">
              WorldPlay enlaza emisiones públicas de sus titulares; no aloja ni retransmite contenido.{" "}
              <Link href="/fuentes" className="text-paper/80 underline-offset-2 hover:text-dial hover:underline">
                Fuentes y retiradas
              </Link>
            </p>
          </aside>

          <div className="min-w-0">
            <header className="sticky top-0 z-30 border-b border-ink-800/80 bg-ink-950/85 backdrop-blur-md">
              <div className="flex items-center gap-4 px-4 py-3 sm:px-6 lg:px-10">
                <div className="lg:hidden">
                  <Logo />
                </div>
                <div className="ml-auto flex w-full max-w-xl justify-end lg:ml-0 lg:justify-start">
                  <SearchBox />
                </div>
              </div>
            </header>

            <main id="contenido" className="px-4 pt-6 pb-10 sm:px-6 lg:px-10 lg:pb-16">
              {children}
            </main>
            <footer className="border-t border-ink-800 px-4 pt-6 pb-28 text-xs leading-relaxed text-mist sm:px-6 lg:hidden">
              WorldPlay enlaza emisiones públicas de sus titulares; no aloja ni retransmite contenido.{" "}
              <Link href="/fuentes" className="text-paper/80 underline underline-offset-2">
                Fuentes y retiradas
              </Link>
            </footer>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-800 bg-ink-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
          <PrimaryNav variant="bottom" />
        </div>
      </body>
    </html>
  );
}
