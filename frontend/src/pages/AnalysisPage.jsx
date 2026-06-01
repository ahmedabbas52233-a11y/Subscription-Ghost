import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Download, FileText, Loader2,
  CheckCircle, AlertCircle, RefreshCw,
  TrendingUp, TrendingDown, Minus, Lightbulb, Star,
} from "lucide-react";
import { C, cardBase } from "../theme";

const API = import.meta.env.VITE_API_URL || "/api/v1";

const SENTIMENT = {
  positive: { icon:TrendingUp,   color:"#4ade80", bg:"rgba(74,222,128,.08)",  border:"rgba(74,222,128,.2)",  label:"Positive" },
  negative: { icon:TrendingDown, color:"#f87171", bg:"rgba(248,113,113,.08)", border:"rgba(248,113,113,.2)", label:"Negative" },
  neutral:  { icon:Minus,        color:"#94a3b8", bg:"rgba(148,163,184,.08)", border:"rgba(148,163,184,.15)",label:"Neutral"  },
};

export default function AnalysisPage() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { documentId, filename } = state || {};

  const [phase,  setPhase]  = useState("loading"); // loading | done | error
  const [parsed, setParsed] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const abortRef = useRef(null);

  const run = () => {
    if (!documentId) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setPhase("loading"); setParsed(null); setErrMsg("");

    const token = localStorage.getItem("access_token");
    fetch(`${API}/analyze/stream/${documentId}`, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        Accept: "text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const b = await res.json().catch(() => ({}));
          throw new Error(b?.detail || `Server error ${res.status}`);
        }

        const reader = res.body.getReader();
        const dec    = new TextDecoder();
        let buf = "";
        let lastEvent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          for (const line of lines) {
            // Track current event type
            if (line.startsWith("event: ")) {
              lastEvent = line.slice(7).trim();
              if (lastEvent === "done") setPhase(p => p === "loading" ? "done" : p);
              continue;
            }
            // Process data lines
            if (line.startsWith("data: ")) {
              const raw = line.slice(6).trim();
              if (!raw) continue;

              if (lastEvent === "result") {
                try {
                  const obj = JSON.parse(raw);
                  if (obj && typeof obj.analysis === "string") {
                    setParsed(obj);
                    setPhase("done");
                  }
                } catch (e) {
                  console.warn("JSON parse failed:", e);
                }
              }
              lastEvent = ""; // reset after consuming data
            }
          }
        }

        // Stream closed — if still loading, something went wrong
        setPhase(p => {
          if (p === "loading") {
            setErrMsg("Connection closed before analysis completed. Please retry.");
            return "error";
          }
          return p;
        });
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setErrMsg(err.message || "Analysis failed. Please try again.");
          setPhase("error");
        }
      });
  };

  useEffect(() => {
    if (!documentId) { navigate("/upload"); return; }
    run();
    return () => abortRef.current?.abort();
  }, []); // eslint-disable-line

  const downloadReport = () => {
    if (!parsed) return;
    const txt = [
      "DocuMind AI — Analysis Report",
      `File: ${filename || "document"}`,
      `Date: ${new Date().toLocaleString()}`,
      `Sentiment: ${parsed.sentiment}`,
      "",
      "SUMMARY",
      "───────────────────────────────────────",
      parsed.analysis || "",
      "",
      "KEY POINTS",
      "───────────────────────────────────────",
      ...(parsed.key_points || []).map((p, i) => `${i + 1}. ${p}`),
      "",
      "RECOMMENDATIONS",
      "───────────────────────────────────────",
      ...(parsed.recommendations || []).map((r, i) => `${i + 1}. ${r}`),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([txt], { type: "text/plain" }));
    a.download = `documind-report-${documentId}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (!documentId) return null;

  const sent    = parsed ? (SENTIMENT[parsed.sentiment] ?? SENTIMENT.neutral) : null;
  const SentIcon = sent?.icon;

  return (
    <main id="main-content" style={{ maxWidth:1060, margin:"0 auto", padding:"36px 20px 72px" }}>

      {/* Back */}
      <Link to="/upload" style={{ display:"inline-flex", alignItems:"center", gap:6,
        color:C.textMuted, textDecoration:"none", fontSize:13, fontWeight:500, marginBottom:28 }}>
        <ArrowLeft size={14} aria-hidden="true" /> Back to upload
      </Link>

      {/* Header */}
      <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        flexWrap:"wrap", gap:12, marginBottom:32 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:"rgba(99,102,241,.1)",
            border:"1px solid rgba(99,102,241,.18)", display:"flex", alignItems:"center",
            justifyContent:"center" }} aria-hidden="true">
            <FileText size={17} color={C.info} />
          </div>
          <div>
            <h1 style={{ fontSize:21, fontWeight:800, color:C.textPrimary, margin:0 }}>
              Analysis Results
            </h1>
            {filename && (
              <p style={{ fontSize:12, color:C.textMuted, margin:0 }}>{filename}</p>
            )}
          </div>
        </div>
        {phase === "done" && parsed && (
          <button type="button" onClick={downloadReport} style={{
            display:"flex", alignItems:"center", gap:6, padding:"8px 14px",
            borderRadius:8, background:"rgba(99,102,241,.1)", border:"1px solid rgba(99,102,241,.2)",
            color:"#a5b4fc", cursor:"pointer", fontWeight:600, fontSize:13, fontFamily:"inherit",
          }}>
            <Download size={13} aria-hidden="true" /> Export Report
          </button>
        )}
      </header>

      {/* ── Loading ── */}
      {phase === "loading" && (
        <div style={{ ...cardBase, padding:"56px 24px", textAlign:"center" }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background:"rgba(99,102,241,.1)",
            border:"1px solid rgba(99,102,241,.18)", display:"flex", alignItems:"center",
            justifyContent:"center", margin:"0 auto 20px" }} aria-hidden="true">
            <Loader2 size={22} color={C.info} style={{ animation:"spin .8s linear infinite" }} />
          </div>
          <p style={{ fontSize:16, fontWeight:700, color:C.textPrimary, marginBottom:8 }}>
            Analysing your document
          </p>
          <p style={{ fontSize:13, color:C.textMuted, marginBottom:24 }}>
            {settings?.OPENAI_API_KEY ? "GPT-4o is reading your document…" : "Processing document…"}
          </p>
          <div style={{ maxWidth:280, margin:"0 auto", height:2,
            background:"rgba(255,255,255,.06)", borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", width:"55%", borderRadius:99,
              background:`linear-gradient(90deg,${C.indigo},${C.violet})`,
              animation:"slide-prog 1.5s ease-in-out infinite" }} />
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {phase === "error" && (
        <div role="alert" style={{ ...cardBase, padding:"40px 24px", textAlign:"center" }}>
          <AlertCircle size={36} color={C.error} style={{ marginBottom:12 }} aria-hidden="true" />
          <p style={{ fontSize:16, fontWeight:700, color:"#fca5a5", marginBottom:6 }}>
            Analysis failed
          </p>
          <p style={{ fontSize:13, color:C.textMuted, marginBottom:22, maxWidth:360, margin:"0 auto 22px" }}>
            {errMsg}
          </p>
          <button type="button" onClick={run} style={{
            display:"inline-flex", alignItems:"center", gap:6, padding:"9px 20px",
            borderRadius:8, background:"rgba(255,255,255,.05)", border:`1px solid ${C.border}`,
            color:C.textSecondary, cursor:"pointer", fontSize:13, fontFamily:"inherit",
          }}>
            <RefreshCw size={13} aria-hidden="true" /> Retry analysis
          </button>
        </div>
      )}

      {/* ── Results ── */}
      {phase === "done" && parsed && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Stats row */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:12 }}>
            {/* Sentiment */}
            <div style={{ ...cardBase, padding:18, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:sent.bg,
                border:`1px solid ${sent.border}`, display:"flex", alignItems:"center",
                justifyContent:"center", flexShrink:0 }} aria-hidden="true">
                {SentIcon && <SentIcon size={18} color={sent.color} />}
              </div>
              <div>
                <p style={{ fontSize:10, color:C.textMuted, fontWeight:600,
                  textTransform:"uppercase", letterSpacing:".07em", margin:0 }}>Sentiment</p>
                <p style={{ fontSize:17, fontWeight:800, color:sent.color, margin:0 }}>{sent.label}</p>
              </div>
            </div>

            {/* Key points */}
            <div style={{ ...cardBase, padding:18, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:"rgba(99,102,241,.08)",
                border:"1px solid rgba(99,102,241,.15)", display:"flex", alignItems:"center",
                justifyContent:"center", flexShrink:0 }} aria-hidden="true">
                <Star size={17} color={C.info} />
              </div>
              <div>
                <p style={{ fontSize:10, color:C.textMuted, fontWeight:600,
                  textTransform:"uppercase", letterSpacing:".07em", margin:0 }}>Key Points</p>
                <p style={{ fontSize:17, fontWeight:800, color:C.textPrimary, margin:0 }}>
                  {(parsed.key_points || []).length}
                </p>
              </div>
            </div>

            {/* Recommendations */}
            <div style={{ ...cardBase, padding:18, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:"rgba(251,191,36,.07)",
                border:"1px solid rgba(251,191,36,.15)", display:"flex", alignItems:"center",
                justifyContent:"center", flexShrink:0 }} aria-hidden="true">
                <Lightbulb size={17} color={C.warn} />
              </div>
              <div>
                <p style={{ fontSize:10, color:C.textMuted, fontWeight:600,
                  textTransform:"uppercase", letterSpacing:".07em", margin:0 }}>Actions</p>
                <p style={{ fontSize:17, fontWeight:800, color:C.textPrimary, margin:0 }}>
                  {(parsed.recommendations || []).length}
                </p>
              </div>
            </div>

            {/* Status */}
            <div style={{ ...cardBase, padding:18, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:"rgba(74,222,128,.07)",
                border:"1px solid rgba(74,222,128,.15)", display:"flex", alignItems:"center",
                justifyContent:"center", flexShrink:0 }} aria-hidden="true">
                <CheckCircle size={17} color={C.success} />
              </div>
              <div>
                <p style={{ fontSize:10, color:C.textMuted, fontWeight:600,
                  textTransform:"uppercase", letterSpacing:".07em", margin:0 }}>Status</p>
                <p style={{ fontSize:14, fontWeight:700, color:C.success, margin:0 }}>Complete</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <section aria-labelledby="sum-h" style={{ ...cardBase, padding:26 }}>
            <h2 id="sum-h" style={{ fontSize:11, fontWeight:700, color:C.info,
              textTransform:"uppercase", letterSpacing:".08em", margin:"0 0 14px" }}>
              Summary
            </h2>
            {(parsed.analysis || "").split("\n").filter(Boolean).map((p, i, arr) => (
              <p key={i} style={{ color:"#cbd5e1", fontSize:15, lineHeight:1.8,
                margin: i < arr.length - 1 ? "0 0 12px" : 0 }}>
                {p}
              </p>
            ))}
          </section>

          {/* Key points + Recs */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:14 }}>
            <section aria-labelledby="kp-h" style={{ ...cardBase, padding:22 }}>
              <h2 id="kp-h" style={{ fontSize:11, fontWeight:700, color:C.info,
                textTransform:"uppercase", letterSpacing:".08em", margin:"0 0 14px" }}>
                Key Points
              </h2>
              {(parsed.key_points || []).length > 0 ? (
                <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:9 }}>
                  {(parsed.key_points || []).map((pt, i) => (
                    <li key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                      <span aria-hidden="true" style={{ width:19, height:19, borderRadius:5,
                        background:"rgba(99,102,241,.12)", display:"flex", alignItems:"center",
                        justifyContent:"center", fontSize:10, fontWeight:700, color:C.info,
                        flexShrink:0, marginTop:2 }}>{i + 1}</span>
                      <span style={{ fontSize:14, color:"#cbd5e1", lineHeight:1.6 }}>{pt}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color:C.textMuted, fontSize:13 }}>No key points extracted.</p>
              )}
            </section>

            <section aria-labelledby="rec-h" style={{ ...cardBase, padding:22 }}>
              <h2 id="rec-h" style={{ fontSize:11, fontWeight:700, color:C.warn,
                textTransform:"uppercase", letterSpacing:".08em", margin:"0 0 14px" }}>
                Recommendations
              </h2>
              {(parsed.recommendations || []).length > 0 ? (
                <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:9 }}>
                  {(parsed.recommendations || []).map((r, i) => (
                    <li key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                      <Lightbulb size={13} color={C.warn} aria-hidden="true"
                        style={{ flexShrink:0, marginTop:3 }} />
                      <span style={{ fontSize:14, color:"#cbd5e1", lineHeight:1.6 }}>{r}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color:C.textMuted, fontSize:13 }}>No recommendations generated.</p>
              )}
            </section>
          </div>
        </div>
      )}
    </main>
  );
}
