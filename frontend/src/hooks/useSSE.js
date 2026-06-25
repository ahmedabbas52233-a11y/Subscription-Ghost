import { useEffect, useRef, useState, useCallback } from "react";

/**
 * useSSE — connects to a Server-Sent Events endpoint.
 *
 * EventSource cannot set custom headers, so we pass the JWT as a
 * query parameter when the backend is set up to accept it, or we use
 * fetch() with ReadableStream as a workaround.
 *
 * This implementation uses fetch() so that Authorization headers work.
 */
export function useSSE(url) {
  const [chunks, setChunks]         = useState([]);
  const [error, setError]           = useState(null);
  const [isConnected, setConnected] = useState(false);
  const [isDone, setDone]           = useState(false);
  const abortRef                    = useRef(null);

  const connect = useCallback(async () => {
    if (!url) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setChunks([]);
    setError(null);
    setDone(false);
    setConnected(false);

    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(url, {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          Accept: "text/event-stream",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `HTTP ${res.status}`);
      }

      setConnected(true);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse SSE lines
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("event: done")) {
            setDone(true);
            setConnected(false);
          } else if (line.startsWith("event: error")) {
            // next line is data
          } else if (line.startsWith("data: ")) {
            const data = line.slice(6);
            setChunks((prev) => [...prev, data]);
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Connection error");
        setConnected(false);
      }
    }
  }, [url]);

  useEffect(() => {
    connect();
    return () => abortRef.current?.abort();
  }, [connect]);

  return { chunks, error, isConnected, isDone };
}
