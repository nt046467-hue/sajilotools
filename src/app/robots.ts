import { MetadataRoute } from "next";

const BASE_URL = (
  process.env.NEXTAUTH_URL || "https://sajilotools.vercel.app"
).trim();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/private", "/dashboard"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
