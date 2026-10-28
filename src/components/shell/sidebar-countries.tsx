import Link from "next/link";
import { catalog } from "@/lib/catalog/repository";

export async function SidebarCountries() {
  const countries = await catalog.listCountries();

  return (
    <section aria-labelledby="sidebar-countries" className="mt-8">
      <h2 id="sidebar-countries" className="px-3 text-sm font-medium text-mist">
        Países
      </h2>
      <ul className="mt-2 space-y-0.5">
        {countries.map((country) => (
          <li key={country.code}>
            <Link
              href={`/explorar?pais=${country.code}`}
              className="flex items-center gap-3 rounded-lg px-3 py-1.5 text-[0.9rem] text-mist transition-colors hover:bg-ink-900 hover:text-paper"
            >
              <span className="tabular w-7 rounded bg-ink-800 py-0.5 text-center text-[0.7rem] font-semibold text-paper/80">
                {country.code}
              </span>
              {country.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
