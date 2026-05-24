import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Bell, CreditCard, BarChart2, Settings, Plus, X, Home, Search, Zap,
  Shield, Clock, DollarSign, Trash2, AlertTriangle, CheckCircle, Mail,
  Lock, User, Check, Eye, EyeOff, ChevronRight, Star, Grid, List,
  ArrowUpRight, Sparkles, Activity, TrendingUp, Calendar, Edit2, Filter
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS & GLOBAL CSS
═══════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{font-size:16px;scroll-behavior:smooth;}
body{
  font-family:'DM Sans',system-ui,sans-serif;
  background:#020510;color:#e8eaf6;
  overflow-x:hidden;-webkit-font-smoothing:antialiased;
}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:#1a2744;border-radius:99px;}
input,select,button{font-family:inherit;}
input:focus,select:focus{outline:none;}

.oxanium{font-family:'Oxanium',sans-serif;}

/* ─ PERSPECTIVE */
.scene-3d{transform-style:preserve-3d;}

/* ─ FLIP CARD */
.flip-inner{
  transition:transform .65s cubic-bezier(.22,1,.36,1);
  transform-style:preserve-3d;
  position:relative;
}
.flip-card:hover .flip-inner{transform:rotateY(180deg);}
.flip-front,.flip-back{backface-visibility:hidden;-webkit-backface-visibility:hidden;}
.flip-back{transform:rotateY(180deg);position:absolute;inset:0;}

/* ─ GLASS SURFACES */
.surface{
  background:rgba(8,14,32,0.88);
  border:1px solid rgba(255,255,255,0.06);
  backdrop-filter:blur(20px) saturate(1.5);
  -webkit-backdrop-filter:blur(20px) saturate(1.5);
}
.surface-hi{
  background:rgba(12,20,44,0.92);
  border:1px solid rgba(0,255,135,0.09);
  backdrop-filter:blur(24px);
}

/* ─ GRADIENT TEXT */
.neon-g{
  background:linear-gradient(135deg,#00ff87 0%,#60efff 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.neon-p{
  background:linear-gradient(135deg,#bf5af2 0%,#ff6cac 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}

/* ─ BUTTONS */
.btn-neon{
  position:relative;overflow:hidden;cursor:pointer;border:none;
  background:linear-gradient(135deg,#00ff87,#06b6d4);
  color:#020510;font-weight:700;
  transition:transform .2s,box-shadow .2s;
  display:inline-flex;align-items:center;justify-content:center;gap:7px;
}
.btn-neon::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.22),transparent);opacity:0;transition:opacity .2s;}
.btn-neon:hover::before{opacity:1;}
.btn-neon:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,255,135,.32);}
.btn-neon:active{transform:translateY(0);}

