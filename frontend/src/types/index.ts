/* ── Subscription ────────────────────────────────────────────── */
export type BillingCycle = 'monthly' | 'quarterly' | 'annually';
export type SubStatus    = 'active' | 'paused' | 'cancelled';

export interface Subscription {
  _id:               string;
  name:              string;
  category:          string;
  price:             number;
  billing:           BillingCycle;
  nextRenewal:       string;      // ISO date string
  status:            SubStatus;
  color:             string;
  initials:          string;
  notes?:            string;
  alertsSent:        number[];
  daysUntilRenewal:  number;      // virtual from backend
  monthlyEquivalent: number;      // virtual from backend
  createdAt:         string;
  updatedAt:         string;
}

/* ── Alert ───────────────────────────────────────────────────── */
export type AlertType = 'overdue' | 'urgent' | 'warning' | 'info' | 'success';

export interface Alert {
  _id:       string;
  subId?:    Partial<Subscription>;
  type:      AlertType;
  title:     string;
  message:   string;
  emoji:     string;
  read:      boolean;
  createdAt: string;
}

/* ── User ────────────────────────────────────────────────────── */
export type Plan = 'free' | 'pro' | 'team';

export interface User {
  _id:       string;
  name:      string;
  email:     string;
  plan:      Plan;
  createdAt: string;
}

/* ── Auth ────────────────────────────────────────────────────── */
export interface AuthResponse {
  user:         User;
  accessToken:  string;
  refreshToken: string;
}

/* ── API wrapper ─────────────────────────────────────────────── */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?:   T;
  message?: string;
  count?:  number;
}

/* ── Stats ───────────────────────────────────────────────────── */
export interface SubStats {
  totalActive:  number;
  monthlyTotal: number;
  annualTotal:  number;
  byCategory:   Record<string, number>;
  urgentCount:  number;
}

/* ── Form ────────────────────────────────────────────────────── */
export interface SubForm {
  name:        string;
  category:    string;
  price:       string;
  billing:     BillingCycle;
  nextRenewal: string;
  notes?:      string;
}
