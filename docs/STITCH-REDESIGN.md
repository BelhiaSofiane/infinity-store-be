# Stitch redesign handover — 9 November 2026

## Rollback checkpoint

Before project edits, a clean-state checkpoint commit was created: `d903789563e4e4c2c1fff19f8996ac0fbc0fca32`.

Tag: `backup/pre-stitch-redesign-2026-11-09`. It preserves the exact pre-redesign project, including prior seller draft catalog and prior removal of the header location tagline. No remote push was requested.

To inspect the original without discarding any current work, use Git's detached checkout or a separate worktree at that tag. For a later shared-history rollback, revert the subsequent redesign commit instead of resetting shared history. Do not run a destructive reset over uncommitted work.

Git on this workstation is available at `%LOCALAPPDATA%\InfinityStore\runtime\mingit\cmd\git.exe`.

## Connection and design source

Google Stitch MCP: `https://stitch.googleapis.com/mcp`. Initialization, tool listing, project listing, screen retrieval, HTML download and screenshot download succeeded with HTTP 200. The saved credential helper was separately tested against the server and also returned HTTP 200.

Selected source: project `8291551607845162369`, screen `acd85ac702c34260a8e6bc83e47946a7`, **Catalogue Produits - Infinity Store**. Its actual screenshot and HTML were inspected. Temporary source references are in ignored `qa-output/`, not shipped to the frontend. No unrelated account project was changed. No Stitch generation, edit or destructive call was made.

The Codex user configuration now has a `mcp_servers.stitch` entry with a local header helper, following [official MCP configuration documentation](https://learn.chatgpt.com/docs/extend/mcp?surface=cli). The supplied key is encrypted with Windows current-user DPAPI under the user's Codex integrations directory. Neither the credential nor the helper is part of the store repository or browser bundle. A backup of the prior Codex configuration was saved beside it. A fresh app session may be needed for native MCP tool discovery; this session successfully accessed Stitch through its MCP HTTP protocol directly. This is development tooling, not a website runtime dependency.

## What changed

The original Stitch visual system is adapted to React components: royal blue actions and headings, pale blue surfaces, green WhatsApp buttons, Plus Jakarta Sans self-hosted from the official Google Fonts repository, white split product panels, a streaming illustration, a Game Pass selection grid and a navy footer. The homepage and catalog use this catalog-first presentation. Existing contact, policy and support routes inherit the same theme.

Filters and duration selection are functional. Query parameters retain the selected plan and category on reload and header language switch. Six terms are compared with exact durations and localized messages; no account, payment, cart or backend order claim has been added. Product verification remains independent. The source design's unsupported certifications, guarantees, service hours, urgency, discounts and identities are intentionally not treated as business facts. Conceptual product visuals reuse existing local assets and code-native illustration; no remote Google scripts/fonts or Tailwind CDN are added to the storefront.

`content/preview-pricing.json` contains editable `.99` price proposals. Original seller prices remain in the catalog. See `CONVERSION-STRATEGY.md` for research, limits and experiment priorities.

## Validation

Windows, Node 22.23.4, Next.js 16.4.5. `npm run build`, `npm run typecheck` and all 10 automated tests passed. The pricing test verifies that proposals stay separate from the unchanged seller prices and cannot mark a product approved.

The HTTP crawler passed all 22 localized routes, 546 rendered link occurrences, 68 WhatsApp link occurrences and eight unavailable/private-path probes. Current pre-existing host-access behavior is preserved. `build:commercial` still fails at the readiness gate before generation, as expected; no product was marked approved.

In-app Chromium checks covered 1440px desktop, 768px tablet and 360px mobile layouts. Final observed document scroll widths fit the viewport (including long Dutch content); the comparison table scrolls inside its container. Verified category filtering, radio selection, keyboard ArrowRight selection, comparison-table selection, matching selected total and WhatsApp SKU/term, reload persistence and FR/NL header language-switch persistence. Fixed a mobile overflow caused by an unpositioned screen-reader-only table label and removed server-round-trip delay from filter/plan changes. The checked page had no captured error/warning logs.

Screenshots of the implemented preview are saved in ignored `qa-output/`. No real WhatsApp message, order, payment or remote deployment was performed. Actual external-app handoff, assistive-technology audit, device testing and conversion uplift remain unverified. Existing commercial-readiness blockers still apply.
