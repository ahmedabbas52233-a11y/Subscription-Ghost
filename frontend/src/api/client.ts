import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE,
  timeout: 12_000,
  headers: { "Content-Type": "application/json" },
});

/* ── Attach access token ──────────────────────────────────────── */
api.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("accessToken");
  if (token && cfg.headers) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

/* ── Transparent token refresh on 401 ────────────────────────── */
let refreshing = false;
type PendingItem = { resolve: (t: string) => void; reject: (e: unknown) => void };
let queue: PendingItem[] = [];

const drain = (err: unknown, token: string | null) => {
  queue.forEach(({ resolve, reject }) => (err ? reject(err) : resolve(token!)));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const orig = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (err.response?.status !== 401 || orig._retry) return Promise.reject(err);

    if (refreshing) {
      return new Promise<string>((resolve, reject) => queue.push({ resolve, reject }))
        .then((tok) => {
          if (orig.headers) orig.headers.Authorization = `Bearer ${tok}`;
          return api(orig);
        });
    }

    orig._retry = true;
    refreshing  = true;

    try {
      const rt = localStorage.getItem("refreshToken");
      if (!rt) throw new Error("no-refresh-token");

      const { data } = await axios.post(`${BASE}/auth/refresh`, { refreshToken: rt });
      const { accessToken, refreshToken } = data.data;

      localStorage.setItem("accessToken",  accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      drain(null, accessToken);
      if (orig.headers) orig.headers.Authorization = `Bearer ${accessToken}`;
      return api(orig);
    } catch (e) {
      drain(e, null);
      localStorage.clear();
      window.location.href = "/";
      return Promise.reject(e);
    } finally {
      refreshing = false;
    }
  }
);

export default api;

/* ── Typed helpers ────────────────────────────────────────────── */
export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    api.post("/auth/register", body),
  login: (body: { email: string; password: string }) =>
    api.post("/auth/login", body),
  refresh: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),
  logout: (refreshToken: string) =>
    api.post("/auth/logout", { refreshToken }),
};

export const subsApi = {
  list:   (params?: Record<string, string>) => api.get("/subscriptions", { params }),
  create: (body: Record<string, unknown>)   => api.post("/subscriptions", body),
  get:    (id: string)                      => api.get(`/subscriptions/${id}`),
  update: (id: string, body: Record<string, unknown>) => api.put(`/subscriptions/${id}`, body),
  delete: (id: string)                      => api.delete(`/subscriptions/${id}`),
  stats:  ()                                => api.get("/subscriptions/stats"),
};

export const alertsApi = {
  list:       ()          => api.get("/alerts"),
  markRead:   (id: string)=> api.put(`/alerts/${id}/read`),
  markAll:    ()          => api.post("/alerts/mark-all-read"),
  dismiss:    (id: string)=> api.delete(`/alerts/${id}`),
};
