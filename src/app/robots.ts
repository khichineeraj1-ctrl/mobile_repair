import type { MetadataRoute } from "next";
import { SITE } from "@/lib/data";

// AI answer engines are welcome: being cited by them is part of the growth plan.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/rate", "/followup", "/track", "/job", "/help/ticket"] },
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended"],
        allow: "/",
        disallow: ["/admin", "/api", "/rate", "/followup", "/track", "/job", "/help/ticket"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
