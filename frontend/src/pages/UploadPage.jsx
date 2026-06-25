import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, FileText, Info, Sparkles } from "lucide-react";
import FileDropZone from "../components/FileDropZone";
import { useAuth } from "../contexts/AuthContext";
import { C } from "../theme";

export default function UploadPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [error, setError]   = useState(null);

  const onSuccess = (data) => {
    setError(null);
    navigate("/analysis", {
      state: { documentId: data.document_id, filename: data.filename },
    });
  };

  return (
    <main
      id="main-content"
      style={{ maxWidth: 600, margin: "0 auto", padding: "60px 20px 80px" }}
    >
      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: 40 }}>
        <div
          aria-hidden="true"
          style={{
            width: 52, height: 52, borderRadius: 13,
            background: "rgba(99,102,241,.09)",
            border: "1px solid rgba(99,102,241,.16)",
            display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 18px",
          }}
        >
          <FileText size={22} color={C.info} />
        </div>
        <h1
          style={{
            fontSize: 28, fontWeight: 800,
            color: C.textPrimary, letterSpacing: "-.5px", marginBottom: 8,
          }}
        >
          Upload a Document
        </h1>
        <p style={{ color: C.textSecondary, fontSize: 15 }}>
          Drop a PDF or image to start AI-powered analysis
        </p>
      </header>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          style={{
            display: "flex", gap: 10, padding: "12px 14px",
            marginBottom: 18,
            background: C.errorBg,
            border: `1px solid ${C.errorBorder}`,
            borderRadius: 10, color: "#fca5a5", fontSize: 13,
          }}
        >
          <AlertCircle
            size={15}
            style={{ flexShrink: 0, marginTop: 1 }}
            aria-hidden="true"
          />
          <div>
            <strong style={{ color: C.error }}>Upload failed</strong>
            <br />{error}
          </div>
        </div>
      )}

      <FileDropZone onUploadSuccess={onSuccess} onUploadError={setError} />

      {/* Info row */}
      <aside
        aria-label="File requirements"
        style={{
          marginTop: 14, padding: "12px 16px",
          background: "rgba(18,18,26,.7)",
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          display: "flex", flexWrap: "wrap",
          gap: 10, alignItems: "center",
        }}
      >
        <Info size={13} color={C.info} aria-hidden="true" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: C.textMuted, flex: 1 }}>
          <strong style={{ color: "#cbd5e1" }}>Accepted:</strong>{" "}
          PDF, PNG, JPG, JPEG, WEBP · Max 5 MB
        </span>
        {!isAuthenticated && (
          <span style={{ fontSize: 12, color: C.textMuted }}>
            <Link to="/register" style={{ color: C.info, fontWeight: 600 }}>
              Sign up
            </Link>{" "}
            to save history
          </span>
        )}
      </aside>

      {/* Feature hint */}
      {!isAuthenticated && (
        <div
          style={{
            marginTop: 24, padding: "16px 18px",
            background: "rgba(99,102,241,.05)",
            border: "1px solid rgba(99,102,241,.14)",
            borderRadius: 12,
            display: "flex", gap: 12, alignItems: "flex-start",
          }}
        >
          <Sparkles
            size={16}
            color={C.info}
            aria-hidden="true"
            style={{ flexShrink: 0, marginTop: 1 }}
          />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#a5b4fc", marginBottom: 3 }}>
              Create a free account to unlock
            </p>
            <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>
              Full analysis history · Revisit any previous report · Manage and delete documents
            </p>
            <Link
              to="/register"
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                marginTop: 10, fontSize: 13, fontWeight: 600,
                color: C.info, textDecoration: "none",
              }}
            >
              Get started free →
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
