"use client";

import { useGems } from "@/lib/gems";

/** The header's gem count, live as gems are earned and spent. data-gem-count lets the preview write it in. */
export default function GemCount() {
  const { gems } = useGems();
  return (
    <span className="tabular" data-gem-count>
      {new Intl.NumberFormat("en-US").format(gems)}
    </span>
  );
}
