export const categories = ['windows', 'office', 'game-pass', 'iptv', 'android-boxes'];
const present = value => typeof value === 'string' && value.trim().length > 0;
export function reviewIsValid(reference, records, now = new Date()) {
  return records.some(r => r.reference === reference && r.status === 'approved' && present(r.reviewer) && present(r.reviewDate) && present(r.evidenceReference) && present(r.scope) && Date.parse(r.reviewDate) <= now.getTime() && (!r.expiresAt || Date.parse(r.expiresAt) > now.getTime()));
}
export function productBlockers(p, reviews, locale, now = new Date()) {
  const errors = [];
  if (p.status !== 'approved') errors.push('not approved');
  if (!categories.includes(p.category)) errors.push('unsupported category');
  for (const key of ['sku','slug','classification','edition','devices','compatibility','territory','licenseConditions','availability','taxDisclosure','delivery','withdrawal','conformity','supportScope','image','imageRightsReference']) if (!present(p[key])) errors.push(`missing ${key}`);
  if (!/^\/assets\/[a-zA-Z0-9_./-]+$/.test(p.image || '') || (p.image || '').includes('..')) errors.push('image must be a verified local asset');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug || '')) errors.push('invalid slug');
  if (!Number.isFinite(p.priceEUR) || p.priceEUR < 0) errors.push('missing verified EUR total');
  if (!reviewIsValid(p.reviewReference, reviews, now)) errors.push('missing current evidence review');
  const translation = p.translations?.[locale];
  for (const key of ['name','description','conditions','assistance','delivery','withdrawal','conformity','compatibility','taxDisclosure']) if (!present(translation?.[key])) errors.push(`missing ${locale}.${key}`);
  if (!reviewIsValid(translation?.reviewReference, reviews, now)) errors.push(`unreviewed ${locale} translation`);
  if (p.category === 'iptv' && (!present(p.rightsScope) || !p.rightsExpiry || Date.parse(p.rightsExpiry) <= now.getTime() || !Number.isFinite(Date.parse(p.rightsExpiry)))) errors.push('missing or expired Belgian content rights');
  if (p.category === 'android-boxes') for (const key of ['manufacturer','euResponsiblePerson','safety','model','conformityReference','returnLogistics']) if (!present(p[key])) errors.push(`missing physical information ${key}`);
  return errors;
}
export function siteBlockers(business, policies, reviews) {
  const errors = [];
  for (const key of ['legalName','legalForm','registration','address','email','publicOrigin','taxAssessment','privacyAssessment','withdrawalAssessment','durableConfirmationProcess','paymentAndFulfillment','algerianObligationsReview','accessibilityReview']) if (!present(business[key])) errors.push(`site: missing ${key}`);
  if (business.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(business.email)) errors.push('site: invalid business email');
  if (business.publicOrigin && !/^https:\/\/[^/]+$/.test(business.publicOrigin)) errors.push('site: publicOrigin must be a real HTTPS origin');
  for (const key of ['taxAssessment','privacyAssessment','withdrawalAssessment','durableConfirmationProcess','paymentAndFulfillment','algerianObligationsReview','accessibilityReview']) if (!reviewIsValid(business[key], reviews.siteReviews)) errors.push(`site: unreviewed ${key}`);
  if (!business.support.escalationOwner || !business.support.humanLanguages.length || !reviewIsValid(business.support.reviewReference, reviews.siteReviews)) errors.push('site: support operations unconfirmed');
  for (const locale of ['fr','nl']) {
    const policy = policies.locales[locale];
    for (const key of ['legal','terms','privacy','storage','returns','delivery','accessibility']) if (!present(policy[key])) errors.push(`${locale}: missing ${key} policy`);
    if (!reviewIsValid(policy.reviewReference, reviews.siteReviews)) errors.push(`${locale}: policy review pending`);
  }
  return errors;
}
