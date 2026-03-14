import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/lp/"],
      },
    ],
    sitemap: "https://client-dcs.vercel.app/sitemap.xml",
  };
}
