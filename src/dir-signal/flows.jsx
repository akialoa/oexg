// Signal direction — two destructive / commit flows for read-only-plus actions.
//   SuspendFlow     — pauses or restores a line with a state-preview confirmation
//   PlanChangeFlow  — compares plans side-by-side and shows the cost delta

const { useState: useStateFl, useEffect: useEffectFl, useMemo: useMemoFl } = React;

// Shared atomic styles — scoped namespace so we don't collide
const flowS = {
  // scrim + sheet
  scrim: {
    position: 'absolute', inset: 0, zIndex: 40,
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    animation: 'flowScrim 0.24s ease-out',
  },
  sheet: {
    width: '100%', maxHeight: '92%', overflowY: 'auto',
    background: 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)',
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    border: '1px solid rgba(255,255,255,.08)',
    borderBottom: 'none',
    color: '#f4f4f2',
    fontFamily: 'Geist, system-ui',
    animation: 'flowSheet 0.32s cubic-bezier(.2,.9,.25,1)',
    display: 'flex', flexDirection: 'column',
  },
  grab: { width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.15)',
    margin: '8px auto 0' },
  head: { padding: '10px 16px 0', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between' },
  headBtn: { width: 28, height: 28, borderRadius: 8,
    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)',
    color: '#f4f4f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: 14 },
  cap: { fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.55)',
    textTransform: 'uppercase', letterSpacing: 0.1 },
  title: { fontFamily: 'Space Grotesk', fontSize: 17, fontWeight: 600,
    letterSpacing: -0.2, marginTop: 2 },
  body: { padding: '18px 16px 0', flex: 1 },
  footer: { padding: '12px 16px 22px', borderTop: '1px solid rgba(255,255,255,.05)',
    marginTop: 18, display: 'flex', gap: 8 },

  // shared primitives
  cap2: { fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.45)',
    textTransform: 'uppercase', letterSpacing: 0.1, marginBottom: 6 },
  card: { background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
    borderRadius: 14, padding: 14 },
  rowLabel: { fontFamily: 'Geist', fontSize: 13, color: 'rgba(244,244,242,.65)' },
  rowValue: { fontFamily: 'Geist Mono', fontSize: 12, color: '#f4f4f2' },

  // CTA
  ctaGhost: {
    flex: 1, padding: '14px 16px',
    background: 'rgba(255,255,255,.04)', color: '#f4f4f2',
    border: '1px solid rgba(255,255,255,.08)', borderRadius: 12,
    fontFamily: 'Geist', fontSize: 14, fontWeight: 500,
    cursor: 'pointer',
  },
  ctaPrimary: {
    flex: 2, padding: '14px 16px',
    background: '#FBD53D', color: '#0a0a0a',
    border: 'none', borderRadius: 12,
    fontFamily: 'Geist', fontSize: 14, fontWeight: 600,
    cursor: 'pointer',
  },
  ctaDanger: {
    flex: 2, padding: '14px 16px',
    background: '#d6593b', color: '#fff',
    border: 'none', borderRadius: 12,
    fontFamily: 'Geist', fontSize: 14, fontWeight: 600,
    cursor: 'pointer',
  },

  // success
  successWrap: {
    padding: '22px 16px 12px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  successGlyph: {
    width: 68, height: 68, borderRadius: '50%',
    background: 'rgba(251,213,61,.12)', border: '1px solid rgba(251,213,61,.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#FBD53D', fontSize: 30, fontWeight: 600,
    animation: 'flowPop 0.5s cubic-bezier(.2,1.4,.4,1)',
  },
  successTitle: {
    fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 600,
    marginTop: 16, letterSpacing: -0.3,
  },
  successSub: {
    fontFamily: 'Geist Mono', fontSize: 11, color: 'rgba(244,244,242,.5)',
    textTransform: 'uppercase', letterSpacing: 0.08, marginTop: 6,
  },
};

// ============================================================================
// SUSPEND / RESTORE FLOW
// ============================================================================
// States: confirm → working → done

