import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptdesk.example.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/prompts/"], // app views are behind auth — nothing to index
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
