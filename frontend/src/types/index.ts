<<<<<<< HEAD
/* ── Subscription ────────────────────────────────────────────── */
export type BillingCycle = 'monthly' | 'quarterly' | 'annually';
export type SubStatus    = 'active' | 'paused' | 'cancelled';

export interface Subscription {
  _id:               string;
=======
/* ── Subscription ─────────────────────────────────────────────── */
export type BillingCycle  = "monthly" | "quarterly" | "annually";
export type SubStatus     = "active"  | "paused"    | "cancelled";
export type AlertType     = "overdue" | "urgent"    | "warning" | "info" | "success";
export type Plan          = "free"    | "pro"        | "team";

export interface Subscription {
  _id:               string;
  userId:            string;
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
  name:              string;
  category:          string;
  price:             number;
  billing:           BillingCycle;
<<<<<<< HEAD
  nextRenewal:       string;      // ISO date string
=======
  nextRenewal:       string;          // ISO date
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
  status:            SubStatus;
  color:             string;
  initials:          string;
  notes?:            string;
  alertsSent:        number[];
<<<<<<< HEAD
  daysUntilRenewal:  number;      // virtual from backend
  monthlyEquivalent: number;      // virtual from backend
=======
  daysUntilRenewal:  number;          // virtual
  monthlyEquivalent: number;          // virtual
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
  createdAt:         string;
  updatedAt:         string;
}

<<<<<<< HEAD
/* ── Alert ───────────────────────────────────────────────────── */
export type AlertType = 'overdue' | 'urgent' | 'warning' | 'info' | 'success';

export interface Alert {
  _id:       string;
=======
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
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
  subId?:    Partial<Subscription>;
  type:      AlertType;
  title:     string;
  message:   string;
  emoji:     string;
  read:      boolean;
  createdAt: string;
}

<<<<<<< HEAD
/* ── User ────────────────────────────────────────────────────── */
export type Plan = 'free' | 'pro' | 'team';

=======
/* ── User ─────────────────────────────────────────────────────── */
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
export interface User {
  _id:       string;
  name:      string;
  email:     string;
  plan:      Plan;
  createdAt: string;
}

<<<<<<< HEAD
/* ── Auth ────────────────────────────────────────────────────── */
export interface AuthResponse {
  user:         User;
=======
/* ── API wrappers ─────────────────────────────────────────────── */
export interface ApiResponse<T = unknown> {
  success:  boolean;
  data?:    T;
  message?: string;
  count?:   number;
  unread?:  number;
}

export interface AuthTokens {
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
  accessToken:  string;
  refreshToken: string;
}

<<<<<<< HEAD
/* ── API wrapper ─────────────────────────────────────────────── */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?:   T;
  message?: string;
  count?:  number;
}

/* ── Stats ───────────────────────────────────────────────────── */
=======
export interface AuthResponse extends AuthTokens {
  user: User;
}

/* ── Dashboard stats ──────────────────────────────────────────── */
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
export interface SubStats {
  totalActive:  number;
  monthlyTotal: number;
  annualTotal:  number;
  byCategory:   Record<string, number>;
  urgentCount:  number;
}

<<<<<<< HEAD
/* ── Form ────────────────────────────────────────────────────── */
=======
/* ── Form states ──────────────────────────────────────────────── */
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
export interface SubForm {
  name:        string;
  category:    string;
  price:       string;
  billing:     BillingCycle;
  nextRenewal: string;
  notes?:      string;
}
<<<<<<< HEAD
=======

export interface AuthForm {
  name?:    string;
  email:    string;
  password: string;
}
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
