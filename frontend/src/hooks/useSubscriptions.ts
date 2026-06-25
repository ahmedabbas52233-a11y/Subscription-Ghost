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
}
