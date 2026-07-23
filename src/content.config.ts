import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const pluginsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/plugins" }),
  schema: z.object({
    name: z.string(),
    developer: z.string(),
    type: z.enum(["synth", "effect", "sampler", "utility"]),
    genreTags: z.array(z.string()),
    osSupport: z.array(z.enum(["windows", "macos", "linux"])),
    format: z.array(z.enum(["VST3", "VST2", "AU", "AAX", "CLAP", "LV2"])),
    price: z.string(),
    downloadUrl: z.string().url(),
    screenshot: z.string(),
    dateAdded: z.string(),
    isActive: z.boolean(),
  }),
});

export const collections = {
  plugins: pluginsCollection,
};
