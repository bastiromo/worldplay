"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { SearchIcon } from "@/components/ui/icons";
import { MAX_QUERY_LENGTH } from "@/lib/domain/filters";

/**
 * Buscador global. Envía a /explorar?q=… y se enfoca con la tecla "/",
 * como en la mayoría de servicios de streaming.
 */
export function SearchBox() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, select, [contenteditable='true']");
      if (event.key === "/" && !typing) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = inputRef.current?.value.trim() ?? "";
    router.push(query ? `/explorar?q=${encodeURIComponent(query)}` : "/explorar");
    inputRef.current?.blur();
  }

  return (
    <form role="search" onSubmit={onSubmit} className="relative w-full max-w-xl">
      <label htmlFor="global-search" className="sr-only">
        Buscar canales y emisoras
      </label>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-lg text-mist" />
      <input
        ref={inputRef}
        id="global-search"
        type="search"
        name="q"
        maxLength={MAX_QUERY_LENGTH}
        autoComplete="off"
        placeholder="Buscar canal, emisora o país"
        className="h-11 w-full rounded-full border border-ink-700 bg-ink-900/80 pr-12 pl-11 text-[0.95rem] text-paper placeholder:text-mist/80 transition-colors hover:border-ink-600 focus:border-dial focus:outline-none"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-3.5 hidden -translate-y-1/2 rounded border border-ink-600 px-1.5 text-xs text-mist sm:block">
        /
      </kbd>
    </form>
  );
}
