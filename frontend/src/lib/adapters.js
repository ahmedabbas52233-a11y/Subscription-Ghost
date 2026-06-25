/**
 * The original UI components (Subscriptions, Dashboard, FlipCard, AlertsPage, …)
 * were built against ad-hoc local mock objects, e.g.
 *   { id, name, cat, price, billing, color, bg, init, next, days, status }
 * The real backend model uses different field names, e.g.
 *   { _id, name, category, price, billing, nextRenewal, daysUntilRenewal,
 *     monthlyEquivalent, initials, status }
 *
 * Rather than rewrite every consumer component (high regression risk on a
 * 2,500-line file with no test harness), these adapters translate between
 * the two shapes at the boundary, so the existing UI keeps working unchanged
 * while the data underneath is now real.
 */

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/** "#E50914" -> "rgba(229,9,20,0.12)" — used for the soft tinted card background. */
export function colorToBg(hex, alpha = 0.12) {
  if (!hex || hex[0] !== '#') return 'rgba(148,163,184,0.12)';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if ([r, g, b].some(Number.isNaN)) return 'rgba(148,163,184,0.12)';
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * The backend's `status` field is a subscription *lifecycle* state
 * (active / paused / cancelled). The UI's `status` field — used for the
 * StatusPill badge, FlipCard coloring, the Dashboard's "N renewals need
 * attention" count, and the Calendar's overdue stat — is a *renewal
 * urgency* state (active / urgent / overdue), derived from how many days
 * until renewal. These are two different concepts that happen to share a
 * field name; passing the backend value straight through meant every real
 * subscription always displayed as plain "Active" no matter how soon it
 * was renewing, and every urgent/overdue count in the UI always read zero.
 */
function deriveUiStatus(apiStatus, daysUntilRenewal) {
  if (apiStatus !== 'active') return 'active'; // paused/cancelled: no dedicated UI state, don't flag as urgent
  if (typeof daysUntilRenewal !== 'number') return 'active';
  if (daysUntilRenewal <= 0) return 'overdue';
  if (daysUntilRenewal <= 3) return 'urgent';
  return 'active';
}

/** Backend Subscription -> shape the existing UI components expect. */
export function toUiSubscription(api) {
  const renewal = api.nextRenewal ? new Date(api.nextRenewal) : null;
  return {
    id:       api._id,
    _id:      api._id,
    name:     api.name,
    cat:      api.category,
    price:    api.price,
    billing:  api.billing,
    color:    api.color || '#00ff87',
    bg:       colorToBg(api.color),
    init:     api.initials || (api.name || '').slice(0, 2).toUpperCase(),
    next:     renewal ? `${MONTHS[renewal.getMonth()]} ${renewal.getDate()}` : '—',
    days:     typeof api.daysUntilRenewal === 'number' ? api.daysUntilRenewal : null,
    status:   deriveUiStatus(api.status, api.daysUntilRenewal),
    lifecycleStatus: api.status,
    notes:    api.notes || '',
    url:      '',
    tier:     '',
  };
}

/**
 * Best-effort reverse mapping: takes whatever partial shape the legacy
 * "Add subscription" form or the email-scanner import produces, and turns
 * it into a valid payload for POST /subscriptions.
 */
export function toApiPayload(ui) {
  const dateGuess = parseLooseDate(ui.next || ui.date);

  return {
    name:        ui.name,
    category:    normalizeCategory(ui.cat || ui.category),
    price:       Number(ui.price) || 0,
    billing:     ui.billing || 'monthly',
    nextRenewal: dateGuess.toISOString(),
    color:       /^#[0-9a-fA-F]{6}$/.test(ui.color) ? ui.color : undefined,
  };
}

const CATEGORY_MAP = {
  streaming: 'Entertainment', entertainment: 'Entertainment',
  music: 'Music', cloud: 'Cloud', design: 'Design', dev: 'Development',
  development: 'Development', productivity: 'Productivity', health: 'Health',
  finance: 'Finance', education: 'Education', marketing: 'Other', analytics: 'Other',
};

function normalizeCategory(raw) {
  if (!raw) return 'Other';
  return CATEGORY_MAP[raw.toLowerCase()] || 'Other';
}

/**
 * Parses either:
 *  - a clean ISO date string ("2026-06-30"), as sent by the AddModal's
 *    native <input type="date">, or
 *  - a fuzzy display string with no year ("May 01"), as used by the
 *    email-scanner's mock "detected subscription" data.
 * Falls back to 30 days from now if it can't make sense of the input.
 * Note: this isn't bulletproof against arbitrary garbage strings — JS's
 * built-in Date parser is notoriously lenient and may extract a bare year
 * from nonsense input rather than returning Invalid Date. Both of the
 * real input sources above are handled correctly, which is what matters.
 */
function parseLooseDate(raw) {
  if (!raw) return defaultRenewalDate();

  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const iso = new Date(raw);
    if (!Number.isNaN(iso.getTime())) return iso;
  }

  const now = new Date();
  const withYear = new Date(`${raw} ${now.getFullYear()}`);
  if (Number.isNaN(withYear.getTime())) return defaultRenewalDate();
  if (withYear.getTime() < now.getTime()) withYear.setFullYear(now.getFullYear() + 1);
  return withYear;
}

function defaultRenewalDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
}

/** Backend Alert -> shape the existing AlertsPage / sidebar badge expect. */
export function toUiAlert(api) {
  return {
    id:    api._id,
    _id:   api._id,
    type:  api.type,
    title: api.title,
    sub:   api.message,
    emoji: api.emoji,
    read:  api.read,
  };
}
