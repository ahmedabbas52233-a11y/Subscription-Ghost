<<<<<<< HEAD
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
=======
import { useState, useCallback, useEffect } from "react";
import { authApi } from "../api/client";
import type { User } from "../types";

interface AuthState {
  user:         User | null;
  accessToken:  string | null;
  isAuthed:     boolean;
  loading:      boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user:        null,
    accessToken: localStorage.getItem("accessToken"),
    isAuthed:    !!localStorage.getItem("accessToken"),
    loading:     false,
  });

  /* Re-hydrate user from localStorage on mount */
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try { setState(p => ({ ...p, user: JSON.parse(raw) })); } catch { /* ignore */ }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(p => ({ ...p, loading: true }));
    try {
      const { data } = await authApi.login({ email, password });
      const { user, accessToken, refreshToken } = data.data;
      localStorage.setItem("accessToken",  accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user",         JSON.stringify(user));
      setState({ user, accessToken, isAuthed: true, loading: false });
      return { ok: true };
    } catch (err: unknown) {
      setState(p => ({ ...p, loading: false }));
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? "Login failed";
      return { ok: false, error: msg };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setState(p => ({ ...p, loading: true }));
    try {
      const { data } = await authApi.register({ name, email, password });
      const { user, accessToken, refreshToken } = data.data;
      localStorage.setItem("accessToken",  accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user",         JSON.stringify(user));
      setState({ user, accessToken, isAuthed: true, loading: false });
      return { ok: true };
    } catch (err: unknown) {
      setState(p => ({ ...p, loading: false }));
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? "Registration failed";
      return { ok: false, error: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    const rt = localStorage.getItem("refreshToken");
    if (rt) { try { await authApi.logout(rt); } catch { /* best-effort */ } }
    localStorage.clear();
    setState({ user: null, accessToken: null, isAuthed: false, loading: false });
  }, []);

  return { ...state, login, register, logout };
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
}
