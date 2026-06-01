import React, { createContext, useContext, useState, useCallback } from "react";
import apiClient from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);

      const { data } = await apiClient.post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("access_token",  data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      const { data: me } = await apiClient.get("/auth/me");
      setUser(me);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post("/auth/register", { email, password });
      return await login(email, password);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Email may already be taken.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    setError(null);
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const { data } = await apiClient.get("/auth/me");
      setUser(data);
    } catch {
      logout();
    }
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, loading, error, login, register, logout, checkAuth, setError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
