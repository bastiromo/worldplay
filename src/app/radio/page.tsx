import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/catalog-view";

export const metadata: Metadata = { title: "Radio" };

export default function RadioPage({ searchParams }: PageProps<"/radio">) {
  return (
    <CatalogView
      title="Radio"
      intro="Emisoras de música, noticias y conversación. Sintoniza por país o filtra por género."
      basePath="/radio"
      kind="radio"
      searchParams={searchParams}
    />
  );
}
