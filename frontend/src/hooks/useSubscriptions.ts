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
}
