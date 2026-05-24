/* ── Subscription ─────────────────────────────────────────────── */
export type BillingCycle  = "monthly" | "quarterly" | "annually";
export type SubStatus     = "active"  | "paused"    | "cancelled";
export type AlertType     = "overdue" | "urgent"    | "warning" | "info" | "success";
export type Plan          = "free"    | "pro"        | "team";

export interface Subscription {
  _id:               string;
  userId:            string;
  name:              string;
  category:          string;
  price:             number;
  billing:           BillingCycle;
  nextRenewal:       string;          // ISO date
  status:            SubStatus;
  color:             string;
  initials:          string;
  notes?:            string;
  alertsSent:        number[];
  daysUntilRenewal:  number;          // virtual
  monthlyEquivalent: number;          // virtual
  createdAt:         string;
  updatedAt:         string;
}

/* ── UI Subscription (seed data shape used in the React layer) ── */
export interface UISub {
  id:      number;
  name:    string;
  cat:     string;
  price:   number;
  billing: string;
  color:   string;
  bg:      string;
  init:    string;
  next:    string;
  days:    number;
  status:  "active" | "urgent" | "overdue";
}

/* ── Alert ────────────────────────────────────────────────────── */
export interface Alert {
  _id:       string;
  userId:    string;
  subId?:    Partial<Subscription>;
  type:      AlertType;
  title:     string;
  message:   string;
  emoji:     string;
  read:      boolean;
  createdAt: string;
}

/* ── User ─────────────────────────────────────────────────────── */
export interface User {
  _id:       string;
  name:      string;
  email:     string;
  plan:      Plan;
  createdAt: string;
}

/* ── API wrappers ─────────────────────────────────────────────── */
export interface ApiResponse<T = unknown> {
  success:  boolean;
  data?:    T;
  message?: string;
  count?:   number;
  unread?:  number;
}

export interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

/* ── Dashboard stats ──────────────────────────────────────────── */
export interface SubStats {
  totalActive:  number;
  monthlyTotal: number;
  annualTotal:  number;
  byCategory:   Record<string, number>;
  urgentCount:  number;
}

/* ── Form states ──────────────────────────────────────────────── */
export interface SubForm {
  name:        string;
  category:    string;
  price:       string;
  billing:     BillingCycle;
  nextRenewal: string;
  notes?:      string;
}

export interface AuthForm {
  name?:    string;
  email:    string;
  password: string;
}
