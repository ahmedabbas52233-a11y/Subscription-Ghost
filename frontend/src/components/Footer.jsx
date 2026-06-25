import React from "react";
import { Link } from "react-router-dom";
import { FileText, Github, Twitter } from "lucide-react";
import { C } from "../theme";

const year = new Date().getFullYear();

const cols = [
  {
    heading: "Product",
    links: [
      ["Upload Document", "/upload"],
      ["Analysis History", "/history"],
      ["Create Account",  "/register"],
    ],
  },
  {
    heading: "Account",
    links: [
      ["Sign In",    "/login"],
      ["Register",   "/register"],
    ],
  },
];

export default function Footer() {
  return (
    <footer
      aria-label="Site footer"
      style={{
        borderTop: `1px solid ${C.border}`,
        background: "rgba(12,12,16,.97)",
        marginTop: "auto",
      }}
    >
      {/* Main footer grid */}
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: "48px 24px 36px",
          display: "grid",
          gridTemplateColumns: "1fr repeat(2, auto)",
          gap: 48,
          alignItems: "start",
        }}
        className="footer-grid"
      >
        {/* Brand column */}
        <div>
          <Link
            to="/"
            aria-label="DocuMind AI home"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              textDecoration: "none",
              marginBottom: 14,
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: C.grad,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText size={13} color="#fff" />
            </div>
            <span
              style={{ fontWeight: 800, fontSize: 16, color: C.textPrimary }}
            >
              Docu<span style={{ color: C.info }}>Mind</span>
            </span>
          </Link>
          <p
            style={{
              fontSize: 13,
              color: C.textMuted,
              lineHeight: 1.7,
              maxWidth: 240,
              margin: "0 0 20px",
            }}
          >
            AI-powered document analysis. Upload any PDF or image and get
            structured insights instantly.
          </p>
          {/* Social icons */}
          <div style={{ display: "flex", gap: 10 }}>
            {[
              ["https://github.com", Github,  "GitHub"],
              ["https://twitter.com", Twitter, "Twitter"],
            ].map(([href, Icon, label]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: `rgba(255,255,255,.04)`,
                  border: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: C.textMuted,
                  textDecoration: "none",
                  transition: "border-color .15s, color .15s",
                }}
              >
                <Icon size={14} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {cols.map(({ heading, links }) => (
          <nav key={heading} aria-label={`${heading} links`}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.textSecondary,
                textTransform: "uppercase",
                letterSpacing: ".08em",
                marginBottom: 14,
              }}
            >
              {heading}
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {links.map(([label, to]) => (
                <li key={label}>
                  <Link
                    to={to}
                    style={{
                      fontSize: 14,
                      color: C.textMuted,
                      textDecoration: "none",
                      transition: "color .15s",
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: `1px solid ${C.border}`,
          maxWidth: 1160,
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <p style={{ fontSize: 12, color: C.textMuted }}>
          © {year} DocuMind AI. All rights reserved.
        </p>
        <p style={{ fontSize: 12, color: C.textMuted }}>
          Built with React, FastAPI &amp; OpenAI
        </p>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </footer>
  );
}
