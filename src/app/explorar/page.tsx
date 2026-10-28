import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/catalog-view";

export const metadata: Metadata = { title: "Explorar" };

export default function ExplorePage({ searchParams }: PageProps<"/explorar">) {
  return (
    <CatalogView
      title="Explorar"
      intro="Busca entre todos los canales y emisoras, o recorre el catálogo país por país."
      basePath="/explorar"
      withSearch
      searchParams={searchParams}
    />
  );
}
