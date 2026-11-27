import { JWT } from "google-auth-library";
import { createPrivateKey } from "node:crypto";
import { parseCatalog } from "./catalog-schema.mjs";

export const SHEETS_SCOPE =
  "https://www.googleapis.com/auth/spreadsheets.readonly";
export class CatalogError extends Error {
  constructor(code) {
    super(code);
    this.name = "CatalogError";
    this.code = code;
  }
}
export function readCatalogConfig(env = process.env) {
  const sheetId = env.GOOGLE_SHEETS_ID?.trim(),
    email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const key = env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  if (!sheetId || !email || !key)
    throw new CatalogError("missing_configuration");
  if (
    !/^[a-zA-Z0-9_-]+$/.test(sheetId) ||
    !/^[^\s@]+@[^\s@]+\.iam\.gserviceaccount\.com$/.test(email)
  )
    throw new CatalogError("invalid_configuration");
  try {
    if (createPrivateKey(key).asymmetricKeyType !== "rsa") throw new Error();
  } catch {
    throw new CatalogError("invalid_private_key");
  }
  return { sheetId, email, key };
}
export function safeCatalogError(error) {
  if (error instanceof CatalogError) return error.code;
  const status = error?.response?.status;
  if (status === 401) return "authentication_failed";
  if (status === 403) return "access_denied_or_api_disabled";
  if (status === 404) return "spreadsheet_not_found";
  if (status === 429) return "google_quota_exceeded";
  if (status === 408 || ["ETIMEDOUT", "ECONNABORTED"].includes(error?.code)) return "google_timeout";
  if (status >= 500) return "google_connection_failed";
  if (status >= 400) return "invalid_google_request";
  if (error?.message?.startsWith("schema:")) return "invalid_sheet_headers";
  return "google_connection_failed";
}
export async function fetchGoogleCatalog(
  config,
  { request, now = Date.now, timeoutMs = 10000, retryDelayMs = 250, maxAttempts = 2, totalTimeoutMs = 15000 } = {},
) {
  const deadline = Date.now() + totalTimeoutMs;
  const attempts = Number.isInteger(maxAttempts) && maxAttempts > 0 ? maxAttempts : 1;
  const retryable = new Set(["google_connection_failed", "google_timeout", "google_quota_exceeded"]);
  try {
    const url = new URL(
      `https://sheets.googleapis.com/v4/spreadsheets/${config.sheetId}/values:batchGet`,
    );
    url.searchParams.append("ranges", "Products!A:S");
    url.searchParams.append("ranges", "Categories!A:D");
    url.searchParams.set("valueRenderOption", "UNFORMATTED_VALUE");
    url.searchParams.set("majorDimension", "ROWS");
    const client = request
      ? null
      : new JWT({
          email: config.email,
          key: config.key,
          scopes: [SHEETS_SCOPE],
        });
    const run = request || ((options) => client.request(options));
    let response;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      const attemptTimeoutMs = Math.min(timeoutMs, deadline - Date.now());
      if (attemptTimeoutMs <= 0) throw new CatalogError("google_timeout");
      const controller = new AbortController();
      let timer;
      try {
        response = await Promise.race([
          run({
            url: url.toString(),
            method: "GET",
            signal: controller.signal,
            timeout: attemptTimeoutMs,
            retry: false,
          }),
          new Promise((_, reject) => {
            timer = setTimeout(() => {
              controller.abort();
              reject(new CatalogError("google_timeout"));
            }, attemptTimeoutMs);
          }),
        ]);
        break;
      } catch (error) {
        clearTimeout(timer);
        controller.abort();
        const code = safeCatalogError(error);
        if (attempt === attempts || !retryable.has(code)) throw new CatalogError(code);
        if (deadline - Date.now() <= retryDelayMs) throw new CatalogError("google_timeout");
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      } finally {
        clearTimeout(timer);
      }
    }
    const ranges = response?.data?.valueRanges;
    if (!Array.isArray(ranges) || ranges.length !== 2)
      throw new CatalogError("invalid_google_response");
    const parsed = parseCatalog(ranges[0].values, ranges[1].values);
    return { ...parsed, fetchedAt: now() };
  } catch (error) {
    throw new CatalogError(safeCatalogError(error));
  }
}

// Share in-flight work between background revalidation and foreground visitors
// on this server instance. Never retain rejected promises or mix credentials.
const pendingRefreshes = new Map();
export async function sharedCatalogRefresh(key, refresh) {
  const existing = pendingRefreshes.get(key);
  if (existing) return existing;
  const pending = Promise.resolve().then(refresh);
  pendingRefreshes.set(key, pending);
  try {
    return await pending;
  } finally {
    if (pendingRefreshes.get(key) === pending) pendingRefreshes.delete(key);
  }
}

// Cached snapshots contain no credentials, raw rows, or validation diagnostics.
// Next can return an expired entry while refreshing it in the background.
// Await fresh data for this visitor instead of rendering a false outage.
export async function snapshotWithRefresh(value, refresh, now = Date.now) {
  const snapshot = publicSnapshot(value, now());
  if (snapshot.status === "ready") return snapshot;
  return publicSnapshot(await refresh(), now());
}

export function publicSnapshot(value, now = Date.now()) {
  const fresh =
    value &&
    Number.isFinite(value.fetchedAt) &&
    Array.isArray(value.products) &&
    Array.isArray(value.categories) &&
    now - value.fetchedAt < 300000 &&
    now >= value.fetchedAt;
  return {
    status: fresh ? "ready" : "unavailable",
    source: "google-sheets",
    fetchedAt: value?.fetchedAt || 0,
    products: fresh ? value.products : [],
    categories: fresh ? value.categories : [],
  };
}
