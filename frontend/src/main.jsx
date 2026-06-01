import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

class ErrorBoundary extends React.Component {
  state = { err: null };
  static getDerivedStateFromError(e) { return { err: e }; }
  render() {
    if (this.state.err) return (
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", background:"#080b14", color:"#f1f5f9", gap:12, padding:24, textAlign:"center" }}>
        <div style={{ fontSize:36 }}>⚠️</div>
        <p style={{ color:"#f87171", fontWeight:700, fontSize:18 }}>Something went wrong</p>
        <p style={{ color:"#94a3b8", fontSize:13, maxWidth:380 }}>{this.state.err?.message}</p>
        <button onClick={() => window.location.reload()}
          style={{ marginTop:8, padding:"9px 22px", borderRadius:8, background:"#4f46e5",
            color:"#fff", border:"none", cursor:"pointer", fontWeight:600 }}>
          Reload
        </button>
      </div>
    );
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