.btn-ghost{
  cursor:pointer;background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.1);color:#94a3b8;
  transition:all .2s;font-weight:500;
  display:inline-flex;align-items:center;gap:7px;
}
.btn-ghost:hover{background:rgba(0,255,135,.06);border-color:rgba(0,255,135,.25);color:#e8eaf6;}

/* ─ SIDEBAR NAV */
.nav-link{
  display:flex;align-items:center;gap:10px;width:100%;
  padding:9px 12px;border-radius:8px;cursor:pointer;
  background:none;border:1px solid transparent;
  color:#4a5568;font-size:13px;font-weight:500;
  transition:all .2s;text-align:left;position:relative;overflow:hidden;
}
.nav-link::before{
  content:'';position:absolute;left:0;top:0;bottom:0;width:2px;
  background:linear-gradient(180deg,#00ff87,#06b6d4);
  opacity:0;transition:opacity .2s;border-radius:0 2px 2px 0;
}
.nav-link:hover{background:rgba(0,255,135,.05);color:#94a3b8;}
.nav-link.active{background:rgba(0,255,135,.08);border-color:rgba(0,255,135,.15);color:#00ff87;}
.nav-link.active::before{opacity:1;}

/* ─ BADGE */
.badge{
  display:inline-flex;align-items:center;gap:4px;
  font-size:10px;font-weight:800;padding:2px 8px;
  border-radius:99px;letter-spacing:.05em;text-transform:uppercase;
}

/* ─ FIELD */
.field{
  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.08);
  border-radius:10px;color:#e8eaf6;font-size:14px;transition:all .2s;
}
.field:focus{border-color:rgba(0,255,135,.4);box-shadow:0 0 0 3px rgba(0,255,135,.08);}
.field::placeholder{color:#374151;}
option{background:#08101f;}

/* ─ TOGGLE */
.tog-track{width:40px;height:22px;border-radius:11px;cursor:pointer;transition:all .3s;position:relative;flex-shrink:0;}
.tog-thumb{width:16px;height:16px;border-radius:50%;background:white;position:absolute;top:3px;transition:left .3s cubic-bezier(.22,1,.36,1);box-shadow:0 2px 8px rgba(0,0,0,.4);}

/* ─ PROGRESS */
.pbar{height:3px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;}
.pfill{height:100%;border-radius:99px;transition:width 1.2s cubic-bezier(.22,1,.36,1);}

/* ─ PERSPECTIVE GRID */
.pg-wrap{perspective:600px;perspective-origin:50% 10%;position:absolute;inset:0;overflow:hidden;pointer-events:none;}
.pg-plane{
  width:100%;height:100%;
  transform:rotateX(65deg) translateY(40%);
  background-image:linear-gradient(rgba(0,255,135,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,135,.07) 1px,transparent 1px);
  background-size:60px 60px;
  mask-image:radial-gradient(ellipse 80% 60% at 50% 40%,black 0%,transparent 100%);
}

/* ─ ANIMATIONS */
@keyframes floatZ{0%,100%{transform:translateY(0)rotateX(0)rotateZ(0)}33%{transform:translateY(-14px)rotateX(3deg)rotateZ(1deg)}66%{transform:translateY(-6px)rotateX(-2deg)rotateZ(-1deg)}}
@keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(500%)}}
@keyframes pulseRing{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.9);opacity:0}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.93) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes slideL{from{opacity:0;transform:translateX(-22px)}to{opacity:1;transform:translateX(0)}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes toastIn{from{opacity:0;transform:translateX(100px)}to{opacity:1;transform:translateX(0)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes gradRot{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}

.a-up{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) both;}
.a-scale{animation:scaleIn .4s cubic-bezier(.22,1,.36,1) both;}
.a-left{animation:slideL .4s cubic-bezier(.22,1,.36,1) both;}

/* ─ SCAN LINE */
.scan-wrap{overflow:hidden;position:relative;}
.scan-wrap::after{content:'';position:absolute;left:0;right:0;height:50px;background:linear-gradient(transparent,rgba(0,255,135,.025),transparent);animation:scanline 4s linear infinite;pointer-events:none;}

/* ─ RECHARTS */
.recharts-tooltip-wrapper{outline:none!important;}

/* ─ RESPONSIVE */
@media(max-width:860px){
  .hide-sm{display:none!important;}
  .sb-wrap{position:fixed;top:0;left:0;bottom:0;z-index:50;transform:translateX(-100%);transition:transform .3s ease;}
  .sb-wrap.open{transform:translateX(0);}
  .main-ml{margin-left:0!important;}
}
@media(min-width:861px){
  .show-sm{display:none!important;}
  .sb-wrap{transform:translateX(0)!important;}
}
`;

/* ═══════════════════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════════════════ */
function useTilt(ref, max = 15) {
  const [tilt, setTilt] = useState({ x: 0, y: 0, gx: 50, gy: 50 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      setTilt({ x: (py - .5) * -max * 2, y: (px - .5) * max * 2, gx: px * 100, gy: py * 100 });
    };
    const onLeave = () => setTilt({ x: 0, y: 0, gx: 50, gy: 50 });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, [max]);
  return tilt;
}

function useGlobalMouse() {
  const [m, setM] = useState({ x: .5, y: .5 });
  useEffect(() => {
    const fn = (e) => setM({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener("mousemove", fn, { passive: true });
    return () => window.removeEventListener("mousemove", fn);
  }, []);
  return m;
}

/* ═══════════════════════════════════════════════════════════════
   3D TILT WRAPPER COMPONENT
═══════════════════════════════════════════════════════════════ */
function Tilt({ children, max = 14, className = "", style = {} }) {
  const ref = useRef(null);
  const { x, y, gx, gy } = useTilt(ref, max);
  return (
    <div ref={ref} className={className} style={{ perspective: "900px", ...style }}>
      <div className="scene-3d" style={{
        transform: `rotateX(${x}deg) rotateY(${y}deg)`,
        transition: "transform .1s ease-out",
        height: "100%", borderRadius: "inherit",
      }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "inherit", zIndex: 1, pointerEvents: "none",
          background: `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,.075) 0%, transparent 58%)`,
          transition: "background .08s",
        }} />
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3D PARTICLE CANVAS  (true z-depth projection)
═══════════════════════════════════════════════════════════════ */
function Particles() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: .5, y: .5 });
  const raf = useRef(null);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => {
      c.width  = c.offsetWidth  * devicePixelRatio;
      c.height = c.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);
    window.addEventListener("mousemove", (e) => {
      const r = c.getBoundingClientRect();
      mouse.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    });

    const FOCAL = 380;
    const pts = Array.from({ length: 85 }, () => ({
      x: (Math.random() - .5) * 1400, y: (Math.random() - .5) * 900,
      z: Math.random() * 900 + 60,
      vx: (Math.random() - .5) * .14, vy: (Math.random() - .5) * .14,
      vz: -.16 - Math.random() * .1,
      hue: Math.random() > .5 ? 157 : 195,
    }));

    const draw = () => {
      const W = c.offsetWidth, H = c.offsetHeight;
      ctx.clearRect(0, 0, W, H);
      const mx = (mouse.current.x - .5) * .28, my = (mouse.current.y - .5) * .28;
      pts.forEach(p => {
        p.x += p.vx + mx; p.y += p.vy + my; p.z += p.vz;
        if (p.z < 10) { p.z = 900; p.x = (Math.random()-.5)*1400; p.y = (Math.random()-.5)*900; }
      });
      const sorted = [...pts].sort((a, b) => b.z - a.z);
      const proj = (p) => { const s = FOCAL/(FOCAL+p.z); return { px: p.x*s+W/2, py: p.y*s+H/2, s }; };

      for (let i = 0; i < sorted.length; i++) {
        for (let j = i+1; j < sorted.length; j++) {
          const pa = proj(sorted[i]), pb = proj(sorted[j]);
          const d = Math.hypot(pa.px-pb.px, pa.py-pb.py);
          if (d < 95) {
            ctx.beginPath(); ctx.moveTo(pa.px, pa.py); ctx.lineTo(pb.px, pb.py);
            ctx.strokeStyle = `rgba(0,255,135,${(1-d/95)*.09*pa.s})`;
            ctx.lineWidth = .5*pa.s; ctx.stroke();
          }
        }
      }
      sorted.forEach(p => {
        const { px, py, s } = proj(p);
        if (px<-20||px>W+20||py<-20||py>H+20) return;
        ctx.beginPath(); ctx.arc(px, py, 1.3*s, 0, Math.PI*2);
        ctx.fillStyle = `hsla(${p.hue},100%,65%,${Math.min(.88,.2+s*.72)})`; ctx.fill();
      });
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} style={{ position:"absolute",inset:0,width:"100%",height:"100%" }} />;
}

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
const SUBS = [
  { id:1,  name:"Netflix",   cat:"Entertainment", price:15.99, billing:"monthly", color:"#e50914", bg:"rgba(229,9,20,.12)",    init:"NF",  next:"Jun 3",  days:5,  status:"urgent"  },
  { id:2,  name:"Spotify",   cat:"Music",         price:9.99,  billing:"monthly", color:"#1db954", bg:"rgba(29,185,84,.12)",   init:"SP",  next:"Jun 12", days:14, status:"active"  },
  { id:3,  name:"AWS",       cat:"Cloud",         price:89.45, billing:"monthly", color:"#ff9900", bg:"rgba(255,153,0,.12)",   init:"AWS", next:"Jun 1",  days:3,  status:"urgent"  },
  { id:4,  name:"GitHub",    cat:"Dev",           price:4.00,  billing:"monthly", color:"#e8eaf6", bg:"rgba(232,234,246,.08)", init:"GH",  next:"Jun 18", days:20, status:"active"  },
  { id:5,  name:"Figma",     cat:"Design",        price:15.00, billing:"monthly", color:"#a259ff", bg:"rgba(162,89,255,.12)",  init:"FG",  next:"Jun 25", days:27, status:"active"  },
  { id:6,  name:"Adobe CC",  cat:"Design",        price:54.99, billing:"monthly", color:"#f87171", bg:"rgba(248,113,113,.1)",  init:"AD",  next:"May 30", days:1,  status:"overdue" },
  { id:7,  name:"Vercel",    cat:"Cloud",         price:20.00, billing:"monthly", color:"#e8eaf6", bg:"rgba(232,234,246,.08)", init:"VC",  next:"Jun 8",  days:10, status:"active"  },
  { id:8,  name:"Linear",    cat:"Productivity",  price:8.00,  billing:"monthly", color:"#5e6ad2", bg:"rgba(94,106,210,.12)",  init:"LN",  next:"Jun 15", days:17, status:"active"  },
  { id:9,  name:"Notion",    cat:"Productivity",  price:16.00, billing:"monthly", color:"#e8eaf6", bg:"rgba(232,234,246,.08)", init:"NO",  next:"Jun 20", days:22, status:"active"  },
  { id:10, name:"Loom",      cat:"Productivity",  price:12.50, billing:"monthly", color:"#625df5", bg:"rgba(98,93,245,.12)",   init:"LM",  next:"Jun 28", days:30, status:"active"  },
];

const TREND = [{ m:"Jan",v:185 },{ m:"Feb",v:202 },{ m:"Mar",v:191 },{ m:"Apr",v:218 },{ m:"May",v:208 },{ m:"Jun",v:246 }];
const CATS  = [
  { name:"Cloud",v:109.45,c:"#06b6d4" },{ name:"Design",v:69.99,c:"#bf5af2" },
  { name:"Entertain",v:15.99,c:"#f87171" },{ name:"Productivity",v:36.50,c:"#00ff87" },
  { name:"Music",v:9.99,c:"#34d399" },{ name:"Dev",v:4.00,c:"#fbbf24" },
];
const ALERTS_SEED = [
  { id:1,type:"overdue",title:"Adobe CC renews TOMORROW",sub:"May 30 · $54.99/mo",emoji:"⚠️",read:false },
  { id:2,type:"urgent", title:"AWS renews in 3 days",   sub:"Jun 1 · $89.45/mo", emoji:"🔔",read:false },
  { id:3,type:"warning",title:"Netflix in 5 days",      sub:"Jun 3 · $15.99/mo", emoji:"🎬",read:false },
  { id:4,type:"info",   title:"Vercel in 10 days",      sub:"Jun 8 · $20.00/mo", emoji:"▲", read:true  },
  { id:5,type:"success",title:"Spotify payment confirmed",sub:"May 12 · $9.99",  emoji:"✅",read:true  },
];
const FEATURES = [
  { icon:Bell,     t:"Smart Pre-Alerts",    d:"AI fires alerts at 7, 3, 1 day before any charge.",         c:"#00ff87" },
  { icon:BarChart2,t:"Spend Analytics",     d:"Trend charts, category breakdown, year-over-year deltas.",  c:"#bf5af2" },
  { icon:Shield,   t:"Bank-Grade Security", d:"AES-256 encryption, SOC 2 compliant.",                     c:"#06b6d4" },
  { icon:Zap,      t:"Email Auto-Detect",   d:"Scan inbox once — every subscription imported instantly.",  c:"#fbbf24" },
  { icon:Calendar, t:"Renewal Calendar",    d:"Visual timeline — every upcoming charge at a glance.",      c:"#f87171" },
  { icon:Activity, t:"Cost Optimizer",      d:"AI surfaces duplicates, unused tiers, bundles.",            c:"#34d399" },
];

const ST = {
  active:  { c:"#00ff87",bg:"rgba(0,255,135,.1)",  bd:"rgba(0,255,135,.22)",  label:"Active"   },
  urgent:  { c:"#fbbf24",bg:"rgba(251,191,36,.1)",  bd:"rgba(251,191,36,.22)", label:"Soon"     },
  overdue: { c:"#f87171",bg:"rgba(248,113,113,.1)", bd:"rgba(248,113,113,.2)", label:"Overdue"  },
};
const AT = {
  overdue:{ c:"#f87171",bg:"rgba(248,113,113,.07)",bd:"rgba(248,113,113,.2)",label:"OVERDUE" },
  urgent: { c:"#fbbf24",bg:"rgba(251,191,36,.07)", bd:"rgba(251,191,36,.2)", label:"URGENT"  },
  warning:{ c:"#f97316",bg:"rgba(249,115,22,.07)", bd:"rgba(249,115,22,.2)", label:"WARNING" },
  info:   { c:"#06b6d4",bg:"rgba(6,182,212,.06)",  bd:"rgba(6,182,212,.18)", label:"INFO"    },
  success:{ c:"#00ff87",bg:"rgba(0,255,135,.06)",  bd:"rgba(0,255,135,.18)", label:"SUCCESS" },
};

/* ═══════════════════════════════════════════════════════════════
   ATOMS
═══════════════════════════════════════════════════════════════ */
function Logo({ size=34, fs=17 }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:9 }}>
      <div style={{
        width:size,height:size,borderRadius:Math.round(size*.28),flexShrink:0,
        background:"linear-gradient(135deg,#00ff87,#06b6d4)",
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:Math.round(size*.56),boxShadow:"0 0 22px rgba(0,255,135,.38)",
      }}>👻</div>
      <span className="oxanium" style={{ fontSize:fs,fontWeight:800,color:"#e8eaf6",letterSpacing:"-.01em" }}>
        Sub<span style={{ color:"#00ff87" }}>Ghost</span>
      </span>
    </div>
  );
}

function Spin() {
  return <div style={{ width:15,height:15,border:"2px solid rgba(0,0,0,.2)",borderTopColor:"#020510",borderRadius:"50%",animation:"spin .65s linear infinite" }} />;
}

function Toggle({ on, onChange }) {
  return (
    <div className="tog-track" onClick={()=>onChange(!on)}
      style={{ background:on?"#00ff87":"rgba(255,255,255,.09)",boxShadow:on?"0 0 14px rgba(0,255,135,.42)":"none" }}>
      <div className="tog-thumb" style={{ left:on?21:3 }} />
    </div>
  );
}

function SubIcon({ sub, size=40, r=10 }) {
  return (
    <div style={{
      width:size,height:size,borderRadius:r,flexShrink:0,
      background:sub.bg,border:`1px solid ${sub.color}32`,
      display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:Math.round(size*.26),fontWeight:800,color:sub.color,
      fontFamily:"'Oxanium',sans-serif",letterSpacing:".02em",
    }}>{sub.init}</div>
  );
}

function Pill({ status }) {
  const s = ST[status]||ST.active;
  return (
    <span className="badge" style={{ background:s.bg,border:`1px solid ${s.bd}`,color:s.c }}>
      <span style={{ width:5,height:5,borderRadius:"50%",background:s.c,display:"inline-block" }} />
      {s.label}
    </span>
  );
}

const ChartTip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:"rgba(5,10,22,.97)",border:"1px solid rgba(0,255,135,.18)",borderRadius:10,padding:"10px 14px" }}>
      <div style={{ fontSize:11,color:"#4a5568",marginBottom:3 }}>{label}</div>
      <div className="oxanium" style={{ fontSize:17,fontWeight:800,color:"#00ff87" }}>${Number(payload[0].value).toFixed(2)}</div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   LANDING
═══════════════════════════════════════════════════════════════ */
function Landing({ onStart }) {
  const mouse = useGlobalMouse();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 44);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ background:"#020510",minHeight:"100vh",overflowX:"hidden" }}>
      {/* ── NAV */}
      <nav style={{
        position:"fixed",top:0,left:0,right:0,zIndex:100,height:62,
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"0 max(24px,5vw)",transition:"all .3s",
        background:scrolled?"rgba(2,5,16,.92)":"transparent",
        backdropFilter:scrolled?"blur(24px)":"none",
        borderBottom:scrolled?"1px solid rgba(0,255,135,.07)":"none",
      }}>
        <Logo />
        <div className="hide-sm" style={{ display:"flex",gap:28 }}>
          {["Features","Pricing","Docs","Blog"].map(l=>(
            <button key={l} style={{ background:"none",border:"none",color:"#4a5568",cursor:"pointer",fontSize:13.5,fontWeight:500,transition:"color .2s" }}
              onMouseEnter={e=>e.target.style.color="#e8eaf6"} onMouseLeave={e=>e.target.style.color="#4a5568"}>{l}</button>
          ))}
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <button className="btn-ghost" onClick={onStart} style={{ padding:"7px 18px",borderRadius:8,fontSize:13 }}>Log in</button>
          <button className="btn-neon"  onClick={onStart} style={{ padding:"7px 20px",borderRadius:8,fontSize:13 }}>Get Started</button>
        </div>
      </nav>

      {/* ── HERO */}
      <section style={{ position:"relative",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"100px 24px 60px",overflow:"hidden" }}>
        <Particles />
        <div className="pg-wrap"><div className="pg-plane" /></div>

        {/* Parallax orbs */}
        {[
          { w:600,h:600,top:"8%",left:"-4%",c:"rgba(0,255,135,.055)",dx:-18,dy:-12 },
          { w:500,h:500,bottom:"6%",right:"-4%",c:"rgba(6,182,212,.06)",dx:18,dy:12 },
          { w:380,h:380,top:"40%",left:"38%",c:"rgba(191,90,242,.05)",dx:-8,dy:8 },
        ].map((o,i)=>(
          <div key={i} style={{
            position:"absolute",width:o.w,height:o.h,borderRadius:"50%",pointerEvents:"none",
            top:o.top,left:o.left,right:o.right,bottom:o.bottom,
            background:`radial-gradient(circle,${o.c},transparent 65%)`,
            transform:`translate(${(mouse.x-.5)*o.dx}px,${(mouse.y-.5)*o.dy}px)`,
            transition:"transform .12s ease-out",
          }} />
        ))}

        {/* Floating 3D preview cards */}
        <div className="hide-sm" style={{
          position:"absolute",right:"max(4%,40px)",top:"50%",
          transform:`translateY(-50%) translate(${(mouse.x-.5)*-10}px,${(mouse.y-.5)*-10}px)`,
          transition:"transform .1s ease-out",
          display:"flex",flexDirection:"column",gap:10,
          perspective:"700px",
        }}>
          {SUBS.slice(0,4).map((s,i)=>(
            <div key={s.id} className="scene-3d" style={{
              animation:`floatZ ${5.2+i*.65}s ease-in-out ${i*.38}s infinite`,
              transform:`perspective(700px) rotateY(${-12+i*3}deg) rotateX(${i*1.5}deg)`,
            }}>
              <div className="surface-hi" style={{
                padding:"10px 14px",borderRadius:12,
                display:"flex",alignItems:"center",gap:10,
                width:205,opacity:.5+i*.12,
                borderLeft:`2px solid ${s.color}`,
                boxShadow:`0 8px 24px rgba(0,0,0,.4),0 0 0 1px ${s.color}15`,
              }}>
                <SubIcon sub={s} size={28} r={7} />
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:12.5,fontWeight:600,color:"#e8eaf6" }}>{s.name}</div>
                  <div style={{ fontSize:11,color:"#4a5568" }}>${s.price}/mo</div>
                </div>
                <Pill status={s.status} />
              </div>
            </div>
          ))}
        </div>

        {/* ── COPY */}
        <div style={{ position:"relative",zIndex:2,maxWidth:720,textAlign:"center" }}>
          <div className="a-up" style={{
            display:"inline-flex",alignItems:"center",gap:8,
            background:"rgba(0,255,135,.07)",border:"1px solid rgba(0,255,135,.22)",
            borderRadius:99,padding:"5px 16px",marginBottom:28,
          }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:"#00ff87",boxShadow:"0 0 9px #00ff87",display:"inline-block",animation:"blink 2s infinite" }} />
            <span style={{ fontSize:11.5,color:"#00ff87",fontWeight:700,letterSpacing:".07em" }}>BETA · 10,000+ ACTIVE USERS</span>
          </div>

          <h1 className="oxanium a-up" style={{ fontSize:"clamp(42px,8vw,80px)",fontWeight:900,lineHeight:1.02,letterSpacing:"-.03em",marginBottom:20,animationDelay:".1s" }}>
            Stop Bleeding Money<br />
            on <span className="neon-g">Forgotten</span><br />
            <span className="neon-p">Subscriptions</span>
          </h1>

          <p className="a-up" style={{ fontSize:"clamp(15px,2.5vw,18px)",color:"#6b7280",lineHeight:1.8,maxWidth:540,margin:"0 auto 40px",animationDelay:".22s" }}>
            SubscriptionGhost tracks every SaaS, stream, and service —
            and fires precise alerts before each renewal hits your card.
          </p>

          <div className="a-up" style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",animationDelay:".33s" }}>
            <button className="btn-neon" onClick={onStart} style={{ padding:"14px 34px",borderRadius:12,fontSize:15,fontWeight:700,boxShadow:"0 0 40px rgba(0,255,135,.22)" }}>
              Start Free — No Card <ChevronRight size={15} />
            </button>
            <button className="btn-ghost" onClick={onStart} style={{ padding:"14px 26px",borderRadius:12,fontSize:15 }}>
              <Activity size={14} /> View Demo
            </button>
          </div>

          <div className="a-up" style={{ display:"flex",alignItems:"center",gap:18,justifyContent:"center",marginTop:42,animationDelay:".44s" }}>
            <div style={{ display:"flex" }}>
              {["#4f46e5","#0891b2","#059669","#d97706","#be185d"].map((c,i)=>(
                <div key={i} style={{ width:28,height:28,borderRadius:"50%",background:c,border:"2px solid #020510",marginLeft:i>0?-8:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9.5,fontWeight:900,color:"white" }}>{["K","A","R","T","S"][i]}</div>
              ))}
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:4 }}>
              {[1,2,3,4,5].map(i=><Star key={i} size={12} fill="#fbbf24" color="#fbbf24"/>)}
              <span style={{ fontSize:12,color:"#4a5568",marginLeft:5 }}>4.9 · 2,400+ reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,.04)",borderBottom:"1px solid rgba(255,255,255,.04)",background:"rgba(255,255,255,.012)",padding:"32px max(24px,5vw)",display:"flex",gap:40,justifyContent:"center",flexWrap:"wrap" }}>
        {[{ v:"$2.4M+",l:"Saved annually" },{ v:"10K+",l:"Active users" },{ v:"99.9%",l:"Uptime SLA" },{ v:"60+",l:"Integrations" }].map(s=>(
          <div key={s.l} style={{ textAlign:"center" }}>
            <div className="oxanium" style={{ fontSize:32,fontWeight:800,color:"#e8eaf6",lineHeight:1 }}>{s.v}</div>
            <div style={{ fontSize:12.5,color:"#4a5568",marginTop:6 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── FEATURES */}
      <section style={{ padding:"80px max(24px,5vw)",maxWidth:1180,margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:50 }}>
          <div style={{ display:"inline-block",padding:"3px 14px",borderRadius:99,marginBottom:12,background:"rgba(191,90,242,.1)",border:"1px solid rgba(191,90,242,.22)",fontSize:11,color:"#bf5af2",fontWeight:700,letterSpacing:".08em" }}>FEATURES</div>
          <h2 className="oxanium" style={{ fontSize:"clamp(26px,4vw,44px)",fontWeight:800,lineHeight:1.1 }}>
            Full Control.<br/><span className="neon-g">Zero Surprises.</span>
          </h2>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(285px,1fr))",gap:18 }}>
          {FEATURES.map((f,i)=>(
            <Tilt key={i} max={13} className="scan-wrap" style={{ borderRadius:16,animation:`fadeUp .5s cubic-bezier(.22,1,.36,1) ${i*.07}s both` }}>
              <div className="surface-hi" style={{ padding:24,borderRadius:16,height:"100%",position:"relative" }}>
                <div style={{ position:"absolute",bottom:0,left:20,right:20,height:1,background:`linear-gradient(90deg,transparent,${f.c}45,transparent)` }} />
                <div style={{ width:46,height:46,borderRadius:12,marginBottom:14,background:`${f.c}14`,border:`1px solid ${f.c}28`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <f.icon size={20} color={f.c} />
                </div>
                <h3 className="oxanium" style={{ fontSize:14.5,fontWeight:700,marginBottom:7,color:"#e8eaf6" }}>{f.t}</h3>
                <p style={{ fontSize:13.5,color:"#4a5568",lineHeight:1.65 }}>{f.d}</p>
              </div>
            </Tilt>
          ))}
        </div>
      </section>

      {/* ── PRICING */}
      <section style={{ padding:"70px max(24px,5vw)",background:"rgba(255,255,255,.012)" }}>
        <div style={{ maxWidth:960,margin:"0 auto" }}>
          <h2 className="oxanium" style={{ textAlign:"center",fontSize:"clamp(26px,4vw,38px)",fontWeight:800,marginBottom:48 }}>
            <span className="neon-g">Transparent</span> Pricing
          </h2>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:18 }}>
            {[
              { name:"Free", price:"$0",  per:"/forever", features:["5 subscriptions","7-day alerts","Basic analytics","Manual entry"],                pop:false },
              { name:"Pro",  price:"$7",  per:"/month",   features:["Unlimited subs","1·3·7 day alerts","Advanced analytics","Email+SMS","Email scan"], pop:true  },
              { name:"Team", price:"$19", per:"/month",   features:["All Pro features","5 members","Shared dashboard","Priority support","API access"],  pop:false },
            ].map(p=>(
              <Tilt key={p.name} max={11} style={{ borderRadius:18 }}>
                <div className="surface-hi" style={{ padding:28,borderRadius:18,position:"relative",overflow:"hidden",border:p.pop?"1px solid rgba(0,255,135,.22)":"1px solid rgba(255,255,255,.06)" }}>
                  {p.pop && <>
                    <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#00ff87,#06b6d4)" }} />
                    <div style={{ position:"absolute",top:14,right:14,background:"rgba(0,255,135,.1)",border:"1px solid rgba(0,255,135,.25)",borderRadius:99,padding:"2px 9px",fontSize:10,color:"#00ff87",fontWeight:800 }}>POPULAR</div>
                  </>}
                  <div style={{ fontSize:11,color:"#4a5568",fontWeight:700,letterSpacing:".07em",textTransform:"uppercase",marginBottom:6 }}>{p.name}</div>
                  <div style={{ marginBottom:20 }}>
                    <span className="oxanium" style={{ fontSize:36,fontWeight:800,color:"#e8eaf6" }}>{p.price}</span>
                    <span style={{ fontSize:12.5,color:"#4a5568",marginLeft:4 }}>{p.per}</span>
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:22 }}>
                    {p.features.map(f=>(
                      <div key={f} style={{ display:"flex",gap:9,alignItems:"center" }}>
                        <div style={{ width:16,height:16,borderRadius:"50%",flexShrink:0,background:p.pop?"rgba(0,255,135,.14)":"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                          <Check size={9} color={p.pop?"#00ff87":"#4a5568"} />
                        </div>
                        <span style={{ fontSize:13,color:"#94a3b8" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={onStart} className={p.pop?"btn-neon":"btn-ghost"}
                    style={{ width:"100%",padding:"10px",borderRadius:10,fontSize:13,fontWeight:700 }}>
                    {p.pop?"Start Free Trial":p.name==="Free"?"Get Started":"Contact Sales"}
                  </button>
                </div>
              </Tilt>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA */}
      <section style={{ padding:"80px max(24px,5vw)",textAlign:"center" }}>
        <div style={{ maxWidth:540,margin:"0 auto",padding:48,background:"linear-gradient(135deg,rgba(0,255,135,.05),rgba(6,182,212,.05))",border:"1px solid rgba(0,255,135,.12)",borderRadius:22,position:"relative",overflow:"hidden" }}>
          <div style={{ position:"absolute",inset:0,background:"radial-gradient(circle at 50% 0%,rgba(0,255,135,.07),transparent 60%)",pointerEvents:"none" }} />
          <h2 className="oxanium" style={{ fontSize:"clamp(24px,4vw,36px)",fontWeight:800,marginBottom:12,position:"relative" }}>
            Kill Your <span className="neon-g">Subscription Ghosts</span>
          </h2>
          <p style={{ color:"#4a5568",marginBottom:28,fontSize:14.5,lineHeight:1.7,position:"relative" }}>Users save $187/year on average. Takes 2 minutes to set up.</p>
          <button className="btn-neon" onClick={onStart} style={{ padding:"13px 36px",borderRadius:12,fontSize:15,fontWeight:700,boxShadow:"0 0 40px rgba(0,255,135,.28)",position:"relative" }}>
            Get Started Free <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* ── FOOTER */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,.04)",padding:"22px max(24px,5vw)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
        <Logo size={26} fs={14} />
        <div style={{ display:"flex",gap:22 }}>
          {["Privacy","Terms","GitHub","Contact"].map(l=>(
            <button key={l} style={{ background:"none",border:"none",color:"#374151",cursor:"pointer",fontSize:12.5,transition:"color .2s" }}
              onMouseEnter={e=>e.target.style.color="#94a3b8"} onMouseLeave={e=>e.target.style.color="#374151"}>{l}</button>
          ))}
        </div>
        <span style={{ fontSize:12,color:"#374151" }}>© 2025 SubscriptionGhost</span>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AUTH
═══════════════════════════════════════════════════════════════ */
function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:"",email:"demo@ghost.app",pw:"demo1234" });
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const cardRef = useRef(null);
  const { x, y, gx, gy } = useTilt(cardRef, 10);
  const submit = () => { if(!form.email||!form.pw) return; setLoading(true); setTimeout(()=>{ setLoading(false); onAuth(); },900); };

  return (
    <div style={{ minHeight:"100vh",background:"#020510",display:"flex",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden" }}>
      <Particles />
      <div className="pg-wrap"><div className="pg-plane" /></div>
      <div style={{ position:"absolute",width:500,height:500,borderRadius:"50%",top:"5%",left:"-5%",pointerEvents:"none",background:"radial-gradient(circle,rgba(0,255,135,.06),transparent 65%)" }} />
      <div style={{ position:"absolute",width:420,height:420,borderRadius:"50%",bottom:"10%",right:"-5%",pointerEvents:"none",background:"radial-gradient(circle,rgba(6,182,212,.07),transparent 65%)" }} />

      <div ref={cardRef} style={{ perspective:"1000px",width:"100%",maxWidth:400,position:"relative",zIndex:2 }}>
        <div className="a-scale scene-3d" style={{ transform:`rotateX(${x}deg) rotateY(${y}deg)`,transition:"transform .1s ease-out" }}>
          <div style={{ position:"absolute",inset:0,borderRadius:22,background:`radial-gradient(circle at ${gx}% ${gy}%,rgba(255,255,255,.065),transparent 55%)`,pointerEvents:"none",zIndex:1 }} />
          <div className="surface-hi" style={{ borderRadius:22,padding:"34px 30px",position:"relative" }}>
            <div style={{ position:"absolute",top:0,left:"20%",right:"20%",height:1,background:"linear-gradient(90deg,transparent,rgba(0,255,135,.45),transparent)" }} />
            <div style={{ textAlign:"center",marginBottom:26 }}>
              <div style={{ width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,#00ff87,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 12px",boxShadow:"0 0 30px rgba(0,255,135,.32)" }}>👻</div>
              <h1 className="oxanium" style={{ fontSize:21,fontWeight:800,color:"#e8eaf6",marginBottom:4 }}>{mode==="login"?"Welcome back":"Create account"}</h1>
              <p style={{ fontSize:12.5,color:"#4a5568" }}>{mode==="login"?"Sign in to your dashboard":"Start tracking free"}</p>
            </div>
            <div style={{ display:"flex",background:"rgba(255,255,255,.04)",borderRadius:10,padding:3,marginBottom:22 }}>
              {["login","register"].map(m=>(
                <button key={m} onClick={()=>setMode(m)} style={{ flex:1,padding:"7px",borderRadius:8,cursor:"pointer",background:mode===m?"rgba(0,255,135,.1)":"none",border:mode===m?"1px solid rgba(0,255,135,.22)":"1px solid transparent",color:mode===m?"#00ff87":"#4a5568",fontSize:12.5,fontWeight:700,transition:"all .2s" }}>
                  {m==="login"?"Sign In":"Sign Up"}
                </button>
              ))}
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:11 }}>
              {mode==="register" && (
                <div style={{ display:"flex",alignItems:"center",gap:9,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,padding:"10px 13px" }}>
                  <User size={14} color="#374151"/><input type="text" placeholder="Full name" value={form.name} onChange={set("name")} style={{ background:"none",border:"none",color:"#e8eaf6",fontSize:13.5,flex:1,outline:"none" }}/>
                </div>
              )}
              <div style={{ display:"flex",alignItems:"center",gap:9,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,padding:"10px 13px" }}>
                <Mail size={14} color="#374151"/><input type="email" placeholder="Email address" value={form.email} onChange={set("email")} style={{ background:"none",border:"none",color:"#e8eaf6",fontSize:13.5,flex:1,outline:"none" }}/>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:9,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,padding:"10px 13px" }}>
                <Lock size={14} color="#374151"/>
                <input type={showPw?"text":"password"} placeholder="Password" value={form.pw} onChange={set("pw")} style={{ background:"none",border:"none",color:"#e8eaf6",fontSize:13.5,flex:1,outline:"none" }}/>
                <button onClick={()=>setShowPw(!showPw)} style={{ background:"none",border:"none",cursor:"pointer",color:"#374151",padding:0,display:"flex" }}>{showPw?<EyeOff size={14}/>:<Eye size={14}/>}</button>
              </div>
            </div>
            <button className="btn-neon" onClick={submit} style={{ width:"100%",padding:13,borderRadius:11,fontSize:14.5,fontWeight:700,marginTop:18,opacity:loading?.82:1 }}>
              {loading?<><Spin/>Signing in…</>:<>{mode==="login"?"Sign In":"Create Account"}<ChevronRight size={15}/></>}
            </button>
            <p style={{ textAlign:"center",fontSize:11,color:"#374151",marginTop:12 }}>Demo credentials pre-filled</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════════ */
function Sidebar({ page, setPage, open, setOpen }) {
  const NAV = [
    { id:"dashboard",     icon:Home,      label:"Dashboard"     },
    { id:"subscriptions", icon:CreditCard,label:"Subscriptions" },
    { id:"alerts",        icon:Bell,      label:"Alerts", badge:3 },
    { id:"analytics",     icon:BarChart2, label:"Analytics"     },
    { id:"settings",      icon:Settings,  label:"Settings"      },
  ];
  return (
    <>
      {open && <div onClick={()=>setOpen(false)} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)",zIndex:48 }} />}
      <aside className={`sb-wrap ${open?"open":""}`} style={{ width:220,background:"#040816",borderRight:"1px solid rgba(255,255,255,.045)",display:"flex",flexDirection:"column",padding:"20px 12px",zIndex:50,overflowY:"auto" }}>
        <div style={{ marginBottom:28,paddingLeft:4 }}><Logo size={28} fs={15} /></div>
        <nav style={{ flex:1,display:"flex",flexDirection:"column",gap:2 }}>
          {NAV.map(({ id,icon:Icon,label,badge })=>(
            <button key={id} className={`nav-link ${page===id?"active":""}`} onClick={()=>{ setPage(id); setOpen(false); }}>
              <div style={{ transform:page===id?"perspective(180px) rotateY(-18deg) translateZ(5px)":"none",transition:"transform .3s cubic-bezier(.22,1,.36,1)" }}>
                <Icon size={15}/>
              </div>
              <span style={{ flex:1 }}>{label}</span>
              {badge && <span style={{ background:"#f87171",color:"white",borderRadius:99,padding:"1px 5px",fontSize:9.5,fontWeight:900 }}>{badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{ display:"flex",alignItems:"center",gap:9,padding:"10px 8px",marginTop:16,borderTop:"1px solid rgba(255,255,255,.045)" }}>
          <div style={{ width:30,height:30,borderRadius:"50%",flexShrink:0,background:"linear-gradient(135deg,#00ff87,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#020510",boxShadow:"0 0 12px rgba(0,255,135,.32)" }}>JD</div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:12.5,fontWeight:600,color:"#e8eaf6",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>John Doe</div>
            <div style={{ fontSize:10.5,color:"#00ff87",fontWeight:600 }}>Pro Plan</div>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3D STAT CARD
═══════════════════════════════════════════════════════════════ */
function StatCard({ label, value, sub, icon:Icon, color, delay="0s" }) {
  const ref = useRef(null);
  const { x, y, gx, gy } = useTilt(ref, 18);
  return (
    <div ref={ref} className="a-up" style={{ perspective:"800px",animationDelay:delay }}>
      <div className="scene-3d" style={{ transform:`rotateX(${x}deg) rotateY(${y}deg)`,transition:"transform .1s ease-out" }}>
        <div className="surface-hi" style={{ padding:"18px 20px",borderRadius:14,overflow:"hidden",position:"relative",cursor:"default" }}>
          <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${color},${color}33)` }} />
          <div style={{ position:"absolute",inset:0,borderRadius:14,background:`radial-gradient(circle at ${gx}% ${gy}%,rgba(255,255,255,.065),transparent 55%)`,pointerEvents:"none",transition:"background .08s" }} />
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
            <span style={{ fontSize:10.5,color:"#4a5568",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em" }}>{label}</span>
            <div style={{ width:32,height:32,borderRadius:9,background:`${color}14`,border:`1px solid ${color}25`,display:"flex",alignItems:"center",justifyContent:"center",transform:"perspective(180px) translateZ(6px)",boxShadow:`0 4px 14px ${color}1a` }}>
              <Icon size={15} color={color}/>
            </div>
          </div>
          <div className="oxanium" style={{ fontSize:26,fontWeight:800,color:"#e8eaf6",marginBottom:4,textShadow:`0 0 22px ${color}28` }}>{value}</div>
          <div style={{ fontSize:11,color:"#4a5568" }}>{sub}</div>
          <div style={{ position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${color}44,transparent)` }} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FLIP SUBSCRIPTION CARD
═══════════════════════════════════════════════════════════════ */
function FlipCard({ sub, onDelete, idx }) {
  const ss = ST[sub.status]||ST.active;
  const pct = Math.max(4, Math.min(100, (30-sub.days)/30*100));
  return (
    <div className="flip-card" style={{ perspective:"1000px",animation:`fadeUp .5s cubic-bezier(.22,1,.36,1) ${idx*.05}s both`,borderRadius:15 }}>
      <div className="flip-inner" style={{ borderRadius:15,minHeight:200 }}>
        {/* FRONT */}
        <div className="flip-front surface-hi" style={{ padding:20,borderRadius:15,position:"relative",overflow:"hidden" }}>
          <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${sub.color},${sub.color}22)` }} />
          <div style={{ position:"absolute",left:0,right:0,height:40,background:`linear-gradient(transparent,${sub.color}04,transparent)`,animation:"scanline 5s linear infinite",pointerEvents:"none" }} />
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 }}>
            <SubIcon sub={sub} size={42} r={11}/>
            <Pill status={sub.status}/>
          </div>
          <div className="oxanium" style={{ fontSize:16,fontWeight:700,color:"#e8eaf6",marginBottom:2 }}>{sub.name}</div>
          <div style={{ fontSize:12,color:"#4a5568",marginBottom:14 }}>{sub.cat} · {sub.billing}</div>
          <div style={{ marginBottom:14 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
              <span style={{ fontSize:11,color:"#4a5568" }}>Next {sub.next}</span>
              <span style={{ fontSize:11,fontWeight:600,color:ss.c }}>{sub.days<=0?"Today":sub.days===1?"1 day":`${sub.days} days`}</span>
            </div>
            <div className="pbar"><div className="pfill" style={{ width:`${pct}%`,background:`linear-gradient(90deg,${ss.c},${ss.c}88)` }}/></div>
          </div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div>
              <span className="oxanium" style={{ fontSize:22,fontWeight:800,color:"#e8eaf6" }}>${sub.price}</span>
              <span style={{ fontSize:12,color:"#4a5568" }}>/mo</span>
            </div>
            <span style={{ fontSize:10.5,color:"#374151",fontStyle:"italic" }}>hover for details ↩</span>
          </div>
        </div>
        {/* BACK */}
        <div className="flip-back" style={{
          padding:20,borderRadius:15,
          background:"rgba(6,12,26,.98)",border:`1px solid ${sub.color}38`,
          display:"flex",flexDirection:"column",justifyContent:"space-between",
          position:"absolute",inset:0,
        }}>
          <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${sub.color},transparent)` }} />
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
              <SubIcon sub={sub} size={34} r={9}/>
              <div>
                <div className="oxanium" style={{ fontSize:14.5,fontWeight:700,color:"#e8eaf6" }}>{sub.name}</div>
                <div style={{ fontSize:11.5,color:ss.c,fontWeight:600 }}>{ss.label}</div>
              </div>
            </div>
            {[
              ["Monthly cost", `$${sub.price}`],
              ["Annual cost",  `$${(sub.price*12).toFixed(2)}`],
              ["Category",     sub.cat],
              ["Next renewal", sub.next],
              ["Days left",    sub.days<=0?"Today!":sub.days===1?"Tomorrow":`${sub.days} days`],
            ].map(([l,v])=>(
              <div key={l} style={{ display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                <span style={{ fontSize:12,color:"#4a5568" }}>{l}</span>
                <span style={{ fontSize:12,fontWeight:600,color:"#e8eaf6" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex",gap:8,marginTop:14 }}>
            <button style={{ flex:1,padding:"9px",borderRadius:9,cursor:"pointer",background:`${sub.color}14`,border:`1px solid ${sub.color}30`,color:sub.color,fontSize:12.5,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
              <Edit2 size={11}/> Edit
            </button>
            <button onClick={onDelete} style={{ flex:1,padding:"9px",borderRadius:9,cursor:"pointer",background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.25)",color:"#f87171",fontSize:12.5,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
              <Trash2 size={11}/> Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADD MODAL
═══════════════════════════════════════════════════════════════ */
function AddModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name:"",cat:"Entertainment",price:"",billing:"monthly",next:"" });
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const submit = () => {
    if(!form.name.trim()||!form.price) return;
    const COLORS = ["#00ff87","#bf5af2","#06b6d4","#fbbf24","#f87171","#34d399","#5e6ad2"];
    const color = COLORS[Math.floor(Math.random()*COLORS.length)];
    onAdd({ id:Date.now(),name:form.name.trim(),cat:form.cat,price:parseFloat(form.price),billing:form.billing,color,bg:`${color}14`,init:form.name.trim().slice(0,3).toUpperCase(),next:form.next||"Jun 30",days:30,status:"active" });
    onClose();
  };
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.82)",backdropFilter:"blur(16px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:24 }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="a-scale surface-hi" style={{ width:"100%",maxWidth:420,borderRadius:20,padding:30,position:"relative" }}>
        <div style={{ position:"absolute",top:0,left:"15%",right:"15%",height:1,background:"linear-gradient(90deg,transparent,rgba(0,255,135,.52),transparent)" }} />
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
          <h2 className="oxanium" style={{ fontSize:19,fontWeight:800,color:"#e8eaf6" }}>Add Subscription</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"#4a5568",padding:4 }}><X size={16}/></button>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
          {[{ l:"Service Name",key:"name",type:"text",ph:"e.g. Netflix" },{ l:"Monthly Price ($)",key:"price",type:"number",ph:"0.00" },{ l:"Next Renewal",key:"next",type:"date",ph:"" }].map(f=>(
            <div key={f.key}>
              <label style={{ fontSize:10.5,fontWeight:700,color:"#4a5568",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:".06em" }}>{f.l}</label>
              <input className="field" type={f.type} placeholder={f.ph} value={form[f.key]} onChange={set(f.key)} style={{ width:"100%",padding:"9px 12px" }}/>
            </div>
          ))}
          {[{ l:"Category",key:"cat",opts:["Entertainment","Music","Cloud","Design","Dev","Productivity","Health","Finance","Other"] },{ l:"Billing",key:"billing",opts:["monthly","quarterly","annually"] }].map(f=>(
            <div key={f.key}>
              <label style={{ fontSize:10.5,fontWeight:700,color:"#4a5568",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:".06em" }}>{f.l}</label>
              <select className="field" value={form[f.key]} onChange={set(f.key)} style={{ width:"100%",padding:"9px 12px" }}>
                {f.opts.map(o=><option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div style={{ display:"flex",gap:10,marginTop:22 }}>
          <button className="btn-ghost" onClick={onClose} style={{ flex:1,padding:11,borderRadius:10,fontSize:13.5,fontWeight:600 }}>Cancel</button>
          <button className="btn-neon" onClick={submit} style={{ flex:1,padding:11,borderRadius:10,fontSize:13.5,fontWeight:700 }}>Add</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════ */
function Dashboard({ setPage, subs }) {
  const total = subs.reduce((s,x)=>s+x.price,0);
  const urgent = subs.filter(s=>s.status==="urgent"||s.status==="overdue");
  return (
    <div style={{ padding:"28px",maxWidth:1180 }}>
      <div style={{ marginBottom:26 }}>
        <h1 className="oxanium a-left" style={{ fontSize:24,fontWeight:800,color:"#e8eaf6" }}>Dashboard</h1>
        <p className="a-left" style={{ color:"#4a5568",fontSize:13.5,marginTop:3,animationDelay:".06s" }}>
          Good morning, John —{" "}
          <span style={{ color:"#fbbf24" }}>{urgent.length} renewal{urgent.length!==1?"s":""}</span>{" "}need attention.
        </p>
      </div>

      {/* 3D Stat Cards */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(185px,1fr))",gap:14,marginBottom:22 }}>
        <StatCard label="Monthly Spend"  value={`$${total.toFixed(2)}`}       sub="+5.2% vs last month" icon={DollarSign} color="#00ff87" delay=".06s"/>
        <StatCard label="Active Subs"    value={subs.length}                  sub="2 added this month"  icon={CreditCard} color="#bf5af2" delay=".12s"/>
        <StatCard label="Renewing Soon"  value={urgent.length}                sub="Next 7 days"         icon={Calendar}   color="#fbbf24" delay=".18s"/>
        <StatCard label="Annual Burn"    value={`$${(total*12).toFixed(0)}`}  sub="Projected total"     icon={TrendingUp} color="#06b6d4" delay=".24s"/>
      </div>

      {/* Charts */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr minmax(220px,305px)",gap:16,marginBottom:16 }}>
        <Tilt max={5} style={{ borderRadius:16 }} className="a-up">
          <div className="surface-hi" style={{ padding:22,borderRadius:16,height:"100%",position:"relative" }}>
            <div style={{ position:"absolute",top:0,left:"20%",right:"20%",height:1,background:"linear-gradient(90deg,transparent,rgba(0,255,135,.42),transparent)" }} />
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18 }}>
              <div>
                <div style={{ fontSize:14,fontWeight:700,color:"#e8eaf6" }}>Monthly Spending</div>
                <div style={{ fontSize:12,color:"#4a5568",marginTop:2 }}>6-month trend</div>
              </div>
              <span style={{ background:"rgba(0,255,135,.1)",color:"#00ff87",padding:"3px 9px",borderRadius:99,fontSize:11,fontWeight:700 }}>↑ 5.2%</span>
            </div>
            <ResponsiveContainer width="100%" height={165}>
              <AreaChart data={TREND} margin={{ top:4,right:4,left:-22,bottom:0 }}>
                <defs>
                  <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00ff87" stopOpacity={.2}/>
                    <stop offset="95%" stopColor="#00ff87" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false}/>
                <XAxis dataKey="m" tick={{ fill:"#4a5568",fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:"#4a5568",fontSize:11 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTip/>}/>
                <Area type="monotone" dataKey="v" stroke="#00ff87" strokeWidth={2} fill="url(#ag1)" dot={{ fill:"#00ff87",r:3,strokeWidth:0 }} activeDot={{ r:5,fill:"#00ff87" }}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Tilt>

        <Tilt max={8} style={{ borderRadius:16 }} className="a-up">
          <div className="surface-hi" style={{ padding:22,borderRadius:16,height:"100%",position:"relative" }}>
            <div style={{ position:"absolute",top:0,left:"15%",right:"15%",height:1,background:"linear-gradient(90deg,transparent,rgba(191,90,242,.42),transparent)" }} />
            <div style={{ fontSize:14,fontWeight:700,color:"#e8eaf6",marginBottom:2 }}>By Category</div>
            <div style={{ fontSize:12,color:"#4a5568",marginBottom:8 }}>Monthly share</div>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={CATS} cx="50%" cy="50%" innerRadius={36} outerRadius={58} paddingAngle={3} dataKey="v">
                  {CATS.map((e,i)=><Cell key={i} fill={e.c}/>)}
                </Pie>
                <Tooltip formatter={v=>[`$${v.toFixed(2)}`,"Spend"]} contentStyle={{ background:"rgba(5,10,22,.97)",border:"1px solid rgba(0,255,135,.15)",borderRadius:8,fontSize:11.5 }}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:"flex",flexDirection:"column",gap:5,marginTop:4 }}>
              {CATS.map(c=>(
                <div key={c.name} style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div style={{ display:"flex",gap:7,alignItems:"center" }}>
                    <div style={{ width:6,height:6,borderRadius:2,background:c.c,flexShrink:0 }}/>
                    <span style={{ fontSize:11.5,color:"#6b7280" }}>{c.name}</span>
                  </div>
                  <span className="oxanium" style={{ fontSize:11.5,fontWeight:700,color:"#e8eaf6" }}>${c.v.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </Tilt>
      </div>

      {/* Urgent alerts */}
      {urgent.length>0 && (
        <div className="a-up surface" style={{ padding:18,borderRadius:14,marginBottom:16,border:"1px solid rgba(248,113,113,.15)",background:"rgba(248,113,113,.03)" }}>
          <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:12 }}>
            <AlertTriangle size={14} color="#f87171"/>
            <span style={{ fontSize:13,fontWeight:700,color:"#f87171" }}>Action Required</span>
            <span style={{ background:"rgba(248,113,113,.12)",color:"#f87171",padding:"1px 7px",borderRadius:99,fontSize:10,fontWeight:900 }}>{urgent.length}</span>
          </div>
          {urgent.map(s=>(
            <div key={s.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",borderRadius:10,background:"rgba(248,113,113,.05)",border:"1px solid rgba(248,113,113,.1)",marginBottom:6 }}>
              <div style={{ display:"flex",gap:9,alignItems:"center" }}>
                <SubIcon sub={s} size={28} r={7}/>
                <div>
                  <div style={{ fontSize:13,fontWeight:600,color:"#e8eaf6" }}>{s.name}</div>
                  <div style={{ fontSize:11,color:"#4a5568" }}>Renews {s.next}</div>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div className="oxanium" style={{ fontSize:14,fontWeight:700,color:"#e8eaf6" }}>${s.price}/mo</div>
                <div style={{ fontSize:11,fontWeight:600,color:s.days<=1?"#f87171":"#fbbf24" }}>{s.days<=0?"Today":s.days===1?"Tomorrow":`${s.days}d`}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All subs mini list */}
      <div className="a-up surface" style={{ padding:20,borderRadius:14 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
          <div style={{ fontSize:14,fontWeight:700,color:"#e8eaf6" }}>All Subscriptions</div>
          <button onClick={()=>setPage("subscriptions")} style={{ background:"none",border:"none",color:"#00ff87",fontSize:12.5,cursor:"pointer",fontWeight:600 }}>View all →</button>
        </div>
        {subs.slice(0,7).map(s=>(
          <div key={s.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderRadius:9,transition:"background .18s",cursor:"default" }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(0,255,135,.03)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{ display:"flex",gap:10,alignItems:"center" }}>
              <SubIcon sub={s} size={32} r={8}/>
              <div>
                <div style={{ fontSize:13.5,fontWeight:600,color:"#e8eaf6" }}>{s.name}</div>
                <div style={{ fontSize:11,color:"#4a5568" }}>{s.cat} · {s.billing}</div>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div className="oxanium" style={{ fontSize:13.5,fontWeight:700,color:"#e8eaf6" }}>${s.price}/mo</div>
              <div style={{ fontSize:11,color:"#4a5568" }}>{s.next}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUBSCRIPTIONS PAGE (flip grid)
═══════════════════════════════════════════════════════════════ */
function Subscriptions({ subs, setSubs }) {
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const cats = useMemo(()=>["All",...new Set(subs.map(s=>s.cat))],[subs]);
  const shown = subs.filter(s=>{
    const q=query.toLowerCase();
    return (s.name.toLowerCase().includes(q)||s.cat.toLowerCase().includes(q))&&(filter==="All"||s.cat===filter);
  });

  return (
    <div style={{ padding:"28px",maxWidth:1180 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:14 }}>
        <div>
          <h1 className="oxanium a-left" style={{ fontSize:24,fontWeight:800,color:"#e8eaf6" }}>Subscriptions</h1>
          <p className="a-left" style={{ color:"#4a5568",fontSize:13.5,marginTop:3,animationDelay:".06s" }}>
            {subs.length} active · ${subs.reduce((s,x)=>s+x.price,0).toFixed(2)}/mo
            <span style={{ color:"#374151",marginLeft:8,fontSize:12 }}>· Hover cards to reveal details</span>
          </p>
        </div>
        <button className="btn-neon" onClick={()=>setShowAdd(true)} style={{ padding:"9px 18px",borderRadius:10,fontSize:13,fontWeight:700 }}>
          <Plus size={14}/> Add Subscription
        </button>
      </div>

      <div style={{ display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:9,padding:"7px 13px",flex:"1 1 180px" }}>
          <Search size={13} color="#374151"/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search…" style={{ background:"none",border:"none",color:"#e8eaf6",fontSize:13.5,flex:1,outline:"none" }}/>
          {query && <button onClick={()=>setQuery("")} style={{ background:"none",border:"none",cursor:"pointer",color:"#374151",padding:0 }}><X size={12}/></button>}
        </div>
        <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setFilter(c)} style={{ padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",border:filter===c?"1px solid rgba(0,255,135,.25)":"1px solid rgba(255,255,255,.07)",background:filter===c?"rgba(0,255,135,.09)":"rgba(255,255,255,.04)",color:filter===c?"#00ff87":"#4a5568",transition:"all .18s" }}>{c}</button>
          ))}
        </div>
        <div style={{ display:"flex",gap:3,background:"rgba(255,255,255,.04)",borderRadius:8,padding:3 }}>
          {[{ id:"grid",I:Grid },{ id:"list",I:List }].map(({ id,I })=>(
            <button key={id} onClick={()=>setView(id)} style={{ padding:"5px 9px",borderRadius:6,cursor:"pointer",background:view===id?"rgba(0,255,135,.14)":"none",border:"none",color:view===id?"#00ff87":"#4a5568",transition:"all .2s" }}><I size={14}/></button>
          ))}
        </div>
      </div>

      {view==="grid" ? (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(238px,1fr))",gap:14 }}>
          {shown.map((s,i)=><FlipCard key={s.id} sub={s} idx={i} onDelete={()=>setSubs(p=>p.filter(x=>x.id!==s.id))}/>)}
          {shown.length===0 && (
            <div style={{ gridColumn:"1/-1",textAlign:"center",padding:"60px 0",color:"#374151" }}>
              <Search size={40} style={{ margin:"0 auto 12px",opacity:.3 }}/>
              <div style={{ fontSize:15,fontWeight:600,color:"#4a5568" }}>No results found</div>
            </div>
          )}
        </div>
      ) : (
        <div className="surface" style={{ borderRadius:14,overflow:"hidden" }}>
          <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 100px 48px",padding:"10px 18px",fontSize:10,fontWeight:800,color:"#374151",textTransform:"uppercase",letterSpacing:".07em",borderBottom:"1px solid rgba(255,255,255,.05)" }}>
            {["Service","Category","Renews","Price/mo","Status",""].map(h=><span key={h}>{h}</span>)}
          </div>
          {shown.map((s,i)=>(
            <div key={s.id} style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 100px 48px",padding:"11px 18px",alignItems:"center",borderBottom:i<shown.length-1?"1px solid rgba(255,255,255,.04)":"none",transition:"background .18s" }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(0,255,135,.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{ display:"flex",gap:9,alignItems:"center" }}>
                <SubIcon sub={s} size={28} r={7}/>
                <span style={{ fontSize:13.5,fontWeight:600,color:"#e8eaf6" }}>{s.name}</span>
              </div>
              <span style={{ fontSize:12.5,color:"#4a5568" }}>{s.cat}</span>
              <span style={{ fontSize:12.5,color:"#e8eaf6" }}>{s.next}</span>
              <span className="oxanium" style={{ fontSize:13.5,fontWeight:700,color:"#e8eaf6" }}>${s.price}</span>
              <Pill status={s.status}/>
              <button onClick={()=>setSubs(p=>p.filter(x=>x.id!==s.id))} style={{ width:28,height:28,borderRadius:7,background:"rgba(248,113,113,.08)",border:"1px solid rgba(248,113,113,.18)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><Trash2 size={11} color="#f87171"/></button>
            </div>
          ))}
        </div>
      )}
      {showAdd && <AddModal onClose={()=>setShowAdd(false)} onAdd={s=>setSubs(p=>[...p,s])}/>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ALERTS
═══════════════════════════════════════════════════════════════ */
function AlertsPage() {
  const [alerts, setAlerts] = useState(ALERTS_SEED);
  const unread = alerts.filter(a=>!a.read).length;
  return (
    <div style={{ padding:"28px",maxWidth:740 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:26 }}>
        <div>
          <h1 className="oxanium a-left" style={{ fontSize:24,fontWeight:800,color:"#e8eaf6" }}>Alerts</h1>
          <p className="a-left" style={{ color:"#4a5568",fontSize:13.5,marginTop:3,animationDelay:".06s" }}>{unread} unread · {alerts.length} total</p>
        </div>
        {unread>0 && <button className="btn-ghost" onClick={()=>setAlerts(p=>p.map(a=>({...a,read:true})))} style={{ padding:"7px 14px",borderRadius:8,fontSize:12.5 }}>Mark all read</button>}
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
        {alerts.map((a,i)=>{
          const as=AT[a.type]||AT.info;
          return (
            <div key={a.id} style={{ display:"flex",gap:13,alignItems:"flex-start",padding:"14px 18px",borderRadius:13,background:a.read?"rgba(255,255,255,.018)":as.bg,border:`1px solid ${a.read?"rgba(255,255,255,.05)":as.bd}`,opacity:a.read?.65:1,animation:`fadeUp .4s cubic-bezier(.22,1,.36,1) ${i*.05}s both`,transition:"all .25s",position:"relative",overflow:"hidden" }}>
              {!a.read && <div style={{ position:"absolute",left:0,top:0,bottom:0,width:2,background:`linear-gradient(180deg,${as.c},${as.c}44)` }}/>}
              <div style={{ fontSize:20,lineHeight:1,marginTop:1,flexShrink:0 }}>{a.emoji}</div>
              <div style={{ flex:1,minWidth:0 }}>
                {!a.read && <span className="badge" style={{ background:as.bg,color:as.c,border:`1px solid ${as.bd}`,display:"inline-flex",marginBottom:5 }}>{as.label}</span>}
                <div style={{ fontSize:13.5,fontWeight:600,color:"#e8eaf6",marginBottom:3 }}>{a.title}</div>
                <div style={{ fontSize:12,color:"#4a5568" }}>{a.sub}</div>
              </div>
              <div style={{ display:"flex",gap:5,flexShrink:0 }}>
                {!a.read && <button onClick={()=>setAlerts(p=>p.map(x=>x.id===a.id?{...x,read:true}:x))} style={{ width:28,height:28,borderRadius:7,background:"rgba(0,255,135,.09)",border:"1px solid rgba(0,255,135,.22)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><CheckCircle size={12} color="#00ff87"/></button>}
                <button onClick={()=>setAlerts(p=>p.filter(x=>x.id!==a.id))} style={{ width:28,height:28,borderRadius:7,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><X size={12} color="#4a5568"/></button>
              </div>
            </div>
          );
        })}
      </div>
      {alerts.length===0 && (
        <div style={{ textAlign:"center",padding:"80px 0",color:"#374151" }}>
          <CheckCircle size={44} style={{ margin:"0 auto 14px",opacity:.25 }}/>
          <div style={{ fontSize:15,fontWeight:600,color:"#4a5568" }}>All clear!</div>
          <div style={{ fontSize:13,marginTop:5 }}>We'll alert you before any subscription renews.</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ANALYTICS
═══════════════════════════════════════════════════════════════ */
function Analytics({ subs }) {
  const sorted = [...subs].sort((a,b)=>b.price-a.price);
  return (
    <div style={{ padding:"28px",maxWidth:1180 }}>
      <div style={{ marginBottom:26 }}>
        <h1 className="oxanium a-left" style={{ fontSize:24,fontWeight:800,color:"#e8eaf6" }}>Analytics</h1>
        <p className="a-left" style={{ color:"#4a5568",fontSize:13.5,marginTop:3,animationDelay:".06s" }}>Deep-dive into spending patterns.</p>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:16,marginBottom:16 }}>
        <Tilt max={5} style={{ borderRadius:16 }} className="a-up">
          <div className="surface-hi" style={{ padding:22,borderRadius:16,position:"relative" }}>
            <div style={{ position:"absolute",top:0,left:"15%",right:"15%",height:1,background:"linear-gradient(90deg,transparent,rgba(6,182,212,.42),transparent)" }}/>
            <div style={{ fontSize:14,fontWeight:700,color:"#e8eaf6",marginBottom:3 }}>Monthly Trend</div>
            <div style={{ fontSize:12,color:"#4a5568",marginBottom:16 }}>6-month overview</div>
            <ResponsiveContainer width="100%" height={198}>
              <BarChart data={TREND} barSize={30} margin={{ top:4,right:4,left:-22,bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false}/>
                <XAxis dataKey="m" tick={{ fill:"#4a5568",fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:"#4a5568",fontSize:11 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTip/>}/>
                <Bar dataKey="v" radius={[5,5,0,0]}>
                  {TREND.map((_,i)=><Cell key={i} fill={`hsl(${170+i*12},90%,${48+i*3}%)`}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Tilt>
        <Tilt max={8} style={{ borderRadius:16 }} className="a-up">
          <div className="surface-hi" style={{ padding:22,borderRadius:16,position:"relative" }}>
            <div style={{ position:"absolute",top:0,left:"15%",right:"15%",height:1,background:"linear-gradient(90deg,transparent,rgba(0,255,135,.42),transparent)" }}/>
            <div style={{ fontSize:14,fontWeight:700,color:"#e8eaf6",marginBottom:16 }}>Top Spenders</div>
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              {sorted.slice(0,6).map((s,i)=>(
                <div key={s.id} style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontSize:11,color:"#374151",width:14,textAlign:"right",flexShrink:0 }}>{i+1}</span>
                  <SubIcon sub={s} size={24} r={6}/>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:12,fontWeight:600,color:"#e8eaf6",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{s.name}</div>
                    <div className="pbar"><div className="pfill" style={{ width:`${Math.min(100,(s.price/sorted[0].price)*100)}%`,background:`linear-gradient(90deg,${s.color},${s.color}66)` }}/></div>
                  </div>
                  <span className="oxanium" style={{ fontSize:12.5,fontWeight:700,color:"#e8eaf6",flexShrink:0 }}>${s.price}</span>
                </div>
              ))}
            </div>
          </div>
        </Tilt>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1.5fr",gap:16 }}>
        <Tilt max={7} style={{ borderRadius:16 }} className="a-up">
          <div className="surface-hi" style={{ padding:22,borderRadius:16,position:"relative" }}>
            <div style={{ position:"absolute",top:0,left:"15%",right:"15%",height:1,background:"linear-gradient(90deg,transparent,rgba(191,90,242,.42),transparent)" }}/>
            <div style={{ fontSize:14,fontWeight:700,color:"#e8eaf6",marginBottom:3 }}>Category Split</div>
            <div style={{ fontSize:12,color:"#4a5568",marginBottom:8 }}>Monthly share</div>
            <ResponsiveContainer width="100%" height={155}>
              <PieChart>
                <Pie data={CATS} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="v">
                  {CATS.map((e,i)=><Cell key={i} fill={e.c}/>)}
                </Pie>
                <Tooltip formatter={v=>[`$${v.toFixed(2)}`,"Spend"]} contentStyle={{ background:"rgba(5,10,22,.97)",border:"1px solid rgba(0,255,135,.15)",borderRadius:8,fontSize:11.5 }}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 12px" }}>
              {CATS.map(c=>(
                <div key={c.name} style={{ display:"flex",gap:6,alignItems:"center" }}>
                  <div style={{ width:6,height:6,borderRadius:2,background:c.c,flexShrink:0 }}/>
                  <span style={{ fontSize:10.5,color:"#6b7280",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.name}</span>
                  <span className="oxanium" style={{ fontSize:11,fontWeight:700,color:"#e8eaf6",marginLeft:"auto" }}>${c.v.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </Tilt>
        <Tilt max={5} style={{ borderRadius:16 }} className="a-up">
          <div className="surface-hi" style={{ padding:22,borderRadius:16,position:"relative",border:"1px solid rgba(0,255,135,.09)" }}>
            <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#00ff87,#06b6d4,#bf5af2)" }}/>
            <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:16 }}>
              <Sparkles size={15} color="#00ff87"/>
              <div style={{ fontSize:14,fontWeight:700,color:"#e8eaf6" }}>AI Optimizer</div>
              <div style={{ background:"linear-gradient(135deg,#00ff87,#06b6d4)",color:"#020510",padding:"1px 7px",borderRadius:99,fontSize:9,fontWeight:900 }}>AI</div>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
              {[
                { t:"Bundle Netflix + Spotify via carrier",   s:"$4/mo",  hi:true  },
                { t:"Downgrade Adobe CC to Photography plan", s:"$32/mo", hi:true  },
                { t:"Switch Figma to annual billing",         s:"$3/mo",  hi:false },
                { t:"Replace Loom+Notion with ClickUp",       s:"$19/mo", hi:true  },
              ].map((sg,i)=>(
                <div key={i} style={{ padding:"11px 13px",borderRadius:11,background:"rgba(0,255,135,.03)",border:"1px solid rgba(0,255,135,.07)" }}>
                  <div style={{ fontSize:12.5,color:"#94a3b8",marginBottom:7,lineHeight:1.5 }}>{sg.t}</div>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div style={{ display:"flex",gap:7,alignItems:"center" }}>
                      <span style={{ fontSize:12,color:"#00ff87",fontWeight:700 }}>Save {sg.s}</span>
                      <span style={{ fontSize:9,fontWeight:900,padding:"1px 6px",borderRadius:99,textTransform:"uppercase",background:sg.hi?"rgba(248,113,113,.12)":"rgba(251,191,36,.12)",color:sg.hi?"#f87171":"#fbbf24" }}>{sg.hi?"high":"medium"}</span>
                    </div>
                    <button style={{ padding:"4px 11px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",background:"rgba(0,255,135,.09)",border:"1px solid rgba(0,255,135,.22)",color:"#00ff87" }}>Apply</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Tilt>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SETTINGS
═══════════════════════════════════════════════════════════════ */
function SettingsPage() {
  const [cfg, setCfg] = useState({ email:true,sms:false,push:true,digest:false,d7:true,d3:true,d1:true,emailVal:"john@ghost.app",phone:"+1 555 000 0000",currency:"USD" });
  const set = k => v => setCfg(p=>({...p,[k]:v}));
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2200); };

  const Section = ({ icon:Icon, title, color="#00ff87", children }) => (
    <Tilt max={4} style={{ borderRadius:14,marginBottom:14 }} className="a-up">
      <div className="surface-hi" style={{ padding:22,borderRadius:14,position:"relative" }}>
        <div style={{ position:"absolute",top:0,left:"15%",right:"15%",height:1,background:`linear-gradient(90deg,transparent,${color}52,transparent)` }}/>
        <div style={{ display:"flex",gap:9,alignItems:"center",marginBottom:16,paddingBottom:14,borderBottom:"1px solid rgba(255,255,255,.05)" }}>
          <Icon size={15} color={color}/><div style={{ fontSize:14,fontWeight:700,color:"#e8eaf6" }}>{title}</div>
        </div>
        {children}
      </div>
    </Tilt>
  );
  const Row = ({ label, sub, children }) => (
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0" }}>
      <div>
        <div style={{ fontSize:13.5,fontWeight:500,color:"#e8eaf6" }}>{label}</div>
        {sub && <div style={{ fontSize:11.5,color:"#4a5568",marginTop:2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ padding:"28px",maxWidth:640 }}>
      <div style={{ marginBottom:26 }}>
        <h1 className="oxanium a-left" style={{ fontSize:24,fontWeight:800,color:"#e8eaf6" }}>Settings</h1>
        <p className="a-left" style={{ color:"#4a5568",fontSize:13.5,marginTop:3,animationDelay:".06s" }}>Manage notifications and account.</p>
      </div>
      <Section icon={Bell} title="Notification Channels">
        <Row label="Email Alerts"       sub="Sent to your registered address"><Toggle on={cfg.email}  onChange={set("email")} /></Row>
        <Row label="SMS Alerts"         sub="Text message reminders"><Toggle on={cfg.sms}    onChange={set("sms")} /></Row>
        <Row label="Push Notifications" sub="Browser push alerts"><Toggle on={cfg.push}   onChange={set("push")} /></Row>
        <Row label="Weekly Digest"      sub="Summary every Monday"><Toggle on={cfg.digest} onChange={set("digest")} /></Row>
      </Section>
      <Section icon={Clock} title="Alert Timing" color="#06b6d4">
        <Row label="7 days before" sub="Early heads-up"><Toggle on={cfg.d7} onChange={set("d7")} /></Row>
        <Row label="3 days before" sub="Standard warning"><Toggle on={cfg.d3} onChange={set("d3")} /></Row>
        <Row label="1 day before"  sub="Final reminder"><Toggle on={cfg.d1} onChange={set("d1")} /></Row>
      </Section>
      <Section icon={User} title="Account" color="#bf5af2">
        {[{ l:"Email Address",k:"emailVal",t:"email" },{ l:"Phone Number",k:"phone",t:"tel" }].map(f=>(
          <div key={f.k} style={{ marginBottom:14 }}>
            <label style={{ fontSize:10,fontWeight:800,color:"#4a5568",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:".07em" }}>{f.l}</label>
            <input className="field" type={f.t} value={cfg[f.k]} onChange={e=>setCfg(p=>({...p,[f.k]:e.target.value}))} style={{ width:"100%",padding:"9px 12px" }}/>
          </div>
        ))}
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:10,fontWeight:800,color:"#4a5568",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:".07em" }}>Currency</label>
          <select className="field" value={cfg.currency} onChange={e=>setCfg(p=>({...p,currency:e.target.value}))} style={{ width:"100%",padding:"9px 12px" }}>
            {["USD","EUR","GBP","CAD","AUD","JPY"].map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button className="btn-neon" onClick={save} style={{ padding:"10px 24px",borderRadius:10,fontSize:13.5,fontWeight:700 }}>
          {saved?<><Check size={14}/>Saved!</>:"Save Changes"}
        </button>
      </Section>
      <div className="surface" style={{ padding:22,borderRadius:14,border:"1px solid rgba(248,113,113,.14)" }}>
        <div className="oxanium" style={{ fontSize:13.5,fontWeight:700,color:"#f87171",marginBottom:12 }}>Danger Zone</div>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <div style={{ fontSize:13.5,color:"#e8eaf6" }}>Delete Account</div>
            <div style={{ fontSize:11.5,color:"#4a5568",marginTop:2 }}>Permanently remove all data</div>
          </div>
          <button style={{ padding:"7px 14px",borderRadius:8,fontSize:12.5,fontWeight:600,cursor:"pointer",background:"rgba(248,113,113,.09)",border:"1px solid rgba(248,113,113,.22)",color:"#f87171" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   APP SHELL
═══════════════════════════════════════════════════════════════ */
function AppShell() {
  const [page, setPage] = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const [subs, setSubs] = useState(SUBS);
  const [toast, setToast] = useState(null);

  useEffect(()=>{
    const t = setTimeout(()=>{ setToast("Adobe CC renews tomorrow · $54.99"); setTimeout(()=>setToast(null),5500); },2800);
    return ()=>clearTimeout(t);
  },[]);

  const pages = {
    dashboard:     <Dashboard setPage={setPage} subs={subs}/>,
    subscriptions: <Subscriptions subs={subs} setSubs={setSubs}/>,
    alerts:        <AlertsPage/>,
    analytics:     <Analytics subs={subs}/>,
    settings:      <SettingsPage/>,
  };

  return (
    <div style={{ display:"flex",minHeight:"100vh",background:"#020510" }}>
      <Sidebar page={page} setPage={setPage} open={sideOpen} setOpen={setSideOpen}/>
      <div className="main-ml" style={{ flex:1,marginLeft:220,display:"flex",flexDirection:"column",minHeight:"100vh" }}>
        {/* Topbar */}
        <header style={{ height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 26px",position:"sticky",top:0,zIndex:30,background:"rgba(2,5,16,.9)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(255,255,255,.045)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <button className="show-sm" onClick={()=>setSideOpen(true)} style={{ background:"none",border:"none",cursor:"pointer",color:"#4a5568",padding:4 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div style={{ display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:8,padding:"5px 12px",width:200 }}>
              <Search size={12} color="#374151"/>
              <input placeholder="Search…" style={{ background:"none",border:"none",color:"#94a3b8",fontSize:13,flex:1,outline:"none" }}/>
            </div>
          </div>
          <div style={{ display:"flex",gap:8,alignItems:"center" }}>
            <button onClick={()=>setPage("alerts")} style={{ width:34,height:34,borderRadius:8,position:"relative",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>
              <Bell size={14} color="#94a3b8"/>
              <div style={{ position:"absolute",top:7,right:7,width:7,height:7,borderRadius:"50%",background:"#f87171",border:"1.5px solid #020510" }}>
                <div style={{ position:"absolute",inset:"-3px",borderRadius:"50%",border:"1.5px solid rgba(248,113,113,.5)",animation:"pulseRing 2s ease-out infinite" }}/>
              </div>
            </button>
            <div style={{ width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#00ff87,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#020510",cursor:"pointer",boxShadow:"0 0 14px rgba(0,255,135,.32)" }}>JD</div>
          </div>
        </header>
        <main style={{ flex:1,overflowY:"auto",overflowX:"hidden" }}>{pages[page]||pages.dashboard}</main>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position:"fixed",bottom:22,right:22,zIndex:999,maxWidth:310,background:"rgba(5,10,22,.98)",border:"1px solid rgba(248,113,113,.22)",borderRadius:13,padding:"13px 16px",boxShadow:"0 20px 60px rgba(0,0,0,.5)",display:"flex",gap:11,alignItems:"flex-start",animation:"toastIn .4s cubic-bezier(.22,1,.36,1) both" }}>
          <div style={{ position:"absolute",top:0,left:"10%",right:"10%",height:1,background:"linear-gradient(90deg,transparent,rgba(248,113,113,.5),transparent)" }}/>
          <AlertTriangle size={15} color="#f87171" style={{ flexShrink:0,marginTop:2 }}/>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:12.5,fontWeight:700,color:"#e8eaf6",marginBottom:2 }}>Renewal Alert</div>
            <div style={{ fontSize:12,color:"#4a5568",lineHeight:1.4 }}>{toast}</div>
          </div>
          <button onClick={()=>setToast(null)} style={{ background:"none",border:"none",cursor:"pointer",color:"#374151",padding:2 }}><X size={12}/></button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState("landing");
  return (
    <>
      <style>{CSS}</style>
      {screen==="landing" && <Landing onStart={()=>setScreen("auth")} />}
      {screen==="auth"    && <AuthPage onAuth={()=>setScreen("app")} />}
      {screen==="app"     && <AppShell />}
    </>
  );
}
