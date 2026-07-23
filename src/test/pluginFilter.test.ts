import { describe, it, expect } from "vitest";
import {
  parsePrice,
  matchesFilters,
  sortPlugins,
  getPluginData,
  type PluginData,
  type FilterState,
} from "../lib/pluginFilter";

// Helper to create a mock HTMLElement with dataset.plugin
function createMockCard(data: Partial<PluginData>): HTMLElement {
  const defaultData: PluginData = {
    slug: "test-plugin",
    name: "Test Plugin",
    developer: "Test Dev",
    type: "synth",
    genreTags: ["electronic"],
    osSupport: ["windows", "macos"],
    format: ["VST3", "AU"],
    price: "Free",
    dateAdded: "2024-01-01",
  };
  const el = document.createElement("div");
  el.dataset.plugin = JSON.stringify({ ...defaultData, ...data });
  return el;
}

describe("parsePrice", () => {
  it("returns 0 for empty string", () => {
    expect(parsePrice("")).toBe(0);
  });

  it("returns 0 for 'Free'", () => {
    expect(parsePrice("Free")).toBe(0);
  });

  it("returns 0 for 'free' (lowercase)", () => {
    expect(parsePrice("free")).toBe(0);
  });

  it("parses '$189' correctly", () => {
    expect(parsePrice("$189")).toBe(189);
  });

  it("parses '$49.99' correctly", () => {
    expect(parsePrice("$49.99")).toBe(49.99);
  });

  it("returns Infinity for non-numeric strings", () => {
    expect(parsePrice("Contact")).toBe(Infinity);
  });

  it("returns Infinity for 'N/A'", () => {
    expect(parsePrice("N/A")).toBe(Infinity);
  });
});

describe("matchesFilters", () => {
  const plugin: PluginData = {
    slug: "serum",
    name: "Serum",
    developer: "Xfer Records",
    type: "synth",
    genreTags: ["wavetable", "edm", "bass"],
    osSupport: ["windows", "macos"],
    format: ["VST3", "VST2", "AU", "AAX"],
    price: "$189",
    dateAdded: "2024-01-10",
  };

  it("returns true when no filters are applied", () => {
    const filters: FilterState = {
      types: [],
      oses: [],
      formats: [],
      priceFilter: "all",
      query: "",
    };
    expect(matchesFilters(plugin, filters)).toBe(true);
  });

  describe("type filtering", () => {
    it("filters by matching type", () => {
      const filters: FilterState = {
        types: ["synth"],
        oses: [],
        formats: [],
        priceFilter: "all",
        query: "",
      };
      expect(matchesFilters(plugin, filters)).toBe(true);
    });

    it("filters out non-matching type", () => {
      const filters: FilterState = {
        types: ["effect"],
        oses: [],
        formats: [],
        priceFilter: "all",
        query: "",
      };
      expect(matchesFilters(plugin, filters)).toBe(false);
    });

    it("matches when multiple types include the plugin type", () => {
      const filters: FilterState = {
        types: ["effect", "synth", "sampler"],
        oses: [],
        formats: [],
        priceFilter: "all",
        query: "",
      };
      expect(matchesFilters(plugin, filters)).toBe(true);
    });
  });

  describe("OS filtering", () => {
    it("filters by matching OS", () => {
      const filters: FilterState = {
        types: [],
        oses: ["windows"],
        formats: [],
        priceFilter: "all",
        query: "",
      };
      expect(matchesFilters(plugin, filters)).toBe(true);
    });

    it("filters out non-matching OS", () => {
      const filters: FilterState = {
        types: [],
        oses: ["linux"],
        formats: [],
        priceFilter: "all",
        query: "",
      };
      expect(matchesFilters(plugin, filters)).toBe(false);
    });

    it("matches when any selected OS is supported", () => {
      const filters: FilterState = {
        types: [],
        oses: ["linux", "macos"],
        formats: [],
        priceFilter: "all",
        query: "",
      };
      expect(matchesFilters(plugin, filters)).toBe(true);
    });
  });

  describe("format filtering", () => {
    it("filters by matching format", () => {
      const filters: FilterState = {
        types: [],
        oses: [],
        formats: ["VST3"],
        priceFilter: "all",
        query: "",
      };
      expect(matchesFilters(plugin, filters)).toBe(true);
    });

    it("filters out non-matching format", () => {
      const filters: FilterState = {
        types: [],
        oses: [],
        formats: ["CLAP"],
        priceFilter: "all",
        query: "",
      };
      expect(matchesFilters(plugin, filters)).toBe(false);
    });
  });

  describe("price filtering", () => {
    it("shows all when priceFilter is 'all'", () => {
      const filters: FilterState = {
        types: [],
        oses: [],
        formats: [],
        priceFilter: "all",
        query: "",
      };
      expect(matchesFilters(plugin, filters)).toBe(true);
    });

    it("filters free plugins correctly", () => {
      const freePlugin: PluginData = { ...plugin, price: "Free" };
      const filters: FilterState = {
        types: [],
        oses: [],
        formats: [],
        priceFilter: "free",
        query: "",
      };
      expect(matchesFilters(freePlugin, filters)).toBe(true);
      expect(matchesFilters(plugin, filters)).toBe(false);
    });

    it("filters paid plugins correctly", () => {
      const freePlugin: PluginData = { ...plugin, price: "Free" };
      const filters: FilterState = {
        types: [],
        oses: [],
        formats: [],
        priceFilter: "paid",
        query: "",
      };
      expect(matchesFilters(plugin, filters)).toBe(true);
      expect(matchesFilters(freePlugin, filters)).toBe(false);
    });
  });

  describe("search query filtering", () => {
    it("matches by plugin name", () => {
      const filters: FilterState = {
        types: [],
        oses: [],
        formats: [],
        priceFilter: "all",
        query: "serum",
      };
      expect(matchesFilters(plugin, filters)).toBe(true);
    });

    it("matches by developer name", () => {
      const filters: FilterState = {
        types: [],
        oses: [],
        formats: [],
        priceFilter: "all",
        query: "xfer",
      };
      expect(matchesFilters(plugin, filters)).toBe(true);
    });

    it("matches by genre tag", () => {
      const filters: FilterState = {
        types: [],
        oses: [],
        formats: [],
        priceFilter: "all",
        query: "wavetable",
      };
      expect(matchesFilters(plugin, filters)).toBe(true);
    });

    it("matches by type", () => {
      const filters: FilterState = {
        types: [],
        oses: [],
        formats: [],
        priceFilter: "all",
        query: "synth",
      };
      expect(matchesFilters(plugin, filters)).toBe(true);
    });

    it("is case-insensitive", () => {
      const filters: FilterState = {
        types: [],
        oses: [],
        formats: [],
        priceFilter: "all",
        query: "SERUM",
      };
      expect(matchesFilters(plugin, filters)).toBe(true);
    });

    it("returns false for non-matching query", () => {
      const filters: FilterState = {
        types: [],
        oses: [],
        formats: [],
        priceFilter: "all",
        query: "guitar",
      };
      expect(matchesFilters(plugin, filters)).toBe(false);
    });
  });

  describe("combined filters", () => {
    it("matches when all filters match", () => {
      const filters: FilterState = {
        types: ["synth"],
        oses: ["windows"],
        formats: ["VST3"],
        priceFilter: "paid",
        query: "serum",
      };
      expect(matchesFilters(plugin, filters)).toBe(true);
    });

    it("fails when one filter doesn't match", () => {
      const filters: FilterState = {
        types: ["synth"],
        oses: ["linux"],
        formats: ["VST3"],
        priceFilter: "paid",
        query: "serum",
      };
      expect(matchesFilters(plugin, filters)).toBe(false);
    });
  });
});

