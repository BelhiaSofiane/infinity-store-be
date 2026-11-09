# Conversion strategy — researched 9 November 2026

The objective is more qualified buying conversations and legitimate completed sales. A WhatsApp click is not a sent message, qualified inquiry or order. No uplift, experiment result or visitor conversion has been measured for Infinity Store.

## Research and decisions

1. **Test just-below pricing, rather than assuming it always wins.** [Thomas and Morwitz's original author summary, NYU Stern](https://w4.stern.nyu.edu/sternbusiness/fall_2005/pennySaved.html) describes experimental evidence of a left-digit perception effect, strongest in their comparisons when the leftmost digit changes. [The original 2005 Journal of Consumer Research paper](https://academic.oup.com/jcr/article-abstract/32/1/54/1796360?login=false) is the underlying study. €35 → €34.99 crosses the €35 threshold but leaves the leftmost digit “3” unchanged; the classic result is not direct proof for this exact case. €60 → €59.99 changes the leftmost digit. Outcomes depend on context and should be tested. The study's price-perception findings are not a conversion forecast for Belgian software buyers.
2. **Show the complete total before commitment.** [Baymard's updated abandonment research, 28 October 2026](https://baymard.com/blog/cart-abandonment-rate) identifies unexpected costs, trust, account requirements and process friction as common reported reasons for abandonment. This is broader checkout research, not an Infinity/WhatsApp experiment. Applied here as a hypothesis: clear total pricing, actual seller details, readily available conditions and a short inquiry route should reduce avoidable uncertainty. The site's conversion cannot be inferred from the article's aggregate statistics.
3. **Match the interaction to the customer's decision.** The Stitch design supplies useful category filters, six duration choices, a comparison table and a product-specific inquiry action. Implement these as real controls, retain selected terms in localized inquiry messages, preserve selection on language switch and show only factual differences. This implementation choice is an inference from the task and usability principles, not a measured research result.

## Implemented in this preview

- Product-first catalog with three large, scannable sections and working category filters.
- Six Game Pass durations with one visible selected total and one primary inquiry CTA. The lowest-commitment duration is the initial selection; no unsupported “most popular” or “best value” labels.
- Comparison table that selects the same duration and returns to its inquiry controls. Day-based terms stay in days; 85 days is not advertised as three months.
- Editable `.99` proposals in `content/preview-pricing.json`: 25→24.99, 35→34.99, 45→44.99, 60→59.99, 75→74.99, 100→99.99 EUR. Seller-supplied prices remain unchanged in `content/products.json`. These are labelled proposals awaiting confirmation, not discounts or approved offers. Approved product rendering uses the verified product price, never an automatic marketing transform.
- Visible help route and external-service explanation beside inquiry decisions; complete FR/NL copy, euro formatting and locale-preserving plan/filter links.
- Local font and assets, no new tracking, account, cart or payment step.

The source design contains a crossed-out reference price, lifetime/official-key/activation guarantees, stated hours, immediate delivery and other service claims. Those are not evidence. They have not been copied into the working store. No fake reviews, urgency, scarcity or notification prompts have been added.

## Prioritized next experiments

| Priority | Hypothesis / action | Success measure and guardrail |
| --- | --- | --- |
| P0 | Confirm seller identity, real contacts, SKU rights, taxes, fulfillment and actual service scope | Complete readiness and independent business/legal review; functioning contact alternatives |
| P1 | Approve `.99` versus round prices for comparable offers | Contribution margin and paid orders per qualified inquiry; no fabricated discount baseline |
| P1 | Put confirmed account/region/device restrictions immediately above the inquiry action | Fewer ineligible inquiries; preserve refund and complaint rates |
| P2 | Compare inquiry wording focused on eligibility versus a general question | Qualified inquiries per covered eligible product viewer; distinguish support contacts |
| P2 | Add a factual comparison of actual plan benefits when approved | Reduced decision questions and improved qualified-inquiry rate |
| P3 | Consider a restrained mobile inquiry bar after the primary control leaves view | No overlap, equal support access, keyboard/reflow checks; do not add a second competing sales action without evidence |

Before experiments: authorize measurement, define denominator/cohort and attribution, assess privacy/consent, establish a baseline and an economically meaningful effect size. Do not simultaneously change price, copy and traffic source then attribute results to pricing. With low traffic, use moderated usability feedback and a restricted manual sales log rather than claiming statistical significance. Do not put identities, order references or message contents in events/URLs, infer unattributed WhatsApp orders as tracked sales, or suppress complaint access to improve a metric.

Owner signoff is still required before proposed prices become actual commercial totals. No public deployment or business approval was performed during this redesign.