function SuspendFlow({ open, device, onClose, onComplete }) {
  const D = window.OPTIMERA;
  const { fmt } = D;
  const [phase, setPhase] = useStateFl('confirm');
  const isSuspended = device && device.state === 'suspended';
  const action = isSuspended ? 'restore' : 'suspend';

  useEffectFl(() => {
    if (open) setPhase('confirm');
  }, [open]);

  useEffectFl(() => {
    if (phase === 'working') {
      const t = setTimeout(() => setPhase('done'), 1400);
      return () => clearTimeout(t);
    }
  }, [phase]);

  if (!open || !device) return null;

  const commit = () => setPhase('working');

  // What-changes bullets for the confirm screen
  const suspendBullets = [
    { k: 'calls', v: 'unable to make or receive calls', icon: '·' },
    { k: 'messaging', v: 'sms and mms paused', icon: '·' },
    { k: 'data', v: 'cellular data off', icon: '·' },
    { k: 'forwarding', v: device.cfuActive || device.cfnaActive ? 'forwarding rules retained' : 'no active rules', icon: '·' },
    { k: 'billing', v: `$12.00 / mo line fee · still billed`, icon: '!' },
    { k: 'restore', v: 'can be restored instantly · no port-out', icon: '✓' },
  ];
  const restoreBullets = [
    { k: 'calls', v: 'voice re-enabled · existing number', icon: '✓' },
    { k: 'messaging', v: 'sms and mms re-enabled', icon: '✓' },
    { k: 'data', v: 'cellular data resumed', icon: '✓' },
    { k: 'delay', v: 'ready in under 60 seconds', icon: '·' },
    { k: 'billing', v: 'billing resumes on next cycle', icon: '·' },
  ];
  const bullets = isSuspended ? restoreBullets : suspendBullets;

  return (
    <div style={flowS.scrim} onClick={onClose}>
      <div style={flowS.sheet} onClick={e => e.stopPropagation()}>
        <div style={flowS.grab}/>
        <div style={flowS.head}>
          <button onClick={onClose} style={flowS.headBtn}>✕</button>
          <div style={{ textAlign: 'center' }}>
            <div style={flowS.cap}>
              {phase === 'confirm' && `${action} line · confirm`}
              {phase === 'working' && `${action}ing · please wait`}
              {phase === 'done' && `${action} complete`}
            </div>
            <div style={flowS.title}>
              {phase === 'confirm' && (isSuspended ? 'restore this line?' : 'pause this line?')}
              {phase !== 'confirm' && device.label}
            </div>
          </div>
          <div style={{ width: 28 }}/>
        </div>

        <div style={flowS.body}>
          {phase === 'confirm' && (
            <>
              {/* State transition visual: CURRENT ——> NEXT */}
              <div style={flS.stateGrid}>
                <StatePanel
                  title="now"
                  state={device.state}
                  device={device}
                  fmt={fmt}
                  side="current"
                />
                <div style={flS.arrowBox}>
                  <div style={flS.arrowLabel}>{action}</div>
                  <svg width="32" height="14" viewBox="0 0 32 14" style={{ color: '#FBD53D' }}>
                    <path d="M2 7 h24 m-4 -4 l4 4 l-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <StatePanel
                  title="after"
                  state={isSuspended ? 'active' : 'suspended'}
                  device={device}
                  fmt={fmt}
                  side="next"
                />
              </div>

              {/* What changes */}
              <div style={{ marginTop: 22 }}>
                <div style={flowS.cap2}>what {action === 'restore' ? 'resumes' : 'changes'}</div>
                <div style={flowS.card}>
                  {bullets.map((b, i) => (
                    <div key={b.k} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '10px 2px',
                      borderBottom: i < bullets.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none',
                    }}>
                      <span style={{
                        ...flS.bulletIcon,
                        color: b.icon === '!' ? '#FBD53D' : b.icon === '✓' ? '#9fd67a' : 'rgba(244,244,242,.35)',
                      }}>{b.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.45)',
                          textTransform: 'uppercase', letterSpacing: 0.08 }}>{b.k}</div>
                        <div style={{ fontSize: 13, color: '#f4f4f2', marginTop: 2 }}>{b.v}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!isSuspended && (
                <div style={flS.callout}>
                  <span style={flS.calloutIcon}>!</span>
                  <span>You can restore this line any time — this does not release the number. For permanent removal, go to line settings.</span>
                </div>
              )}
            </>
          )}

          {phase === 'working' && (
            <div style={flS.workingWrap}>
              <WorkingSpinner tint="#FBD53D"/>
              <div style={flS.workingTitle}>
                {isSuspended ? 'restoring service' : 'pausing service'}
              </div>
              <div style={flS.workingSub}>
                {isSuspended
                  ? 'waking the line on the network'
                  : 'detaching the line from the network · retaining number'}
              </div>
              <div style={flS.workingSteps}>
                <StepLine label="verify account" done/>
                <StepLine label="signal core network" done/>
                <StepLine label={isSuspended ? 're-attach line' : 'release radio bearer'} active/>
                <StepLine label="finalize"/>
              </div>
            </div>
          )}

          {phase === 'done' && (
            <div style={flowS.successWrap}>
              <div style={flowS.successGlyph}>✓</div>
              <div style={flowS.successTitle}>
                {isSuspended ? `${device.label} is active` : `${device.label} is paused`}
              </div>
              <div style={flowS.successSub}>
                {isSuspended ? 'ready to use · no port required' : 'restore any time from this screen'}
              </div>

              <div style={{ width: '100%', marginTop: 22 }}>
                <div style={flowS.cap2}>next</div>
                <div style={flowS.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 2px' }}>
                    <span style={flowS.rowLabel}>line status</span>
                    <span style={{ ...flowS.rowValue, color: isSuspended ? '#FBD53D' : '#888' }}>
                      ● {isSuspended ? 'active' : 'suspended'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 2px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
                    <span style={flowS.rowLabel}>next bill</span>
                    <span style={flowS.rowValue}>apr 28, 2026</span>
                  </div>
                  {!isSuspended && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 2px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
                      <span style={flowS.rowLabel}>this cycle saves</span>
                      <span style={{ ...flowS.rowValue, color: 'rgba(244,244,242,.55)' }}>
                        $0.00 <span style={{ fontSize: 10, marginLeft: 4 }}>(line fee still applies)</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={flowS.footer}>
          {phase === 'confirm' && (
            <>
              <button onClick={onClose} style={flowS.ctaGhost}>cancel</button>
              <button onClick={commit} style={isSuspended ? flowS.ctaPrimary : flowS.ctaDanger}>
                {isSuspended ? 'restore line' : 'pause line'}
              </button>
            </>
          )}
          {phase === 'working' && (
            <button disabled style={{ ...flowS.ctaPrimary, opacity: 0.5, cursor: 'wait', flex: 1 }}>
              working…
            </button>
          )}
          {phase === 'done' && (
            <button
              onClick={() => { onComplete && onComplete({ action, deviceId: device.id }); onClose(); }}
              style={{ ...flowS.ctaPrimary, flex: 1 }}>
              done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Small panel showing a line in its current / next state
function StatePanel({ title, state, device, fmt, side }) {
  const isActive = state === 'active';
  return (
    <div style={{
      ...flS.statePanel,
      borderColor: side === 'next'
        ? (isActive ? 'rgba(251,213,61,.35)' : 'rgba(214,89,59,.35)')
        : 'rgba(255,255,255,.08)',
      background: side === 'next'
        ? (isActive ? 'rgba(251,213,61,.06)' : 'rgba(214,89,59,.06)')
        : 'rgba(255,255,255,.025)',
    }}>
      <div style={flowS.cap2}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: isActive ? '#FBD53D' : '#666',
        }}/>
        <span style={{
          fontFamily: 'Geist Mono', fontSize: 11,
          textTransform: 'uppercase', letterSpacing: 0.08,
          color: isActive ? '#FBD53D' : '#888',
        }}>{state}</span>
      </div>
      <div style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 600, marginTop: 10,
        opacity: isActive ? 1 : 0.55 }}>
        {device.label.split(' · ')[0]}
      </div>
      <div style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.45)',
        marginTop: 2 }}>
        {device.phoneNumber ? fmt.phone(device.phoneNumber) : 'data only'}
      </div>
    </div>
  );
}

