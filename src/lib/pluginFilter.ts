export interface PluginData {
  slug: string;
  name: string;
  developer: string;
  type: string;
  genreTags: string[];
  osSupport: string[];
  format: string[];
  price: string;
  dateAdded: string;
}

export function getPluginData(card: HTMLElement): PluginData | null {
  try {
    return JSON.parse(card.dataset.plugin ?? "null") as PluginData | null;
  } catch {
    return null;
  }
}

export function parsePrice(price: string): number {
  if (!price || price.toLowerCase() === "free") return 0;
  const match = price.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : Infinity;
}

export interface FilterState {
  types: string[];
  oses: string[];
  formats: string[];
  priceFilter: string;
  query: string;
}

export function matchesFilters(
  plugin: PluginData,
  filters: FilterState,
): boolean {
  if (filters.types.length > 0 && !filters.types.includes(plugin.type))
    return false;
  if (
    filters.oses.length > 0 &&
    !filters.oses.some((os) => plugin.osSupport.includes(os))
  )
    return false;
  if (
    filters.formats.length > 0 &&
    !filters.formats.some((fmt) => plugin.format.includes(fmt))
  )
    return false;

  if (filters.priceFilter === "free" && parsePrice(plugin.price) !== 0)
    return false;
  if (filters.priceFilter === "paid" && parsePrice(plugin.price) === 0)
    return false;

  if (filters.query) {
    const q = filters.query.toLowerCase();
    const searchable = [
      plugin.name,
      plugin.developer,
      ...plugin.genreTags,
      plugin.type,
    ]
      .join(" ")
      .toLowerCase();
    if (!searchable.includes(q)) return false;
  }

  return true;
}

export function sortPlugins(
  cards: HTMLElement[],
  sortValue: string,
): HTMLElement[] {
  return [...cards].sort((a, b) => {
    const pa = getPluginData(a);
    const pb = getPluginData(b);
    if (!pa || !pb) return 0;

    switch (sortValue) {
      case "date-desc":
        return (
          new Date(pb.dateAdded).getTime() - new Date(pa.dateAdded).getTime()
        );
      case "date-asc":
        return (
          new Date(pa.dateAdded).getTime() - new Date(pb.dateAdded).getTime()
        );
      case "name-asc":
        return pa.name.localeCompare(pb.name);
      case "name-desc":
        return pb.name.localeCompare(pa.name);
      case "price-asc":
        return parsePrice(pa.price) - parsePrice(pb.price);
      case "price-desc":
        return parsePrice(pb.price) - parsePrice(pa.price);
      default:
        return 0;
    }
  });
}
