// Signal direction · eSIM activation flow
// 5 steps: pick → number → plan → install → name
// Overlay that slides in from below and lives within the iPhone frame.

const { useState: useStateAct, useEffect: useEffectAct, useRef: useRefAct, useMemo: useMemoAct } = React;

// ---- Data: available numbers to reserve --------------------------------------
const AVAILABLE_NUMBERS = [
  { area: '907', local: '5550194', vibe: 'anchorage' },
  { area: '907', local: '5550207', vibe: 'anchorage' },
  { area: '907', local: '5550311', vibe: 'anchorage' },
  { area: '808', local: '5550423', vibe: 'honolulu' },
  { area: '808', local: '5550611', vibe: 'honolulu' },
  { area: '808', local: '5550290', vibe: 'honolulu' },
  { area: '206', local: '5550841', vibe: 'seattle' },
  { area: '206', local: '5550122', vibe: 'seattle' },
  { area: '206', local: '5550733', vibe: 'seattle' },
  { area: '206', local: '5550109', vibe: 'seattle' },
];

const PRESETS = {
  personal: {
    label: 'personal',
    tagline: 'your day-to-day line',
    icon: 'phone',
    features: { hasVoice: true, hasData: true, hasSms: true, hasMms: true, callWaiting: true },
    forwarding: null,
  },
  work: {
    label: 'work',
    tagline: 'after-hours calls roll to voicemail',
    icon: 'sim',
    features: { hasVoice: true, hasData: true, hasSms: true, hasMms: true, callWaiting: false },
    forwarding: 'no-answer → primary',
  },
  data: {
    label: 'data-only',
    tagline: 'for a hotspot, tablet, or router',
    icon: 'data',
    features: { hasVoice: false, hasData: true, hasSms: false, hasMms: false, callWaiting: false },
    forwarding: null,
  },
};

