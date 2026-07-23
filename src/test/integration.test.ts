import { describe, it, expect } from "vitest";
import type { PluginData } from "../lib/pluginFilter";
import { parsePrice, matchesFilters, sortPlugins } from "../lib/pluginFilter";

function createMockCard(data: PluginData): HTMLElement {
  const div = document.createElement("div");
  div.dataset.plugin = JSON.stringify(data);
  return div;
}

const samplePlugins: PluginData[] = [
  {
    slug: "serum",
    name: "Serum",
    developer: "Xfer Records",
    type: "synth",
    genreTags: ["wavetable", "edm", "bass", "pop"],
    osSupport: ["windows", "macos"],
    format: ["VST3", "VST2", "AU", "AAX"],
    price: "$189",
    dateAdded: "2024-01-10",
  },
  {
    slug: "vital",
    name: "Vital",
    developer: "Matt Tytel",
    type: "synth",
    genreTags: ["wavetable", "edm", "bass"],
    osSupport: ["windows", "macos", "linux"],
    format: ["VST3", "VST2", "AU", "CLAP", "LV2"],
    price: "Free",
    dateAdded: "2024-03-15",
  },
  {
    slug: "valhallaReverb",
    name: "ValhallaReverb",
    developer: "Valhalla DSP",
    type: "effect",
    genreTags: ["reverb", "ambient", "mix"],
    osSupport: ["windows", "macos"],
    format: ["VST3", "VST2", "AU", "AAX"],
    price: "$50",
    dateAdded: "2023-11-20",
  },
  {
    slug: "kontakt",
    name: "Kontakt",
    developer: "Native Instruments",
    type: "sampler",
    genreTags: ["sampling", "orchestral", "hip-hop"],
    osSupport: ["windows", "macos"],
    format: ["VST3", "VST2", "AU", "AAX"],
    price: "$399",
    dateAdded: "2024-06-01",
  },
];

const sampleCards: HTMLElement[] = samplePlugins.map((p) => createMockCard(p));

// ===== Full Flow Integration Scenarios =====

describe("Full Search + Filter + Sort Flow", () => {
  it("filters by type synth, then sorts by price ascending", () => {
    const filters = {
      types: ["synth"],
      oses: [] as string[],
      formats: [] as string[],
      priceFilter: "all",
      query: "",
    };

    const synthCards = sampleCards.filter((card) => {
      const data = JSON.parse(card.dataset.plugin!) as PluginData;
      return matchesFilters(data, filters);
    });
    expect(synthCards).toHaveLength(2);

    const sorted = sortPlugins(synthCards, "price-asc");
    const sortedNames = sorted.map(
      (c) => (JSON.parse(c.dataset.plugin!) as PluginData).name,
    );
    expect(sortedNames[0]).toBe("Vital");
    expect(sortedNames[1]).toBe("Serum");
  });

  it("filters by free plugins", () => {
    const filters = {
      types: [] as string[],
      oses: [] as string[],
      formats: [] as string[],
      priceFilter: "free",
      query: "",
    };

    const freeCards = sampleCards.filter((card) => {
      const data = JSON.parse(card.dataset.plugin!) as PluginData;
      return matchesFilters(data, filters);
    });
    expect(freeCards).toHaveLength(1);
    const name = (JSON.parse(freeCards[0].dataset.plugin!) as PluginData).name;
    expect(name).toBe("Vital");
  });

  it("filters by search query and OS simultaneously", () => {
    const filters = {
      types: [] as string[],
      oses: ["linux"],
      formats: [] as string[],
      priceFilter: "all",
      query: "vital",
    };

    const results = sampleCards.filter((card) => {
      const data = JSON.parse(card.dataset.plugin!) as PluginData;
      return matchesFilters(data, filters);
    });
    expect(results).toHaveLength(1);
    const name = (JSON.parse(results[0].dataset.plugin!) as PluginData).name;
    expect(name).toBe("Vital");
  });
});

// ===== Multiple Filter Combinations =====

describe("Multiple Filter Combinations", () => {
  it("filters by type + format + price", () => {
    const filters = {
      types: ["synth"],
      oses: [] as string[],
      formats: ["AU"],
      priceFilter: "paid",
      query: "",
    };

    const results = sampleCards.filter((card) => {
      const data = JSON.parse(card.dataset.plugin!) as PluginData;
      return matchesFilters(data, filters);
    });
    expect(results).toHaveLength(1);
    const name = (JSON.parse(results[0].dataset.plugin!) as PluginData).name;
    expect(name).toBe("Serum");
  });

  it("filters by OS + format, no type filter", () => {
    const filters = {
      types: [] as string[],
      oses: ["linux"],
      formats: ["CLAP"],
      priceFilter: "all",
      query: "",
    };

    const results = sampleCards.filter((card) => {
      const data = JSON.parse(card.dataset.plugin!) as PluginData;
      return matchesFilters(data, filters);
    });
    expect(results).toHaveLength(1);
    const name = (JSON.parse(results[0].dataset.plugin!) as PluginData).name;
    expect(name).toBe("Vital");
  });

  it("multiple OS selection returns plugins supporting any of them", () => {
    const filters = {
      types: [] as string[],
      oses: ["linux", "macos"],
      formats: [] as string[],
      priceFilter: "all",
      query: "",
    };

    const results = sampleCards.filter((card) => {
      const data = JSON.parse(card.dataset.plugin!) as PluginData;
      return matchesFilters(data, filters);
    });
    expect(results).toHaveLength(4);
  });
});

