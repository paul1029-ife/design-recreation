import type { MetadataRoute } from "next";

import {
  getPopulatedCategories,
  getPopulatedDomains,
  registry,
} from "@/patterns/registry";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Built from the registry rather than maintained by hand, so a pattern cannot
 * exist without being listed. Browse pages come from the *populated* category
 * and domain helpers, so the sitemap never advertises a page that renders an
 * empty list.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const patterns = registry.map((meta) => ({
    url: `${BASE}/patterns/${meta.slug}`,
    lastModified: new Date(meta.added),
    changeFrequency: "monthly" as const,
    priority: meta.featured ? 0.8 : 0.7,
  }));

  const categories = getPopulatedCategories().map((category) => ({
    url: `${BASE}/patterns/category/${category}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const domains = getPopulatedDomains().map((domain) => ({
    url: `${BASE}/patterns/domain/${domain}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/patterns`, changeFrequency: "weekly", priority: 0.9 },
    ...patterns,
    ...categories,
    ...domains,
  ];
}