function StepLine({ label, done, active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
      <span style={{
        width: 14, height: 14, borderRadius: '50%',
        border: '1.5px solid',
        borderColor: done ? '#FBD53D' : active ? '#FBD53D' : 'rgba(255,255,255,.2)',
        background: done ? '#FBD53D' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: active ? 'flowPulse 1.2s ease-in-out infinite' : 'none',
      }}>
        {done && <span style={{ color: '#0a0a0a', fontSize: 9, fontWeight: 700 }}>✓</span>}
      </span>
      <span style={{
        fontFamily: 'Geist Mono', fontSize: 11.5,
        color: done || active ? '#f4f4f2' : 'rgba(244,244,242,.4)',
        textTransform: 'uppercase', letterSpacing: 0.05,
      }}>{label}</span>
    </div>
  );
}

function WorkingSpinner({ tint = '#FBD53D' }) {
  return (
    <div style={{
      width: 48, height: 48, borderRadius: '50%',
      border: '3px solid rgba(255,255,255,.08)',
      borderTopColor: tint,
      animation: 'flowSpin 0.9s linear infinite',
    }}/>
  );
}

// ============================================================================
// PLAN-CHANGE FLOW
// ============================================================================
// States: browse → compare → working → done

const PLANS = [
  {
    id: 'essential',
    name: 'optima essential',
    tagline: 'light talk, text & email',
    pricePerMonth: 28,
    pricePerLine: 10,
    dataGB: 20,
    speed: '5g · standard',
    terms: ['30-day contract', 'slowed after 20 gb', 'no roaming'],
    maxDevices: 5,
    color: '#7ea7d6',
  },
  {
    id: 'unlimited',
    name: 'optima unlimited',
    tagline: 'nationwide 5g, priority data',
    pricePerMonth: 48,
    pricePerLine: 12,
    dataGB: 60,
    speed: '5g · up to 300 mbps',
    terms: ['30-day contract', 'priority until 60gb', 'roaming included'],
    maxDevices: 10,
    color: '#FBD53D',
    current: true,
  },
  {
    id: 'premiere',
    name: 'optima premiere',
    tagline: 'uncapped priority + international',
    pricePerMonth: 72,
    pricePerLine: 15,
    dataGB: 200,
    speed: '5g+ · up to 500 mbps',
    terms: ['30-day contract', 'always priority', '10gb intl / mo'],
    maxDevices: 15,
    color: '#d9a8ff',
  },
];

