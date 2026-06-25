import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Bell, CreditCard, BarChart2, Settings, Plus, X, Home, Search, Zap,
  Shield, Clock, DollarSign, Trash2, AlertTriangle, CheckCircle, Mail,
  Lock, User, Check, Eye, EyeOff, ChevronRight, Star, Grid, List,
  Sparkles, Activity, TrendingUp, Calendar, Edit2,
  Download, Scan, Phone, LogOut, AlertCircle,
  Users, Webhook, Key, Copy, RefreshCw, Send
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

/* ── Real backend wiring ──────────────────────────────────────────
   Everything below this line connects the existing UI (previously
   driven entirely by local mock arrays) to the actual Express API. */
import { useAuth } from "./hooks/useAuth";
import { useSubscriptions } from "./hooks/useSubscriptions";
import { useAlerts } from "./hooks/useAlerts";
import { toUiSubscription, toUiAlert, toApiPayload } from "./lib/adapters";

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS & GLOBAL CSS
═══════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{font-size:16px;scroll-behavior:smooth;}
body{
  font-family:'DM Sans',system-ui,sans-serif;
  background:#06040a;color:#e8eaf6;
  overflow-x:hidden;-webkit-font-smoothing:antialiased;
}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:#2d1b4e;border-radius:99px;}
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
.glass-legacy{
  background:rgba(8,14,32,0.88);
  border:1px solid rgba(255,255,255,0.06);
  backdrop-filter:blur(20px) saturate(1.5);
  -webkit-backdrop-filter:blur(20px) saturate(1.5);
}
.glass-v-legacy{
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
.nav-item{
  display:flex;align-items:center;gap:10px;width:100%;
  padding:9px 12px;border-radius:8px;cursor:pointer;
  background:none;border:1px solid transparent;
  color:#4a5568;font-size:13px;font-weight:500;
  transition:all .2s;text-align:left;position:relative;overflow:hidden;
}
.nav-item::before{
  content:'';position:absolute;left:0;top:0;bottom:0;width:2px;
  background:linear-gradient(180deg,#00ff87,#06b6d4);
  opacity:0;transition:opacity .2s;border-radius:0 2px 2px 0;
}
.nav-item.hover{background:rgba(0,255,135,.05);color:#94a3b8;}
.nav-item.active{background:rgba(0,255,135,.08);border-color:rgba(0,255,135,.15);color:#00ff87;}
.nav-item.active::before{opacity:1;}

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
  {id:1, name:"Netflix",        cat:"Streaming",    price:22.99,billing:"monthly",color:"#E50914",bg:"rgba(229,9,20,.12)",   init:"NF", next:"Jun 3", days:10,status:"active", url:"netflix.com",       tier:"Standard with Ads"},
  {id:2, name:"Spotify",        cat:"Music",        price:11.99,billing:"monthly",color:"#1DB954",bg:"rgba(29,185,84,.12)",  init:"SP", next:"Jun 12",days:19,status:"active", url:"spotify.com",       tier:"Individual"},
  {id:3, name:"Disney+",        cat:"Streaming",    price:13.99,billing:"monthly",color:"#0063E5",bg:"rgba(0,99,229,.12)",   init:"D+", next:"Jun 7", days:14,status:"active", url:"disneyplus.com",    tier:"Basic"},
  {id:4, name:"Apple TV+",      cat:"Streaming",    price:9.99, billing:"monthly",color:"#d1d5db",bg:"rgba(209,213,219,.08)",init:"TV", next:"Jun 20",days:27,status:"active", url:"apple.com/tv",      tier:"Standard"},
  {id:5, name:"Max (HBO)",      cat:"Streaming",    price:15.99,billing:"monthly",color:"#6B1CE0",bg:"rgba(107,28,224,.12)", init:"MX", next:"Jun 1", days:1, status:"urgent", url:"max.com",           tier:"With Ads"},
  {id:6, name:"Hulu",           cat:"Streaming",    price:17.99,billing:"monthly",color:"#1CE783",bg:"rgba(28,231,131,.1)",  init:"HL", next:"Jun 5", days:3, status:"urgent", url:"hulu.com",          tier:"No Ads"},
  {id:7, name:"YouTube Premium",cat:"Streaming",    price:13.99,billing:"monthly",color:"#FF0000",bg:"rgba(255,0,0,.1)",     init:"YT", next:"Jun 15",days:22,status:"active", url:"youtube.com",       tier:"Individual"},
  {id:8, name:"Amazon Prime",   cat:"Streaming",    price:14.99,billing:"monthly",color:"#00A8E0",bg:"rgba(0,168,224,.12)",  init:"AP", next:"Jun 28",days:35,status:"active", url:"amazon.com",        tier:"Monthly"},
  {id:9, name:"Paramount+",     cat:"Streaming",    price:7.99, billing:"monthly",color:"#0064FF",bg:"rgba(0,100,255,.12)",  init:"P+", next:"May 30",days:0, status:"overdue",url:"paramountplus.com", tier:"Essential"},
  {id:10,name:"Peacock",        cat:"Streaming",    price:7.99, billing:"monthly",color:"#888",   bg:"rgba(136,136,136,.1)", init:"PC", next:"Jun 10",days:17,status:"active", url:"peacocktv.com",     tier:"Premium"},
  {id:11,name:"Apple Music",    cat:"Music",        price:10.99,billing:"monthly",color:"#FA2C5A",bg:"rgba(250,44,90,.12)",  init:"AM", next:"Jun 18",days:25,status:"active", url:"apple.com/music",   tier:"Individual"},
  {id:12,name:"Tidal",          cat:"Music",        price:10.99,billing:"monthly",color:"#888",   bg:"rgba(136,136,136,.1)", init:"TD", next:"Jun 22",days:29,status:"active", url:"tidal.com",         tier:"HiFi"},
  {id:13,name:"SiriusXM",       cat:"Music",        price:9.99, billing:"monthly",color:"#0046B6",bg:"rgba(0,70,182,.12)",   init:"SX", next:"Jun 30",days:37,status:"active", url:"siriusxm.com",      tier:"Music & Entertainment"},
  {id:14,name:"AWS",            cat:"Cloud",        price:247.83,billing:"monthly",color:"#FF9900",bg:"rgba(255,153,0,.12)", init:"AWS",next:"Jun 1", days:2, status:"urgent", url:"aws.amazon.com",    tier:"Pay-as-you-go"},
  {id:15,name:"Google Cloud",   cat:"Cloud",        price:189.40,billing:"monthly",color:"#4285F4",bg:"rgba(66,133,244,.12)",init:"GCP",next:"Jun 1", days:2, status:"urgent", url:"cloud.google.com",  tier:"Pay-as-you-go"},
  {id:16,name:"GitHub",         cat:"Dev",          price:4.00, billing:"monthly",color:"#d1d5db",bg:"rgba(209,213,219,.08)",init:"GH", next:"Jun 18",days:25,status:"active", url:"github.com",        tier:"Team (per user)"},
  {id:17,name:"Vercel",         cat:"Cloud",        price:20.00,billing:"monthly",color:"#d1d5db",bg:"rgba(209,213,219,.08)",init:"VC", next:"Jun 8", days:15,status:"active", url:"vercel.com",        tier:"Pro"},
  {id:18,name:"Netlify",        cat:"Cloud",        price:19.00,billing:"monthly",color:"#00C7B7",bg:"rgba(0,199,183,.12)",  init:"NL", next:"Jun 14",days:21,status:"active", url:"netlify.com",       tier:"Pro"},
  {id:19,name:"Cloudflare",     cat:"Cloud",        price:20.00,billing:"monthly",color:"#F48120",bg:"rgba(244,129,32,.12)", init:"CF", next:"Jun 20",days:27,status:"active", url:"cloudflare.com",    tier:"Pro"},
  {id:20,name:"MongoDB Atlas",  cat:"Cloud",        price:57.00,billing:"monthly",color:"#00ED64",bg:"rgba(0,237,100,.1)",   init:"MG", next:"Jun 1", days:2, status:"urgent", url:"mongodb.com",       tier:"M10 Cluster"},
  {id:21,name:"Figma",          cat:"Design",       price:15.00,billing:"monthly",color:"#A259FF",bg:"rgba(162,89,255,.12)", init:"FG", next:"Jun 25",days:32,status:"active", url:"figma.com",         tier:"Professional"},
  {id:22,name:"Adobe CC",       cat:"Design",       price:59.99,billing:"monthly",color:"#FF0000",bg:"rgba(255,0,0,.1)",     init:"AD", next:"May 31",days:0, status:"overdue",url:"adobe.com",         tier:"All Apps"},
  {id:23,name:"Canva Pro",      cat:"Design",       price:14.99,billing:"monthly",color:"#00C4CC",bg:"rgba(0,196,204,.12)",  init:"CA", next:"Jun 16",days:23,status:"active", url:"canva.com",         tier:"Pro"},
  {id:24,name:"Sketch",         cat:"Design",       price:9.00, billing:"monthly",color:"#FDA429",bg:"rgba(253,164,41,.12)", init:"SK", next:"Jun 9", days:16,status:"active", url:"sketch.com",        tier:"Standard"},
  {id:25,name:"Notion",         cat:"Productivity", price:16.00,billing:"monthly",color:"#d1d5db",bg:"rgba(209,213,219,.08)",init:"NO", next:"Jun 20",days:27,status:"active", url:"notion.so",         tier:"Plus"},
  {id:26,name:"Linear",         cat:"Productivity", price:8.00, billing:"monthly",color:"#5E6AD2",bg:"rgba(94,106,210,.12)", init:"LN", next:"Jun 15",days:22,status:"active", url:"linear.app",        tier:"Business/user"},
  {id:27,name:"Slack",          cat:"Productivity", price:8.75, billing:"monthly",color:"#4A154B",bg:"rgba(74,21,75,.15)",   init:"SL", next:"Jun 11",days:18,status:"active", url:"slack.com",         tier:"Pro/user"},
  {id:28,name:"Asana",          cat:"Productivity", price:13.49,billing:"monthly",color:"#F95572",bg:"rgba(249,85,114,.12)", init:"AS", next:"Jun 6", days:13,status:"active", url:"asana.com",         tier:"Starter/user"},
  {id:29,name:"Zoom",           cat:"Productivity", price:15.99,billing:"monthly",color:"#2D8CFF",bg:"rgba(45,140,255,.12)", init:"ZM", next:"Jun 3", days:10,status:"active", url:"zoom.us",           tier:"Pro"},
  {id:30,name:"Loom",           cat:"Productivity", price:15.00,billing:"monthly",color:"#625DF5",bg:"rgba(98,93,245,.12)",  init:"LM", next:"Jun 28",days:35,status:"active", url:"loom.com",          tier:"Business"},
  {id:31,name:"ClickUp",        cat:"Productivity", price:12.00,billing:"monthly",color:"#7B68EE",bg:"rgba(123,104,238,.12)",init:"CU", next:"Jun 13",days:20,status:"active", url:"clickup.com",       tier:"Business"},
  {id:32,name:"Airtable",       cat:"Productivity", price:20.00,billing:"monthly",color:"#FCB400",bg:"rgba(252,180,0,.12)",  init:"AT", next:"Jun 24",days:31,status:"active", url:"airtable.com",      tier:"Plus"},
  {id:33,name:"1Password",      cat:"Security",     price:4.99, billing:"monthly",color:"#1A8CFF",bg:"rgba(26,140,255,.12)", init:"1P", next:"Jun 19",days:26,status:"active", url:"1password.com",     tier:"Individual"},
  {id:34,name:"NordVPN",        cat:"Security",     price:4.99, billing:"monthly",color:"#4687FF",bg:"rgba(70,135,255,.12)", init:"NV", next:"Jun 23",days:30,status:"active", url:"nordvpn.com",       tier:"Complete 2yr"},
  {id:35,name:"Datadog",        cat:"Analytics",    price:189.00,billing:"monthly",color:"#632CA6",bg:"rgba(99,44,166,.12)", init:"DD", next:"Jun 1", days:2, status:"urgent", url:"datadoghq.com",     tier:"Infrastructure"},
  {id:36,name:"Mixpanel",       cat:"Analytics",    price:28.00,billing:"monthly",color:"#7856FF",bg:"rgba(120,86,255,.12)", init:"MX", next:"Jun 10",days:17,status:"active", url:"mixpanel.com",      tier:"Starter"},
  {id:37,name:"Hotjar",         cat:"Analytics",    price:39.00,billing:"monthly",color:"#FD3A5C",bg:"rgba(253,58,92,.12)",  init:"HJ", next:"Jun 16",days:23,status:"active", url:"hotjar.com",        tier:"Business"},
  {id:38,name:"Mailchimp",      cat:"Marketing",    price:20.00,billing:"monthly",color:"#FFE01B",bg:"rgba(255,224,27,.1)",  init:"MC", next:"Jun 4", days:11,status:"active", url:"mailchimp.com",     tier:"Essentials"},
  {id:39,name:"HubSpot",        cat:"Marketing",    price:45.00,billing:"monthly",color:"#FF7A59",bg:"rgba(255,122,89,.12)", init:"HS", next:"Jun 21",days:28,status:"active", url:"hubspot.com",       tier:"Starter"},
  {id:40,name:"Intercom",       cat:"Marketing",    price:74.00,billing:"monthly",color:"#1F8DED",bg:"rgba(31,141,237,.12)", init:"IC", next:"Jun 8", days:15,status:"active", url:"intercom.com",      tier:"Starter"},
  {id:41,name:"ChatGPT Plus",   cat:"AI",           price:20.00,billing:"monthly",color:"#10A37F",bg:"rgba(16,163,127,.12)", init:"GP", next:"Jun 7", days:14,status:"active", url:"chat.openai.com",   tier:"Plus"},
  {id:42,name:"Claude Pro",     cat:"AI",           price:20.00,billing:"monthly",color:"#CC785C",bg:"rgba(204,120,92,.12)", init:"CP", next:"Jun 7", days:14,status:"active", url:"claude.ai",         tier:"Pro"},
  {id:43,name:"Midjourney",     cat:"AI",           price:30.00,billing:"monthly",color:"#7289DA",bg:"rgba(114,137,218,.12)",init:"MJ", next:"Jun 12",days:19,status:"active", url:"midjourney.com",    tier:"Standard"},
  {id:44,name:"GitHub Copilot", cat:"AI",           price:10.00,billing:"monthly",color:"#d1d5db",bg:"rgba(209,213,219,.08)",init:"GC", next:"Jun 18",days:25,status:"active", url:"github.com",        tier:"Individual"},
];
const CAT_COLORS = {
  Streaming:"#f87171", Music:"#34d399",   Cloud:"#22d3ee",
  Dev:"#fbbf24",       Design:"#a855f7",  Productivity:"#818cf8",
  Security:"#4ade80",  Analytics:"#fb923c",Marketing:"#f472b6",
  AI:"#60a5fa",        Finance:"#a78bfa", Health:"#86efac",
};

const STATUS_S = {
  active:  { c:"#4ade80", bg:"rgba(74,222,128,.1)",  bd:"rgba(74,222,128,.22)",  l:"Active"  },
  urgent:  { c:"#fbbf24", bg:"rgba(251,191,36,.1)",  bd:"rgba(251,191,36,.22)",  l:"Renewing" },
  overdue: { c:"#f87171", bg:"rgba(248,113,113,.1)", bd:"rgba(248,113,113,.22)", l:"Overdue"  },
};

/* StatusPill was referenced in 3 places (Dashboard, Subscriptions grid + list
   view) but never actually defined anywhere — every one of those views would
   throw `ReferenceError: StatusPill is not defined` at render time. */
function StatusPill({ status }) {
  const s = STATUS_S[status] || STATUS_S.active;
  return (
    <span className="badge" style={{ background:s.bg, color:s.c, border:`1px solid ${s.bd}`, display:"inline-flex", alignItems:"center", gap:5, fontSize:10.5, fontWeight:700, padding:"3px 8px", borderRadius:99 }}>
      <span style={{ width:5,height:5,borderRadius:"50%",background:s.c }} />
      {s.l}
    </span>
  );
}

const ALERT_S = {
  overdue: { c:"#f87171", bg:"rgba(248,113,113,.07)", bd:"rgba(248,113,113,.22)", l:"OVERDUE" },
  urgent:  { c:"#fbbf24", bg:"rgba(251,191,36,.07)",  bd:"rgba(251,191,36,.22)",  l:"URGENT"  },
  warning: { c:"#f97316", bg:"rgba(249,115,22,.07)",  bd:"rgba(249,115,22,.22)",  l:"WARNING" },
  info:    { c:"#a855f7", bg:"rgba(168,85,247,.07)",  bd:"rgba(168,85,247,.2)",   l:"INFO"    },
  success: { c:"#4ade80", bg:"rgba(74,222,128,.07)",  bd:"rgba(74,222,128,.2)",   l:"SUCCESS" },
};

const SPEND_TREND = [
  {m:"Dec",v:982},{m:"Jan",v:1047},{m:"Feb",v:1089},
  {m:"Mar",v:1134},{m:"Apr",v:1198},{m:"May",v:1263},
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
const FEATS_DATA = [
  { icon:Bell,     t:"Smart Pre-Alerts",    d:"AI fires alerts at 7, 3, 1 day before any charge.",         c:"#00ff87" },
  { icon:BarChart2,t:"Spend Analytics",     d:"Trend charts, category breakdown, year-over-year deltas.",  c:"#bf5af2" },
  { icon:Shield,   t:"Bank-Grade Security", d:"AES-256 encryption, SOC 2 compliant.",                     c:"#06b6d4" },
  { icon:Zap,      t:"Email Auto-Detect",   d:"Scan inbox once — every subscription imported instantly.",  c:"#fbbf24" },
  { icon:Calendar, t:"Renewal Calendar",    d:"Visual timeline — every upcoming charge at a glance.",      c:"#f87171" },
  { icon:Activity, t:"Cost Optimizer",      d:"AI surfaces duplicates, unused tiers, bundles.",            c:"#34d399" },
];

const ST = {
  active:  { c:"#00ff87",bg:"rgba(0,255,135,.1)",  bd:"rgba(0,255,135,.22)",  label:"Active"  },
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
      <span className="sg" style={{ fontSize:fs,fontWeight:800,color:"#f0eeff",letterSpacing:"-.01em" }}>
        Sub<span style={{ color:"#a855f7" }}>Ghost</span>
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

function PillLegacy({ status }) {
  const s = STATUS_S[status]||STATUS_S.active;
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
      <div style={{ fontSize:11,color:"#6b7280",marginBottom:3 }}>{label}</div>
      <div className="sg" style={{ fontSize:17,fontWeight:800,color:"#a855f7" }}>${Number(payload[0].value).toFixed(2)}</div>
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
    <div style={{ background:"#06040a",minHeight:"100vh",overflowX:"hidden" }}>
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
            <button key={l} style={{ background:"none",border:"none",color:"#6b7280",cursor:"pointer",fontSize:13.5,fontWeight:500,transition:"color .2s" }}
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
              <div className="glass-v" style={{
                padding:"10px 14px",borderRadius:12,
                display:"flex",alignItems:"center",gap:10,
                width:205,opacity:.5+i*.12,
                borderLeft:`2px solid ${s.color}`,
                boxShadow:`0 8px 24px rgba(0,0,0,.4),0 0 0 1px ${s.color}15`,
              }}>
                <SubIcon sub={s} size={28} r={7} />
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:12.5,fontWeight:600,color:"#f0eeff" }}>{s.name}</div>
                  <div style={{ fontSize:11,color:"#6b7280" }}>${s.price}/mo</div>
                </div>
                <StatusPill status={s.status} />
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
            <span style={{ fontSize:11.5,color:"#a855f7",fontWeight:700,letterSpacing:".07em" }}>BETA · 10,000+ ACTIVE USERS</span>
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
              <span style={{ fontSize:12,color:"#6b7280",marginLeft:5 }}>4.9 · 2,400+ reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,.04)",borderBottom:"1px solid rgba(255,255,255,.04)",background:"rgba(255,255,255,.012)",padding:"32px max(24px,5vw)",display:"flex",gap:40,justifyContent:"center",flexWrap:"wrap" }}>
        {[{ v:"$2.4M+",l:"Saved annually" },{ v:"10K+",l:"Active users" },{ v:"99.9%",l:"Uptime SLA" },{ v:"60+",l:"Integrations" }].map(s=>(
          <div key={s.l} style={{ textAlign:"center" }}>
            <div className="sg" style={{ fontSize:32,fontWeight:800,color:"#f0eeff",lineHeight:1 }}>{s.v}</div>
            <div style={{ fontSize:12.5,color:"#6b7280",marginTop:6 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── FEATURES */}
      <section style={{ padding:"80px max(24px,5vw)",maxWidth:1180,margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:50 }}>
          <div style={{ display:"inline-block",padding:"3px 14px",borderRadius:99,marginBottom:12,background:"rgba(191,90,242,.1)",border:"1px solid rgba(191,90,242,.22)",fontSize:11,color:"#bf5af2",fontWeight:700,letterSpacing:".08em" }}>FEATURES</div>
          <h2 className="sg" style={{ fontSize:"clamp(26px,4vw,44px)",fontWeight:800,lineHeight:1.1 }}>
            Full Control.<br/><span className="neon-g">Zero Surprises.</span>
          </h2>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(285px,1fr))",gap:18 }}>
          {FEATS_DATA.map((f,i)=>(
            <Tilt key={i} max={13} className="scan-wrap" style={{ borderRadius:16,animation:`fadeUp .5s cubic-bezier(.22,1,.36,1) ${i*.07}s both` }}>
              <div className="glass-v" style={{ padding:24,borderRadius:16,height:"100%",position:"relative" }}>
                <div style={{ position:"absolute",bottom:0,left:20,right:20,height:1,background:`linear-gradient(90deg,transparent,${f.c}45,transparent)` }} />
                <div style={{ width:46,height:46,borderRadius:12,marginBottom:14,background:`${f.c}14`,border:`1px solid ${f.c}28`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <f.icon size={20} color={f.c} />
                </div>
                <h3 className="sg" style={{ fontSize:14.5,fontWeight:700,marginBottom:7,color:"#f0eeff" }}>{f.t}</h3>
                <p style={{ fontSize:13.5,color:"#6b7280",lineHeight:1.65 }}>{f.d}</p>
              </div>
            </Tilt>
          ))}
        </div>
      </section>

      {/* ── PRICING */}
      <section style={{ padding:"70px max(24px,5vw)",background:"rgba(255,255,255,.012)" }}>
        <div style={{ maxWidth:960,margin:"0 auto" }}>
          <h2 className="sg" style={{ textAlign:"center",fontSize:"clamp(26px,4vw,38px)",fontWeight:800,marginBottom:48 }}>
            <span className="neon-g">Transparent</span> Pricing
          </h2>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:18 }}>
            {[
              { name:"Free", price:"$0",  per:"/forever", features:["5 subscriptions","7-day alerts","Basic analytics","Manual entry"],                pop:false },
              { name:"Pro",  price:"$7",  per:"/month",   features:["Unlimited subs","1·3·7 day alerts","Advanced analytics","Email+SMS","Email scan"], pop:true  },
              { name:"Team", price:"$19", per:"/month",   features:["All Pro features","5 members","Shared dashboard","Priority support","API access"],  pop:false },
            ].map(p=>(
              <Tilt key={p.name} max={11} style={{ borderRadius:18 }}>
                <div className="glass-v" style={{ padding:28,borderRadius:18,position:"relative",overflow:"hidden",border:p.pop?"1px solid rgba(0,255,135,.22)":"1px solid rgba(255,255,255,.06)" }}>
                  {p.pop && <>
                    <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#00ff87,#06b6d4)" }} />
                    <div style={{ position:"absolute",top:14,right:14,background:"rgba(0,255,135,.1)",border:"1px solid rgba(0,255,135,.25)",borderRadius:99,padding:"2px 9px",fontSize:10,color:"#a855f7",fontWeight:800 }}>POPULAR</div>
                  </>}
                  <div style={{ fontSize:11,color:"#6b7280",fontWeight:700,letterSpacing:".07em",textTransform:"uppercase",marginBottom:6 }}>{p.name}</div>
                  <div style={{ marginBottom:20 }}>
                    <span className="sg" style={{ fontSize:36,fontWeight:800,color:"#f0eeff" }}>{p.price}</span>
                    <span style={{ fontSize:12.5,color:"#6b7280",marginLeft:4 }}>{p.per}</span>
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:22 }}>
                    {p.features.map(f=>(
                      <div key={f} style={{ display:"flex",gap:9,alignItems:"center" }}>
                        <div style={{ width:16,height:16,borderRadius:"50%",flexShrink:0,background:p.pop?"rgba(0,255,135,.14)":"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                          <Check size={9} color={p.pop?"#00ff87":"#4a5568"} />
                        </div>
                        <span style={{ fontSize:13,color:"#9ca3af" }}>{f}</span>
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
          <h2 className="sg" style={{ fontSize:"clamp(24px,4vw,36px)",fontWeight:800,marginBottom:12,position:"relative" }}>
            Kill Your <span className="neon-g">Subscription Ghosts</span>
          </h2>
          <p style={{ color:"#6b7280",marginBottom:28,fontSize:14.5,lineHeight:1.7,position:"relative" }}>Users save $187/year on average. Takes 2 minutes to set up.</p>
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
  const [form, setForm] = useState({ name:"",email:"",pw:"" });
  const [formError, setFormError] = useState("");
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const cardRef = useRef(null);
  const { x, y, gx, gy } = useTilt(cardRef, 10);

  const { loading, error, login, signup } = useAuth();

  const submit = async () => {
    setFormError("");
    if (!form.email || !form.pw) { setFormError("Email and password are required."); return; }
    if (mode === "register" && form.pw.length < 8) { setFormError("Password must be at least 8 characters."); return; }

    try {
      const result = mode === "login"
        ? await login({ email: form.email, password: form.pw })
        : await signup({ name: form.name || form.email.split("@")[0], email: form.email, password: form.pw });

      if (result?.data?.user) onAuth(result.data.user);
    } catch (err) {
      setFormError(err?.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div style={{ minHeight:"100vh",background:"#06040a",display:"flex",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden" }}>
      <Particles />
      <div className="pg-wrap"><div className="pg-plane" /></div>
      <div style={{ position:"absolute",width:500,height:500,borderRadius:"50%",top:"5%",left:"-5%",pointerEvents:"none",background:"radial-gradient(circle,rgba(0,255,135,.06),transparent 65%)" }} />
      <div style={{ position:"absolute",width:420,height:420,borderRadius:"50%",bottom:"10%",right:"-5%",pointerEvents:"none",background:"radial-gradient(circle,rgba(6,182,212,.07),transparent 65%)" }} />

      <div ref={cardRef} style={{ perspective:"1000px",width:"100%",maxWidth:400,position:"relative",zIndex:2 }}>
        <div className="a-scale scene-3d" style={{ transform:`rotateX(${x}deg) rotateY(${y}deg)`,transition:"transform .1s ease-out" }}>
          <div style={{ position:"absolute",inset:0,borderRadius:22,background:`radial-gradient(circle at ${gx}% ${gy}%,rgba(255,255,255,.065),transparent 55%)`,pointerEvents:"none",zIndex:1 }} />
          <div className="glass-v" style={{ borderRadius:22,padding:"34px 30px",position:"relative" }}>
            <div style={{ position:"absolute",top:0,left:"20%",right:"20%",height:1,background:"linear-gradient(90deg,transparent,rgba(0,255,135,.45),transparent)" }} />
            <div style={{ textAlign:"center",marginBottom:26 }}>
              <div style={{ width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,#00ff87,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 12px",boxShadow:"0 0 30px rgba(0,255,135,.32)" }}>👻</div>
              <h1 className="sg" style={{ fontSize:21,fontWeight:800,color:"#f0eeff",marginBottom:4 }}>{mode==="login"?"Welcome back":"Create account"}</h1>
              <p style={{ fontSize:12.5,color:"#6b7280" }}>{mode==="login"?"Sign in to your dashboard":"Start tracking free"}</p>
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
                  <User size={14} color="#374151"/><input type="text" placeholder="Full name" value={form.name} onChange={set("name")} style={{ background:"none",border:"none",color:"#f0eeff",fontSize:13.5,flex:1,outline:"none" }}/>
                </div>
              )}
              <div style={{ display:"flex",alignItems:"center",gap:9,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,padding:"10px 13px" }}>
                <Mail size={14} color="#374151"/><input type="email" placeholder="Email address" value={form.email} onChange={set("email")} style={{ background:"none",border:"none",color:"#f0eeff",fontSize:13.5,flex:1,outline:"none" }}/>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:9,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,padding:"10px 13px" }}>
                <Lock size={14} color="#374151"/>
                <input type={showPw?"text":"password"} placeholder="Password" value={form.pw} onChange={set("pw")} style={{ background:"none",border:"none",color:"#f0eeff",fontSize:13.5,flex:1,outline:"none" }}/>
                <button onClick={()=>setShowPw(!showPw)} style={{ background:"none",border:"none",cursor:"pointer",color:"#374151",padding:0,display:"flex" }}>{showPw?<EyeOff size={14}/>:<Eye size={14}/>}</button>
              </div>
            </div>
            {(formError || error) && (
              <div style={{ display:"flex",alignItems:"center",gap:7,background:"rgba(248,113,113,.08)",border:"1px solid rgba(248,113,113,.22)",borderRadius:9,padding:"9px 12px",marginBottom:13,fontSize:12.5,color:"#f87171" }}>
                <AlertCircle size={13} style={{ flexShrink:0 }}/><span>{formError || error}</span>
              </div>
            )}
            <button className="btn-neon" onClick={submit} style={{ width:"100%",padding:13,borderRadius:11,fontSize:14.5,fontWeight:700,marginTop:18,opacity:loading?.82:1 }} disabled={loading}>
              {loading?<><Spin/>{mode==="login"?"Signing in…":"Creating account…"}</>:<>{mode==="login"?"Sign In":"Create Account"}<ChevronRight size={15}/></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════════ */
function Sidebar({ page, setPage, open, setOpen, alertCount=0, user, onLogout }) {
  const NAV = [
    { id:"dashboard",     icon:Home,      label:"Dashboard"            },
    { id:"subscriptions", icon:CreditCard,label:"Subscriptions"        },
    { id:"alerts",        icon:Bell,      label:"Alerts", badge:alertCount||0 },
    { id:"analytics",     icon:BarChart2, label:"Analytics"            },
    { id:"calendar",      icon:Calendar,  label:"Calendar"             },
    { id:"team",          icon:Users,     label:"Team"                 },
    { id:"integrations",  icon:Webhook,   label:"Integrations"         },
    { id:"scanner",       icon:Scan,      label:"Email Scanner"        },
    { id:"sms",           icon:Phone,     label:"SMS Alerts"           },
    { id:"budget",        icon:DollarSign,label:"Budget Tracker"       },
    { id:"export",        icon:Download,  label:"Export Center"        },
    { id:"settings",      icon:Settings,  label:"Settings"             },
  ];
  const displayName = user?.name || "Account";
  const initials = (user?.name || user?.email || "?").split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const planLabel = user?.plan ? `${user.plan.charAt(0).toUpperCase()}${user.plan.slice(1)} Plan` : "Free Plan";
  return (
    <>
      {open && <div onClick={()=>setOpen(false)} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)",zIndex:48 }} />}
      <aside className={`sb-wrap ${open?"open":""}`} style={{ width:220,background:"#0a0512",borderRight:"1px solid rgba(255,255,255,.045)",display:"flex",flexDirection:"column",padding:"20px 12px",zIndex:50,overflowY:"auto" }}>
        <div style={{ marginBottom:28,paddingLeft:4 }}><Logo size={28} fs={15} /></div>
        <nav style={{ flex:1,display:"flex",flexDirection:"column",gap:2 }}>
          {NAV.map(({ id,icon:Icon,label,badge })=>(
            <button key={id} className={`nav-item ${page===id?"active":""}`} onClick={()=>{ setPage(id); setOpen(false); }}>
              <div style={{ transform:page===id?"perspective(180px) rotateY(-18deg) translateZ(5px)":"none",transition:"transform .3s cubic-bezier(.22,1,.36,1)" }}>
                <Icon size={15}/>
              </div>
              <span style={{ flex:1 }}>{label}</span>
              {badge>0 && <span style={{ background:"#f87171",color:"white",borderRadius:99,padding:"1px 5px",fontSize:9.5,fontWeight:900 }}>{badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{ display:"flex",alignItems:"center",gap:9,padding:"10px 8px",marginTop:16,borderTop:"1px solid rgba(255,255,255,.045)" }}>
          <div style={{ width:30,height:30,borderRadius:"50%",flexShrink:0,background:"linear-gradient(135deg,#00ff87,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#020510",boxShadow:"0 0 12px rgba(0,255,135,.32)" }}>{initials}</div>
          <div style={{ minWidth:0,flex:1 }}>
            <div style={{ fontSize:12.5,fontWeight:600,color:"#f0eeff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{displayName}</div>
            <div style={{ fontSize:10.5,color:"#a855f7",fontWeight:600 }}>{planLabel}</div>
          </div>
          <button onClick={onLogout} title="Log out" style={{ background:"none",border:"none",cursor:"pointer",color:"#4a5568",padding:4,flexShrink:0 }}>
            <LogOut size={14}/>
          </button>
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
        <div className="glass-v" style={{ padding:"18px 20px",borderRadius:14,overflow:"hidden",position:"relative",cursor:"default" }}>
          <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${color},${color}33)` }} />
          <div style={{ position:"absolute",inset:0,borderRadius:14,background:`radial-gradient(circle at ${gx}% ${gy}%,rgba(255,255,255,.065),transparent 55%)`,pointerEvents:"none",transition:"background .08s" }} />
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
            <span style={{ fontSize:10.5,color:"#6b7280",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em" }}>{label}</span>
            <div style={{ width:32,height:32,borderRadius:9,background:`${color}14`,border:`1px solid ${color}25`,display:"flex",alignItems:"center",justifyContent:"center",transform:"perspective(180px) translateZ(6px)",boxShadow:`0 4px 14px ${color}1a` }}>
              <Icon size={15} color={color}/>
            </div>
          </div>
          <div className="sg" style={{ fontSize:26,fontWeight:800,color:"#f0eeff",marginBottom:4,textShadow:`0 0 22px ${color}28` }}>{value}</div>
          <div style={{ fontSize:11,color:"#6b7280" }}>{sub}</div>
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
  const ss = STATUS_S[sub.status] || STATUS_S.active;
  const pct = Math.max(4, Math.min(100, (30-sub.days)/30*100));
  return (
    <div className="flip-wrap" style={{ perspective:"1000px",animation:`fadeUp .48s cubic-bezier(.22,1,.36,1) ${idx*.04}s both`,borderRadius:15 }}>
      <div className="flip-inner" style={{ borderRadius:15,minHeight:210 }}>
        {/* FRONT */}
        <div className="flip-front glass-v scan-wrap" style={{ padding:18,borderRadius:15,position:"relative",overflow:"hidden" }}>
          <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${sub.color},${sub.color}22)` }} />
          <div style={{ position:"absolute",left:0,right:0,height:40,background:`linear-gradient(transparent,${sub.color}04,transparent)`,animation:"scanline 5s linear infinite",pointerEvents:"none" }} />
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 }}>
            <SubIcon sub={sub} size={42} r={11}/>
            <StatusPill status={sub.status}/>
          </div>
          <div className="sg" style={{ fontSize:15,fontWeight:700,color:"#f0eeff",marginBottom:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{sub.name}</div>
          <div style={{ fontSize:12,color:"#6b7280",marginBottom:14 }}>{sub.tier || sub.cat}<br/><span style={{fontSize:10,opacity:.7}}>{sub.url || sub.cat}</span></div>
          <div style={{ marginBottom:14 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
              <span style={{ fontSize:11,color:"#6b7280" }}>Next {sub.next}</span>
              <span style={{ fontSize:11,fontWeight:600,color:ss.c }}>{sub.days<=0?"Today":sub.days===1?"1 day":`${sub.days} days`}</span>
            </div>
            <div className="pbar"><div className="pfill" style={{ width:`${pct}%`,background:`linear-gradient(90deg,${ss.c},${ss.c}88)` }}/></div>
          </div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div>
              <span className="sg" style={{ fontSize:22,fontWeight:800,color:"#f0eeff" }}>${sub.price}</span>
              <span style={{ fontSize:12,color:"#6b7280" }}>/mo</span>
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
                <div className="sg" style={{ fontSize:14.5,fontWeight:700,color:"#f0eeff" }}>{sub.name}</div>
                <div style={{ fontSize:11.5,color:ss.c,fontWeight:600 }}>{ss.l}</div>
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
                <span style={{ fontSize:12,color:"#6b7280" }}>{l}</span>
                <span style={{ fontSize:12,fontWeight:600,color:"#f0eeff" }}>{v}</span>
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
      <div className="a-scale glass-v" style={{ width:"100%",maxWidth:420,borderRadius:20,padding:30,position:"relative" }}>
        <div style={{ position:"absolute",top:0,left:"15%",right:"15%",height:1,background:"linear-gradient(90deg,transparent,rgba(0,255,135,.52),transparent)" }} />
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
          <h2 className="sg" style={{ fontSize:19,fontWeight:800,color:"#f0eeff" }}>Add Subscription</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"#6b7280",padding:4 }}><X size={16}/></button>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
          {[{ l:"Service Name",key:"name",type:"text",ph:"e.g. Netflix" },{ l:"Monthly Price ($)",key:"price",type:"number",ph:"0.00" },{ l:"Next Renewal",key:"next",type:"date",ph:"" }].map(f=>(
            <div key={f.key}>
              <label style={{ fontSize:10.5,fontWeight:700,color:"#6b7280",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:".06em" }}>{f.l}</label>
              <input className="field" type={f.type} placeholder={f.ph} value={form[f.key]} onChange={set(f.key)} style={{ width:"100%",padding:"9px 12px" }}/>
            </div>
          ))}
          {[{ l:"Category",key:"cat",opts:["Entertainment","Music","Cloud","Design","Dev","Productivity","Health","Finance","Other"] },{ l:"Billing",key:"billing",opts:["monthly","quarterly","annually"] }].map(f=>(
            <div key={f.key}>
              <label style={{ fontSize:10.5,fontWeight:700,color:"#6b7280",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:".06em" }}>{f.l}</label>
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
function Dashboard({ setPage, subs, user }) {
  const total = subs.reduce((s,x)=>s+x.price,0);
  const urgent = subs.filter(s=>s.status==="urgent"||s.status==="overdue");
  const firstName = (user?.name || "").split(" ")[0] || "there";
  return (
    <div style={{ padding:"28px",maxWidth:1180 }}>
      <div style={{ marginBottom:26 }}>
        <h1 className="oxanium a-left" style={{ fontSize:24,fontWeight:800,color:"#f0eeff" }}>Dashboard</h1>
        <p className="a-left" style={{ color:"#6b7280",fontSize:13.5,marginTop:3,animationDelay:".06s" }}>
          Good morning, {firstName} —{" "}
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
          <div className="glass-v" style={{ padding:22,borderRadius:16,height:"100%",position:"relative" }}>
            <div style={{ position:"absolute",top:0,left:"20%",right:"20%",height:1,background:"linear-gradient(90deg,transparent,rgba(0,255,135,.42),transparent)" }} />
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18 }}>
              <div>
                <div style={{ fontSize:14,fontWeight:700,color:"#f0eeff" }}>Monthly Spending</div>
                <div style={{ fontSize:12,color:"#6b7280",marginTop:2 }}>6-month trend</div>
              </div>
              <span style={{ background:"rgba(0,255,135,.1)",color:"#a855f7",padding:"3px 9px",borderRadius:99,fontSize:11,fontWeight:700 }}>↑ 5.2%</span>
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
          <div className="glass-v" style={{ padding:22,borderRadius:16,height:"100%",position:"relative" }}>
            <div style={{ position:"absolute",top:0,left:"15%",right:"15%",height:1,background:"linear-gradient(90deg,transparent,rgba(191,90,242,.42),transparent)" }} />
            <div style={{ fontSize:14,fontWeight:700,color:"#f0eeff",marginBottom:2 }}>By Category</div>
            <div style={{ fontSize:12,color:"#6b7280",marginBottom:8 }}>Monthly share</div>
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
                  <span className="sg" style={{ fontSize:11.5,fontWeight:700,color:"#f0eeff" }}>${c.v.toFixed(0)}</span>
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
                  <div style={{ fontSize:13,fontWeight:600,color:"#f0eeff" }}>{s.name}</div>
                  <div style={{ fontSize:11,color:"#6b7280" }}>Renews {s.next}</div>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div className="sg" style={{ fontSize:14,fontWeight:700,color:"#f0eeff" }}>${s.price}/mo</div>
                <div style={{ fontSize:11,fontWeight:600,color:s.days<=1?"#f87171":"#fbbf24" }}>{s.days<=0?"Today":s.days===1?"Tomorrow":`${s.days}d`}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All subs mini list */}
      <div className="a-up surface" style={{ padding:20,borderRadius:14 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
          <div style={{ fontSize:14,fontWeight:700,color:"#f0eeff" }}>All Subscriptions</div>
          <button onClick={()=>setPage("subscriptions")} style={{ background:"none",border:"none",color:"#a855f7",fontSize:12.5,cursor:"pointer",fontWeight:600 }}>View all →</button>
        </div>
        {subs.slice(0,7).map(s=>(
          <div key={s.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderRadius:9,transition:"background .18s",cursor:"default" }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(0,255,135,.03)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{ display:"flex",gap:10,alignItems:"center" }}>
              <SubIcon sub={s} size={32} r={8}/>
              <div>
                <div style={{ fontSize:13.5,fontWeight:600,color:"#f0eeff" }}>{s.name}</div>
                <div style={{ fontSize:11,color:"#6b7280" }}>{s.cat} · {s.billing}</div>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div className="sg" style={{ fontSize:13.5,fontWeight:700,color:"#f0eeff" }}>${s.price}/mo</div>
              <div style={{ fontSize:11,color:"#6b7280" }}>{s.next}</div>
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
          <h1 className="oxanium a-left" style={{ fontSize:24,fontWeight:800,color:"#f0eeff" }}>Subscriptions</h1>
          <p className="a-left" style={{ color:"#6b7280",fontSize:13.5,marginTop:3,animationDelay:".06s" }}>
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
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search…" style={{ background:"none",border:"none",color:"#f0eeff",fontSize:13.5,flex:1,outline:"none" }}/>
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
              <div style={{ fontSize:15,fontWeight:600,color:"#6b7280" }}>No results found</div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass" style={{ borderRadius:14,overflow:"hidden" }}>
          <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 100px 48px",padding:"10px 18px",fontSize:10,fontWeight:800,color:"#374151",textTransform:"uppercase",letterSpacing:".07em",borderBottom:"1px solid rgba(255,255,255,.05)" }}>
            {["Service","Category","Renews","Price/mo","Status",""].map(h=><span key={h}>{h}</span>)}
          </div>
          {shown.map((s,i)=>(
            <div key={s.id} style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 100px 48px",padding:"11px 18px",alignItems:"center",borderBottom:i<shown.length-1?"1px solid rgba(255,255,255,.04)":"none",transition:"background .18s" }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(0,255,135,.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{ display:"flex",gap:9,alignItems:"center" }}>
                <SubIcon sub={s} size={28} r={7}/>
                <span style={{ fontSize:13.5,fontWeight:600,color:"#f0eeff" }}>{s.name}</span>
              </div>
              <span style={{ fontSize:12.5,color:"#6b7280" }}>{s.cat}</span>
              <span style={{ fontSize:12.5,color:"#f0eeff" }}>{s.next}</span>
              <span className="sg" style={{ fontSize:13.5,fontWeight:700,color:"#f0eeff" }}>${s.price}</span>
              <StatusPill status={s.status}/>
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
function AlertsPage({ alertsData=[], onMarkRead, onMarkAllRead, onDismiss }) {
  const alerts = alertsData;
  const unread = alerts.filter(a=>!a.read).length;
  return (
    <div style={{ padding:"28px",maxWidth:740 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:26 }}>
        <div>
          <h1 className="oxanium a-left" style={{ fontSize:24,fontWeight:800,color:"#f0eeff" }}>Alerts</h1>
          <p className="a-left" style={{ color:"#6b7280",fontSize:13.5,marginTop:3,animationDelay:".06s" }}>{unread} unread · {alerts.length} total</p>
        </div>
        {unread>0 && <button className="btn-ghost" onClick={onMarkAllRead} style={{ padding:"7px 14px",borderRadius:8,fontSize:12.5 }}>Mark all read</button>}
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
                <div style={{ fontSize:13.5,fontWeight:600,color:"#f0eeff",marginBottom:3 }}>{a.title}</div>
                <div style={{ fontSize:12,color:"#6b7280" }}>{a.sub}</div>
              </div>
              <div style={{ display:"flex",gap:5,flexShrink:0 }}>
                {!a.read && <button onClick={()=>onMarkRead?.({_id:a.id})} style={{ width:28,height:28,borderRadius:7,background:"rgba(0,255,135,.09)",border:"1px solid rgba(0,255,135,.22)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><CheckCircle size={12} color="#00ff87"/></button>}
                <button onClick={()=>onDismiss?.({_id:a.id})} style={{ width:28,height:28,borderRadius:7,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><X size={12} color="#4a5568"/></button>
              </div>
            </div>
          );
        })}
      </div>
      {alerts.length===0 && (
        <div style={{ textAlign:"center",padding:"80px 0",color:"#374151" }}>
          <CheckCircle size={44} style={{ margin:"0 auto 14px",opacity:.25 }}/>
          <div style={{ fontSize:15,fontWeight:600,color:"#6b7280" }}>All clear!</div>
          <div style={{ fontSize:13,marginTop:5 }}>We&rsquo;ll alert you before any subscription renews.</div>
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
        <h1 className="oxanium a-left" style={{ fontSize:24,fontWeight:800,color:"#f0eeff" }}>Analytics</h1>
        <p className="a-left" style={{ color:"#6b7280",fontSize:13.5,marginTop:3,animationDelay:".06s" }}>Deep-dive into spending patterns.</p>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:16,marginBottom:16 }}>
        <Tilt max={5} style={{ borderRadius:16 }} className="a-up">
          <div className="glass-v" style={{ padding:22,borderRadius:16,position:"relative" }}>
            <div style={{ position:"absolute",top:0,left:"15%",right:"15%",height:1,background:"linear-gradient(90deg,transparent,rgba(6,182,212,.42),transparent)" }}/>
            <div style={{ fontSize:14,fontWeight:700,color:"#f0eeff",marginBottom:3 }}>Monthly Trend</div>
            <div style={{ fontSize:12,color:"#6b7280",marginBottom:16 }}>6-month overview</div>
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
          <div className="glass-v" style={{ padding:22,borderRadius:16,position:"relative" }}>
            <div style={{ position:"absolute",top:0,left:"15%",right:"15%",height:1,background:"linear-gradient(90deg,transparent,rgba(0,255,135,.42),transparent)" }}/>
            <div style={{ fontSize:14,fontWeight:700,color:"#f0eeff",marginBottom:16 }}>Top Spenders</div>
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              {sorted.slice(0,6).map((s,i)=>(
                <div key={s.id} style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontSize:11,color:"#374151",width:14,textAlign:"right",flexShrink:0 }}>{i+1}</span>
                  <SubIcon sub={s} size={24} r={6}/>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:12,fontWeight:600,color:"#f0eeff",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{s.name}</div>
                    <div className="pbar"><div className="pfill" style={{ width:`${Math.min(100,(s.price/sorted[0].price)*100)}%`,background:`linear-gradient(90deg,${s.color},${s.color}66)` }}/></div>
                  </div>
                  <span className="sg" style={{ fontSize:12.5,fontWeight:700,color:"#f0eeff",flexShrink:0 }}>${s.price}</span>
                </div>
              ))}
            </div>
          </div>
        </Tilt>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1.5fr",gap:16 }}>
        <Tilt max={7} style={{ borderRadius:16 }} className="a-up">
          <div className="glass-v" style={{ padding:22,borderRadius:16,position:"relative" }}>
            <div style={{ position:"absolute",top:0,left:"15%",right:"15%",height:1,background:"linear-gradient(90deg,transparent,rgba(191,90,242,.42),transparent)" }}/>
            <div style={{ fontSize:14,fontWeight:700,color:"#f0eeff",marginBottom:3 }}>Category Split</div>
            <div style={{ fontSize:12,color:"#6b7280",marginBottom:8 }}>Monthly share</div>
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
                  <span className="sg" style={{ fontSize:11,fontWeight:700,color:"#f0eeff",marginLeft:"auto" }}>${c.v.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </Tilt>
        <Tilt max={5} style={{ borderRadius:16 }} className="a-up">
          <div className="glass-v" style={{ padding:22,borderRadius:16,position:"relative",border:"1px solid rgba(0,255,135,.09)" }}>
            <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#00ff87,#06b6d4,#bf5af2)" }}/>
            <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:16 }}>
              <Sparkles size={15} color="#00ff87"/>
              <div style={{ fontSize:14,fontWeight:700,color:"#f0eeff" }}>AI Optimizer</div>
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
                  <div style={{ fontSize:12.5,color:"#9ca3af",marginBottom:7,lineHeight:1.5 }}>{sg.t}</div>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div style={{ display:"flex",gap:7,alignItems:"center" }}>
                      <span style={{ fontSize:12,color:"#a855f7",fontWeight:700 }}>Save {sg.s}</span>
                      <span style={{ fontSize:9,fontWeight:900,padding:"1px 6px",borderRadius:99,textTransform:"uppercase",background:sg.hi?"rgba(248,113,113,.12)":"rgba(251,191,36,.12)",color:sg.hi?"#f87171":"#fbbf24" }}>{sg.hi?"high":"medium"}</span>
                    </div>
                    <button style={{ padding:"4px 11px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",background:"rgba(0,255,135,.09)",border:"1px solid rgba(0,255,135,.22)",color:"#a855f7" }}>Apply</button>
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
      <div className="glass-v" style={{ padding:22,borderRadius:14,position:"relative" }}>
        <div style={{ position:"absolute",top:0,left:"15%",right:"15%",height:1,background:`linear-gradient(90deg,transparent,${color}52,transparent)` }}/>
        <div style={{ display:"flex",gap:9,alignItems:"center",marginBottom:16,paddingBottom:14,borderBottom:"1px solid rgba(255,255,255,.05)" }}>
          <Icon size={15} color={color}/><div style={{ fontSize:14,fontWeight:700,color:"#f0eeff" }}>{title}</div>
        </div>
        {children}
      </div>
    </Tilt>
  );
  const Row = ({ label, sub, children }) => (
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0" }}>
      <div>
        <div style={{ fontSize:13.5,fontWeight:500,color:"#f0eeff" }}>{label}</div>
        {sub && <div style={{ fontSize:11.5,color:"#6b7280",marginTop:2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ padding:"28px",maxWidth:640 }}>
      <div style={{ marginBottom:26 }}>
        <h1 className="oxanium a-left" style={{ fontSize:24,fontWeight:800,color:"#f0eeff" }}>Settings</h1>
        <p className="a-left" style={{ color:"#6b7280",fontSize:13.5,marginTop:3,animationDelay:".06s" }}>Manage notifications and account.</p>
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
            <label style={{ fontSize:10,fontWeight:800,color:"#6b7280",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:".07em" }}>{f.l}</label>
            <input className="field" type={f.t} value={cfg[f.k]} onChange={e=>setCfg(p=>({...p,[f.k]:e.target.value}))} style={{ width:"100%",padding:"9px 12px" }}/>
          </div>
        ))}
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:10,fontWeight:800,color:"#6b7280",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:".07em" }}>Currency</label>
          <select className="field" value={cfg.currency} onChange={e=>setCfg(p=>({...p,currency:e.target.value}))} style={{ width:"100%",padding:"9px 12px" }}>
            {["USD","EUR","GBP","CAD","AUD","JPY"].map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button className="btn-neon" onClick={save} style={{ padding:"10px 24px",borderRadius:10,fontSize:13.5,fontWeight:700 }}>
          {saved?<><Check size={14}/>Saved!</>:"Save Changes"}
        </button>
      </Section>
      <div className="glass" style={{ padding:22,borderRadius:14,border:"1px solid rgba(248,113,113,.14)" }}>
        <div className="sg" style={{ fontSize:13.5,fontWeight:700,color:"#f87171",marginBottom:12 }}>Danger Zone</div>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <div style={{ fontSize:13.5,color:"#f0eeff" }}>Delete Account</div>
            <div style={{ fontSize:11.5,color:"#6b7280",marginTop:2 }}>Permanently remove all data</div>
          </div>
          <button style={{ padding:"7px 14px",borderRadius:8,fontSize:12.5,fontWeight:600,cursor:"pointer",background:"rgba(248,113,113,.09)",border:"1px solid rgba(248,113,113,.22)",color:"#f87171" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   PHASE 4: CALENDAR
═══════════════════════════════════════════════════════════════ */
function CalendarPage({ subs }) {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const renewals = subs.reduce((a, s) => {
    const d = parseInt((s.next || "1").split(" ")[1] || "1");
    if (!a[d]) a[d] = [];
    a[d].push(s);
    return a;
  }, {});
  const startDay = 6;
  const total = subs.reduce((s,x)=>s+x.price,0);
  return (
    <div style={{ padding:"28px", maxWidth:1100 }}>
      <div style={{ marginBottom:26 }}>
        <h1 className="sg a-left" style={{ fontSize:24, fontWeight:800, color:"#f0eeff" }}>Renewal Calendar</h1>
        <p className="a-left" style={{ color:"#6b7280", fontSize:13.5, marginTop:3, animationDelay:".06s" }}>
          Every upcoming charge visualised · {subs.length} renewals this month.
        </p>
      </div>
      <div style={{ display:"flex", gap:14, marginBottom:18, flexWrap:"wrap" }}>
        {[
          { l:"Total Renewals", v:subs.length, c:"#a855f7" },
          { l:"This Week",      v:subs.filter(s=>s.days<=7).length, c:"#fbbf24" },
          { l:"Overdue",        v:subs.filter(s=>s.status==="overdue").length, c:"#f87171" },
          { l:"Monthly Total",  v:`$${total.toFixed(0)}`, c:"#4ade80" },
        ].map(st => (
          <div key={st.l} className="glass-v a-up" style={{ padding:"14px 18px", borderRadius:12, flex:"1 1 140px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${st.c},${st.c}33)` }} />
            <div style={{ fontSize:10, color:"#6b7280", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em", marginBottom:6 }}>{st.l}</div>
            <div className="sg" style={{ fontSize:24, fontWeight:800, color:"#f0eeff" }}>{st.v}</div>
          </div>
        ))}
      </div>
      <div className="glass-v a-up" style={{ padding:22, borderRadius:16, position:"relative" }}>
        <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:1, background:"linear-gradient(90deg,transparent,rgba(168,85,247,.4),transparent)" }} />
        <div className="sg" style={{ fontSize:16, fontWeight:700, color:"#f0eeff", marginBottom:18 }}>June 2025</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:4 }}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} style={{ textAlign:"center", fontSize:10.5, color:"#6b7280", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em", padding:"6px 0" }}>{d}</div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
          {Array.from({ length: startDay }, (_, i) => <div key={`e${i}`} />)}
          {days.map(d => {
            const dr = renewals[d] || [];
            const hasU = dr.some(s => s.status==="urgent" || s.status==="overdue");
            const isT = d === 24;
            return (
              <div key={d} style={{ minHeight:60, borderRadius:10, padding:"6px 7px", position:"relative",
                background:isT?"rgba(168,85,247,.16)":dr.length>0?"rgba(168,85,247,.05)":"rgba(255,255,255,.02)",
                border:isT?"1px solid rgba(168,85,247,.35)":dr.length>0?"1px solid rgba(168,85,247,.12)":"1px solid rgba(255,255,255,.04)",
                transition:"all .2s", cursor:dr.length>0?"pointer":"default" }}
                onMouseEnter={e=>{ if(dr.length>0) e.currentTarget.style.background="rgba(168,85,247,.1)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=isT?"rgba(168,85,247,.16)":dr.length>0?"rgba(168,85,247,.05)":"rgba(255,255,255,.02)"; }}>
                <div style={{ fontSize:12, fontWeight:isT?800:500, color:isT?"#a855f7":"#f0eeff", marginBottom:4 }}>{d}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                  {dr.slice(0,2).map(s => (
                    <div key={s.id} style={{ fontSize:8.5, fontWeight:700, padding:"1px 4px", borderRadius:4, background:s.color+"20", color:s.color, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {s.name} ${s.price}
                    </div>
                  ))}
                  {dr.length > 2 && <div style={{ fontSize:8.5, color:"#6b7280" }}>+{dr.length-2} more</div>}
                </div>
                {hasU && <div style={{ position:"absolute", top:5, right:5, width:5, height:5, borderRadius:"50%", background:"#f87171" }} />}
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:16, marginTop:14, flexWrap:"wrap" }}>
          {[{c:"#a855f7",l:"Has renewals"},{c:"#f87171",l:"Urgent/Overdue"},{c:"#a855f7",l:"Today (June 24)"}].map(lg => (
            <div key={lg.l} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:10, height:10, borderRadius:3, background:lg.c+"22", border:`1px solid ${lg.c}44`, flexShrink:0 }} />
              <span style={{ fontSize:11.5, color:"#6b7280" }}>{lg.l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PHASE 6: TEAM
═══════════════════════════════════════════════════════════════ */
function TeamPage() {
  const [members] = useState([
    {id:1,name:"John Doe",    email:"john@company.com",  role:"Admin", avatar:"JD",color:"#7c3aed",subs:28,spend:892.43,joined:"Jan 2025"},
    {id:2,name:"Alice Chen",  email:"alice@company.com", role:"Member",avatar:"AC",color:"#22d3ee",subs:14,spend:341.20,joined:"Feb 2025"},
    {id:3,name:"Bob Williams",email:"bob@company.com",   role:"Member",avatar:"BW",color:"#4ade80",subs:9, spend:189.99,joined:"Mar 2025"},
    {id:4,name:"Sara Park",   email:"sara@company.com",  role:"Viewer",avatar:"SP",color:"#fbbf24",subs:6, spend:95.97, joined:"Apr 2025"},
  ]);
  return (
    <div style={{ padding:"28px", maxWidth:1000 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:26, flexWrap:"wrap", gap:14 }}>
        <div>
          <h1 className="sg a-left" style={{ fontSize:24, fontWeight:800, color:"#f0eeff" }}>Team</h1>
          <p className="a-left" style={{ color:"#6b7280", fontSize:13.5, marginTop:3, animationDelay:".06s" }}>Manage members and shared subscription visibility.</p>
        </div>
        <button className="btn-p" style={{ padding:"9px 18px", borderRadius:10, fontSize:13, fontWeight:700 }}>
          <Plus size={14} /> Invite Member
        </button>
      </div>
      <div className="grid4" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
        <StatCard label="Team Members" value={members.length} sub="Seats used" icon={Users} color="#a855f7" delay=".06s"/>
        <StatCard label="Shared Subs"  value={57}            sub="Across team"        icon={CreditCard} color="#22d3ee" delay=".12s"/>
        <StatCard label="Combined/mo"  value={`$${members.reduce((s,x)=>s+x.spend,0).toFixed(0)}`} sub="Total team spend" icon={DollarSign} color="#4ade80" delay=".18s"/>
        <StatCard label="Plan"         value="Team"          sub="Up to 10 members"   icon={Star}       color="#fbbf24" delay=".24s"/>
      </div>
      <div className="glass-v a-up" style={{ borderRadius:14, overflow:"hidden" }}>
        <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,.055)", display:"flex", gap:8, alignItems:"center" }}>
          <Users size={14} color="#a855f7"/>
          <span style={{ fontSize:14, fontWeight:700, color:"#f0eeff" }}>Members</span>
        </div>
        {members.map((m, i) => (
          <div key={m.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 20px",
            borderBottom:i<members.length-1?"1px solid rgba(255,255,255,.04)":"none", transition:"background .18s" }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(168,85,247,.04)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{ width:38, height:38, borderRadius:"50%", flexShrink:0, background:`${m.color}22`, border:`1px solid ${m.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:m.color }}>{m.avatar}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13.5, fontWeight:600, color:"#f0eeff" }}>{m.name}</div>
              <div style={{ fontSize:11.5, color:"#6b7280" }}>{m.email}</div>
            </div>
            <div className="hide-sm" style={{ textAlign:"center", minWidth:60 }}>
              <div className="sg" style={{ fontSize:15, fontWeight:700, color:"#f0eeff" }}>{m.subs}</div>
              <div style={{ fontSize:10.5, color:"#6b7280" }}>subs</div>
            </div>
            <div className="hide-sm" style={{ textAlign:"center", minWidth:80 }}>
              <div className="sg" style={{ fontSize:15, fontWeight:700, color:"#f0eeff" }}>${m.spend.toFixed(0)}</div>
              <div style={{ fontSize:10.5, color:"#6b7280" }}>per month</div>
            </div>
            <span className="badge" style={{
              background:m.role==="Admin"?"rgba(168,85,247,.12)":m.role==="Member"?"rgba(34,211,238,.1)":"rgba(255,255,255,.07)",
              color:m.role==="Admin"?"#a855f7":m.role==="Member"?"#22d3ee":"#6b7280",
              border:`1px solid ${m.role==="Admin"?"rgba(168,85,247,.25)":m.role==="Member"?"rgba(34,211,238,.2)":"rgba(255,255,255,.1)"}`
            }}>{m.role}</span>
            <div style={{ display:"flex", gap:5 }}>
              <button style={{ width:28, height:28, borderRadius:7, background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Edit2 size={11} color="#6b7280"/></button>
              {m.role !== "Admin" && <button style={{ width:28, height:28, borderRadius:7, background:"rgba(248,113,113,.08)", border:"1px solid rgba(248,113,113,.18)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Trash2 size={11} color="#f87171"/></button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PHASE 7: INTEGRATIONS & API
═══════════════════════════════════════════════════════════════ */
function IntegrationsPage() {
  const [apiKey]  = useState("sg_live_a3f9b2c1d8e7f4a0b5c2d9e6f3a0b7c4d1e8f5a2b9c6");
  const [copied, setCopied] = useState(false);
  const [whUrl, setWhUrl]   = useState("");
  const copyKey = () => { setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const INTGS = [
    { name:"Slack",           desc:"Renewal alerts in your Slack channels.",      status:"connected",  color:"#4A154B",init:"SL"},
    { name:"Google Calendar", desc:"Sync renewal dates to Google Calendar.",      status:"connected",  color:"#4285F4",init:"GC"},
    { name:"Zapier",          desc:"Trigger 5,000+ automations on renewals.",     status:"available",  color:"#FF4F00",init:"ZP"},
    { name:"Notion",          desc:"Sync subscription data to Notion databases.", status:"available",  color:"#d1d5db",init:"NO"},
    { name:"QuickBooks",      desc:"Auto-categorise subscription expenses.",      status:"available",  color:"#2CA01C",init:"QB"},
    { name:"PagerDuty",       desc:"Critical renewal alerts to on-call teams.",   status:"available",  color:"#06AC38",init:"PD"},
    { name:"Jira",            desc:"Create tickets for renewal approvals.",       status:"coming_soon",color:"#0052CC",init:"JR"},
    { name:"HubSpot CRM",     desc:"Track SaaS spend alongside CRM data.",       status:"coming_soon",color:"#FF7A59",init:"HS"},
  ];
  return (
    <div style={{ padding:"28px", maxWidth:1100 }}>
      <div style={{ marginBottom:26 }}>
        <h1 className="sg a-left" style={{ fontSize:24, fontWeight:800, color:"#f0eeff" }}>Integrations & API</h1>
        <p className="a-left" style={{ color:"#6b7280", fontSize:13.5, marginTop:3, animationDelay:".06s" }}>
          Phase 7 complete — connect SubscriptionGhost to your existing workflow.
        </p>
      </div>
      <div className="glass-v a-up" style={{ padding:22, borderRadius:16, marginBottom:16, position:"relative", border:"1px solid rgba(168,85,247,.18)" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,#7c3aed,#a855f7,#22d3ee)", borderRadius:"16px 16px 0 0" }} />
        <div style={{ display:"flex", gap:9, alignItems:"center", marginBottom:16 }}>
          <Key size={15} color="#a855f7"/>
          <div className="sg" style={{ fontSize:14, fontWeight:700, color:"#f0eeff" }}>REST API Key</div>
          <span className="badge" style={{ background:"rgba(74,222,128,.1)", color:"#4ade80", border:"1px solid rgba(74,222,128,.22)" }}>LIVE</span>
        </div>
        <div style={{ display:"flex", gap:9, alignItems:"center", marginBottom:12 }}>
          <div style={{ flex:1, background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:10, padding:"10px 14px", fontFamily:"monospace", fontSize:12, color:"#6b7280", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{apiKey}</div>
          <button className="btn-o" onClick={copyKey} style={{ padding:"10px 16px", borderRadius:10, fontSize:13, fontWeight:600, flexShrink:0 }}>
            {copied ? <><Check size={13}/> Copied</> : <><Copy size={13}/> Copy</>}
          </button>
          <button className="btn-o" style={{ padding:"10px 14px", borderRadius:10, flexShrink:0 }}><RefreshCw size={13}/></button>
        </div>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
          {[{l:"Base URL",v:"https://api.subscriptionghost.app/v1"},{l:"Rate Limit",v:"1,000 req/hour"},{l:"Docs",v:"docs.subscriptionghost.app"}].map(d=>(
            <div key={d.l} style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ fontSize:11, color:"#6b7280" }}>{d.l}:</span>
              <span style={{ fontSize:11, color:"#a855f7", fontFamily:"monospace" }}>{d.v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-v a-up" style={{ padding:22, borderRadius:16, marginBottom:20 }}>
        <div style={{ display:"flex", gap:9, alignItems:"center", marginBottom:14 }}><Webhook size={15} color="#22d3ee"/><div className="sg" style={{ fontSize:14, fontWeight:700, color:"#f0eeff" }}>Webhooks</div></div>
        <div style={{ display:"flex", gap:9, alignItems:"center", marginBottom:12 }}>
          <input value={whUrl} onChange={e=>setWhUrl(e.target.value)} placeholder="https://your-app.com/webhook" className="field" style={{ flex:1, padding:"9px 13px", fontSize:13 }}/>
          <button className="btn-c" style={{ padding:"9px 18px", borderRadius:10, fontSize:13, fontWeight:700, flexShrink:0 }}><Send size={13}/> Add</button>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {["renewal.upcoming","renewal.overdue","subscription.created","subscription.deleted"].map(ev=>(
            <span key={ev} className="badge" style={{ background:"rgba(34,211,238,.08)", color:"#22d3ee", border:"1px solid rgba(34,211,238,.18)", fontSize:11 }}>{ev}</span>
          ))}
        </div>
      </div>
      <h2 className="sg" style={{ fontSize:16, fontWeight:700, color:"#f0eeff", marginBottom:14 }}>Available Integrations</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:14 }}>
        {INTGS.map((intg, i) => (
          <Tilt key={i} max={12} style={{ borderRadius:14, animation:`fadeUp .48s cubic-bezier(.22,1,.36,1) ${i*.05}s both` }}>
            <div className="glass-v" style={{ padding:18, borderRadius:14, position:"relative", height:"100%" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:`${intg.color}20`, border:`1px solid ${intg.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:intg.color, fontFamily:"'Space Grotesk',sans-serif" }}>{intg.init}</div>
                <span className="badge" style={{
                  background:intg.status==="connected"?"rgba(74,222,128,.1)":intg.status==="available"?"rgba(168,85,247,.1)":"rgba(255,255,255,.06)",
                  color:intg.status==="connected"?"#4ade80":intg.status==="available"?"#a855f7":"#6b7280",
                  border:`1px solid ${intg.status==="connected"?"rgba(74,222,128,.22)":intg.status==="available"?"rgba(168,85,247,.22)":"rgba(255,255,255,.1)"}`
                }}>{intg.status==="connected"?"Connected":intg.status==="available"?"Available":"Soon"}</span>
              </div>
              <div className="sg" style={{ fontSize:14, fontWeight:700, color:"#f0eeff", marginBottom:6 }}>{intg.name}</div>
              <p style={{ fontSize:12.5, color:"#6b7280", lineHeight:1.6, marginBottom:14 }}>{intg.desc}</p>
              <button className={intg.status==="connected"?"btn-d":"btn-o"} style={{ width:"100%", padding:"8px", borderRadius:9, fontSize:12.5, fontWeight:600 }}>
                {intg.status==="connected"?"Disconnect →":intg.status==="available"?"Connect →":"Coming Soon"}
              </button>
            </div>
          </Tilt>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   APP SHELL
═══════════════════════════════════════════════════════════════ */
function AppShell({ user, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const [toast, setToast] = useState(null);

  /* ── Real subscriptions, mapped to the shape the existing UI expects ── */
  const {
    subscriptions: apiSubs,
    fetchAll: fetchSubs,
    create: createSub,
    remove: removeSub,
  } = useSubscriptions();

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const subs = useMemo(() => apiSubs.map(toUiSubscription), [apiSubs]);

  // Back-compat shim: the rest of the UI (Subscriptions, AddModal, FlipCard,
  // EmailScannerPage) was written against a plain `setSubs(updaterOrArray)`
  // contract from the old useState. Rather than rewrite every consumer, we
  // diff what they're trying to do against the real list and call the right
  // API method. New code should prefer createSub/removeSub directly.
  const setSubs = useCallback((updater) => {
    const next = typeof updater === "function" ? updater(subs) : updater;
    if (next.length < subs.length) {
      const removed = subs.find(p => !next.some(n => n.id === p.id));
      if (removed) removeSub({ _id: removed.id });
    } else if (next.length > subs.length) {
      const added = next.filter(n => !subs.some(p => p.id === n.id));
      added.forEach(a => createSub(toApiPayload(a)));
    }
  }, [subs, createSub, removeSub]);

  useEffect(()=>{
    const t = setTimeout(()=>{ setToast("Adobe CC & Paramount+ overdue — $67.98 at risk"); setTimeout(()=>setToast(null),5500); },2800);
    return ()=>clearTimeout(t);
  },[]);

  /* ── Real alerts ───────────────────────────────────────────────────── */
  const {
    alerts: apiAlerts,
    fetchAll: fetchAlerts,
    markRead: markAlertRead,
    markAllRead: markAllAlertsRead,
    remove: removeAlert,
  } = useAlerts();

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const alertsData = useMemo(() => apiAlerts.map(toUiAlert), [apiAlerts]);
  const unreadAlerts = alertsData.filter(a=>!a.read).length;

  const pages = {
    dashboard:     <Dashboard        setPage={setPage} subs={subs} user={user}/>,
    subscriptions: <Subscriptions    subs={subs} setSubs={setSubs}/>,
    alerts:        <AlertsPage       alertsData={alertsData} onMarkRead={markAlertRead} onMarkAllRead={markAllAlertsRead} onDismiss={removeAlert}/>,
    analytics:     <Analytics        subs={subs}/>,
    calendar:      <CalendarPage     subs={subs}/>,
    team:          <TeamPage/>,
    integrations:  <IntegrationsPage/>,
    scanner:       <EmailScannerPage onImport={imported=>{setSubs(p=>[...imported,...p]);setPage("subscriptions");}}/>,
    sms:           <SMSAlertsPage/>,
    budget:        <BudgetPage       subs={subs}/>,
    export:        <ExportPage       subs={subs}/>,
    settings:      <SettingsPage/>,
  };

  return (
    <div style={{ display:"flex",minHeight:"100vh",background:"#06040a" }}>
      <Sidebar page={page} setPage={setPage} open={sideOpen} setOpen={setSideOpen} alertCount={unreadAlerts||0} user={user} onLogout={onLogout}/>
      <div className="main-ml" style={{ flex:1,marginLeft:232,display:"flex",flexDirection:"column",minHeight:"100vh" }}>
        {/* Topbar */}
        <header style={{ height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 26px",position:"sticky",top:0,zIndex:30,background:"rgba(2,5,16,.9)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(255,255,255,.045)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <button className="show-sm" onClick={()=>setSideOpen(true)} style={{ background:"none",border:"none",cursor:"pointer",color:"#6b7280",padding:4 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div style={{ display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:8,padding:"5px 12px",width:200 }}>
              <Search size={12} color="#374151"/>
              <input placeholder="Search…" style={{ background:"none",border:"none",color:"#9ca3af",fontSize:13,flex:1,outline:"none" }}/>
            </div>
          </div>
          <div style={{ display:"flex",gap:8,alignItems:"center" }}>
            <button onClick={()=>setPage("alerts")} style={{ width:34,height:34,borderRadius:8,position:"relative",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>
              <Bell size={14} color="#94a3b8"/>
              <div style={{ position:"absolute",top:7,right:7,width:7,height:7,borderRadius:"50%",background:"#f87171",border:"1.5px solid #06040a" }}>
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
            <div style={{ fontSize:12.5,fontWeight:700,color:"#f0eeff",marginBottom:2 }}>Renewal Alert</div>
            <div style={{ fontSize:12,color:"#6b7280",lineHeight:1.4 }}>{toast}</div>
          </div>
          <button onClick={()=>setToast(null)} style={{ background:"none",border:"none",cursor:"pointer",color:"#374151",padding:2 }}><X size={12}/></button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PHASE 8-A: EMAIL SCANNER — IMAP Auto-Detect
═══════════════════════════════════════════════════════════════ */
const DETECTED_SUBS = [
  { id:"d1",  name:"Netflix",       price:22.99, date:"May 01",cat:"Streaming",confidence:99,color:"#E50914",init:"NF",detected:true },
  { id:"d2",  name:"Spotify",       price:11.99, date:"May 12",cat:"Music",     confidence:98,color:"#1DB954",init:"SP",detected:true },
  { id:"d3",  name:"Adobe CC",      price:59.99, date:"Apr 30",cat:"Design",    confidence:96,color:"#FF0000",init:"AD",detected:true },
  { id:"d4",  name:"AWS",           price:247.83,date:"May 01",cat:"Cloud",     confidence:94,color:"#FF9900",init:"AW",detected:true },
  { id:"d5",  name:"GitHub",        price:4.00,  date:"May 18",cat:"Dev",       confidence:97,color:"#d1d5db",init:"GH",detected:true },
  { id:"d6",  name:"Figma",         price:15.00, date:"Apr 25",cat:"Design",    confidence:93,color:"#A259FF",init:"FG",detected:true },
  { id:"d7",  name:"Zoom",          price:15.99, date:"May 03",cat:"Productivity",confidence:91,color:"#2D8CFF",init:"ZM",detected:true },
  { id:"d8",  name:"ClickUp",       price:12.00, date:"May 13",cat:"Productivity",confidence:88,color:"#7B68EE",init:"CU",detected:true },
  { id:"d9",  name:"Notion",        price:16.00, date:"May 20",cat:"Productivity",confidence:95,color:"#d1d5db",init:"NO",detected:true },
  { id:"d10", name:"HubSpot",       price:45.00, date:"May 21",cat:"Marketing", confidence:87,color:"#FF7A59",init:"HS",detected:true },
  { id:"d11", name:"Datadog",       price:189.00,date:"May 01",cat:"Analytics", confidence:92,color:"#632CA6",init:"DD",detected:true },
  { id:"d12", name:"Intercom",      price:74.00, date:"May 08",cat:"Marketing", confidence:85,color:"#1F8DED",init:"IC",detected:true },
];

function EmailScannerPage({ onImport }) {
  const [step, setStep] = useState("connect");   // connect | scanning | review | done
  const [provider, setProvider] = useState("");
  const [email, setEmail] = useState("");
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState(new Set(DETECTED_SUBS.map(s => s.id)));
  const [scanCount, setScanCount] = useState(0);
  const iref = useRef(null);

  const startScan = () => {
    if (!email.trim()) return;
    setStep("scanning");
    setProgress(0);
    setScanCount(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 8 + 2;
      setScanCount(c => Math.min(DETECTED_SUBS.length, c + Math.floor(Math.random() * 2)));
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setTimeout(() => setStep("review"), 600);
      }
      setProgress(Math.min(100, p));
    }, 220);
  };

  const toggleSub = id => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const importSelected = () => {
    const toImport = DETECTED_SUBS.filter(s => selected.has(s.id)).map(s => ({
      ...s, id: Date.now() + Math.random(), billing:"monthly",
      bg:`${s.color}14`, next:"Jun 30", days:30, status:"active",
      tier:"Auto-detected", url:`${s.name.toLowerCase().replace(/\s/g,"")}.com`
    }));
    onImport(toImport);
    setStep("done");
  };

  const PROVIDERS = [
    { id:"gmail",   label:"Gmail",        color:"#EA4335", icon:"G" },
    { id:"outlook", label:"Outlook",      color:"#0078D4", icon:"O" },
    { id:"apple",   label:"Apple Mail",   color:"#d1d5db", icon:"✉" },
    { id:"yahoo",   label:"Yahoo Mail",   color:"#6001D2", icon:"Y" },
  ];

  return (
    <div style={{ padding:"28px", maxWidth:840 }}>
      <div style={{ marginBottom:26 }}>
        <h1 className="sg a-left" style={{ fontSize:24, fontWeight:800, color:"#f0eeff" }}>Email Scanner</h1>
        <p className="a-left" style={{ color:"#6b7280", fontSize:13.5, marginTop:3, animationDelay:".06s" }}>
          Phase 8 — Auto-detect every subscription from your inbox in under 60 seconds.
        </p>
      </div>

      {/* STEPS */}
      <div style={{ display:"flex", gap:0, marginBottom:28, position:"relative" }}>
        {["Connect","Scanning","Review","Done"].map((s,i) => {
          const stepIdx = ["connect","scanning","review","done"].indexOf(step);
          const done = i < stepIdx;
          const active = i === stepIdx;
          return (
            <div key={s} style={{ flex:1, display:"flex", alignItems:"center" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                <div style={{
                  width:32, height:32, borderRadius:"50%",
                  background: done?"#a855f7":active?"rgba(168,85,247,.15)":"rgba(255,255,255,.05)",
                  border:`2px solid ${done||active?"#a855f7":"rgba(255,255,255,.1)"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:12, fontWeight:800,
                  color: done?"white":active?"#a855f7":"#4b5563",
                  transition:"all .4s",
                  boxShadow: active?"0 0 18px rgba(168,85,247,.4)":"none",
                }}>
                  {done ? <Check size={14}/> : i+1}
                </div>
                <span style={{ fontSize:11, color:active?"#a855f7":done?"#9ca3af":"#4b5563", fontWeight:active?700:500 }}>{s}</span>
              </div>
              {i < 3 && (
                <div style={{ flex:1, height:2, margin:"0 4px", marginTop:-14,
                  background: done?"#a855f7":"rgba(255,255,255,.07)", transition:"background .4s" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* STEP: CONNECT */}
      {step === "connect" && (
        <Tilt max={4} style={{ borderRadius:18 }} className="a-scale">
          <div className="glass-v" style={{ padding:30, borderRadius:18, position:"relative" }}>
            <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:1, background:"linear-gradient(90deg,transparent,rgba(168,85,247,.5),transparent)" }} />
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22 }}>
              <div style={{ width:42, height:42, borderRadius:11, background:"rgba(168,85,247,.12)", border:"1px solid rgba(168,85,247,.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Mail size={20} color="#a855f7"/>
              </div>
              <div>
                <div className="sg" style={{ fontSize:16, fontWeight:700, color:"#f0eeff" }}>Connect Your Inbox</div>
                <div style={{ fontSize:12.5, color:"#6b7280" }}>We scan for subscription receipts — read-only, never store emails.</div>
              </div>
            </div>

            <div className="sg" style={{ fontSize:12, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:".06em", marginBottom:12 }}>Choose Provider</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:22 }}>
              {PROVIDERS.map(p => (
                <button key={p.id} onClick={() => setProvider(p.id)} style={{
                  padding:"14px 8px", borderRadius:12, cursor:"pointer",
                  background: provider===p.id ? `${p.color}18` : "rgba(255,255,255,.03)",
                  border:`1.5px solid ${provider===p.id ? p.color : "rgba(255,255,255,.08)"}`,
                  display:"flex", flexDirection:"column", alignItems:"center", gap:8,
                  transition:"all .2s", fontFamily:"inherit",
                  boxShadow: provider===p.id ? `0 0 20px ${p.color}22` : "none",
                }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:`${p.color}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:p.color }}>{p.icon}</div>
                  <span style={{ fontSize:12, fontWeight:600, color: provider===p.id ? "#f0eeff" : "#6b7280" }}>{p.label}</span>
                </button>
              ))}
            </div>

            <div style={{ marginBottom:18 }}>
              <label className="sg" style={{ fontSize:11, fontWeight:700, color:"#6b7280", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:".06em" }}>Email Address</label>
              <div style={{ display:"flex", gap:10 }}>
                <div style={{ flex:1, display:"flex", alignItems:"center", gap:9, background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:10, padding:"10px 13px" }}>
                  <Mail size={14} color="#374151"/>
                  <input ref={iref} type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&startScan()}
                    style={{ background:"none", border:"none", color:"#f0eeff", fontSize:13.5, flex:1, outline:"none" }} />
                </div>
              </div>
            </div>

            <div style={{ background:"rgba(74,222,128,.06)", border:"1px solid rgba(74,222,128,.18)", borderRadius:10, padding:"12px 15px", marginBottom:20, display:"flex", gap:10, alignItems:"flex-start" }}>
              <Shield size={14} color="#4ade80" style={{ flexShrink:0, marginTop:2 }}/>
              <div style={{ fontSize:12.5, color:"#6b7280", lineHeight:1.6 }}>
                <span style={{ color:"#4ade80", fontWeight:700 }}>Read-only OAuth2</span> — we never store your emails or password.
                Receipts are scanned client-side. You can revoke access at any time.
              </div>
            </div>

            <button className="btn-p" onClick={startScan} disabled={!email.trim()}
              style={{ padding:"12px 28px", borderRadius:11, fontSize:14, fontWeight:700, opacity: email.trim() ? 1 : 0.45 }}>
              <Scan size={15}/> Start Scanning
            </button>
          </div>
        </Tilt>
      )}

      {/* STEP: SCANNING */}
      {step === "scanning" && (
        <div className="a-scale glass-v" style={{ padding:40, borderRadius:18, textAlign:"center", position:"relative" }}>
          <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:1, background:"linear-gradient(90deg,transparent,rgba(168,85,247,.5),transparent)" }} />
          {/* Animated scanner ring */}
          <div style={{ position:"relative", width:100, height:100, margin:"0 auto 28px" }}>
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"3px solid rgba(168,85,247,.15)" }} />
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"3px solid transparent", borderTopColor:"#a855f7", animation:"spinAnim 1s linear infinite" }} />
            <div style={{ position:"absolute", inset:12, borderRadius:"50%", border:"2px solid rgba(168,85,247,.1)" }} />
            <div style={{ position:"absolute", inset:12, borderRadius:"50%", border:"2px solid transparent", borderTopColor:"#22d3ee", animation:"spinAnim 1.4s linear infinite reverse" }} />
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Mail size={28} color="#a855f7"/>
            </div>
          </div>
          <div className="sg" style={{ fontSize:20, fontWeight:800, color:"#f0eeff", marginBottom:8 }}>Scanning Inbox…</div>
          <div style={{ fontSize:13.5, color:"#6b7280", marginBottom:28 }}>Analysing receipts, invoices, and confirmation emails</div>
          <div style={{ maxWidth:400, margin:"0 auto 16px", background:"rgba(255,255,255,.06)", borderRadius:99, height:8, overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:99, transition:"width .3s", background:"linear-gradient(90deg,#7c3aed,#a855f7,#22d3ee)", width:`${progress}%` }} />
          </div>
          <div style={{ fontSize:13, color:"#a855f7", fontWeight:700 }}>{Math.round(progress)}%</div>
          {scanCount > 0 && (
            <div style={{ marginTop:18, fontSize:12.5, color:"#6b7280" }}>
              Found <span style={{ color:"#4ade80", fontWeight:700 }}>{scanCount}</span> subscription{scanCount!==1?"s":""} so far…
            </div>
          )}
        </div>
      )}

      {/* STEP: REVIEW */}
      {step === "review" && (
        <div className="a-up">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
            <div>
              <div className="sg" style={{ fontSize:16, fontWeight:800, color:"#f0eeff" }}>
                Found {DETECTED_SUBS.length} Subscriptions
              </div>
              <div style={{ fontSize:12.5, color:"#6b7280", marginTop:3 }}>
                {selected.size} selected · ${DETECTED_SUBS.filter(s=>selected.has(s.id)).reduce((a,s)=>a+s.price,0).toFixed(2)}/mo to import
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn-o" onClick={() => setSelected(new Set())} style={{ padding:"7px 14px", borderRadius:8, fontSize:12.5 }}>Deselect All</button>
              <button className="btn-o" onClick={() => setSelected(new Set(DETECTED_SUBS.map(s=>s.id)))} style={{ padding:"7px 14px", borderRadius:8, fontSize:12.5 }}>Select All</button>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
            {DETECTED_SUBS.map((s,i) => {
              const on = selected.has(s.id);
              return (
                <div key={s.id} onClick={() => toggleSub(s.id)} style={{
                  display:"flex", alignItems:"center", gap:14, padding:"12px 16px",
                  borderRadius:12, cursor:"pointer", transition:"all .18s",
                  background: on ? "rgba(168,85,247,.07)" : "rgba(255,255,255,.02)",
                  border: `1px solid ${on ? "rgba(168,85,247,.22)" : "rgba(255,255,255,.06)"}`,
                  animation:`fadeUp .4s cubic-bezier(.22,1,.36,1) ${i*.035}s both`,
                }}>
                  <div style={{
                    width:20, height:20, borderRadius:5, flexShrink:0,
                    background: on ? "#a855f7" : "rgba(255,255,255,.06)",
                    border:`1.5px solid ${on?"#a855f7":"rgba(255,255,255,.14)"}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"all .2s",
                  }}>
                    {on && <Check size={11} color="white"/>}
                  </div>
                  <SubIcon sub={{...s,bg:s.color+"14"}} size={36} r={9}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span className="sg" style={{ fontSize:14, fontWeight:700, color:"#f0eeff" }}>{s.name}</span>
                      <span style={{
                        fontSize:9.5, fontWeight:800, padding:"2px 7px", borderRadius:99,
                        background: s.confidence>95?"rgba(74,222,128,.1)":s.confidence>88?"rgba(251,191,36,.1)":"rgba(168,85,247,.1)",
                        color: s.confidence>95?"#4ade80":s.confidence>88?"#fbbf24":"#a855f7",
                        border:`1px solid ${s.confidence>95?"rgba(74,222,128,.22)":s.confidence>88?"rgba(251,191,36,.2)":"rgba(168,85,247,.2)"}`,
                      }}>{s.confidence}% match</span>
                    </div>
                    <div style={{ fontSize:11.5, color:"#6b7280", marginTop:2 }}>{s.cat} · Last charge {s.date}</div>
                  </div>
                  <div className="sg" style={{ fontSize:15, fontWeight:800, color:"#f0eeff" }}>${s.price}<span style={{ fontSize:10.5, color:"#6b7280", fontWeight:400 }}>/mo</span></div>
                </div>
              );
            })}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button className="btn-o" onClick={() => setStep("connect")} style={{ padding:"11px 22px", borderRadius:11, fontSize:13.5, fontWeight:600 }}>← Back</button>
            <button className="btn-p" onClick={importSelected} disabled={selected.size===0}
              style={{ flex:1, padding:"11px", borderRadius:11, fontSize:14, fontWeight:700, opacity:selected.size>0?1:.5 }}>
              <Download size={14}/> Import {selected.size} Subscription{selected.size!==1?"s":""} — ${DETECTED_SUBS.filter(s=>selected.has(s.id)).reduce((a,s)=>a+s.price,0).toFixed(2)}/mo
            </button>
          </div>
        </div>
      )}

      {/* STEP: DONE */}
      {step === "done" && (
        <div className="a-scale glass-v" style={{ padding:40, borderRadius:18, textAlign:"center", position:"relative" }}>
          <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(74,222,128,.12)", border:"2px solid rgba(74,222,128,.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", boxShadow:"0 0 28px rgba(74,222,128,.2)" }}>
            <CheckCircle size={36} color="#4ade80"/>
          </div>
          <div className="sg" style={{ fontSize:22, fontWeight:800, color:"#f0eeff", marginBottom:10 }}>Import Complete!</div>
          <div style={{ fontSize:14, color:"#6b7280", lineHeight:1.7, marginBottom:28 }}>
            {selected.size} subscriptions added to your dashboard.<br/>
            Renewal alerts have been configured automatically.
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <button className="btn-p" onClick={() => setStep("connect")} style={{ padding:"11px 24px", borderRadius:11, fontSize:13.5, fontWeight:700 }}>
              <Scan size={14}/> Scan Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PHASE 8-B: SMS ALERTS — Twilio Integration
═══════════════════════════════════════════════════════════════ */
function SMSAlertsPage() {
  const [phone, setPhone] = useState("+1 ");
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [step, setStep] = useState("phone");   // phone | verify | done
  const [testSent, setTestSent] = useState(false);
  const [alerts, setAlerts] = useState({
    day7:true, day3:true, day1:true, day0:true,
    overdue:true, digest:false, cost:true,
  });
  const setA = k => v => setAlerts(p=>({...p,[k]:v}));

  const sendCode = () => {
    if (!phone.trim() || phone.length < 10) return;
    setVerifying(true);
    setStep("verify");
  };
  const verifyCode = () => {
    if (code.length < 4) return;
    setVerified(true);
    setStep("done");
  };
  const sendTest = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div style={{ padding:"28px", maxWidth:720 }}>
      <div style={{ marginBottom:26 }}>
        <h1 className="sg a-left" style={{ fontSize:24, fontWeight:800, color:"#f0eeff" }}>SMS Alerts</h1>
        <p className="a-left" style={{ color:"#6b7280", fontSize:13.5, marginTop:3, animationDelay:".06s" }}>
          Phase 8 — Get text message alerts before every renewal. Powered by Twilio.
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
        {[
          { icon:Phone,   t:"Instant Delivery",   d:"Texts land within seconds of a renewal trigger.", c:"#a855f7" },
          { icon:Shield,  t:"Secure & Private",   d:"E2E encrypted via Twilio. Number never sold.",    c:"#4ade80" },
          { icon:Bell,    t:"Smart Timing",       d:"Alerts at 7, 3, 1 day — and day-of.",             c:"#22d3ee" },
          { icon:Zap,     t:"Instant Setup",      d:"Verified in 60 seconds. No app required.",        c:"#fbbf24" },
        ].map((f,i) => (
          <Tilt key={i} max={10} style={{ borderRadius:13 }} className="a-up">
            <div className="glass-v" style={{ padding:"16px 18px", borderRadius:13, position:"relative" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${f.c},${f.c}33)` }} />
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <div style={{ width:36, height:36, borderRadius:9, background:`${f.c}14`, border:`1px solid ${f.c}28`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><f.icon size={17} color={f.c}/></div>
                <div>
                  <div className="sg" style={{ fontSize:13, fontWeight:700, color:"#f0eeff" }}>{f.t}</div>
                  <div style={{ fontSize:11.5, color:"#6b7280", marginTop:2 }}>{f.d}</div>
                </div>
              </div>
            </div>
          </Tilt>
        ))}
      </div>

      {/* Phone verification */}
      <Tilt max={3} style={{ borderRadius:16, marginBottom:16 }} className="a-up">
        <div className="glass-v" style={{ padding:24, borderRadius:16, position:"relative" }}>
          <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:1, background:"linear-gradient(90deg,transparent,rgba(168,85,247,.45),transparent)" }} />
          <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:18 }}>
            <Phone size={15} color="#a855f7"/>
            <div className="sg" style={{ fontSize:14, fontWeight:700, color:"#f0eeff" }}>Phone Verification</div>
            {verified && <span style={{ background:"rgba(74,222,128,.1)", color:"#4ade80", border:"1px solid rgba(74,222,128,.22)", borderRadius:99, padding:"2px 9px", fontSize:10, fontWeight:800 }}>VERIFIED ✓</span>}
          </div>

          {step === "phone" && (
            <>
              <label className="sg" style={{ fontSize:10.5, fontWeight:700, color:"#6b7280", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:".06em" }}>Mobile Number</label>
              <div style={{ display:"flex", gap:9, marginBottom:12 }}>
                <div style={{ flex:1, display:"flex", alignItems:"center", gap:9, background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:10, padding:"10px 13px" }}>
                  <Phone size={14} color="#374151"/>
                  <input type="tel" placeholder="+1 555 000 0000" value={phone} onChange={e=>setPhone(e.target.value)}
                    style={{ background:"none", border:"none", color:"#f0eeff", fontSize:14, flex:1, outline:"none" }} />
                </div>
                <button className="btn-p" onClick={sendCode} style={{ padding:"10px 20px", borderRadius:10, fontSize:13, fontWeight:700, flexShrink:0 }}>
                  Send Code
                </button>
              </div>
              <div style={{ fontSize:12, color:"#4b5563" }}>Standard SMS rates may apply. Carrier-independent delivery.</div>
            </>
          )}

          {step === "verify" && (
            <>
              <div style={{ fontSize:13.5, color:"#9ca3af", marginBottom:14 }}>
                Enter the 6-digit code sent to <span style={{ color:"#f0eeff", fontWeight:600 }}>{phone}</span>
              </div>
              <div style={{ display:"flex", gap:9, marginBottom:12 }}>
                <input type="text" maxLength={6} placeholder="000000" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))}
                  style={{ flex:1, background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:10, color:"#f0eeff", fontSize:24, textAlign:"center", padding:"12px", letterSpacing:"8px", outline:"none", fontFamily:"'Space Grotesk',sans-serif", fontWeight:800 }} />
                <button className="btn-p" onClick={verifyCode} disabled={code.length < 4}
                  style={{ padding:"12px 20px", borderRadius:10, fontSize:13, fontWeight:700, flexShrink:0, opacity:code.length>=4?1:.5 }}>
                  Verify
                </button>
              </div>
              <button onClick={() => setStep("phone")} style={{ background:"none", border:"none", color:"#6b7280", cursor:"pointer", fontSize:12.5 }}>← Change number</button>
            </>
          )}

          {step === "done" && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(74,222,128,.12)", border:"1px solid rgba(74,222,128,.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <CheckCircle size={18} color="#4ade80"/>
                </div>
                <div>
                  <div style={{ fontSize:13.5, fontWeight:600, color:"#f0eeff" }}>{phone} verified</div>
                  <div style={{ fontSize:12, color:"#6b7280" }}>SMS alerts are active</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn-o" onClick={() => { setStep("phone"); setVerified(false); setCode(""); }}
                  style={{ padding:"7px 14px", borderRadius:8, fontSize:12.5 }}>Change</button>
                <button className="btn-o" onClick={sendTest}
                  style={{ padding:"7px 14px", borderRadius:8, fontSize:12.5, color:testSent?"#4ade80":"#94a3b8", borderColor:testSent?"rgba(74,222,128,.3)":"rgba(255,255,255,.1)" }}>
                  {testSent ? <><Check size={12}/> Sent!</> : <><Send size={12}/> Test SMS</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </Tilt>

      {/* Alert config */}
      <Tilt max={3} style={{ borderRadius:16 }} className="a-up">
        <div className="glass-v" style={{ padding:24, borderRadius:16, position:"relative" }}>
          <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:1, background:"linear-gradient(90deg,transparent,rgba(34,211,238,.4),transparent)" }} />
          <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:18 }}>
            <Bell size={15} color="#22d3ee"/>
            <div className="sg" style={{ fontSize:14, fontWeight:700, color:"#f0eeff" }}>SMS Alert Triggers</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
            {[
              { k:"day7",   l:"7 days before renewal",   s:"Early planning reminder",    c:"#a855f7" },
              { k:"day3",   l:"3 days before renewal",   s:"Standard warning",            c:"#fbbf24" },
              { k:"day1",   l:"1 day before renewal",    s:"Final reminder",              c:"#f97316" },
              { k:"day0",   l:"Day of renewal",          s:"Morning-of alert",            c:"#f87171" },
              { k:"overdue",l:"Overdue subscription",    s:"Immediate notification",       c:"#f87171" },
              { k:"cost",   l:"Spend threshold alert",   s:"When monthly total exceeds $500", c:"#22d3ee" },
              { k:"digest", l:"Weekly SMS digest",       s:"Sunday evening summary",      c:"#4ade80" },
            ].map(row => (
              <div key={row.k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,.045)" }}>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:row.c, boxShadow:`0 0 6px ${row.c}66`, flexShrink:0 }} />
                  <div>
                    <div style={{ fontSize:13.5, fontWeight:500, color:"#f0eeff" }}>{row.l}</div>
                    <div style={{ fontSize:11.5, color:"#6b7280", marginTop:1 }}>{row.s}</div>
                  </div>
                </div>
                <Toggle on={alerts[row.k]} onChange={setA(row.k)}/>
              </div>
            ))}
          </div>
          <div style={{ marginTop:16 }}>
            <button className="btn-p" style={{ padding:"10px 24px", borderRadius:10, fontSize:13.5, fontWeight:700 }}>
              <Check size={14}/> Save SMS Settings
            </button>
          </div>
        </div>
      </Tilt>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PHASE 8-C: BUDGET TRACKER
═══════════════════════════════════════════════════════════════ */
function BudgetPage({ subs }) {
  const total = subs.reduce((s,x)=>s+x.price,0);
  const [budget, setBudget] = useState(1200);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState("1200");
  const pct = Math.min(100, (total / budget) * 100);
  const byCat = subs.reduce((a,s)=>{a[s.cat]=(a[s.cat]||0)+s.price;return a;},{});
  const catArr = Object.entries(byCat).map(([n,v])=>({n,v,c:CAT_COLORS[n]||"#a855f7"})).sort((a,b)=>b.v-a.v);
  const MONTHLY_HIST = [
    {m:"Dec",v:982,b:1200},{m:"Jan",v:1047,b:1200},{m:"Feb",v:1089,b:1150},
    {m:"Mar",v:1134,b:1150},{m:"Apr",v:1198,b:1200},{m:"May",v:total,b:budget},
  ];
  const saveBudget = () => { const v = parseFloat(editVal); if (v > 0) setBudget(v); setEditing(false); };

  return (
    <div style={{ padding:"28px", maxWidth:1100 }}>
      <div style={{ marginBottom:26 }}>
        <h1 className="sg a-left" style={{ fontSize:24, fontWeight:800, color:"#f0eeff" }}>Budget Tracker</h1>
        <p className="a-left" style={{ color:"#6b7280", fontSize:13.5, marginTop:3, animationDelay:".06s" }}>
          Phase 8 — Set monthly spend limits and track your budget in real time.
        </p>
      </div>

      {/* BUDGET HERO CARD */}
      <Tilt max={5} style={{ borderRadius:18, marginBottom:18 }} className="a-up">
        <div className="glass-v" style={{ padding:28, borderRadius:18, position:"relative", overflow:"hidden",
          border:`1px solid ${pct>90?"rgba(248,113,113,.25)":pct>75?"rgba(251,191,36,.2)":"rgba(168,85,247,.18)"}` }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
            background:`linear-gradient(90deg,${pct>90?"#f87171":pct>75?"#fbbf24":"#7c3aed"},${pct>90?"#f97316":pct>75?"#f97316":"#a855f7"},${pct>90?"#f87171":pct>75?"#fbbf24":"#22d3ee"})` }} />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:16 }}>
            <div>
              <div style={{ fontSize:11, color:"#6b7280", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>Monthly Budget</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                <span className="sg" style={{ fontSize:44, fontWeight:800, color:"#f0eeff", lineHeight:1 }}>${total.toFixed(0)}</span>
                <span style={{ fontSize:18, color:"#6b7280" }}>/ </span>
                {editing ? (
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <input type="number" value={editVal} onChange={e=>setEditVal(e.target.value)}
                      style={{ width:90, background:"rgba(255,255,255,.08)", border:"1px solid rgba(168,85,247,.4)", borderRadius:8, color:"#f0eeff", fontSize:22, padding:"4px 10px", outline:"none", fontFamily:"'Space Grotesk',sans-serif", fontWeight:700 }} />
                    <button onClick={saveBudget} className="btn-p" style={{ padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:700 }}><Check size={12}/></button>
                    <button onClick={()=>setEditing(false)} className="btn-o" style={{ padding:"6px 10px", borderRadius:8 }}><X size={12}/></button>
                  </div>
                ) : (
                  <button onClick={()=>{setEditing(true);setEditVal(String(budget));}} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                    <span className="sg" style={{ fontSize:22, color:"#6b7280" }}>${budget}</span>
                    <Edit2 size={13} color="#6b7280"/>
                  </button>
                )}
              </div>
              <div style={{ fontSize:13, color:"#6b7280", marginTop:6 }}>
                <span style={{ color:pct>90?"#f87171":pct>75?"#fbbf24":"#4ade80", fontWeight:700 }}>${(budget-total).toFixed(2)}</span>
                {" "}{budget-total >= 0 ? "remaining this month" : "over budget!"}
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:40, fontWeight:900, fontFamily:"'Space Grotesk',sans-serif",
                color:pct>90?"#f87171":pct>75?"#fbbf24":"#4ade80" }}>{pct.toFixed(0)}%</div>
              <div style={{ fontSize:12, color:"#6b7280" }}>of budget used</div>
            </div>
          </div>
          <div style={{ marginTop:22, background:"rgba(255,255,255,.06)", borderRadius:99, height:12, overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:99, transition:"width 1.4s cubic-bezier(.22,1,.36,1)",
              background:pct>90?"linear-gradient(90deg,#f87171,#f97316)":pct>75?"linear-gradient(90deg,#fbbf24,#f97316)":"linear-gradient(90deg,#7c3aed,#a855f7,#22d3ee)",
              width:`${pct}%` }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
            <span style={{ fontSize:11, color:"#6b7280" }}>$0</span>
            <span style={{ fontSize:11, color:"#6b7280" }}>${budget}/mo limit</span>
          </div>
        </div>
      </Tilt>

      {/* CHARTS ROW */}
      <div style={{ display:"grid", gridTemplateColumns:"1.3fr 1fr", gap:16, marginBottom:16 }}>
        <Tilt max={5} style={{ borderRadius:16 }} className="a-up">
          <div className="glass-v" style={{ padding:22, borderRadius:16, position:"relative" }}>
            <div style={{ position:"absolute", top:0, left:"15%", right:"15%", height:1, background:"linear-gradient(90deg,transparent,rgba(168,85,247,.4),transparent)" }} />
            <div className="sg" style={{ fontSize:14, fontWeight:700, color:"#f0eeff", marginBottom:3 }}>Spend vs Budget</div>
            <div style={{ fontSize:12, color:"#6b7280", marginBottom:16 }}>6-month history</div>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={MONTHLY_HIST} barGap={4} barCategoryGap="28%" margin={{top:4,right:4,left:-22,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false}/>
                <XAxis dataKey="m" tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`}/>
                <Tooltip contentStyle={{background:"rgba(6,4,10,.97)",border:"1px solid rgba(168,85,247,.2)",borderRadius:8,fontSize:11.5}}
                  formatter={(val,name)=>[`$${val.toFixed(0)}`, name==="v"?"Spent":"Budget"]}/>
                <Bar dataKey="b" fill="rgba(168,85,247,.12)" radius={[4,4,0,0]} name="Budget"/>
                <Bar dataKey="v" radius={[4,4,0,0]} name="Spent">
                  {MONTHLY_HIST.map((entry,i)=><Cell key={i} fill={entry.v>entry.b?"#f87171":entry.v/entry.b>0.85?"#fbbf24":"#a855f7"}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Tilt>
        <Tilt max={7} style={{ borderRadius:16 }} className="a-up">
          <div className="glass-v" style={{ padding:22, borderRadius:16, position:"relative" }}>
            <div style={{ position:"absolute", top:0, left:"15%", right:"15%", height:1, background:"linear-gradient(90deg,transparent,rgba(34,211,238,.4),transparent)" }} />
            <div className="sg" style={{ fontSize:14, fontWeight:700, color:"#f0eeff", marginBottom:16 }}>Budget by Category</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {catArr.slice(0,7).map(c=>{
                const catPct = Math.min(100,(c.v/total)*100);
                const share = (c.v/budget)*100;
                return (
                  <div key={c.n}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <div style={{ display:"flex", gap:7, alignItems:"center" }}>
                        <div style={{ width:7, height:7, borderRadius:2, background:c.c, flexShrink:0 }}/>
                        <span style={{ fontSize:12.5, color:"#94a3b8" }}>{c.n}</span>
                      </div>
                      <div style={{ display:"flex", gap:10 }}>
                        <span className="sg" style={{ fontSize:12, fontWeight:700, color:"#f0eeff" }}>${c.v.toFixed(0)}</span>
                        <span style={{ fontSize:11, color:"#4b5563" }}>{share.toFixed(0)}% of budget</span>
                      </div>
                    </div>
                    <div className="pbar">
                      <div className="pfill" style={{ width:`${catPct}%`, background:`linear-gradient(90deg,${c.c},${c.c}88)` }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Tilt>
      </div>

      {/* THRESHOLD ALERTS */}
      <Tilt max={3} style={{ borderRadius:16 }} className="a-up">
        <div className="glass-v" style={{ padding:22, borderRadius:16, position:"relative" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:16 }}>
            <AlertTriangle size={15} color="#fbbf24"/>
            <div className="sg" style={{ fontSize:14, fontWeight:700, color:"#f0eeff" }}>Threshold Alerts</div>
            <span style={{ fontSize:10.5, color:"#6b7280" }}>Get notified when spend crosses a limit</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:10 }}>
            {[
              { pct:75,  label:"Warning at 75%",  val:`$${(budget*.75).toFixed(0)}`, active:pct>=75,  c:"#fbbf24" },
              { pct:90,  label:"Critical at 90%",  val:`$${(budget*.9).toFixed(0)}`,  active:pct>=90,  c:"#f97316" },
              { pct:100, label:"Over budget",      val:`$${budget}+`,                 active:pct>=100, c:"#f87171" },
            ].map(t=>(
              <div key={t.pct} style={{ padding:"14px 16px", borderRadius:11,
                background:t.active?`${t.c}10`:"rgba(255,255,255,.02)",
                border:`1px solid ${t.active?t.c+"33":"rgba(255,255,255,.06)"}`,
                transition:"all .3s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:t.active?t.c:"#6b7280" }}>{t.label}</span>
                  {t.active && <span style={{ fontSize:9, fontWeight:900, background:`${t.c}20`, color:t.c, border:`1px solid ${t.c}33`, borderRadius:99, padding:"2px 6px" }}>ACTIVE</span>}
                </div>
                <div className="sg" style={{ fontSize:18, fontWeight:800, color:t.active?t.c:"#4b5563" }}>{t.val}</div>
              </div>
            ))}
          </div>
        </div>
      </Tilt>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PHASE 8-D: EXPORT CENTER
═══════════════════════════════════════════════════════════════ */
function ExportPage({ subs }) {
  const [fmt, setFmt] = useState("csv");
  const [range, setRange] = useState("all");
  const [fields, setFields] = useState({ name:true,cat:true,price:true,billing:true,next:true,status:true,tier:true,url:true });
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  const toggleField = k => setFields(p=>({...p,[k]:!p[k]}));

  const doExport = () => {
    setExporting(true);
    setTimeout(() => {
      // Generate real CSV download
      const cols = Object.entries(fields).filter(([,v])=>v).map(([k])=>k);
      const header = cols.join(",");
      const rows = subs.map(s => cols.map(c => {
        const v = s[c] ?? "";
        return typeof v === "string" && v.includes(",") ? `"${v}"` : v;
      }).join(","));
      const csv = [header, ...rows].join("\n");
      const blob = new Blob([csv], {type:"text/csv"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href=url; a.download="subscriptions.csv"; a.click();
      URL.revokeObjectURL(url);
      setExporting(false); setDone(true);
      setTimeout(()=>setDone(false), 3000);
    }, 1200);
  };

  return (
    <div style={{ padding:"28px", maxWidth:740 }}>
      <div style={{ marginBottom:26 }}>
        <h1 className="sg a-left" style={{ fontSize:24, fontWeight:800, color:"#f0eeff" }}>Export Center</h1>
        <p className="a-left" style={{ color:"#6b7280", fontSize:13.5, marginTop:3, animationDelay:".06s" }}>
          Phase 8 — Export your subscription data in multiple formats for reporting.
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
        {/* Format */}
        <Tilt max={6} style={{ borderRadius:14 }} className="a-up">
          <div className="glass-v" style={{ padding:20, borderRadius:14, position:"relative" }}>
            <div className="sg" style={{ fontSize:13, fontWeight:700, color:"#f0eeff", marginBottom:14 }}>Export Format</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { id:"csv",  label:"CSV",          desc:"Excel, Sheets, any spreadsheet",   icon:"📊" },
                { id:"json", label:"JSON",          desc:"Developers & API integrations",    icon:"{}" },
                { id:"pdf",  label:"PDF Report",   desc:"Printable summary with charts",    icon:"📄" },
              ].map(f=>(
                <button key={f.id} onClick={()=>setFmt(f.id)} style={{
                  display:"flex", alignItems:"center", gap:11, padding:"11px 14px",
                  borderRadius:10, cursor:"pointer", textAlign:"left",
                  background: fmt===f.id?"rgba(168,85,247,.1)":"rgba(255,255,255,.03)",
                  border:`1px solid ${fmt===f.id?"rgba(168,85,247,.28)":"rgba(255,255,255,.07)"}`,
                  transition:"all .18s", fontFamily:"inherit",
                }}>
                  <span style={{ fontSize:18 }}>{f.icon}</span>
                  <div>
                    <div className="sg" style={{ fontSize:13, fontWeight:700, color:fmt===f.id?"#a855f7":"#f0eeff" }}>{f.label}</div>
                    <div style={{ fontSize:11, color:"#6b7280" }}>{f.desc}</div>
                  </div>
                  {fmt===f.id && <div style={{ marginLeft:"auto", width:18, height:18, borderRadius:"50%", background:"#a855f7", display:"flex", alignItems:"center", justifyContent:"center" }}><Check size={10} color="white"/></div>}
                </button>
              ))}
            </div>
          </div>
        </Tilt>

        {/* Fields */}
        <Tilt max={6} style={{ borderRadius:14 }} className="a-up">
          <div className="glass-v" style={{ padding:20, borderRadius:14, position:"relative" }}>
            <div className="sg" style={{ fontSize:13, fontWeight:700, color:"#f0eeff", marginBottom:14 }}>Include Fields</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {Object.entries(fields).map(([k,v])=>(
                <label key={k} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                  <div onClick={()=>toggleField(k)} style={{
                    width:16, height:16, borderRadius:4, flexShrink:0,
                    background:v?"#a855f7":"rgba(255,255,255,.06)",
                    border:`1.5px solid ${v?"#a855f7":"rgba(255,255,255,.14)"}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"all .18s", cursor:"pointer",
                  }}>
                    {v && <Check size={9} color="white"/>}
                  </div>
                  <span style={{ fontSize:12.5, color:v?"#f0eeff":"#6b7280", fontWeight:v?600:400, textTransform:"capitalize" }}>{k}</span>
                </label>
              ))}
            </div>
          </div>
        </Tilt>
      </div>

      {/* Export button */}
      <Tilt max={3} style={{ borderRadius:14 }} className="a-up">
        <div className="glass-v" style={{ padding:22, borderRadius:14, position:"relative" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:14 }}>
            <div>
              <div className="sg" style={{ fontSize:14, fontWeight:700, color:"#f0eeff" }}>
                {subs.length} subscriptions · {Object.values(fields).filter(Boolean).length} fields · {fmt.toUpperCase()}
              </div>
              <div style={{ fontSize:12.5, color:"#6b7280", marginTop:3 }}>
                Estimated file size: ~{(subs.length * Object.values(fields).filter(Boolean).length * 15 / 1024).toFixed(1)} KB
              </div>
            </div>
            <button className="btn-p" onClick={doExport} disabled={exporting}
              style={{ padding:"11px 28px", borderRadius:11, fontSize:14, fontWeight:700, minWidth:160 }}>
              {exporting ? <><Spin size={14}/> Exporting…</> : done ? <><Check size={14}/> Downloaded!</> : <><Download size={14}/> Export {fmt.toUpperCase()}</>}
            </button>
          </div>
        </div>
      </Tilt>

      {/* Recent exports */}
      <div className="a-up glass-v" style={{ padding:20, borderRadius:14, marginTop:14 }}>
        <div className="sg" style={{ fontSize:13, fontWeight:700, color:"#f0eeff", marginBottom:14 }}>Recent Exports</div>
        {[
          { name:"subscriptions_may2025.csv", date:"May 19, 2025", size:"4.2 KB", fmt:"CSV" },
          { name:"subscriptions_apr2025.json",date:"Apr 30, 2025", size:"8.7 KB", fmt:"JSON"},
          { name:"monthly_report_apr.pdf",    date:"Apr 01, 2025", size:"142 KB", fmt:"PDF" },
        ].map((e,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"9px 10px", borderRadius:9, transition:"background .18s", cursor:"pointer" }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(168,85,247,.04)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <div style={{ width:32, height:32, borderRadius:8, background:"rgba(168,85,247,.1)", border:"1px solid rgba(168,85,247,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#a855f7" }}>{e.fmt}</div>
              <div>
                <div style={{ fontSize:13, color:"#f0eeff", fontFamily:"monospace" }}>{e.name}</div>
                <div style={{ fontSize:11, color:"#6b7280" }}>{e.date} · {e.size}</div>
              </div>
            </div>
            <button className="btn-o" style={{ padding:"5px 11px", borderRadius:7, fontSize:11.5 }}><Download size={11}/> Re-download</button>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState("checking"); // checking | landing | auth | app
  const [authedUser, setAuthedUser] = useState(null);
  const { refreshUser, logout: doLogout } = useAuth();

  // On first load, try to restore a session from a previously-stored access
  // token. We await refreshUser's *return value* directly rather than
  // watching the hook's internal user/loading state from a second effect —
  // cross-effect state-watching here raced against the in-flight request and
  // always sent logged-in users back to the landing page on refresh.
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { setScreen("landing"); return; }

    let cancelled = false;
    (async () => {
      const restored = await refreshUser({ accessToken: token });
      if (cancelled) return;
      if (restored) { setAuthedUser(restored); setScreen("app"); }
      else { localStorage.clear(); setScreen("landing"); }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAuth = (u) => { setAuthedUser(u); setScreen("app"); };
  const handleLogout = () => {
    doLogout({ refreshToken: localStorage.getItem("refreshToken") });
    setAuthedUser(null);
    setScreen("landing");
  };

  return (
    <>
      <style>{CSS}</style>
      {screen==="checking" && (
        <div style={{ minHeight:"100vh",background:"#06040a",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <div style={{ width:24,height:24,border:"2px solid rgba(0,255,135,.2)",borderTopColor:"#00ff87",borderRadius:"50%",animation:"spin .65s linear infinite" }} />
        </div>
      )}
      {screen==="landing" && <Landing onStart={()=>setScreen("auth")} />}
      {screen==="auth"    && <AuthPage onAuth={handleAuth} />}
      {screen==="app"     && <AppShell user={authedUser} onLogout={handleLogout} />}
    </>
  );
}
