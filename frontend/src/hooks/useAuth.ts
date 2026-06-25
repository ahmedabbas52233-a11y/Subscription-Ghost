import { useState, useCallback } from 'react';
import API from '../api/client';
import type { User, AuthResponse, ApiResponse } from '../types';

interface LoginPayload  { email: string; password: string; }
interface SignupPayload { name: string; email: string; password: string; }

export function useAuth() {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const login = useCallback(async (p: LoginPayload) => {
    setLoading(true); setError(null);
    try {
      const { data } = await API.post<ApiResponse<AuthResponse>>('/auth/login', p);
      if (data.data) {
        localStorage.setItem('accessToken',  data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        setUser(data.data.user);
      }
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (p: SignupPayload) => {
    setLoading(true); setError(null);
    try {
      const { data } = await API.post<ApiResponse<AuthResponse>>('/auth/register', p);
      if (data.data) {
        localStorage.setItem('accessToken',  data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        setUser(data.data.user);
      }
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Signup failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async (p: { accessToken: string }) => {
    setLoading(true);
    try {
      const { data } = await API.get<ApiResponse<User>>('/auth/me', {
        headers: { Authorization: `Bearer ${p.accessToken}` },
      });
      setUser(data.data ?? null);
      return data.data ?? null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (p?: { refreshToken?: string }) => {
    try {
      await API.post('/auth/logout', { refreshToken: p?.refreshToken });
    } finally {
      localStorage.clear();
      setUser(null);
    }
  }, []);

  return { user, setUser, loading, error, login, signup, refreshUser, logout };
}