describe("getPluginData", () => {
  it("returns null for element without dataset", () => {
    const el = document.createElement("div");
    expect(getPluginData(el)).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    const el = document.createElement("div");
    el.dataset.plugin = "not-json";
    expect(getPluginData(el)).toBeNull();
  });

  it("parses valid plugin data", () => {
    const data: PluginData = {
      slug: "vital",
      name: "Vital",
      developer: "Matt Tytel",
      type: "synth",
      genreTags: ["wavetable", "bass"],
      osSupport: ["windows", "macos", "linux"],
      format: ["VST3", "AU", "CLAP"],
      price: "Free",
      dateAdded: "2024-02-01",
    };
    const el = document.createElement("div");
    el.dataset.plugin = JSON.stringify(data);
    const result = getPluginData(el);
    expect(result).toEqual(data);
  });
});

describe("sortPlugins", () => {
  const cards = [
    createMockCard({
      slug: "a",
      name: "Alpha",
      price: "$50",
      dateAdded: "2024-03-01",
    }),
    createMockCard({
      slug: "b",
      name: "Beta",
      price: "Free",
      dateAdded: "2024-01-01",
    }),
    createMockCard({
      slug: "c",
      name: "Gamma",
      price: "$100",
      dateAdded: "2024-02-01",
    }),
  ];

  it("sorts by date descending (newest first)", () => {
    const sorted = sortPlugins(cards, "date-desc");
    const slugs = sorted.map((c) => JSON.parse(c.dataset.plugin!).slug);
    expect(slugs).toEqual(["a", "c", "b"]);
  });

  it("sorts by date ascending (oldest first)", () => {
    const sorted = sortPlugins(cards, "date-asc");
    const slugs = sorted.map((c) => JSON.parse(c.dataset.plugin!).slug);
    expect(slugs).toEqual(["b", "c", "a"]);
  });

  it("sorts by name ascending (A-Z)", () => {
    const sorted = sortPlugins(cards, "name-asc");
    const names = sorted.map((c) => JSON.parse(c.dataset.plugin!).name);
    expect(names).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("sorts by name descending (Z-A)", () => {
    const sorted = sortPlugins(cards, "name-desc");
    const names = sorted.map((c) => JSON.parse(c.dataset.plugin!).name);
    expect(names).toEqual(["Gamma", "Beta", "Alpha"]);
  });

  it("sorts by price ascending (low to high)", () => {
    const sorted = sortPlugins(cards, "price-asc");
    const slugs = sorted.map((c) => JSON.parse(c.dataset.plugin!).slug);
    expect(slugs).toEqual(["b", "a", "c"]);
  });

  it("sorts by price descending (high to low)", () => {
    const sorted = sortPlugins(cards, "price-desc");
    const slugs = sorted.map((c) => JSON.parse(c.dataset.plugin!).slug);
    expect(slugs).toEqual(["c", "a", "b"]);
  });

  it("returns cards in original order for unknown sort value", () => {
    const sorted = sortPlugins(cards, "unknown");
    const slugs = sorted.map((c) => JSON.parse(c.dataset.plugin!).slug);
    expect(slugs).toEqual(["a", "b", "c"]);
  });

  it("handles cards with missing data gracefully", () => {
    const emptyCard = document.createElement("div");
    const result = sortPlugins([emptyCard, cards[0]], "name-asc");
    expect(result.length).toBe(2);
  });
});
