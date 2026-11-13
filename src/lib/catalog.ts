import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createHash } from "node:crypto";
import localProducts from "../../content/products.json";
import { localCatalog } from "../../scripts/catalog-schema.mjs";
import {
  fetchGoogleCatalog,
  readCatalogConfig,
  safeCatalogError,
  publicSnapshot,
} from "../../scripts/catalog-google.mjs";
import type { CatalogSnapshot } from "./catalog-types";

export const getCatalogSnapshot = cache(async (): Promise<CatalogSnapshot> => {
  const source = process.env.CATALOG_SOURCE || "local";
  if (source === "local") {
    const value = localCatalog(localProducts);
    return {
      status: "ready",
      source: "local",
      fetchedAt: Date.now(),
      products: value.products,
      categories: value.categories,
    } as CatalogSnapshot;
  }
  if (source !== "google-sheets") {
    console.error("[catalog] invalid_catalog_source");
    return publicSnapshot(null) as CatalogSnapshot;
  }
  try {
    const config = readCatalogConfig();
    // Partition cache on the sheet and credential identity; key material is never a cache argument.
    const fingerprint = createHash("sha256")
      .update(config.sheetId + config.email + config.key)
      .digest("hex");
    const load = unstable_cache(
      async () => {
        try {
          const result = await fetchGoogleCatalog(config);
          for (const issue of result.issues)
            console.warn(
              `[catalog] ${issue.tab} row ${issue.row}: ${issue.code}`,
            );
          return {
            products: result.products,
            categories: result.categories,
            fetchedAt: result.fetchedAt,
          };
        } catch (error) {
          const code = safeCatalogError(error);
          console.error(`[catalog] ${code}`);
          // Next retains a successful cache entry when revalidation throws. Never cache failures.
          throw new Error(`catalog:${code}`);
        }
      },
      ["catalog-sheets-v2-paypal", fingerprint],
      { revalidate: 60 },
    );
    return publicSnapshot(await load()) as CatalogSnapshot;
  } catch (error) {
    console.error(`[catalog] ${safeCatalogError(error)}`);
    return publicSnapshot(null) as CatalogSnapshot;
  }
});
