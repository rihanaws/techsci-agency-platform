import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/marketing/products";

const baseUrl = "https://agency.rihan.cloud";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/products",
    "/pricing",
    "/about",
    "/legal/privacy",
    "/legal/terms",
  ];

  const staticEntries = staticRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));

  const productEntries = PRODUCTS.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...productEntries];
}