function PlanChangeFlow({ open, onClose, onComplete }) {
  const D = window.OPTIMERA;
  const { fmt, plan: currentPlan, activeDevices } = D;
  const numLines = activeDevices.length;

  const [phase, setPhase] = useStateFl('browse'); // browse | compare | working | done
  const [selectedId, setSelectedId] = useStateFl(null);

  useEffectFl(() => {
    if (open) { setPhase('browse'); setSelectedId(null); }
  }, [open]);

  useEffectFl(() => {
    if (phase === 'working') {
      const t = setTimeout(() => setPhase('done'), 1600);
      return () => clearTimeout(t);
    }
  }, [phase]);

  if (!open) return null;

  const current = PLANS.find(p => p.current);
  const target = PLANS.find(p => p.id === selectedId);

  // Cost math
  const currentMonthly = currentPlan.pricePerMonth + currentPlan.pricePerLine * numLines;
  const targetMonthly = target ? (target.pricePerMonth + target.pricePerLine * numLines) : 0;
  const delta = targetMonthly - currentMonthly;
  const annualDelta = delta * 12;

  return (
    <div style={flowS.scrim} onClick={onClose}>
      <div style={flowS.sheet} onClick={e => e.stopPropagation()}>
        <div style={flowS.grab}/>
        <div style={flowS.head}>
          <button onClick={phase === 'browse' ? onClose : () => setPhase('browse')} style={flowS.headBtn}>
            {phase === 'browse' ? '✕' : '‹'}
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={flowS.cap}>
              {phase === 'browse' && 'change plan · pick a tier'}
              {phase === 'compare' && 'change plan · review'}
              {phase === 'working' && 'switching plans'}
              {phase === 'done' && 'plan updated'}
            </div>
            <div style={flowS.title}>
              {phase === 'browse' && 'choose a new plan'}
              {phase === 'compare' && 'review the change'}
              {phase === 'working' && 'hang tight'}
              {phase === 'done' && target ? target.name : ''}
            </div>
          </div>
          <div style={{ width: 28 }}/>
        </div>

        <div style={flowS.body}>
          {phase === 'browse' && (
            <>
              <div style={flS.planHeroStrip}>
                <div style={flowS.cap2}>on now</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <div>
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600 }}>{currentPlan.name}</div>
                    <div style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.5)',
                      marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.06 }}>
                      {currentPlan.dataAllocationGigs} gb · {numLines} lines · {fmt.usd(currentMonthly)}/mo
                    </div>
                  </div>
                  <span style={flS.chipNow}>current</span>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={flowS.cap2}>all plans</div>
                {PLANS.map(p => {
                  const monthlyForAccount = p.pricePerMonth + p.pricePerLine * numLines;
                  const relDelta = monthlyForAccount - currentMonthly;
                  return (
                    <button key={p.id}
                      onClick={() => { setSelectedId(p.id); setPhase('compare'); }}
                      disabled={p.current}
                      style={{
                        ...flS.planRow,
                        borderColor: p.current ? 'rgba(251,213,61,.3)' : 'rgba(255,255,255,.08)',
                        background: p.current ? 'rgba(251,213,61,.04)' : 'rgba(255,255,255,.02)',
                        cursor: p.current ? 'default' : 'pointer',
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: p.color,
                          boxShadow: `0 0 12px ${p.color}66`,
                        }}/>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <div style={{ fontFamily: 'Space Grotesk', fontSize: 15, fontWeight: 600 }}>
                            {p.name}
                            {p.current && <span style={flS.chipCur}>now</span>}
                          </div>
                          <div style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.5)',
                            marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.06 }}>
                            {p.tagline}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'Geist Mono', fontSize: 17, fontWeight: 600 }}>
                            {fmt.usd(p.pricePerMonth)}<span style={{ fontSize: 10, color: 'rgba(244,244,242,.4)', marginLeft: 2 }}>/mo</span>
                          </div>
                          <div style={{ fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.5)', marginTop: 3, textTransform: 'uppercase' }}>
                            + {fmt.usd(p.pricePerLine)}/line
                          </div>
                        </div>
                      </div>

                      <div style={flS.planChips}>
                        <span style={flS.chipSm}>{p.dataGB} gb</span>
                        <span style={flS.chipSm}>{p.speed}</span>
                        <span style={flS.chipSm}>up to {p.maxDevices}</span>
                      </div>

                      {!p.current && (
                        <div style={{
                          marginTop: 10, paddingTop: 10, borderTop: '1px dashed rgba(255,255,255,.06)',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                          <span style={{ fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.55)', textTransform: 'uppercase', letterSpacing: 0.06 }}>
                            your cost · {numLines} lines
                          </span>
                          <span style={{ fontFamily: 'Geist Mono', fontSize: 13, fontWeight: 600,
                            color: relDelta > 0 ? '#f4f4f2' : '#9fd67a' }}>
                            {fmt.usd(monthlyForAccount)}/mo
                            <span style={{
                              marginLeft: 8, fontSize: 11, fontWeight: 500,
                              color: relDelta > 0 ? '#d6593b' : '#9fd67a',
                            }}>
                              {relDelta > 0 ? '+' : ''}{fmt.usd(Math.abs(relDelta))}
                            </span>
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {phase === 'compare' && target && current && (
            <>
              {/* Side-by-side compare header */}
              <div style={flS.compareGrid}>
                <div style={{ ...flS.comparePanel, borderColor: 'rgba(255,255,255,.08)' }}>
                  <div style={flowS.cap2}>from</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: current.color }}/>
                    <span style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.5)',
                      textTransform: 'uppercase', letterSpacing: 0.08 }}>current</span>
                  </div>
                  <div style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600, marginTop: 6 }}>
                    {current.name}
                  </div>
                  <div style={{ fontFamily: 'Geist Mono', fontSize: 18, fontWeight: 600, marginTop: 10 }}>
                    {fmt.usd(currentMonthly)}<span style={{ fontSize: 10, color: 'rgba(244,244,242,.4)', marginLeft: 2 }}>/mo</span>
                  </div>
                </div>
                <div style={flS.arrowBox}>
                  <div style={flS.arrowLabel}>change</div>
                  <svg width="32" height="14" viewBox="0 0 32 14" style={{ color: '#FBD53D' }}>
                    <path d="M2 7 h24 m-4 -4 l4 4 l-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div style={{ ...flS.comparePanel,
                  borderColor: 'rgba(251,213,61,.3)',
                  background: 'rgba(251,213,61,.04)',
                }}>
                  <div style={flowS.cap2}>to</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: target.color,
                      boxShadow: `0 0 8px ${target.color}66` }}/>
                    <span style={{ fontFamily: 'Geist Mono', fontSize: 10, color: '#FBD53D',
                      textTransform: 'uppercase', letterSpacing: 0.08 }}>new</span>
                  </div>
                  <div style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600, marginTop: 6 }}>
                    {target.name}
                  </div>
                  <div style={{ fontFamily: 'Geist Mono', fontSize: 18, fontWeight: 600, marginTop: 10 }}>
                    {fmt.usd(targetMonthly)}<span style={{ fontSize: 10, color: 'rgba(244,244,242,.4)', marginLeft: 2 }}>/mo</span>
                  </div>
                </div>
              </div>

              {/* Cost delta hero */}
              <div style={{ ...flS.deltaCard,
                borderColor: delta > 0 ? 'rgba(214,89,59,.35)' : 'rgba(159,214,122,.35)',
              }}>
                <div style={flowS.cap2}>cost delta</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginTop: 4 }}>
                  <span style={{ fontFamily: 'Geist Mono', fontSize: 36, fontWeight: 600,
                    color: delta > 0 ? '#d6593b' : '#9fd67a' }}>
                    {delta > 0 ? '+' : '−'}{fmt.usd(Math.abs(delta))}
                  </span>
                  <span style={{ fontFamily: 'Geist Mono', fontSize: 13, color: 'rgba(244,244,242,.55)', marginBottom: 6 }}>
                    /mo
                  </span>
                </div>
                <div style={{ fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.55)',
                  marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.06 }}>
                  {delta > 0 ? '+' : '−'}{fmt.usd(Math.abs(annualDelta))} per year · prorated to apr 28 on next bill
                </div>
              </div>

              {/* Feature compare */}
              <div style={{ marginTop: 18 }}>
                <div style={flowS.cap2}>what changes</div>
                <div style={flowS.card}>
                  <CompareRow label="data allocation"
                    from={`${current.dataGB} gb`}
                    to={`${target.dataGB} gb`}
                    better={target.dataGB > current.dataGB}/>
                  <CompareRow label="network speed"
                    from={current.speed}
                    to={target.speed}
                    better={target.pricePerMonth > current.pricePerMonth}/>
                  <CompareRow label="per-line fee"
                    from={fmt.usd(current.pricePerLine)}
                    to={fmt.usd(target.pricePerLine)}
                    better={target.pricePerLine < current.pricePerLine}/>
                  <CompareRow label="max devices"
                    from={String(current.maxDevices)}
                    to={String(target.maxDevices)}
                    better={target.maxDevices > current.maxDevices}
                    last/>
                </div>
              </div>

              <div style={flS.callout}>
                <span style={flS.calloutIcon}>i</span>
                <span>Changes apply immediately. Your next invoice on apr 28 will show a prorated {delta >= 0 ? 'charge' : 'credit'} for the remaining 8 days of this cycle.</span>
              </div>
            </>
          )}

          {phase === 'working' && target && (
            <div style={flS.workingWrap}>
              <WorkingSpinner tint={target.color}/>
              <div style={flS.workingTitle}>moving to {target.name.split(' ')[1]}</div>
              <div style={flS.workingSub}>updating plan across {numLines} lines</div>
              <div style={flS.workingSteps}>
                <StepLine label="validate payment method" done/>
                <StepLine label="compute proration" done/>
                <StepLine label="assign new plan" active/>
                <StepLine label="refresh line entitlements"/>
              </div>
            </div>
          )}

          {phase === 'done' && target && (
            <div style={flowS.successWrap}>
              <div style={{ ...flowS.successGlyph, background: `${target.color}22`, borderColor: `${target.color}55`, color: target.color }}>
                ✓
              </div>
              <div style={flowS.successTitle}>you're on {target.name}</div>
              <div style={flowS.successSub}>effective now · proration on next bill</div>

              <div style={{ width: '100%', marginTop: 22 }}>
                <div style={flowS.cap2}>summary</div>
                <div style={flowS.card}>
                  <SumRow label="new plan" value={target.name}/>
                  <SumRow label="data allocation" value={`${target.dataGB} gb`}/>
                  <SumRow label="monthly (5 lines)" value={`${fmt.usd(targetMonthly)} / mo`}/>
                  <SumRow label="cost change" value={`${delta > 0 ? '+' : '−'}${fmt.usd(Math.abs(delta))} / mo`}
                    color={delta > 0 ? '#d6593b' : '#9fd67a'}
                    last/>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={flowS.footer}>
          {phase === 'browse' && (
            <button onClick={onClose} style={{ ...flowS.ctaGhost, flex: 1 }}>close</button>
          )}
          {phase === 'compare' && target && (
            <>
              <button onClick={() => setPhase('browse')} style={flowS.ctaGhost}>back</button>
              <button onClick={() => setPhase('working')} style={flowS.ctaPrimary}>
                confirm switch
              </button>
            </>
          )}
          {phase === 'working' && (
            <button disabled style={{ ...flowS.ctaPrimary, opacity: 0.5, cursor: 'wait', flex: 1 }}>
              switching plans…
            </button>
          )}
          {phase === 'done' && (
            <button
              onClick={() => { onComplete && onComplete({ planId: target.id }); onClose(); }}
              style={{ ...flowS.ctaPrimary, flex: 1 }}>
              done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CompareRow({ label, from, to, better, last }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto 14px auto', gap: 10, alignItems: 'center',
      padding: '10px 2px',
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,.05)',
    }}>
      <span style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.5)',
        textTransform: 'uppercase', letterSpacing: 0.06 }}>{label}</span>
      <span style={{ fontSize: 12, color: 'rgba(244,244,242,.5)', textDecoration: from !== to ? 'line-through' : 'none' }}>
        {from}
      </span>
      <svg width="12" height="8" viewBox="0 0 12 8" style={{ color: 'rgba(251,213,61,.6)' }}>
        <path d="M1 4 h9 m-3 -3 l3 3 l-3 3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{ fontSize: 13, fontWeight: 500, color: better ? '#9fd67a' : '#f4f4f2' }}>
        {to}
      </span>
    </div>
  );
}

