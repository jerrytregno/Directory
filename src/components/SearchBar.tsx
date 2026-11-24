"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Suggestion = { name: string; slug: string; category: string; websiteUrl?: string };

export function SearchBar({
  defaultValue = "",
  placeholder = "Search AI tools, software, and businesses",
  tone = "light",
}: {
  defaultValue?: string;
  placeholder?: string;
  tone?: "light" | "dark";
}) {
  const [value, setValue] = useState(defaultValue);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = window.setTimeout(() => {
      fetch(`/api/suggest?q=${encodeURIComponent(query)}`)
        .then((response) => response.json())
        .then((data: { results?: Suggestion[] }) => setResults(data.results ?? []))
        .catch(() => setResults([]));
    }, 200);
    return () => window.clearTimeout(timer);
  }, [value]);

  return (
    <div className="relative">
      <form
        action="/categories"
        className={`flex w-full items-center gap-2 rounded-full p-1.5 shadow-[0_16px_40px_rgba(18,16,24,0.18)] ${
          tone === "dark" ? "bg-white/10 ring-1 ring-white/15" : "border border-line bg-white"
        }`}
      >
        <label className="sr-only" htmlFor="directory-search">
          Search the directory
        </label>
        <span className={`pl-3 ${tone === "dark" ? "text-white/70" : "text-muted"}`} aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
        </span>
        <input
          id="directory-search"
          name="q"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(event) => {
            setValue(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className={`h-12 w-full bg-transparent text-sm outline-none ${
            tone === "dark" ? "text-white placeholder:text-white/45" : "text-ink placeholder:text-stone-400"
          }`}
        />
        <button type="submit" className="h-11 shrink-0 rounded-lg bg-pine px-5 text-sm font-semibold text-white transition hover:bg-pine-dark">
          Search
        </button>
      </form>
      {open && results.length > 0 ? (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-line bg-white shadow-[0_18px_40px_rgba(18,16,24,0.12)]">
          {results.map((result) => {
            const className = "flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-mist";
            const body = (
              <>
                <span className="font-semibold text-ink">{result.name}</span>
                <span className="text-muted">{result.category}</span>
              </>
            );
            return (
              <li key={result.slug || result.websiteUrl || result.name}>
                {result.slug ? (
                  <Link href={`/listing/${result.slug}`} className={className} onClick={() => setOpen(false)}>
                    {body}
                  </Link>
                ) : (
                  <a href={result.websiteUrl} target="_blank" rel="noopener noreferrer" className={className} onClick={() => setOpen(false)}>
                    {body}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
