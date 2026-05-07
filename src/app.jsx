// App shell — presents the three directions on a scrollable canvas.
// Persists active screen in localStorage so refresh preserves state.

const { useState, useEffect, useRef, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "screen": "home",
  "focusedDirection": "signal",
  "lineId": "sim-01",
  "invoiceId": 90701
}/*EDITMODE-END*/;

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem('optimera-state') || '{}');
    return { ...TWEAK_DEFAULTS, ...s };
  } catch { return { ...TWEAK_DEFAULTS }; }
}

function App() {
  const [state, setState] = useState(loadState);
  const [tweakOpen, setTweakOpen] = useState(false);

  useEffect(() => { localStorage.setItem('optimera-state', JSON.stringify(state)); }, [state]);

  // register tweaks listener
  useEffect(() => {
    const handler = (e) => {
      if (!e.data) return;
      if (e.data.type === '__activate_edit_mode') setTweakOpen(true);
      if (e.data.type === '__deactivate_edit_mode') setTweakOpen(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const update = (patch) => {
    setState(s => ({ ...s, ...patch }));
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*');
  };

  const screens = [
    { id: 'home', label: 'Home' },
    { id: 'lines', label: 'Lines' },
    { id: 'line', label: 'Line detail' },
    { id: 'bills', label: 'Bills' },
    { id: 'bill', label: 'Bill detail' },
    { id: 'settings', label: 'Settings' },
  ];
  const directions = [
    { id: 'signal', name: '01 · Signal',
      subtitle: 'Data-rich · operator-console density',
      body: 'Live at-a-glance readout of every line. Numbers first; 14-day sparklines; cost allocation per line on the same screen.' },
    { id: 'editorial', name: '02 · Editorial',
      subtitle: 'Calm · big type · lots of air',
      body: 'Treats your account like a magazine cover. One hero number per screen. Instrument Serif accents for the moments that matter.' },
    { id: 'spatial', name: '03 · Stack',
      subtitle: 'iOS 26 liquid glass · layered',
      body: 'Your lines as a stack of physical SIM cards you peel back. Depth and material carry the meaning — numbers stay calm.' },
  ];

  const activeDirId = state.focusedDirection;
  const visibleDirs = activeDirId === 'all' ? directions : directions.filter(d => d.id === activeDirId);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brandRow}>
          <div style={styles.logoMark}>
            <div style={styles.logoDot}/>
          </div>
          <div>
            <div style={styles.brandTitle}>OptimERA</div>
            <div style={styles.brandSub}>iPhone + Android app</div>
          </div>
        </div>
      </header>

      <main style={styles.canvas}>
        {visibleDirs.map(d => (
          <div key={d.id} style={styles.column}>
            <DirectionFrame
              directionId={d.id}
              screen={state.screen}
              lineId={state.lineId}
              invoiceId={state.invoiceId}
              onScreen={(screen) => update({ screen })}
              onLine={(lineId) => update({ lineId, screen: 'line' })}
              onInvoice={(invoiceId) => update({ invoiceId, screen: 'bill' })}
            />
          </div>
        ))}
      </main>

      {tweakOpen && (
        <div style={styles.tweaks}>
          <div style={styles.tweaksTitle}>Tweaks</div>
          <div style={styles.tweakGroup}>
            <div style={styles.tweakLabel}>Screen</div>
            <div style={styles.tweakRow}>
              {screens.map(s => (
                <button key={s.id} onClick={() => update({ screen: s.id })}
                  style={{ ...styles.tweakChip, ...(state.screen === s.id ? styles.tweakChipActive : {}) }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div style={styles.tweakGroup}>
            <div style={styles.tweakLabel}>Direction focus</div>
            <div style={styles.tweakRow}>
              <button onClick={() => update({ focusedDirection: 'all' })}
                style={{ ...styles.tweakChip, ...(activeDirId === 'all' ? styles.tweakChipActive : {}) }}>all 3</button>
              {directions.map(d => (
                <button key={d.id} onClick={() => update({ focusedDirection: d.id })}
                  style={{ ...styles.tweakChip, ...(activeDirId === d.id ? styles.tweakChipActive : {}) }}>
                  {d.name}
                </button>
              ))}
            </div>
          </div>
          <div style={styles.tweakGroup}>
            <div style={styles.tweakLabel}>Line detail target</div>
            <div style={styles.tweakRow}>
              {window.OPTIMERA.devices.map(d => (
                <button key={d.id} onClick={() => update({ lineId: d.id, screen: 'line' })}
                  style={{ ...styles.tweakChip, ...(state.lineId === d.id ? styles.tweakChipActive : {}) }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DirectionFrame({ directionId, screen, lineId, invoiceId, onScreen, onLine, onInvoice }) {
  const Dir = directionId === 'signal' ? window.DirSignal
            : directionId === 'editorial' ? window.DirEditorial
            : window.DirSpatial;
  if (!Dir) {
    return <div style={{ color: '#666', padding: 24 }}>Direction "{directionId}" not ready</div>;
  }
  return (
    <Dir screen={screen} lineId={lineId} invoiceId={invoiceId}
         onScreen={onScreen} onLine={onLine} onInvoice={onInvoice} />
  );
}

// --- styles (app-shell scoped) ---
const styles = {
  page: {
    minHeight: '100vh',
    padding: '40px 36px 80px',
    background: 'radial-gradient(1200px 800px at 20% -10%, rgba(251,213,61,0.06), transparent 60%), #0b0b0c',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    borderBottom: '1px solid rgba(255,255,255,.08)',
    paddingBottom: 20, marginBottom: 28, gap: 40, flexWrap: 'wrap',
  },
  brandRow: { display: 'flex', alignItems: 'center', gap: 14 },
  logoMark: {
    width: 40, height: 40, borderRadius: 10, background: '#0a0a0a',
    border: '1px solid rgba(255,255,255,.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoDot: { width: 14, height: 14, borderRadius: '50%', background: '#FBD53D',
    boxShadow: '0 0 16px rgba(251,213,61,.7)' },
  brandTitle: { fontFamily: 'Space Grotesk, Geist, sans-serif', fontSize: 20, fontWeight: 600, letterSpacing: 0.2 },
  brandSub: { fontFamily: 'Geist Mono, ui-monospace, monospace', fontSize: 11, color: 'rgba(244,244,242,.5)' },
  meta: { display: 'flex', gap: 28, fontFamily: 'Geist Mono, ui-monospace, monospace', fontSize: 11,
    color: 'rgba(244,244,242,.72)', textTransform: 'uppercase', letterSpacing: 0.06,
    flexWrap: 'wrap', justifyContent: 'flex-end' },
  metaKey: { color: 'rgba(244,244,242,.35)', marginRight: 6 },
  reasoning: { maxWidth: 760, marginBottom: 40 },
  h3: { fontFamily: 'Geist, system-ui', fontWeight: 500, fontSize: 12, color: 'rgba(244,244,242,.4)',
    letterSpacing: 0.18, textTransform: 'uppercase', margin: '0 0 14px' },
  p: { fontFamily: 'Geist, system-ui', fontSize: 15.5, lineHeight: 1.55, color: 'rgba(244,244,242,.86)',
    margin: '0 0 12px', maxWidth: 720, textWrap: 'pretty' },
  swatch: { display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Geist Mono, monospace',
    fontSize: 12, padding: '1px 6px', border: '1px solid rgba(255,255,255,.12)', borderRadius: 4, marginLeft: 4 },
  mono: { fontFamily: 'Geist Mono, monospace', fontSize: '0.92em' },
  screenNav: { display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
    padding: '14px 16px', background: 'rgba(255,255,255,.03)',
    border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, marginBottom: 36 },
  navLabel: { fontFamily: 'Geist Mono, monospace', fontSize: 10.5,
    textTransform: 'uppercase', color: 'rgba(244,244,242,.35)',
    letterSpacing: 0.12, marginRight: 6 },
  navBtn: { background: 'transparent', color: 'rgba(244,244,242,.7)',
    border: '1px solid rgba(255,255,255,.08)', borderRadius: 999,
    padding: '6px 12px', fontFamily: 'Geist, system-ui', fontSize: 12.5,
    cursor: 'pointer', fontWeight: 500, letterSpacing: 0.02, transition: 'all .15s' },
  navBtnActive: { background: '#FBD53D', color: '#0a0a0a', borderColor: '#FBD53D' },
  canvas: { display: 'grid', gap: 40, justifyContent: 'center',
    gridTemplateColumns: 'repeat(auto-fit, minmax(402px, 430px))' },
  column: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 },
  colHeader: { width: '100%', maxWidth: 420 },
  colName: { fontFamily: 'Space Grotesk, Geist, sans-serif', fontSize: 18, fontWeight: 600, color: '#FBD53D' },
  colSub: { fontFamily: 'Geist Mono, monospace', fontSize: 11, color: 'rgba(244,244,242,.55)',
    textTransform: 'uppercase', letterSpacing: 0.1, marginTop: 2 },
  colBody: { fontFamily: 'Geist, system-ui', fontSize: 13.5, lineHeight: 1.5,
    color: 'rgba(244,244,242,.7)', margin: '10px 0 0', textWrap: 'pretty' },
  tweaks: {
    position: 'fixed', right: 24, bottom: 24, width: 320, zIndex: 100,
    background: 'rgba(14,14,16,.92)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, padding: 16,
    boxShadow: '0 20px 50px rgba(0,0,0,.4)',
  },
  tweaksTitle: { fontFamily: 'Geist, system-ui', fontWeight: 600, fontSize: 14, marginBottom: 14, color: '#FBD53D' },
  tweakGroup: { marginBottom: 14 },
  tweakLabel: { fontFamily: 'Geist Mono, monospace', fontSize: 10,
    textTransform: 'uppercase', color: 'rgba(244,244,242,.4)', marginBottom: 6, letterSpacing: 0.1 },
  tweakRow: { display: 'flex', flexWrap: 'wrap', gap: 4 },
  tweakChip: { background: 'rgba(255,255,255,.05)', color: '#f4f4f2',
    border: '1px solid rgba(255,255,255,.08)', borderRadius: 6,
    padding: '4px 8px', fontSize: 11, cursor: 'pointer', fontFamily: 'Geist, system-ui' },
  tweakChipActive: { background: '#FBD53D', color: '#0a0a0a', borderColor: '#FBD53D' },
};

ReactDOM.createRoot(document.getElementById('app')).render(<App/>);
