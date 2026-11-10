export const PRODUCT_HEADERS = [
  "sku",
  "group_id",
  "category_id",
  "name_fr",
  "name_nl",
  "description_fr",
  "description_nl",
  "variant_fr",
  "variant_nl",
  "edition",
  "price_eur",
  "availability",
  "visible",
  "image_key",
  "sort_order",
];
export const CATEGORY_HEADERS = [
  "category_id",
  "name_fr",
  "name_nl",
  "sort_order",
];
// Public artwork metadata only. This module is safe to import in client components.
export const IMAGE_LIBRARY = Object.freeze({
  "game-pass": {
    kind: "poster",
    label: "Game Pass poster",
    src: "/assets/catalog/Gamepass%20post.png",
    width: 896,
    height: 1200,
  },
  "windows-office": {
    kind: "windows",
    label: "Windows 11 + Office",
    src: "/assets/catalog/windows-11.jpg",
    width: 1000,
    height: 563,
  },
  iptv: {
    kind: "iptv",
    label: "Original IPTV illustration",
    src: "",
    width: 240,
    height: 150,
  },
});
const id = (value) =>
  typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const text = (value) => (typeof value === "string" ? value.trim() : "");
const order = (value) =>
  value === "" || value === undefined ? 0 : Number(value);
const compare = (a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id);

function records(values, headers, tab) {
  if (!Array.isArray(values) || !Array.isArray(values[0]))
    throw new Error(`schema:${tab}:missing_headers`);
  const actual = values[0].map(text);
  if (headers.some((h) => actual.filter((x) => x === h).length !== 1))
    throw new Error(`schema:${tab}:invalid_headers`);
  return values
    .slice(1)
    .map((cells, index) => ({
      row: index + 2,
      ...Object.fromEntries(
        headers.map((h) => [h, cells?.[actual.indexOf(h)] ?? ""]),
      ),
    }))
    .filter((record) => headers.some((h) => record[h] !== ""));
}

export function parseCatalog(productValues, categoryValues) {
  const issues = [];
  const warn = (tab, row, code) => issues.push({ tab, row, code });
  const categories = [],
    categoryIds = new Set(),
    badCategories = new Set();
  for (const r of records(categoryValues, CATEGORY_HEADERS, "Categories")) {
    const key = text(r.category_id);
    if (
      !id(key) ||
      key === "all" ||
      !text(r.name_fr) ||
      !text(r.name_nl) ||
      !Number.isFinite(order(r.sort_order))
    ) {
      warn("Categories", r.row, "invalid_category");
      continue;
    }
    if (categoryIds.has(key)) {
      badCategories.add(key);
      warn("Categories", r.row, "duplicate_category");
    }
    categoryIds.add(key);
    categories.push({
      id: key,
      translations: { fr: text(r.name_fr), nl: text(r.name_nl) },
      sortOrder: order(r.sort_order),
    });
  }
  const validCategories = categories
    .filter((c) => !badCategories.has(c.id))
    .sort(compare);
  const knownCategories = new Set(validCategories.map((c) => c.id));
  const rows = records(productValues, PRODUCT_HEADERS, "Products");
  const skuCounts = new Map(),
    blockedGroups = new Set();
  for (const r of rows) {
    const sku = text(r.sku);
    skuCounts.set(sku, (skuCounts.get(sku) || 0) + 1);
  }
  const products = [];
  for (const r of rows) {
    const sku = text(r.sku),
      groupId = text(r.group_id);
    // Deleted/unchecked rows never reappear through a fallback to local data.
    if (
      r.visible === false ||
      String(r.visible).toLowerCase() === "false" ||
      r.visible === ""
    )
      continue;
    const visible =
      r.visible === true || String(r.visible).toLowerCase() === "true";
    if (skuCounts.get(sku) > 1) {
      blockedGroups.add(groupId);
      warn("Products", r.row, "duplicate_sku");
      continue;
    }
    const price = r.price_eur;
    if (
      !visible ||
      !id(sku) ||
      !id(groupId) ||
      !knownCategories.has(text(r.category_id)) ||
      !text(r.name_fr) ||
      !text(r.name_nl) ||
      !Object.hasOwn(IMAGE_LIBRARY, text(r.image_key)) ||
      !["available", "sold_out"].includes(r.availability) ||
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isSafeInteger(Math.round(price * 100)) ||
      Math.abs(price * 100 - Math.round(price * 100)) > 0.000001 ||
      !Number.isFinite(order(r.sort_order))
    ) {
      warn("Products", r.row, "invalid_product");
      continue;
    }
    products.push({
      sku,
      slug: sku,
      groupId,
      category: text(r.category_id),
      status: "pending_review",
      edition: text(r.edition),
      priceEUR: Math.round(price * 100) / 100,
      availability: r.availability,
      imageKey: text(r.image_key),
      sortOrder: order(r.sort_order),
      translations: {
        fr: {
          name: text(r.name_fr),
          description: text(r.description_fr),
          variant: text(r.variant_fr),
        },
        nl: {
          name: text(r.name_nl),
          description: text(r.description_nl),
          variant: text(r.variant_nl),
        },
      },
    });
  }
  const groups = new Map();
  for (const p of products) {
    const signature = JSON.stringify([
      p.category,
      p.imageKey,
      p.translations.fr.name,
      p.translations.nl.name,
      p.translations.fr.description,
      p.translations.nl.description,
    ]);
    if (groups.has(p.groupId) && groups.get(p.groupId) !== signature) {
      blockedGroups.add(p.groupId);
      warn("Products", 0, "conflicting_group");
    }
    groups.set(p.groupId, signature);
  }
  for (const groupId of groups.keys()) {
    const group = products.filter((p) => p.groupId === groupId);
    if (
      group.length > 1 &&
      (group.some(
        (p) => !p.translations.fr.variant || !p.translations.nl.variant,
      ) ||
        ["fr", "nl"].some(
          (l) =>
            new Set(group.map((p) => p.translations[l].variant)).size !==
            group.length,
        ))
    ) {
      blockedGroups.add(groupId);
      warn("Products", 0, "invalid_group_variants");
    }
  }
  const accepted = products
    .filter((p) => !blockedGroups.has(p.groupId))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.sku.localeCompare(b.sku));
  return { products: accepted, categories: validCategories, issues };
}

export function localCatalog(products) {
  const categoryRows = [
    CATEGORY_HEADERS,
    ["game-pass", "Gaming", "Gaming", 1],
    ["windows", "Logiciels", "Software", 2],
    ["iptv", "Divertissement", "Entertainment", 3],
  ];
  const productRows = [
    PRODUCT_HEADERS,
    ...products
      .filter((p) => p.status === "pending_review")
      .map((p, index) => {
        const split = (l) =>
          p.translations[l].name.replace(" ? ", " — ").split(" — ");
        return [
          p.sku,
          p.category === "game-pass" ? "game-pass" : p.sku,
          p.category,
          split("fr")[0],
          split("nl")[0],
          "",
          "",
          split("fr")[1] || "",
          split("nl")[1] || "",
          p.edition || "",
          p.priceEUR,
          "sold_out",
          true,
          p.category === "windows" ? "windows-office" : p.category,
          p.category === "game-pass"
            ? index - 1
            : p.category === "windows"
              ? 10
              : 20,
        ];
      }),
  ];
  const result = parseCatalog(productRows, categoryRows);
  // The existing local preview does not assert stock. Only Sheets publishes stock states.
  result.products = result.products.map((p) => ({
    ...p,
    availability: "unconfirmed",
  }));
  return { ...result, productRows, categoryRows };
}
