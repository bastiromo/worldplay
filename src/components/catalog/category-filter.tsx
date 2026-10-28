import Link from "next/link";

interface CategoryFilterProps {
  categories: string[];
  basePath: string;
  active?: string;
  /** Parámetros que se conservan al cambiar de categoría. */
  keepParams: Record<string, string | undefined>;
}

function href(basePath: string, category: string | undefined, keep: CategoryFilterProps["keepParams"]) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(keep)) if (value) params.set(key, value);
  if (category) params.set("categoria", category);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function CategoryFilter({ categories, basePath, active, keepParams }: CategoryFilterProps) {
  const options: { label: string; value?: string }[] = [
    { label: "Todas" },
    ...categories.map((c) => ({ label: c, value: c })),
  ];

  return (
    <nav aria-label="Filtrar por categoría" className="scroll-row -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      {options.map(({ label, value }) => {
        const isActive = active === value;
        return (
          <Link
            key={label}
            href={href(basePath, value, keepParams)}
            aria-current={isActive ? "true" : undefined}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-dial bg-dial text-ink-950"
                : "border-ink-700 text-mist hover:border-ink-600 hover:text-paper"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
