import type { MetadataRoute } from "next";
import { CITIES, MODELS, SITE, modelPath } from "@/lib/data";
import { DMODELS, KINDS, dPath } from "@/lib/devices";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const u = (path: string, priority: number) => ({
    url: SITE.url + path,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority,
  });
  return [
    u("/", 1),
    u("/screen-replacement/apple", 0.9),
    u("/diagnose", 0.7),
    u("/book", 0.5),
    u("/partners", 0.6),
    u("/how-it-works", 0.8),
    u("/help", 0.6),
    u(KINDS.ipad.path, 0.9),
    u(KINDS.mac.path, 0.9),
    u(KINDS.watch.path, 0.9),
    ...MODELS.map((m) => u(modelPath(m), 0.8)),
    ...DMODELS.map((m) => u(dPath(m), 0.8)),
    ...DMODELS.flatMap((m) => CITIES.map((c) => u(dPath(m, c), 0.6))),
    ...MODELS.flatMap((m) => CITIES.map((c) => u(modelPath(m, c), 0.6))),
  ];
}
