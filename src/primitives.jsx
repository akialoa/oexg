// Shared primitives: icons, sparklines, donut, progress bars.
// Uses inline SVG only. All styles scoped via style={} to avoid collisions.

// --- inline icons (hand-picked, stroked, 1.6px). NOT hand-drawn imagery. ---
const Ico = {
  home: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 11l9-8 9 8"/><path d="M5 9.5V21h14V9.5"/>
    </svg>
  ),
  lines: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="7" y="3" width="10" height="18" rx="2.2"/><line x1="11" y1="18" x2="13" y2="18"/>
    </svg>
  ),
  bills: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 13h7M9 17h5"/>
    </svg>
  ),
  settings: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.08a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.17.36.55.61 1.01.61H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  phone: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0122 16.92z"/>
    </svg>
  ),
  msg: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  data: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  signal: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2 20h2M6 16h2M10 12h2M14 8h2M18 4h2"/><path d="M2 20v-2M6 20v-6M10 20v-10M14 20v-14M18 20v-18"/>
    </svg>
  ),
  chev: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9 6l6 6-6 6"/>
    </svg>
  ),
  plus: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  bolt: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/>
    </svg>
  ),
  card: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>
    </svg>
  ),
  arrUp: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M7 17L17 7M8 7h9v9"/>
    </svg>
  ),
  arrDn: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M17 7L7 17M16 17H7V8"/>
    </svg>
  ),
  check: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  ),
  dot3: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>
    </svg>
  ),
  search: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/>
    </svg>
  ),
  bell: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/>
    </svg>
  ),
  globe: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>
    </svg>
  ),
  sim: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M18 21H6a2 2 0 01-2-2V9l6-6h8a2 2 0 012 2v14a2 2 0 01-2 2z"/>
      <rect x="8" y="11" width="8" height="7" rx="1"/>
    </svg>
  ),
  download: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
    </svg>
  ),
  wifi: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12.5a10 10 0 0114 0"/><path d="M8.5 15.8a5 5 0 017 0"/><circle cx="12" cy="19" r="1" fill="currentColor"/>
    </svg>
  ),
  logout: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>
    </svg>
  ),
};

// ---- Sparkline (line) ------------------------------------------------------
function Spark({ values, width = 120, height = 32, color = '#FBD53D', strokeWidth = 1.5, fill }) {
  if (!values || values.length === 0) return null;
  const max = Math.max(...values, 0.001);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const stepX = width / (values.length - 1 || 1);
  const pts = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / span) * (height - 2) - 1;
    return [x, y];
  });
  const d = pts.map(([x, y], i) => (i ? `L${x.toFixed(1)},${y.toFixed(1)}` : `M${x.toFixed(1)},${y.toFixed(1)}`)).join(' ');
  const areaD = `${d} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {fill && <path d={areaD} fill={fill} />}
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ---- Sparkbars --------------------------------------------------------------
function SparkBars({ values, width = 120, height = 32, color = '#FBD53D', gap = 1 }) {
  if (!values || values.length === 0) return null;
  const max = Math.max(...values, 0.001);
  const bw = (width - gap * (values.length - 1)) / values.length;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {values.map((v, i) => {
        const h = Math.max(1, (v / max) * (height - 2));
        return <rect key={i} x={i * (bw + gap)} y={height - h} width={bw} height={h} rx={0.8} fill={color} />;
      })}
    </svg>
  );
}

// ---- Donut ------------------------------------------------------------------
function Donut({ percent, size = 160, stroke = 14, track = 'rgba(255,255,255,0.08)', color = '#FBD53D', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(Math.max(percent, 0), 1));
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke={track} strokeWidth={stroke} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.2,.7,.2,1)' }}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

// ---- Stacked horizontal bar (for lines-by-data split) -----------------------
function StackedBar({ segments, height = 10, radius = 6 }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div style={{ display: 'flex', gap: 3, height, width: '100%' }}>
      {segments.map((seg, i) => (
        <div key={i} title={seg.label}
          style={{
            width: `${(seg.value / total) * 100}%`,
            background: seg.color,
            borderRadius: radius,
            minWidth: seg.value > 0 ? 6 : 0,
          }}/>
      ))}
    </div>
  );
}

// ---- Avatar (initials, deterministic hue) -----------------------------------
function Avatar({ name, email, size = 36, dark = true, ring }) {
  const initials = (name || email || '??')
    .split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: dark ? '#1c1c1c' : '#eeeae2',
      color: dark ? '#FBD53D' : '#0a0a0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Geist, system-ui', fontWeight: 600, fontSize: size * 0.38,
      letterSpacing: 0.3,
      boxShadow: ring ? `0 0 0 2px ${ring}` : 'inset 0 0 0 1px rgba(255,255,255,.06)',
      flexShrink: 0,
    }}>{initials}</div>
  );
}

// Shared
Object.assign(window, { Ico, Spark, SparkBars, Donut, StackedBar, Avatar });
