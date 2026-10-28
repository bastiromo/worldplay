import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/catalog-view";

export const metadata: Metadata = { title: "Televisión en vivo" };

export default function TvPage({ searchParams }: PageProps<"/tv">) {
  return (
    <CatalogView
      title="Televisión en vivo"
      intro="Canales de noticias, deporte, cultura y entretenimiento de distintos países. Elige un país en el dial o filtra por categoría."
      basePath="/tv"
      kind="tv"
      searchParams={searchParams}
    />
  );
}
