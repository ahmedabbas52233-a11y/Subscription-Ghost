import { useState, useCallback } from 'react';
import API from '../api/client';
import type { Alert, ApiResponse } from '../types';

export function useAlerts() {
  const [alerts,  setAlerts]  = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await API.get<ApiResponse<Alert[]>>('/alerts');
      setAlerts(data.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  const markRead = useCallback(async (p: { _id: string }) => {
    try {
      await API.put(`/alerts/${p._id}/read`);
      setAlerts((s) => s.map((a) => (a._id === p._id ? { ...a, read: true } : a)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to mark alert read');
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await API.post('/alerts/mark-all-read');
      setAlerts((s) => s.map((a) => ({ ...a, read: true })));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to mark all alerts read');
    }
  }, []);

  const remove = useCallback(async (p: { _id: string }) => {
    try {
      await API.delete(`/alerts/${p._id}`);
      setAlerts((s) => s.filter((a) => a._id !== p._id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to dismiss alert');
    }
  }, []);

  return { alerts, loading, error, fetchAll, markRead, markAllRead, remove };
}
