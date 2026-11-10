import nextEnv from "@next/env";
import {
  fetchGoogleCatalog,
  readCatalogConfig,
  safeCatalogError,
} from "./catalog-google.mjs";
nextEnv.loadEnvConfig(process.cwd());
try {
  const result = await fetchGoogleCatalog(readCatalogConfig());
  console.log(
    `Google Sheets connection OK: ${result.products.length} visible variants, ${result.categories.length} categories.`,
  );
  for (const issue of result.issues)
    console.warn(`${issue.tab} row ${issue.row}: ${issue.code}`);
  if (result.issues.length) process.exitCode = 1;
} catch (error) {
  console.error(
    `Catalog check failed: ${safeCatalogError(error)}. See docs/GOOGLE-SHEETS.md for setup and troubleshooting.`,
  );
  process.exitCode = 1;
}
