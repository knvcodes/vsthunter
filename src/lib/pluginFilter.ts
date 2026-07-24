// ─── Types ─────────────────────────────────────────────────────────

export interface PluginData {
  slug: string;
  name: string;
  developer: string;
  type: string;
  genreTags: string[];
  osSupport: string[];
  format: string[];
  price: string;
  dateAdded: string; // ISO date string
}

export type SortOption =
  | "date-desc"
  | "date-asc"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "default";

export type PriceFilter = "all" | "free" | "paid";

export interface FilterState {
  types: string[];
  oses: string[];
  formats: string[];
  priceFilter: PriceFilter;
  query: string;
}

// ─── Data Extraction ───────────────────────────────────────────────

export function getPluginData(card: HTMLElement): PluginData | null {
  const raw = card.dataset.plugin;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PluginData;
  } catch {
    console.warn("Failed to parse plugin data:", raw);
    return null;
  }
}

// ─── Price Handling ────────────────────────────────────────────────

export function parsePrice(price: string): number {
  const clean = price?.trim().toLowerCase();
  if (!clean || clean === "free") return 0;

  const match = clean.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : Infinity;
}

export function formatPriceDisplay(price: string): string {
  const num = parsePrice(price);
  if (num === 0) return "Free";
  if (num === Infinity) return price; // fallback to raw string
  return `$${num.toFixed(2)}`;
}

// ─── Filtering ─────────────────────────────────────────────────────

function hasOverlap(haystack: string[], needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

function matchesQuery(plugin: PluginData, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const searchable = [
    plugin.name,
    plugin.developer,
    plugin.type,
    ...plugin.genreTags,
  ]
    .join(" ")
    .toLowerCase();

  return searchable.includes(q);
}

function matchesPrice(plugin: PluginData, filter: PriceFilter): boolean {
  if (filter === "all") return true;

  const price = parsePrice(plugin.price);
  if (filter === "free") return price === 0;
  if (filter === "paid") return price > 0;

  return true;
}

export function matchesFilters(
  plugin: PluginData,
  filters: FilterState,
): boolean {
  if (filters.types.length > 0 && !filters.types.includes(plugin.type)) {
    return false;
  }

  if (filters.oses.length > 0 && !hasOverlap(plugin.osSupport, filters.oses)) {
    return false;
  }

  if (
    filters.formats.length > 0 &&
    !hasOverlap(plugin.format, filters.formats)
  ) {
    return false;
  }

  if (!matchesPrice(plugin, filters.priceFilter)) {
    return false;
  }

  if (!matchesQuery(plugin, filters.query)) {
    return false;
  }

  return true;
}

// ─── Sorting ───────────────────────────────────────────────────────

type CompareFn = (a: PluginData, b: PluginData) => number;

const SORTERS: Record<SortOption, CompareFn> = {
  "date-desc": (a, b) =>
    new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),

  "date-asc": (a, b) =>
    new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime(),

  "name-asc": (a, b) => a.name.localeCompare(b.name),

  "name-desc": (a, b) => b.name.localeCompare(a.name),

  "price-asc": (a, b) => parsePrice(a.price) - parsePrice(b.price),

  "price-desc": (a, b) => parsePrice(b.price) - parsePrice(a.price),

  default: () => 0,
};

export function sortPlugins(
  cards: HTMLElement[],
  sortValue: SortOption,
): HTMLElement[] {
  const sorter = SORTERS[sortValue] ?? SORTERS.default;

  return [...cards].sort((a, b) => {
    const pa = getPluginData(a);
    const pb = getPluginData(b);
    if (!pa || !pb) return 0;

    return sorter(pa, pb);
  });
}

// ─── Utility ───────────────────────────────────────────────────────

export function getActiveFiltersCount(filters: FilterState): number {
  let count = 0;
  if (filters.types.length > 0) count++;
  if (filters.oses.length > 0) count++;
  if (filters.formats.length > 0) count++;
  if (filters.priceFilter !== "all") count++;
  if (filters.query.trim()) count++;
  return count;
}

export function createEmptyFilters(): FilterState {
  return {
    types: [],
    oses: [],
    formats: [],
    priceFilter: "all",
    query: "",
  };
}
