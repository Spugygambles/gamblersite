"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { caseBySlug } from "@/lib/cases";
import CaseList, { type Risk, type Sort } from "./CaseList";
import CasePage from "./CasePage";

/*
 * Cases: the list of every case, or one case's own page. The address says
 * which: ?case=<slug> opens that case, none shows the list. Moving between
 * them writes the address, so a case can be linked to and Back returns to
 * the list; where the page can't write its address (a sandboxed preview),
 * the choice is kept here instead.
 */
const listeners = new Set<() => void>();
let held: string | null = null;
let holding = false;

const fromAddress = () => new URLSearchParams(location.search).get("case");
const current = () => (holding ? held : fromAddress());

function subscribe(fn: () => void) {
  listeners.add(fn);
  const pop = () => {
    holding = false;
    fn();
  };
  window.addEventListener("popstate", pop);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("popstate", pop);
  };
}

function go(slug: string | null) {
  const url = new URL(location.href);
  if (slug) url.searchParams.set("case", slug);
  else url.searchParams.delete("case");
  try {
    history.pushState(null, "", url);
    holding = false;
  } catch {
    held = slug;
    holding = true;
  }
  listeners.forEach((fn) => fn());
}

export default function CaseOpening({ initial = null }: { initial?: string | null }) {
  const slug = useSyncExternalStore(subscribe, current, () => initial);
  const c = slug ? caseBySlug(slug) : undefined;
  // the list's search, risk and order last while a case is open
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState<Risk>("all");
  const [sort, setSort] = useState<Sort>("high");
  const listY = useRef(0);
  const first = useRef(true);

  // a case opens at the top; back on the list, it's where it was left
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo(0, c ? 0 : listY.current);
  }, [c]);

  if (c) return <CasePage key={c.slug} c={c} backHref="/cases" onBack={() => go(null)} />;
  return (
    <CaseList
      query={query}
      risk={risk}
      sort={sort}
      onQuery={setQuery}
      onRisk={setRisk}
      onSort={setSort}
      onOpen={(s) => {
        listY.current = window.scrollY;
        go(s);
      }}
    />
  );
}
