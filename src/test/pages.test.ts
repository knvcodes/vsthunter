import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

describe("Page Route Integrity", () => {
  const pagesDir = resolve(__dirname, "../pages");

  it("has all expected top-level pages", () => {
    const expectedPages = ["index.astro", "plugins.astro", "about.astro"];
    for (const page of expectedPages) {
      const pagePath = resolve(pagesDir, page);
      expect(existsSync(pagePath)).toBe(true);
    }
  });

  it("has dynamic route directories", () => {
    const expectedDirs = ["genre", "os", "plugin", "type"];
    for (const dir of expectedDirs) {
      const dirPath = resolve(pagesDir, dir);
      expect(existsSync(dirPath)).toBe(true);
    }
  });

  it("has dynamic route files", () => {
    const dynamicRoutes = [
      "genre/[genre].astro",
      "os/[os].astro",
      "plugin/[slug].astro",
      "type/[type].astro",
    ];
    for (const route of dynamicRoutes) {
      const routePath = resolve(pagesDir, route);
      expect(existsSync(routePath)).toBe(true);
    }
  });
});

describe("Content Collection Integrity", () => {
  const pluginsDir = resolve(__dirname, "../content/plugins");

  it("has plugin markdown files", () => {
    const expectedPlugins = [
      "kontakt.md",
      "serum.md",
      "shapeShifter.md",
      "valhallaReverb.md",
      "vital.md",
    ];
    for (const plugin of expectedPlugins) {
      const pluginPath = resolve(pluginsDir, plugin);
      expect(existsSync(pluginPath)).toBe(true);
    }
  });

  it("each plugin has valid YAML frontmatter and required fields", () => {
    const pluginFiles = [
      "kontakt.md",
      "serum.md",
      "shapeShifter.md",
      "valhallaReverb.md",
      "vital.md",
    ];

    for (const file of pluginFiles) {
      const content = readFileSync(resolve(pluginsDir, file), "utf-8");

      // Check required frontmatter fields exist
      const requiredFields = [
        "name:",
        "developer:",
        "type:",
        "genreTags:",
        "osSupport:",
        "format:",
        "price:",
        "downloadUrl:",
        "screenshot:",
        "dateAdded:",
        "isActive:",
      ];

      for (const field of requiredFields) {
        expect(content).toContain(field);
      }

      // Verify frontmatter delimiters exist
      expect(content.startsWith("---")).toBe(true);
      const secondDelimiter = content.indexOf("---", 3);
      expect(secondDelimiter).toBeGreaterThan(3);

      // Verify there is body content after frontmatter
      const body = content.slice(secondDelimiter + 3).trim();
      expect(body.length).toBeGreaterThan(0);
    }
  });

  it("has valid plugin types", () => {
    const validTypes = ["synth", "effect", "sampler", "utility"];
    const pluginFiles = [
      "kontakt.md",
      "serum.md",
      "shapeShifter.md",
      "valhallaReverb.md",
      "vital.md",
    ];

    for (const file of pluginFiles) {
      const content = readFileSync(resolve(pluginsDir, file), "utf-8");
      const typeMatch = content.match(/^type:\s*(\w+)/m);
      if (typeMatch) {
        expect(validTypes).toContain(typeMatch[1]);
      }
    }
  });

  it("has valid OS support values", () => {
    const validOS = ["windows", "macos", "linux"];
    const content = readFileSync(resolve(pluginsDir, "vital.md"), "utf-8");
    const osMatch = content.match(/osSupport:\n((?:\s+- \w+\n?)*)/);
    if (osMatch) {
      const oses = osMatch[1]
        .match(/- (\w+)/g)
        ?.map((o) => o.replace("- ", ""));
      expect(oses).toBeDefined();
      if (oses) {
        for (const os of oses) {
          expect(validOS).toContain(os);
        }
      }
    }
  });
});

describe("Component Existence", () => {
  const componentsDir = resolve(__dirname, "../components");

  it("has all required components", () => {
    const expectedComponents = [
      "Header.astro",
      "PluginCard.astro",
      "SearchBox.astro",
      "FilterSidebar.astro",
    ];
    for (const comp of expectedComponents) {
      const compPath = resolve(componentsDir, comp);
      expect(existsSync(compPath)).toBe(true);
    }
  });
});

describe("Layout Integrity", () => {
  const layoutsDir = resolve(__dirname, "../layouts");

  it("has BaseLayout", () => {
    expect(existsSync(resolve(layoutsDir, "BaseLayout.astro"))).toBe(true);
  });
});