function SumRow({ label, value, color, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', padding: '8px 2px',
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,.05)',
    }}>
      <span style={flowS.rowLabel}>{label}</span>
      <span style={{ ...flowS.rowValue, color: color || '#f4f4f2', fontWeight: color ? 600 : 400 }}>
        {value}
      </span>
    </div>
  );
}

// flow-local supplementary styles
const flS = {
  stateGrid: { display: 'grid', gridTemplateColumns: '1fr 50px 1fr', gap: 8, alignItems: 'stretch' },
  statePanel: {
    padding: 14, borderRadius: 14, border: '1px solid',
    minHeight: 100,
  },
  arrowBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  arrowLabel: {
    fontFamily: 'Geist Mono', fontSize: 9, color: 'rgba(251,213,61,.65)',
    textTransform: 'uppercase', letterSpacing: 0.1,
  },
  bulletIcon: {
    fontFamily: 'Geist Mono', fontSize: 14, fontWeight: 700, width: 14, textAlign: 'center',
    lineHeight: 1, marginTop: 2,
  },
  callout: {
    marginTop: 16, padding: '12px 14px', borderRadius: 10,
    background: 'rgba(251,213,61,.06)', border: '1px solid rgba(251,213,61,.18)',
    display: 'flex', alignItems: 'flex-start', gap: 10,
    fontSize: 12, color: 'rgba(244,244,242,.75)', lineHeight: 1.45,
  },
  calloutIcon: {
    width: 18, height: 18, borderRadius: '50%',
    background: 'rgba(251,213,61,.15)', color: '#FBD53D',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Geist Mono', fontSize: 11, fontWeight: 700, flexShrink: 0,
  },
  workingWrap: {
    padding: '22px 16px 12px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  workingTitle: {
    fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 600,
    marginTop: 20, letterSpacing: -0.2,
  },
  workingSub: {
    fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.5)',
    textTransform: 'uppercase', letterSpacing: 0.08, marginTop: 6, textAlign: 'center',
  },
  workingSteps: {
    marginTop: 24, width: '100%',
    padding: '14px 16px', borderRadius: 12,
    background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)',
  },

  // plan browse
  planHeroStrip: {
    padding: '12px 14px', borderRadius: 12,
    background: 'rgba(251,213,61,.05)', border: '1px solid rgba(251,213,61,.2)',
  },
  chipNow: {
    fontFamily: 'Geist Mono', fontSize: 9.5, color: '#FBD53D',
    textTransform: 'uppercase', letterSpacing: 0.08,
    padding: '3px 8px', background: 'rgba(251,213,61,.14)',
    border: '1px solid rgba(251,213,61,.3)', borderRadius: 5,
  },
  planRow: {
    display: 'block', width: '100%', padding: 14, marginTop: 8,
    border: '1px solid', borderRadius: 14,
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  planChips: { display: 'flex', gap: 5, flexWrap: 'wrap' },
  chipSm: {
    fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.6)',
    padding: '3px 7px', background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.08)', borderRadius: 4,
    textTransform: 'uppercase', letterSpacing: 0.05,
  },
  chipCur: {
    fontFamily: 'Geist Mono', fontSize: 8.5, color: '#FBD53D',
    textTransform: 'uppercase', letterSpacing: 0.08,
    padding: '2px 6px', background: 'rgba(251,213,61,.14)',
    border: '1px solid rgba(251,213,61,.3)', borderRadius: 4,
    marginLeft: 8, verticalAlign: 'middle',
  },

  // compare phase
  compareGrid: {
    display: 'grid', gridTemplateColumns: '1fr 50px 1fr', gap: 8, alignItems: 'stretch',
  },
  comparePanel: {
    padding: 14, borderRadius: 14, border: '1px solid',
    minHeight: 120,
    display: 'flex', flexDirection: 'column',
  },
  deltaCard: {
    marginTop: 18, padding: 18,
    background: 'rgba(255,255,255,.03)', border: '1px solid',
    borderRadius: 14,
  },
};

// Keyframes
if (typeof document !== 'undefined' && !document.getElementById('flowsKeyframes')) {
  const s = document.createElement('style');
  s.id = 'flowsKeyframes';
  s.textContent = `
    @keyframes flowSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes flowPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(251,213,61,.35); } 50% { box-shadow: 0 0 0 5px rgba(251,213,61,0); } }
    @keyframes flowPop { 0% { transform: scale(.6); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  `;
  document.head.appendChild(s);
}

window.SuspendFlow = SuspendFlow;
window.PlanChangeFlow = PlanChangeFlow;