// ===== Search Query Edge Cases =====

describe("Search Query Edge Cases", () => {
  it("empty query returns all plugins matching other filters", () => {
    const filters = {
      types: [] as string[],
      oses: [] as string[],
      formats: [] as string[],
      priceFilter: "all",
      query: "",
    };

    const results = sampleCards.filter((card) => {
      const data = JSON.parse(card.dataset.plugin!) as PluginData;
      return matchesFilters(data, filters);
    });
    expect(results).toHaveLength(4);
  });

  it("search matches developer name case-insensitively", () => {
    const filters = {
      types: [] as string[],
      oses: [] as string[],
      formats: [] as string[],
      priceFilter: "all",
      query: "xfer",
    };

    const results = sampleCards.filter((card) => {
      const data = JSON.parse(card.dataset.plugin!) as PluginData;
      return matchesFilters(data, filters);
    });
    expect(results).toHaveLength(1);
    const name = (JSON.parse(results[0].dataset.plugin!) as PluginData).name;
    expect(name).toBe("Serum");
  });

  it("search matches genre tags", () => {
    const filters = {
      types: [] as string[],
      oses: [] as string[],
      formats: [] as string[],
      priceFilter: "all",
      query: "ambient",
    };

    const results = sampleCards.filter((card) => {
      const data = JSON.parse(card.dataset.plugin!) as PluginData;
      return matchesFilters(data, filters);
    });
    expect(results).toHaveLength(1);
    const name = (JSON.parse(results[0].dataset.plugin!) as PluginData).name;
    expect(name).toBe("ValhallaReverb");
  });

  it("search with no results returns empty array", () => {
    const filters = {
      types: [] as string[],
      oses: [] as string[],
      formats: [] as string[],
      priceFilter: "all",
      query: "nonexistent12345",
    };

    const results = sampleCards.filter((card) => {
      const data = JSON.parse(card.dataset.plugin!) as PluginData;
      return matchesFilters(data, filters);
    });
    expect(results).toHaveLength(0);
  });
});

// ===== Sort Edge Cases =====

describe("Sort Edge Cases", () => {
  it("sorts by name descending", () => {
    const sorted = sortPlugins(sampleCards, "name-desc");
    const names = sorted.map(
      (c) => (JSON.parse(c.dataset.plugin!) as PluginData).name,
    );
    expect(names[0]).toBe("Vital");
    expect(names[names.length - 1]).toBe("Kontakt");
  });

  it("sorts by date descending (newest first)", () => {
    const sorted = sortPlugins(sampleCards, "date-desc");
    const names = sorted.map(
      (c) => (JSON.parse(c.dataset.plugin!) as PluginData).name,
    );
    expect(names[0]).toBe("Kontakt");
    expect(names[names.length - 1]).toBe("ValhallaReverb");
  });

  it("sorts by price descending", () => {
    const sorted = sortPlugins(sampleCards, "price-desc");
    const names = sorted.map(
      (c) => (JSON.parse(c.dataset.plugin!) as PluginData).name,
    );
    expect(names[0]).toBe("Kontakt");
    expect(names[names.length - 1]).toBe("Vital");
  });

  it("handles unknown sort value gracefully", () => {
    const sorted = sortPlugins(sampleCards, "unknown-sort" as any);
    expect(sorted).toHaveLength(4);
  });
});

// ===== Price Filter Edge Cases =====

describe("Price Filter Edge Cases", () => {
  it("parsePrice handles various currency formats", () => {
    expect(parsePrice("Free")).toBe(0);
    expect(parsePrice("$0")).toBe(0);
    expect(parsePrice("$189")).toBe(189);
    expect(parsePrice("$49.99")).toBe(49.99);
    expect(parsePrice("$399")).toBe(399);
    expect(parsePrice("99")).toBe(99);
    expect(parsePrice("")).toBe(0);
    expect(parsePrice("Contact")).toBe(Infinity);
  });

  it("priceFilter 'free' only returns plugins with Free price", () => {
    const filters = {
      types: [] as string[],
      oses: [] as string[],
      formats: [] as string[],
      priceFilter: "free",
      query: "",
    };

    const results = sampleCards.filter((card) => {
      const data = JSON.parse(card.dataset.plugin!) as PluginData;
      return matchesFilters(data, filters);
    });
    expect(results).toHaveLength(1);
    results.forEach((card) => {
      const data = JSON.parse(card.dataset.plugin!) as PluginData;
      expect(data.price).toBe("Free");
    });
  });

  it("priceFilter 'paid' returns only non-free plugins", () => {
    const filters = {
      types: [] as string[],
      oses: [] as string[],
      formats: [] as string[],
      priceFilter: "paid",
      query: "",
    };

    const results = sampleCards.filter((card) => {
      const data = JSON.parse(card.dataset.plugin!) as PluginData;
      return matchesFilters(data, filters);
    });
    expect(results).toHaveLength(3);
    results.forEach((card) => {
      const data = JSON.parse(card.dataset.plugin!) as PluginData;
      expect(data.price).not.toBe("Free");
    });
  });

  it("priceFilter 'all' returns all plugins regardless of price", () => {
    const filters = {
      types: [] as string[],
      oses: [] as string[],
      formats: [] as string[],
      priceFilter: "all",
      query: "",
    };

    const results = sampleCards.filter((card) => {
      const data = JSON.parse(card.dataset.plugin!) as PluginData;
      return matchesFilters(data, filters);
    });
    expect(results).toHaveLength(4);
  });
});