// ---- Root overlay ------------------------------------------------------------
function ActivationFlow({ open, onClose, onComplete }) {
  const [step, setStep] = useStateAct(0);  // 0..4
  const [state, setState] = useStateAct({
    lineType: 'personal',
    numberMode: 'new',  // 'new' | 'port'
    selectedNumber: null,
    portNumber: '',
    portCarrier: 'verizon',
    portPin: '',
    features: { ...PRESETS.personal.features },
    forwarding: null,
    installProgress: 0,
    installStage: 'idle',  // idle | downloading | provisioning | activating | done
    lineName: '',
  });

  // Reset on open
  useEffectAct(() => {
    if (open) {
      setStep(0);
      setState({
        lineType: 'personal',
        numberMode: 'new',
        selectedNumber: AVAILABLE_NUMBERS[0],
        portNumber: '',
        portCarrier: 'verizon',
        portPin: '',
        features: { ...PRESETS.personal.features },
        forwarding: null,
        installProgress: 0,
        installStage: 'idle',
        lineName: '',
      });
    }
  }, [open]);

  const update = (patch) => setState(s => ({ ...s, ...patch }));
  const next = () => setStep(s => Math.min(s + 1, 4));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const STEPS = [
    { title: 'new line', cap: 'step 1 / 5 · type' },
    { title: 'pick a number', cap: 'step 2 / 5 · number' },
    { title: 'plan & features', cap: 'step 3 / 5 · features' },
    { title: 'install eSIM', cap: 'step 4 / 5 · provision' },
    { title: 'name your line', cap: 'step 5 / 5 · finish' },
  ];

  const canAdvance = (() => {
    if (step === 0) return !!state.lineType;
    if (step === 1) {
      if (state.numberMode === 'new') return !!state.selectedNumber;
      return state.portNumber.replace(/\D/g, '').length === 10 && state.portPin.length >= 4;
    }
    if (step === 2) return true;
    if (step === 3) return state.installStage === 'done';
    if (step === 4) return state.lineName.trim().length > 0;
    return false;
  })();

  if (!open) return null;

  return (
    <div style={actS.scrim} onClick={onClose}>
      <div style={actS.sheet} onClick={e => e.stopPropagation()}>
        {/* header */}
        <div style={actS.sheetGrab}/>
        <div style={actS.sheetHead}>
          <button onClick={step === 0 ? onClose : back} style={actS.headBtn}>
            {step === 0 ? '✕' : <Ico.chev width={14} height={14} style={{ transform: 'rotate(180deg)' }}/>}
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={actS.cap}>{STEPS[step].cap}</div>
            <div style={actS.title}>{STEPS[step].title}</div>
          </div>
          <div style={{ width: 28 }}/>
        </div>
        {/* progress dots */}
        <div style={actS.dots}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              ...actS.dot,
              background: i === step ? '#FBD53D' : (i < step ? 'rgba(251,213,61,.4)' : 'rgba(255,255,255,.12)'),
              width: i === step ? 20 : 6,
            }}/>
          ))}
        </div>

        {/* content */}
        <div style={actS.body}>
          {step === 0 && <StepType state={state} update={update}/>}
          {step === 1 && <StepNumber state={state} update={update}/>}
          {step === 2 && <StepPlan state={state} update={update}/>}
          {step === 3 && <StepInstall state={state} update={update}/>}
          {step === 4 && <StepName state={state} update={update}/>}
        </div>

        {/* footer */}
        <div style={actS.footer}>
          {step < 4 ? (
            <button
              onClick={() => {
                if (step === 2 && state.installStage === 'idle') {
                  // advance to install
                  next();
                  return;
                }
                next();
              }}
              disabled={!canAdvance}
              style={{
                ...actS.cta,
                background: canAdvance ? '#FBD53D' : 'rgba(255,255,255,.08)',
                color: canAdvance ? '#0a0a0a' : 'rgba(244,244,242,.35)',
                cursor: canAdvance ? 'pointer' : 'not-allowed',
              }}>
              {step === 0 && 'continue'}
              {step === 1 && (state.numberMode === 'new' ? `reserve ${state.selectedNumber ? `+1 ${state.selectedNumber.area} ${state.selectedNumber.local.slice(0,3)} ${state.selectedNumber.local.slice(3)}` : ''}` : 'verify port request')}
              {step === 2 && 'continue to install'}
              {step === 3 && (state.installStage === 'done' ? 'name your line' : 'installing…')}
            </button>
          ) : (
            <button
              onClick={() => { onComplete && onComplete(state); onClose(); }}
              disabled={!canAdvance}
              style={{
                ...actS.cta,
                background: canAdvance ? '#FBD53D' : 'rgba(255,255,255,.08)',
                color: canAdvance ? '#0a0a0a' : 'rgba(244,244,242,.35)',
                cursor: canAdvance ? 'pointer' : 'not-allowed',
              }}>
              finish setup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Step 0: pick type ------------------------------------------------------
function StepType({ state, update }) {
  const pickType = (id) => {
    update({
      lineType: id,
      features: { ...PRESETS[id].features },
      forwarding: PRESETS[id].forwarding,
    });
  };
  return (
    <div style={actS.pad}>
      <p style={actS.lede}>what should this line do?</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
        {Object.entries(PRESETS).map(([id, p]) => (
          <button key={id} onClick={() => pickType(id)}
            style={{
              ...actS.typeTile,
              borderColor: state.lineType === id ? '#FBD53D' : 'rgba(255,255,255,.08)',
              background: state.lineType === id ? 'rgba(251,213,61,.06)' : 'rgba(255,255,255,.025)',
            }}>
            <div style={{
              ...actS.typeTileIco,
              background: state.lineType === id ? 'rgba(251,213,61,.15)' : 'rgba(255,255,255,.05)',
              color: state.lineType === id ? '#FBD53D' : 'rgba(244,244,242,.6)',
            }}>
              {p.icon === 'phone' && <Ico.phone width={18} height={18}/>}
              {p.icon === 'sim' && <Ico.sim width={18} height={18}/>}
              {p.icon === 'data' && <Ico.data width={18} height={18}/>}
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <div style={actS.typeTileLabel}>{p.label}</div>
              <div style={actS.typeTileTag}>{p.tagline}</div>
            </div>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              border: state.lineType === id ? 'none' : '1.5px solid rgba(255,255,255,.15)',
              background: state.lineType === id ? '#FBD53D' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {state.lineType === id && <Ico.check width={12} height={12} style={{ color: '#0a0a0a' }}/>}
            </div>
          </button>
        ))}
      </div>

      {/* Multi-line hint */}
      <div style={actS.hintBox}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Ico.bolt width={12} height={12} style={{ color: '#FBD53D' }}/>
          <span style={{ fontFamily: 'Geist Mono', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.1, color: '#FBD53D' }}>pro tip</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(244,244,242,.7)', lineHeight: 1.5 }}>
          setting up a team? <span style={{ color: '#FBD53D', textDecoration: 'underline' }}>activate 3+ lines together</span> and share a single area code.
        </div>
      </div>
    </div>
  );
}

// ---- Step 1: number (new OR port) -------------------------------------------
function StepNumber({ state, update }) {
  const [reserveCountdown, setReserveCountdown] = useStateAct(272); // 4:32

  useEffectAct(() => {
    if (state.numberMode !== 'new' || !state.selectedNumber) return;
    const t = setInterval(() => setReserveCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [state.numberMode, state.selectedNumber]);

  const fmtCountdown = (s) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, '0')}`;
  };

  const formatPortInput = (raw) => {
    const d = raw.replace(/\D/g, '').slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  };

  return (
    <div style={actS.pad}>
      {/* mode segment */}
      <div style={actS.segGroup}>
        <button
          onClick={() => update({ numberMode: 'new' })}
          style={{ ...actS.segBtn, ...(state.numberMode === 'new' ? actS.segBtnActive : {}) }}>
          new number
        </button>
        <button
          onClick={() => update({ numberMode: 'port' })}
          style={{ ...actS.segBtn, ...(state.numberMode === 'port' ? actS.segBtnActive : {}) }}>
          port in
        </button>
      </div>

      {state.numberMode === 'new' ? (
        <>
          {/* hero selected number */}
          <div style={actS.heroNumDisp}>
            <div style={actS.cap2}>reserved for you</div>
            <div style={actS.heroNumText}>
              +1 <span style={{ color: '#FBD53D' }}>{state.selectedNumber?.area}</span>{' '}
              {state.selectedNumber?.local.slice(0,3)}{' '}{state.selectedNumber?.local.slice(3)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <div style={actS.reservePill}>
                <div style={actS.pulseDot}/>
                <span>held for {fmtCountdown(reserveCountdown)}</span>
              </div>
              <span style={{ fontFamily: 'Geist Mono', fontSize: 10.5, color: 'rgba(244,244,242,.45)', textTransform: 'uppercase', letterSpacing: 0.06 }}>
                {state.selectedNumber?.vibe}
              </span>
            </div>
          </div>

          {/* other choices */}
          <div style={{ marginTop: 18 }}>
            <div style={actS.cap2}>other available · {AVAILABLE_NUMBERS.length}</div>
            <div style={actS.numList}>
              {AVAILABLE_NUMBERS.map(n => (
                <button key={n.area + n.local}
                  onClick={() => { update({ selectedNumber: n }); setReserveCountdown(272); }}
                  style={{
                    ...actS.numRow,
                    borderColor: state.selectedNumber?.area === n.area && state.selectedNumber?.local === n.local
                      ? 'rgba(251,213,61,.4)' : 'rgba(255,255,255,.05)',
                    background: state.selectedNumber?.area === n.area && state.selectedNumber?.local === n.local
                      ? 'rgba(251,213,61,.06)' : 'transparent',
                  }}>
                  <span style={{ fontFamily: 'Geist Mono', fontSize: 14, fontWeight: 500 }}>
                    ({n.area}) {n.local.slice(0,3)}-{n.local.slice(3)}
                  </span>
                  <span style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.4)', textTransform: 'uppercase' }}>{n.vibe}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <p style={actS.lede}>bringing a number over?</p>
          <div style={{ marginTop: 20 }}>
            <div style={actS.cap2}>your current number</div>
            <input
              type="tel"
              value={state.portNumber}
              onChange={e => update({ portNumber: formatPortInput(e.target.value) })}
              placeholder="(555) 123-4567"
              style={actS.bigInput}/>

            <div style={{ marginTop: 20 }}>
              <div style={actS.cap2}>current carrier</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {['verizon', 'at&t', 't-mobile', 'other'].map(c => (
                  <button key={c} onClick={() => update({ portCarrier: c })}
                    style={{
                      ...actS.chip,
                      ...(state.portCarrier === c ? actS.chipActive : {}),
                    }}>{c}</button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={actS.cap2}>account pin / password</div>
              <input
                type="text"
                value={state.portPin}
                onChange={e => update({ portPin: e.target.value })}
                placeholder="from your carrier account"
                style={actS.normalInput}/>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.4)', marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.06 }}>
                required to release number · usually 4-6 digits
              </div>
            </div>

            {/* live verify readout */}
            {state.portNumber.replace(/\D/g, '').length === 10 && state.portPin.length >= 4 && (
              <div style={actS.verifyBox}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ ...actS.pulseDot, background: '#FBD53D' }}/>
                  <span style={{ fontFamily: 'Geist Mono', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.08, color: 'rgba(244,244,242,.8)' }}>
                    ready · will verify with {state.portCarrier}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(244,244,242,.55)', marginTop: 6, lineHeight: 1.5 }}>
                  your old line stays active until the port completes — usually under 10 minutes.
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ---- Step 2: plan & features -------------------------------------------------
function StepPlan({ state, update }) {
  const preset = PRESETS[state.lineType];
  const toggle = (key) => update({ features: { ...state.features, [key]: !state.features[key] } });

  return (
    <div style={actS.pad}>
      <p style={actS.lede}>
        we pre-configured this for a <span style={{ color: '#FBD53D' }}>{preset.label}</span> line.
      </p>

      {/* plan card */}
      <div style={actS.planCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={actS.cap2}>plan</div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 600, marginTop: 2 }}>optima unlimited</div>
            <div style={{ fontFamily: 'Geist Mono', fontSize: 10.5, color: 'rgba(244,244,242,.5)', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.06 }}>
              shares pool · 60 gb · 5 lines
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Geist Mono', fontSize: 18, fontWeight: 600 }}>$0<span style={{ fontSize: 10, color: 'rgba(244,244,242,.4)', marginLeft: 2 }}>/mo</span></div>
            <div style={{ fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.5)', marginTop: 3, textTransform: 'uppercase' }}>added to pool</div>
          </div>
        </div>
      </div>

      {/* feature groups with toggles */}
      {[
        { title: 'voice', rows: [
          ['voice',        'hasVoice'],
          ['call waiting', 'callWaiting'],
        ]},
        { title: 'messaging', rows: [
          ['sms', 'hasSms'],
          ['mms', 'hasMms'],
        ]},
        { title: 'data', rows: [
          ['cellular data', 'hasData'],
        ]},
      ].map(g => (
        <div key={g.title} style={{ marginTop: 18 }}>
          <div style={actS.cap2}>{g.title}</div>
          <div style={actS.listCard}>
            {g.rows.map(([label, key], i, arr) => (
              <div key={key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none',
              }}>
                <span style={{ fontSize: 14 }}>{label}</span>
                <IOSTogglePure on={state.features[key]} onClick={() => toggle(key)}/>
              </div>
            ))}
          </div>
        </div>
      ))}

      {preset.forwarding && (
        <div style={actS.presetNote}>
          <Ico.bolt width={12} height={12} style={{ color: '#FBD53D' }}/>
          <span>preset: {preset.forwarding}</span>
        </div>
      )}
    </div>
  );
}

// Pure controlled toggle (no localStorage) for the flow
function IOSTogglePure({ on, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 51, height: 31, borderRadius: 31, border: 'none', padding: 2,
      background: on ? '#FBD53D' : 'rgba(255,255,255,0.14)',
      position: 'relative', cursor: 'pointer',
      transition: 'background .22s ease',
      flex: '0 0 auto',
    }} aria-pressed={on} role="switch">
      <div style={{
        width: 27, height: 27, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 2, left: on ? 22 : 2,
        transition: 'left .22s cubic-bezier(.4,0,.2,1)',
        boxShadow: '0 2px 6px rgba(0,0,0,.25)',
      }}/>
    </button>
  );
}

// ---- Step 3: install hero ----------------------------------------------------
const INSTALL_STAGES = [
  { key: 'downloading',  label: 'downloading profile',    to: 35 },
  { key: 'provisioning', label: 'provisioning on network', to: 72 },
  { key: 'activating',   label: 'activating line',         to: 96 },
  { key: 'done',         label: 'eSIM installed',          to: 100 },
];

function StepInstall({ state, update }) {
  const [responseMs, setResponseMs] = useStateAct(null);
  const tickRef = useRefAct(null);

  // Autostart when this step mounts
  useEffectAct(() => {
    if (state.installStage !== 'idle') return;
    update({ installStage: 'downloading', installProgress: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Progress loop
  useEffectAct(() => {
    if (state.installStage === 'idle' || state.installStage === 'done') return;
    const stageObj = INSTALL_STAGES.find(s => s.key === state.installStage);
    if (!stageObj) return;

    // Smooth progress
    let p = state.installProgress;
    const interval = setInterval(() => {
      p = Math.min(stageObj.to, p + (stageObj.to - p) * 0.08 + 0.4);
      if (p >= stageObj.to - 0.5) {
        clearInterval(interval);
        const next = INSTALL_STAGES[INSTALL_STAGES.findIndex(x => x.key === state.installStage) + 1];
        if (next) {
          setTimeout(() => update({ installStage: next.key, installProgress: stageObj.to }), 260);
        } else {
          update({ installProgress: 100 });
        }
      } else {
        update({ installProgress: p });
      }
    }, 50);

    // First-response readout
    if (state.installStage === 'downloading' && responseMs === null) {
      setTimeout(() => setResponseMs(210 + Math.floor(Math.random() * 80)), 220);
    }

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.installStage]);

  const isDone = state.installStage === 'done';
  const iccid = '8901 2600 0012 3458 9021';
  const imsi = '310 260 000 123 458';

  return (
    <div style={actS.pad}>
      {/* Animated SIM card */}
      <div style={{ position: 'relative', perspective: 1000 }}>
        <div style={{
          position: 'relative',
          width: '100%', aspectRatio: '1.59 / 1',
          transformStyle: 'preserve-3d',
          transform: isDone ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 1.2s cubic-bezier(.4,0,.2,1)',
        }}>
          {/* front */}
          <div style={{ ...actS.simFace, transform: 'rotateY(0deg)' }}>
            <div style={actS.simBrand}>OPTIM<span style={{ opacity: 0.55 }}>ERA</span></div>
            <div style={actS.simChip}>
              <div style={actS.simChipTexture}/>
              {!isDone && state.installStage !== 'idle' && (
                <div style={actS.simChipPulse}/>
              )}
            </div>
            <div style={actS.simSignalWave}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  ...actS.wave,
                  animationDelay: `${i * 0.4}s`,
                  opacity: state.installStage === 'idle' ? 0 : 0.8,
                }}/>
              ))}
            </div>
            <div style={actS.simLabel}>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(10,10,10,.55)', textTransform: 'uppercase', letterSpacing: 0.1 }}>
                {state.numberMode === 'port' ? 'porting' : 'new number'}
              </div>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 14, fontWeight: 600, color: '#0a0a0a', marginTop: 2 }}>
                {state.numberMode === 'new' && state.selectedNumber
                  ? `+1 ${state.selectedNumber.area} ${state.selectedNumber.local.slice(0,3)} ${state.selectedNumber.local.slice(3)}`
                  : `+1 ${state.portNumber}`}
              </div>
            </div>
          </div>
          {/* back */}
          <div style={{ ...actS.simFace, ...actS.simFaceBack, transform: 'rotateY(180deg)' }}>
            <div style={{ position: 'absolute', top: 16, left: 20, right: 20 }}>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(10,10,10,.55)', textTransform: 'uppercase', letterSpacing: 0.1 }}>installed</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <Ico.check width={14} height={14} style={{ color: '#0a0a0a' }}/>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: 15, fontWeight: 600, color: '#0a0a0a' }}>active on iphone 15 pro</span>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20, fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(10,10,10,.7)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(10,10,10,.12)' }}>
                <span style={{ opacity: 0.55 }}>iccid</span><span>{iccid}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                <span style={{ opacity: 0.55 }}>imsi</span><span>{imsi}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live readout */}
      <div style={{ marginTop: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontFamily: 'Geist Mono', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.08, color: isDone ? '#FBD53D' : 'rgba(244,244,242,.75)' }}>
            {isDone ? '● installed' : '● ' + (INSTALL_STAGES.find(s => s.key === state.installStage)?.label || 'preparing')}
          </span>
          <span style={{ fontFamily: 'Geist Mono', fontSize: 14, fontWeight: 600, color: '#FBD53D' }}>
            {Math.round(state.installProgress)}%
          </span>
        </div>
        <div style={actS.progressTrack}>
          <div style={{
            ...actS.progressFill,
            width: `${state.installProgress}%`,
            background: isDone ? '#FBD53D' : 'linear-gradient(90deg, #FBD53D 0%, #fff2a8 50%, #FBD53D 100%)',
            backgroundSize: '200% 100%',
            animation: isDone ? 'none' : 'sigFlow 1.6s linear infinite',
          }}/>
        </div>

        {/* Stage list */}
        <div style={{ marginTop: 18 }}>
          {INSTALL_STAGES.map((s) => {
            const idx = INSTALL_STAGES.findIndex(x => x.key === state.installStage);
            const selfIdx = INSTALL_STAGES.findIndex(x => x.key === s.key);
            const isCurrent = s.key === state.installStage;
            const isComplete = selfIdx < idx || (s.key === 'done' && state.installStage === 'done');
            const isPending = selfIdx > idx;
            return (
              <div key={s.key} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0',
                opacity: isPending ? 0.3 : 1, transition: 'opacity .3s',
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: isComplete || isCurrent ? 'none' : '1.3px solid rgba(255,255,255,.25)',
                  background: isComplete ? '#FBD53D' : (isCurrent ? 'transparent' : 'transparent'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}>
                  {isComplete && <Ico.check width={9} height={9} style={{ color: '#0a0a0a' }}/>}
                  {isCurrent && !isComplete && (
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      border: '1.3px solid #FBD53D',
                      borderTopColor: 'transparent',
                      animation: 'sigSpin .9s linear infinite',
                    }}/>
                  )}
                </div>
                <span style={{ fontSize: 12.5, flex: 1, color: isCurrent ? '#f4f4f2' : 'rgba(244,244,242,.65)' }}>{s.label}</span>
                {isCurrent && responseMs !== null && s.key === 'downloading' && (
                  <span style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.5)' }}>
                    {responseMs}ms
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---- Step 4: name your line --------------------------------------------------
function StepName({ state, update }) {
  const D = window.OPTIMERA;
  const deviceModel = 'iPhone 15 Pro';
  const suggestions = [
    `emmett · ${state.lineType}`,
    `${state.lineType} · ${deviceModel.toLowerCase()}`,
    state.lineType === 'work' ? 'fitch industries' : null,
    state.lineType === 'data' ? 'olympia studio' : null,
  ].filter(Boolean);

  return (
    <div style={actS.pad}>
      <p style={actS.lede}>what do you want to call it?</p>
      <div style={{ marginTop: 22 }}>
        <input
          type="text"
          value={state.lineName}
          onChange={e => update({ lineName: e.target.value })}
          placeholder="e.g. emmett iPhone"
          autoFocus
          style={actS.bigInput}/>
        <div style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.4)', marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.06 }}>
          shown in your lines list · can rename any time
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={actS.cap2}>suggestions</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => update({ lineName: s })}
              style={{ ...actS.chip, fontFamily: 'Geist, system-ui' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Summary block */}
      <div style={{ marginTop: 22 }}>
        <div style={actS.cap2}>summary</div>
        <div style={actS.summaryCard}>
          <div style={actS.sumRow}><span>type</span><span>{state.lineType}</span></div>
          <div style={actS.sumRow}><span>number</span>
            <span style={{ fontFamily: 'Geist Mono' }}>
              {state.numberMode === 'new' && state.selectedNumber
                ? `+1 ${state.selectedNumber.area} ${state.selectedNumber.local.slice(0,3)} ${state.selectedNumber.local.slice(3)}`
                : `port +1 ${state.portNumber}`}
            </span>
          </div>
          <div style={actS.sumRow}><span>installed on</span><span>iphone 15 pro</span></div>
          <div style={{ ...actS.sumRow, borderBottom: 'none' }}>
            <span>features</span>
            <span style={{ color: '#FBD53D' }}>
              {Object.entries(state.features).filter(([,v]) => v).length} enabled
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Styles + keyframes ------------------------------------------------------
const actS = {
  scrim: {
    position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)',
    zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    animation: 'sigScrim .28s ease',
  },
  sheet: {
    width: '100%', height: '94%',
    background: '#0a0a0a',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    border: '1px solid rgba(255,255,255,.08)',
    borderBottom: 'none',
    display: 'flex', flexDirection: 'column',
    animation: 'sigSlide .38s cubic-bezier(.2,.8,.2,1)',
    overflow: 'hidden',
  },
  sheetGrab: { width: 36, height: 4, background: 'rgba(255,255,255,.2)', borderRadius: 2,
    margin: '8px auto 0', flexShrink: 0 },
  sheetHead: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 16px 0',
  },
  headBtn: {
    width: 28, height: 28, borderRadius: 14,
    background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)',
    color: 'rgba(244,244,242,.8)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontFamily: 'Geist, system-ui',
  },
  cap: { fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.45)',
    textTransform: 'uppercase', letterSpacing: 0.12 },
  cap2: { fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.5)',
    textTransform: 'uppercase', letterSpacing: 0.12, marginBottom: 4 },
  title: { fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600, marginTop: 2 },
  dots: { display: 'flex', justifyContent: 'center', gap: 6, padding: '14px 0 4px' },
  dot: { height: 6, borderRadius: 3, transition: 'all .3s ease' },
  body: { flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' },
  pad: { padding: '14px 18px 20px' },
  footer: {
    padding: '14px 18px 22px', borderTop: '1px solid rgba(255,255,255,.06)',
    background: 'linear-gradient(to top, #0a0a0a, rgba(10,10,10,.92))',
    flexShrink: 0,
  },
  cta: {
    width: '100%', padding: '14px', borderRadius: 12, border: 'none',
    fontFamily: 'Geist, system-ui', fontSize: 14, fontWeight: 600,
    transition: 'all .2s',
  },
  lede: { fontFamily: 'Geist, system-ui', fontSize: 15, color: 'rgba(244,244,242,.8)',
    lineHeight: 1.5, margin: 0, textWrap: 'pretty' },

  // type tiles
  typeTile: {
    display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: 14,
    borderRadius: 14, border: '1px solid',
    cursor: 'pointer', transition: 'all .15s',
  },
  typeTileIco: {
    width: 40, height: 40, borderRadius: 10, display: 'flex',
    alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
  },
  typeTileLabel: { fontFamily: 'Space Grotesk', fontSize: 15, fontWeight: 600, color: '#f4f4f2' },
  typeTileTag: { fontFamily: 'Geist Mono', fontSize: 10.5, color: 'rgba(244,244,242,.55)',
    marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.05 },
  hintBox: {
    marginTop: 18, padding: 12,
    background: 'rgba(251,213,61,.04)',
    border: '1px solid rgba(251,213,61,.15)',
    borderRadius: 10,
  },

  // number step
  segGroup: {
    display: 'flex', gap: 4, padding: 4,
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.06)',
    borderRadius: 10, marginBottom: 18,
  },
  segBtn: {
    flex: 1, padding: '8px 12px', background: 'transparent', border: 'none',
    color: 'rgba(244,244,242,.5)', fontFamily: 'Geist, system-ui', fontSize: 12.5, fontWeight: 500,
    cursor: 'pointer', borderRadius: 7, transition: 'all .15s',
  },
  segBtnActive: {
    background: '#FBD53D', color: '#0a0a0a',
  },
  heroNumDisp: {
    padding: 16, borderRadius: 14,
    border: '1px solid rgba(251,213,61,.18)',
    background: 'radial-gradient(600px 300px at 50% -20%, rgba(251,213,61,.08), transparent 60%)',
  },
  heroNumText: {
    fontFamily: 'Geist Mono', fontSize: 26, fontWeight: 600, letterSpacing: -0.5,
    marginTop: 4, color: '#f4f4f2',
  },
  reservePill: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '4px 10px', borderRadius: 999,
    background: 'rgba(251,213,61,.1)', border: '1px solid rgba(251,213,61,.25)',
    fontFamily: 'Geist Mono', fontSize: 10.5, color: '#FBD53D', letterSpacing: 0.05,
    textTransform: 'uppercase',
  },
  pulseDot: {
    width: 7, height: 7, borderRadius: '50%', background: '#FBD53D',
    boxShadow: '0 0 0 0 rgba(251,213,61,.6)',
    animation: 'sigPulse 1.6s infinite',
  },
  numList: { display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 },
  numRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 12px', border: '1px solid',
    background: 'transparent', borderRadius: 8, cursor: 'pointer',
    color: '#f4f4f2', transition: 'all .12s',
  },
  bigInput: {
    width: '100%', padding: '14px 16px',
    fontFamily: 'Geist Mono', fontSize: 22, fontWeight: 500, letterSpacing: -0.3,
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: 12, color: '#f4f4f2', marginTop: 6,
    outline: 'none',
  },
  normalInput: {
    width: '100%', padding: '12px 14px',
    fontFamily: 'Geist Mono', fontSize: 14,
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: 10, color: '#f4f4f2', marginTop: 6,
    outline: 'none',
  },
  chip: {
    padding: '6px 12px', borderRadius: 999,
    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)',
    color: 'rgba(244,244,242,.8)', fontFamily: 'Geist Mono', fontSize: 11,
    letterSpacing: 0.04, cursor: 'pointer', transition: 'all .12s',
  },
  chipActive: {
    background: '#FBD53D', color: '#0a0a0a', borderColor: '#FBD53D',
  },
  verifyBox: {
    marginTop: 18, padding: 12,
    background: 'rgba(251,213,61,.04)',
    border: '1px solid rgba(251,213,61,.15)',
    borderRadius: 10,
  },

  // plan step
  planCard: {
    marginTop: 18, padding: 14,
    borderRadius: 12, border: '1px solid rgba(251,213,61,.2)',
    background: 'linear-gradient(160deg, rgba(251,213,61,.05), rgba(255,255,255,.02))',
  },
  listCard: {
    marginTop: 8,
    background: 'rgba(255,255,255,.025)',
    border: '1px solid rgba(255,255,255,.06)',
    borderRadius: 12, overflow: 'hidden',
  },
  presetNote: {
    marginTop: 14, padding: '8px 12px',
    display: 'flex', alignItems: 'center', gap: 8,
    fontFamily: 'Geist Mono', fontSize: 11, color: 'rgba(244,244,242,.65)',
    textTransform: 'uppercase', letterSpacing: 0.05,
  },

  // install hero
  simFace: {
    position: 'absolute', inset: 0, borderRadius: 16,
    background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 60%, #1c1c1c 100%)',
    border: '1px solid rgba(251,213,61,.2)',
    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(0,0,0,.5), inset 0 0 0 0.5px rgba(255,255,255,.06)',
  },
  simFaceBack: {
    background: 'linear-gradient(135deg, #FBD53D 0%, #e0bb30 60%, #FBD53D 100%)',
    border: '1px solid rgba(0,0,0,.15)',
  },
  simBrand: {
    position: 'absolute', top: 14, right: 18,
    fontFamily: 'Space Grotesk', fontSize: 12, fontWeight: 700,
    color: 'rgba(251,213,61,.9)', letterSpacing: 0.08,
  },
  simChip: {
    position: 'absolute', top: 14, left: 18,
    width: 52, height: 40, borderRadius: 6,
    background: 'linear-gradient(135deg, #FBD53D, #a47c00)',
    boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,.3), inset 0 -3px 6px rgba(0,0,0,.35)',
    overflow: 'hidden',
  },
  simChipTexture: {
    position: 'absolute', inset: 5,
    backgroundImage: `
      linear-gradient(to bottom, rgba(0,0,0,.38) 1px, transparent 1px),
      linear-gradient(to right, rgba(0,0,0,.38) 1px, transparent 1px)
    `,
    backgroundSize: '7px 5px',
    opacity: 0.65,
  },
  simChipPulse: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(circle, rgba(255,255,255,.5) 0%, transparent 50%)',
    animation: 'sigChipPulse 1.8s ease-in-out infinite',
  },
  simSignalWave: {
    position: 'absolute', top: 62, left: 18, display: 'flex', gap: 3,
  },
  wave: {
    width: 3, height: 12, background: '#FBD53D', borderRadius: 1,
    animation: 'sigWave 1.4s ease-in-out infinite',
  },
  simLabel: { position: 'absolute', bottom: 14, left: 18, right: 18 },
  progressTrack: {
    height: 4, background: 'rgba(255,255,255,.06)',
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', borderRadius: 2, transition: 'width .25s ease-out',
  },

  // summary
  summaryCard: {
    marginTop: 8, padding: '4px 14px',
    background: 'rgba(255,255,255,.025)',
    border: '1px solid rgba(255,255,255,.06)',
    borderRadius: 12,
  },
  sumRow: {
    display: 'flex', justifyContent: 'space-between', padding: '11px 0',
    borderBottom: '1px solid rgba(255,255,255,.05)',
    fontSize: 13, color: '#f4f4f2',
  },
};

// keyframes injected once
if (typeof document !== 'undefined' && !document.getElementById('sig-act-kf')) {
  const s = document.createElement('style');
  s.id = 'sig-act-kf';
  s.textContent = `
    @keyframes sigSlide { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @keyframes sigScrim { from { opacity: 0; } to { opacity: 1; } }
    @keyframes sigPulse {
      0% { box-shadow: 0 0 0 0 rgba(251,213,61,.6); }
      70% { box-shadow: 0 0 0 8px rgba(251,213,61,0); }
      100% { box-shadow: 0 0 0 0 rgba(251,213,61,0); }
    }
    @keyframes sigSpin { to { transform: rotate(360deg); } }
    @keyframes sigFlow { 0% { background-position: 0% 0; } 100% { background-position: 200% 0; } }
    @keyframes sigWave {
      0%, 100% { transform: scaleY(0.4); opacity: .4; }
      50% { transform: scaleY(1); opacity: 1; }
    }
    @keyframes sigChipPulse {
      0%, 100% { opacity: 0.15; }
      50% { opacity: 0.45; }
    }
  `;
  document.head.appendChild(s);
}

window.ActivationFlow = ActivationFlow;
