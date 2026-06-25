<<<<<<< HEAD
import { useState, useCallback } from 'react';
import API from '../api/client';
import type { Subscription, ApiResponse, SubStats } from '../types';

/** Fields needed when creating a new subscription (no _id yet) */
type NewSubscription = Omit<Subscription, '_id' | 'alertsSent' | 'daysUntilRenewal' | 'monthlyEquivalent' | 'createdAt' | 'updatedAt'>;

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats,   setStats]   = useState<SubStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await API.get<ApiResponse<Subscription[]>>('/subscriptions');
      setSubscriptions(data.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await API.get<ApiResponse<SubStats>>('/subscriptions/stats');
      setStats(data.data ?? null);
    } catch { /* non-critical */ }
  }, []);

  const create = useCallback(async (p: NewSubscription) => {
    setLoading(true); setError(null);
    try {
      const { data } = await API.post<ApiResponse<Subscription>>('/subscriptions', p);
      if (data.data) setSubscriptions((s) => [...s, data.data as Subscription]);
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create subscription';
      setError(msg); throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (p: Partial<Subscription> & { _id: string }) => {
    setLoading(true); setError(null);
    try {
      const { data } = await API.put<ApiResponse<Subscription>>(`/subscriptions/${p._id}`, p);
      if (data.data) {
        setSubscriptions((s) => s.map((sub) => sub._id === p._id ? data.data as Subscription : sub));
      }
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update subscription';
      setError(msg); throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (p: { _id: string }) => {
    setLoading(true); setError(null);
    try {
      await API.delete(`/subscriptions/${p._id}`);
      setSubscriptions((s) => s.filter((sub) => sub._id !== p._id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete subscription';
      setError(msg); throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkDelete = useCallback(async (p: { ids: string[] }) => {
    setLoading(true); setError(null);
    try {
      await API.post('/subscriptions/bulk-delete', { ids: p.ids });
      setSubscriptions((s) => s.filter((sub) => !p.ids.includes(sub._id)));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete subscriptions';
      setError(msg); throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { subscriptions, setSubscriptions, stats, loading, error, fetchAll, fetchStats, create, update, remove, bulkDelete };
=======
import { useState, useEffect, useCallback } from "react";
import { subsApi } from "../api/client";
import type { Subscription, SubForm } from "../types";

export function useSubscriptions(authed: boolean) {
  const [subs,    setSubs]    = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!authed) return;
    setLoading(true);
    try {
      const { data } = await subsApi.list({ status: "active" });
      setSubs(data.data ?? []);
      setError(null);
    } catch {
      setError("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }, [authed]);

  useEffect(() => { fetch(); }, [fetch]);

  /* ── Create (optimistic) ───────────────────────────────────── */
  const create = useCallback(async (form: SubForm) => {
    const tempId = `temp-${Date.now()}`;
    const optimistic: Subscription = {
      _id:               tempId,
      userId:            "",
      name:              form.name,
      category:          form.category,
      price:             parseFloat(form.price),
      billing:           form.billing,
      nextRenewal:       form.nextRenewal,
      status:            "active",
      color:             "#00ff87",
      initials:          form.name.slice(0, 3).toUpperCase(),
      alertsSent:        [],
      daysUntilRenewal:  30,
      monthlyEquivalent: parseFloat(form.price),
      createdAt:         new Date().toISOString(),
      updatedAt:         new Date().toISOString(),
    };
    setSubs(p => [optimistic, ...p]);

    try {
      const { data } = await subsApi.create({
        name:        form.name,
        category:    form.category,
        price:       parseFloat(form.price),
        billing:     form.billing,
        nextRenewal: form.nextRenewal,
        notes:       form.notes,
      });
      /* Replace optimistic entry with real data */
      setSubs(p => p.map(s => s._id === tempId ? data.data : s));
      return { ok: true };
    } catch {
      /* Roll back on failure */
      setSubs(p => p.filter(s => s._id !== tempId));
      return { ok: false, error: "Failed to create subscription" };
    }
  }, []);

  /* ── Delete (optimistic) ───────────────────────────────────── */
  const remove = useCallback(async (id: string) => {
    const prev = [...subs];
    setSubs(p => p.filter(s => s._id !== id));
    try {
      await subsApi.delete(id);
    } catch {
      setSubs(prev); // roll back
    }
  }, [subs]);

  /* ── Update ────────────────────────────────────────────────── */
  const update = useCallback(async (id: string, body: Partial<SubForm>) => {
    try {
      const { data } = await subsApi.update(id, body as Record<string, unknown>);
      setSubs(p => p.map(s => s._id === id ? data.data : s));
      return { ok: true };
    } catch {
      return { ok: false, error: "Failed to update subscription" };
    }
  }, []);

  return { subs, setSubs, loading, error, refetch: fetch, create, remove, update };
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
}
