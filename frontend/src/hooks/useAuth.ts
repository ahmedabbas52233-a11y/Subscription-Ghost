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
}
