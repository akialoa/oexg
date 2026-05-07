// Direction 01 · SIGNAL — Data-rich operator console
// Dense, numeric, 14-day sparklines everywhere, cost allocation surfaced.

const { useState: useStateSig, useMemo: useMemoSig, useEffect: useEffectSig } = React;

// Per-line toggle overrides, so taps on the detail screen actually flip the switch.
// Keyed by `${lineId}.${tkey}` so each line has independent state.
function useLineToggle(lineId, tkey, initial) {
  const storeKey = `optimera-toggle-${lineId}-${tkey}`;
  const [on, setOn] = useStateSig(() => {
    try {
      const v = localStorage.getItem(storeKey);
      return v === null ? !!initial : v === '1';
    } catch { return !!initial; }
  });
  // Reset to the source-of-truth when the caller's initial changes (new line selected).
  useEffectSig(() => {
    try {
      const v = localStorage.getItem(storeKey);
      if (v === null) setOn(!!initial);
      else setOn(v === '1');
    } catch { setOn(!!initial); }
  }, [lineId, tkey]);
  const toggle = () => {
    setOn(prev => {
      const next = !prev;
      try { localStorage.setItem(storeKey, next ? '1' : '0'); } catch {}
      return next;
    });
  };
  return [on, toggle];
}

function IOSToggle({ on: initialOn, lineId, tkey, onChange }) {
  const [on, toggle] = useLineToggle(lineId, tkey, initialOn);
  const handle = (e) => { e.stopPropagation(); toggle(); onChange && onChange(!on); };
  return (
    <button onClick={handle} style={{
      width: 51, height: 31, borderRadius: 31, border: 'none', padding: 2,
      background: on ? '#FBD53D' : 'rgba(255,255,255,0.14)',
      position: 'relative', cursor: 'pointer',
      transition: 'background .22s ease',
      boxShadow: on ? 'inset 0 0 0 0.5px rgba(0,0,0,.1)' : 'inset 0 0 0 0.5px rgba(255,255,255,.04)',
      flex: '0 0 auto',
    }} aria-pressed={on} role="switch">
      <div style={{
        width: 27, height: 27, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 2, left: on ? 22 : 2,
        transition: 'left .22s cubic-bezier(.4,0,.2,1)',
        boxShadow: '0 2px 6px rgba(0,0,0,.25), 0 0 0 0.5px rgba(0,0,0,.06)',
      }}/>
    </button>
  );
}

function ToggleRow({ label, on, lineId, tkey, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 14px', gap: 12,
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,.05)',
    }}>
      <span style={{ fontFamily: 'Geist, system-ui', fontSize: 14, color: '#f4f4f2' }}>{label}</span>
      <IOSToggle on={on} lineId={lineId} tkey={tkey}/>
    </div>
  );
}

function DirSignal({ screen, lineId, invoiceId, onScreen, onLine, onInvoice }) {
  const D = window.OPTIMERA;
  const [activationOpen, setActivationOpen] = useStateSig(false);
  const [suspendDeviceId, setSuspendDeviceId] = useStateSig(null);
  const [planChangeOpen, setPlanChangeOpen] = useStateSig(false);
  const openActivation = () => setActivationOpen(true);
  const openSuspend = (id) => setSuspendDeviceId(id);
  const openPlanChange = () => setPlanChangeOpen(true);

  const content = (() => {
    switch (screen) {
      case 'lines':    return <SigLines onLine={onLine} openActivation={openActivation}/>;
      case 'line':     return <SigLineDetail device={D.devices.find(x => x.id === lineId) || D.devices[0]} onBack={() => onScreen('lines')} openSuspend={openSuspend}/>;
      case 'bills':    return <SigBills onInvoice={onInvoice}/>;
      case 'bill':     return <SigBillDetail invoice={D.invoices.find(x => x.id === invoiceId) || D.invoices[0]} onBack={() => onScreen('bills')}/>;
      case 'settings': return <SigSettings openPlanChange={openPlanChange}/>;
      default:         return <SigHome onLine={onLine} onScreen={onScreen} onInvoice={onInvoice} openActivation={openActivation} openPlanChange={openPlanChange}/>;
    }
  })();

  const suspendDevice = suspendDeviceId ? D.devices.find(x => x.id === suspendDeviceId) : null;

  return (
    <IOSDevice dark={true} width={402} height={874}>
      <div style={sigStyles.root}>
        {content}
        {window.ActivationFlow && (
          <window.ActivationFlow
            open={activationOpen}
            onClose={() => setActivationOpen(false)}
            onComplete={() => {}}
          />
        )}
        {window.SuspendFlow && (
          <window.SuspendFlow
            open={!!suspendDeviceId}
            device={suspendDevice}
            onClose={() => setSuspendDeviceId(null)}
            onComplete={() => {}}
          />
        )}
        {window.PlanChangeFlow && (
          <window.PlanChangeFlow
            open={planChangeOpen}
            onClose={() => setPlanChangeOpen(false)}
            onComplete={() => {}}
          />
        )}
      </div>
      <TabBar active={screen === 'line' ? 'lines' : (screen === 'bill' ? 'bills' : screen)}
              onTab={onScreen} dark={true} variant="glass"/>
    </IOSDevice>
  );
}

// ---------- shared header ----------
function SigTopBar({ left, right }) {
  return (
    <div style={sigStyles.topBar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{left}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{right}</div>
    </div>
  );
}

function SigIconBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={sigStyles.iconBtn}>{children}</button>
  );
}

// ---------- HOME ----------
function SigHome({ onLine, onScreen, onInvoice, openActivation, openPlanChange }) {
  const D = window.OPTIMERA;
  const { user, plan, activeDevices, totalDataUsed, dataPercent, totalMinutes, totalSms, periodProgress, invoices, fmt, daysElapsed, daysTotal } = D;
  const nextBill = invoices[0];
  const projectedTotal = (totalDataUsed / periodProgress); // lazy linear projection
  const projectedGB = projectedTotal / 1073741824;

  return (
    <div style={{ paddingTop: 54, paddingBottom: 110 }}>
      <SigTopBar
        left={<>
          <Avatar name={user.fullName} size={30}/>
          <div>
            <div style={sigStyles.greeting}>good evening, emmett!</div>
            <div style={sigStyles.greetingSub}>fitch industries</div>
          </div>
        </>}
        right={<>
          <SigIconBtn><Ico.search width={16} height={16}/></SigIconBtn>
          <SigIconBtn><Ico.bell width={16} height={16}/></SigIconBtn>
        </>}
      />

      {/* Period readout */}
      <div style={sigStyles.padX}>
        <div style={sigStyles.stripe}>
          <div style={sigStyles.stripeLabel}>period</div>
          <div style={sigStyles.stripeValue}>april 2026</div>
          <div style={sigStyles.stripeDivider}/>
          <div style={sigStyles.stripeLabel}>day</div>
          <div style={sigStyles.stripeValue}>{daysElapsed} / {daysTotal}</div>
          <div style={{ ...sigStyles.stripeDivider, flex: 1 }}/>
          <div style={sigStyles.stripeLabel}>status</div>
          <div style={{ ...sigStyles.stripeValue, color: '#FBD53D' }}>on track</div>
        </div>
      </div>

      {/* Hero data widget */}
      <div style={sigStyles.padX}>
        <div style={sigStyles.heroCard}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={sigStyles.cardCap}>data used · all lines</div>
              <div style={sigStyles.heroNumber}>
                {fmt.gb(totalDataUsed).toFixed(1)}
                <span style={sigStyles.heroUnit}>gb</span>
              </div>
              <div style={sigStyles.heroSub}>
                of <span style={{ color: '#f4f4f2' }}>{plan.dataAllocationGigs} gb</span> · {(dataPercent * 100).toFixed(0)}% used
              </div>
            </div>
            <Donut percent={dataPercent} size={96} stroke={10} color="#FBD53D" track="rgba(255,255,255,.08)">
              <div style={{ fontFamily: 'Geist Mono', fontSize: 16, fontWeight: 600 }}>{(dataPercent * 100).toFixed(0)}%</div>
            </Donut>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <div style={sigStyles.microStat}>
              <div style={sigStyles.microLabel}>projected</div>
              <div style={sigStyles.microValue}>{projectedGB.toFixed(0)} gb</div>
              <div style={sigStyles.microDelta}>+{(projectedGB - fmt.gb(totalDataUsed)).toFixed(0)} gb remaining</div>
            </div>
            <div style={sigStyles.microStat}>
              <div style={sigStyles.microLabel}>voice</div>
              <div style={sigStyles.microValue}>{totalMinutes}<span style={sigStyles.microUnit}>min</span></div>
              <div style={sigStyles.microDelta}>unlimited</div>
            </div>
            <div style={sigStyles.microStat}>
              <div style={sigStyles.microLabel}>sms</div>
              <div style={sigStyles.microValue}>{totalSms.toLocaleString()}</div>
              <div style={sigStyles.microDelta}>unlimited</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lines by usage */}
      <div style={sigStyles.padX}>
        <div style={sigStyles.sectionHead}>
          <span>lines</span>
          <button style={sigStyles.linkBtn} onClick={() => onScreen('lines')}>view all →</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {activeDevices.map(d => (
            <button key={d.id} onClick={() => onLine(d.id)} style={sigStyles.lineRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <div style={{ ...sigStyles.lineDot, background: d.id === 'sim-04' ? '#888' : '#FBD53D' }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={sigStyles.lineName}>{d.label}</div>
                  <div style={sigStyles.lineNum}>
                    {d.phoneNumber ? fmt.phone(d.phoneNumber) : 'data only · ' + d.deviceModel}
                  </div>
                </div>
              </div>
              <Spark values={d.usage.spark} width={48} height={22} color="#FBD53D"
                     fill="rgba(251,213,61,.1)" strokeWidth={1.2}/>
              <div style={sigStyles.lineGb}>
                {fmt.gb(d.usage.dataTotalBytes).toFixed(1)}<span style={{ color: 'rgba(244,244,242,.4)', fontSize: 10, marginLeft: 2 }}>gb</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Next bill */}
      <div style={sigStyles.padX}>
        <div style={sigStyles.sectionHead}>
          <span>next bill</span>
          <button style={sigStyles.linkBtn} onClick={() => onInvoice(nextBill.id)}>open →</button>
        </div>
        <button onClick={() => onInvoice(nextBill.id)} style={sigStyles.billCard}>
          <div>
            <div style={sigStyles.billDate}>apr 28</div>
            <div style={sigStyles.billLabel}>{nextBill.invoiceNumber} · due in 8 days</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={sigStyles.billAmt}>{fmt.usd(nextBill.total)}</div>
            <div style={sigStyles.billMethod}>visa ···· 4412</div>
          </div>
        </button>
      </div>

      {/* Activity */}
      <div style={sigStyles.padX}>
        <div style={sigStyles.sectionHead}><span>recent activity</span></div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {D.recentActivity.slice(0, 5).map((a, i) => {
            const dev = D.devices.find(x => x.id === a.deviceId);
            const icon = a.kind === 'call' ? Ico.phone : a.kind === 'sms' ? Ico.msg : Ico.data;
            const Icon = icon;
            const main = a.kind === 'call' ? `${a.dir === 'in' ? 'in' : 'out'} · ${fmt.phone(a.other)}`
                       : a.kind === 'sms' ? `${a.dir === 'in' ? 'in' : 'out'} · ${fmt.phone(a.other)}`
                       : `${fmt.gb(a.bytes).toFixed(2)} gb · session`;
            const meta = a.kind === 'call' ? fmt.duration(a.dur) : a.at.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            return (
              <div key={i} style={sigStyles.actRow}>
                <div style={sigStyles.actIco}><Icon width={14} height={14}/></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={sigStyles.actMain}>{main}</div>
                  <div style={sigStyles.actMeta}>{dev.label}</div>
                </div>
                <div style={sigStyles.actTime}>{meta}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- LINES ----------
function SigLines({ onLine, openActivation }) {
  const D = window.OPTIMERA;
  const { devices, plan, totalDataUsed, fmt } = D;
  return (
    <div style={{ paddingTop: 54, paddingBottom: 110 }}>
      <SigTopBar
        left={<div style={sigStyles.pageTitle}>lines <span style={sigStyles.pageCount}>/{devices.length}</span></div>}
        right={<>
          <SigIconBtn><Ico.search width={16} height={16}/></SigIconBtn>
          <SigIconBtn onClick={openActivation}><Ico.plus width={16} height={16}/></SigIconBtn>
        </>}
      />

      {/* Total bar */}
      <div style={sigStyles.padX}>
        <div style={sigStyles.totalCard}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={sigStyles.cardCap}>pool · all lines</div>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 22, fontWeight: 600 }}>
                {fmt.gb(totalDataUsed).toFixed(1)} <span style={{ color: 'rgba(244,244,242,.5)', fontSize: 14 }}>of {plan.dataAllocationGigs} gb</span>
              </div>
            </div>
            <div style={{ fontFamily: 'Geist Mono', fontSize: 14, color: '#FBD53D' }}>71%</div>
          </div>
          <StackedBar segments={devices.filter(d => d.state === 'active').map((d, i) => ({
            label: d.label,
            value: d.usage.dataTotalBytes,
            color: ['#FBD53D', '#D9B530', '#B89625', '#7A6212'][i] || '#555',
          }))}/>
          <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
            {devices.filter(d => d.state === 'active').map((d, i) => (
              <div key={d.id} style={sigStyles.legendItem}>
                <span style={{ ...sigStyles.legendDot, background: ['#FBD53D', '#D9B530', '#B89625', '#7A6212'][i] }}/>
                <span style={{ color: 'rgba(244,244,242,.7)' }}>{d.label.split(' · ')[0]}</span>
                <span style={{ color: 'rgba(244,244,242,.4)' }}>{fmt.gb(d.usage.dataTotalBytes).toFixed(1)}g</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={sigStyles.padX}>
        {devices.map(d => (
          <button key={d.id} onClick={() => onLine(d.id)} style={sigStyles.lineFullRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
              <div style={{
                ...sigStyles.lineFullIco,
                background: d.state === 'suspended' ? '#333' : 'rgba(251,213,61,.12)',
                color: d.state === 'suspended' ? '#666' : '#FBD53D',
              }}>
                <Ico.sim width={16} height={16}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={sigStyles.lineFullName}>
                  {d.label}
                  {d.state === 'suspended' && <span style={sigStyles.suspendedTag}>suspended</span>}
                </div>
                <div style={sigStyles.lineFullMeta}>
                  {d.phoneNumber ? fmt.phone(d.phoneNumber) : 'data only'}
                  {d.deviceModel && ` · ${d.deviceModel}`}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right', marginRight: 8 }}>
              <div style={sigStyles.lineFullGb}>{fmt.gb(d.usage.dataTotalBytes).toFixed(1)}<span style={{ fontSize: 10, color: 'rgba(244,244,242,.4)', marginLeft: 2 }}>gb</span></div>
              <div style={sigStyles.lineFullCost}>{fmt.usd(D.lineCostThisMonth[d.id] || 0)}</div>
            </div>
            <Ico.chev width={14} height={14} style={{ color: 'rgba(244,244,242,.3)' }}/>
          </button>
        ))}

        {/* Activate new line CTA */}
        <button onClick={openActivation} style={sigStyles.addLineRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
            <div style={sigStyles.addLineIco}>
              <Ico.plus width={16} height={16}/>
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <div style={sigStyles.addLineName}>activate a new line</div>
              <div style={sigStyles.addLineMeta}>esim · ready in about a minute</div>
            </div>
          </div>
          <Ico.chev width={14} height={14} style={{ color: '#FBD53D' }}/>
        </button>
      </div>
    </div>
  );
}

// ---------- LINE DETAIL ----------
function SigLineDetail({ device, onBack, openSuspend }) {
  const D = window.OPTIMERA;
  const { fmt, plan } = D;
  return (
    <div style={{ paddingTop: 54, paddingBottom: 110 }}>
      <SigTopBar
        left={<>
          <button onClick={onBack} style={sigStyles.backBtn}><Ico.chev width={14} height={14} style={{ transform: 'rotate(180deg)' }}/></button>
          <div>
            <div style={sigStyles.detailTitle}>{device.label}</div>
            <div style={sigStyles.detailSub}>{device.phoneNumber ? fmt.phone(device.phoneNumber) : 'data only'}</div>
          </div>
        </>}
        right={<SigIconBtn><Ico.dot3 width={16} height={16}/></SigIconBtn>}
      />

      <div style={sigStyles.padX}>
        {/* Device meta */}
        <div style={sigStyles.metaBlock}>
          <div style={sigStyles.metaCol}>
            <div style={sigStyles.metaK}>device</div>
            <div style={sigStyles.metaV}>{device.deviceBrand || '—'} {device.deviceModel || ''}</div>
          </div>
          <div style={sigStyles.metaCol}>
            <div style={sigStyles.metaK}>sim</div>
            <div style={sigStyles.metaV}>{device.simType}</div>
          </div>
          <div style={sigStyles.metaCol}>
            <div style={sigStyles.metaK}>status</div>
            <div style={{ ...sigStyles.metaV, color: device.state === 'active' ? '#FBD53D' : '#888' }}>● {device.state}</div>
          </div>
        </div>

        {/* Data */}
        <div style={sigStyles.detailCard}>
          <div style={sigStyles.detailCardHead}>
            <div>
              <div style={sigStyles.cardCap}>data · 14 days</div>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 22, fontWeight: 600 }}>
                {fmt.gb(device.usage.dataTotalBytes).toFixed(2)}<span style={{ fontSize: 13, color: 'rgba(244,244,242,.5)', marginLeft: 4 }}>gb</span>
              </div>
            </div>
            <div style={{ fontFamily: 'Geist Mono', fontSize: 11, color: 'rgba(244,244,242,.5)', textAlign: 'right' }}>
              <div>↓ {fmt.gb(device.usage.dataDownloadBytes).toFixed(1)} gb</div>
              <div>↑ {fmt.gb(device.usage.dataUploadBytes).toFixed(1)} gb</div>
            </div>
          </div>
          <SparkBars values={device.usage.spark} width={370} height={52} color="#FBD53D" gap={3}/>
          <div style={sigStyles.axisRow}>
            <span>apr 7</span><span>apr 14</span><span>apr 20</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <div style={{ ...sigStyles.splitStat, flex: 1 }}>
            <div style={sigStyles.microLabel}>voice</div>
            <div style={sigStyles.microValue}>{device.usage.minutesTotal}<span style={sigStyles.microUnit}>min</span></div>
          </div>
          <div style={{ ...sigStyles.splitStat, flex: 1 }}>
            <div style={sigStyles.microLabel}>sms</div>
            <div style={sigStyles.microValue}>{device.usage.smsTotal}</div>
          </div>
        </div>

        {/* Features — native iOS toggles */}
        <div style={sigStyles.sectionHead}><span>voice</span></div>
        <div style={sigStyles.listCard}>
          <ToggleRow label="voice" on={device.hasVoice} lineId={device.id} tkey="hasVoice"/>
          <ToggleRow label="call waiting" on={device.callWaiting} lineId={device.id} tkey="callWaiting" last/>
        </div>

        <div style={sigStyles.sectionHead}><span>messaging</span></div>
        <div style={sigStyles.listCard}>
          <ToggleRow label="sms" on={device.hasSms} lineId={device.id} tkey="hasSms"/>
          <ToggleRow label="mms" on={device.hasMms} lineId={device.id} tkey="hasMms" last/>
        </div>

        <div style={sigStyles.sectionHead}><span>data</span></div>
        <div style={sigStyles.listCard}>
          <ToggleRow label="cellular data" on={device.hasData} lineId={device.id} tkey="hasData" last/>
        </div>

        {/* Forwarding */}
        <div style={sigStyles.sectionHead}><span>call forwarding</span></div>
        <div style={sigStyles.listCard}>
          {[
            { k: 'unconditional', on: device.cfuActive, num: device.cfuNumber, tkey: 'cfuActive' },
            { k: 'busy',          on: device.cfbActive, num: device.cfbNumber, tkey: 'cfbActive' },
            { k: 'no answer',     on: device.cfnaActive, num: device.cfnaNumber, tkey: 'cfnaActive' },
            { k: 'not reachable', on: device.cfnrActive, num: device.cfnrNumber, tkey: 'cfnrActive' },
          ].map((r, i, arr) => (
            <div key={r.k} style={{ ...sigStyles.listRow, borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <div style={sigStyles.rowLabel}>{r.k}</div>
                {r.on && r.num && (
                  <div style={{ fontFamily: 'Geist Mono', fontSize: 9.5, color: '#FBD53D', marginTop: 2, letterSpacing: 0.04 }}>
                    → {fmt.phone(r.num)}
                  </div>
                )}
              </div>
              <IOSToggle on={r.on} lineId={device.id} tkey={r.tkey}/>
            </div>
          ))}
        </div>

        {/* Identifiers */}
        <div style={sigStyles.sectionHead}><span>identifiers</span></div>
        <div style={sigStyles.listCard}>
          <div style={{ ...sigStyles.listRow, borderBottom: '1px solid rgba(255,255,255,.05)' }}>
            <span style={sigStyles.rowLabel}>imsi</span>
            <span style={{ ...sigStyles.rowValue, fontFamily: 'Geist Mono', fontSize: 12 }}>{device.imsi}</span>
          </div>
          <div style={sigStyles.listRow}>
            <span style={sigStyles.rowLabel}>iccid</span>
            <span style={{ ...sigStyles.rowValue, fontFamily: 'Geist Mono', fontSize: 12 }}>{device.iccid}</span>
          </div>
        </div>

        {/* Line actions */}
        <div style={sigStyles.sectionHead}><span>line actions</span></div>
        <button onClick={() => openSuspend && openSuspend(device.id)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '14px 16px',
          background: device.state === 'suspended'
            ? 'linear-gradient(to right, rgba(251,213,61,.04), rgba(251,213,61,.01))'
            : 'rgba(214,89,59,.04)',
          border: '1px dashed ' + (device.state === 'suspended' ? 'rgba(251,213,61,.3)' : 'rgba(214,89,59,.3)'),
          borderRadius: 12, cursor: 'pointer',
          color: device.state === 'suspended' ? '#FBD53D' : '#d6593b',
          fontFamily: 'Geist, system-ui', fontSize: 14, fontWeight: 500,
          textAlign: 'left',
        }}>
          <div>
            <div>{device.state === 'suspended' ? 'restore this line' : 'pause this line'}</div>
            <div style={{ fontFamily: 'Geist Mono', fontSize: 10, marginTop: 3,
              opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.06 }}>
              {device.state === 'suspended' ? 'resume service instantly' : 'keeps the number · restore anytime'}
            </div>
          </div>
          <Ico.chev width={14} height={14}/>
        </button>
      </div>
    </div>
  );
}

// ---------- BILLS ----------
function SigBills({ onInvoice }) {
  const D = window.OPTIMERA;
  const { invoices, fmt } = D;
  const ytd = invoices.filter(i => i.periodStart.getFullYear() === 2026).reduce((s, i) => s + i.total, 0);
  const maxT = Math.max(...invoices.map(i => i.total));
  const minT = Math.min(...invoices.map(i => i.total));
  return (
    <div style={{ paddingTop: 54, paddingBottom: 110 }}>
      <SigTopBar
        left={<div style={sigStyles.pageTitle}>bills</div>}
        right={<>
          <SigIconBtn><Ico.download width={16} height={16}/></SigIconBtn>
          <SigIconBtn><Ico.search width={16} height={16}/></SigIconBtn>
        </>}
      />

      <div style={sigStyles.padX}>
        {/* Summary */}
        <div style={sigStyles.billSummary}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={sigStyles.cardCap}>year to date · 2026</div>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 26, fontWeight: 600 }}>{fmt.usd(ytd)}</div>
              <div style={sigStyles.heroSub}>avg {fmt.usd(ytd / 4)} / mo across 4 bills</div>
            </div>
            <div style={{ fontFamily: 'Geist Mono', fontSize: 11, color: 'rgba(244,244,242,.55)', textAlign: 'right' }}>
              <div>high {fmt.usd(maxT)}</div>
              <div>low {fmt.usd(minT)}</div>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <SparkBars values={[...invoices].reverse().map(i => i.total)} width={370} height={38} color="#FBD53D" gap={6}/>
            <div style={sigStyles.axisRow}>
              <span>nov</span><span>dec</span><span>jan</span><span>feb</span><span>mar</span><span style={{ color: '#FBD53D' }}>apr</span>
            </div>
          </div>
        </div>

        {/* List */}
        {invoices.map(inv => (
          <button key={inv.id} onClick={() => onInvoice(inv.id)} style={sigStyles.billFullRow}>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={sigStyles.billFullDate}>{fmt.monthYear(inv.periodStart)}</div>
              <div style={sigStyles.billFullMeta}>{inv.invoiceNumber} · {inv.items.length} items</div>
            </div>
            <div style={{ textAlign: 'right', marginRight: 8 }}>
              <div style={sigStyles.billFullAmt}>{fmt.usd(inv.total)}</div>
              <div style={{
                ...sigStyles.billFullStatus,
                color: inv.isPaid ? 'rgba(244,244,242,.5)' : '#FBD53D',
              }}>
                {inv.isPaid ? '● paid' : '● due ' + fmt.shortDate(inv.periodEnd)}
              </div>
            </div>
            <Ico.chev width={14} height={14} style={{ color: 'rgba(244,244,242,.3)' }}/>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- BILL DETAIL ----------
function SigBillDetail({ invoice, onBack }) {
  const D = window.OPTIMERA;
  const { fmt } = D;
  return (
    <div style={{ paddingTop: 54, paddingBottom: 110 }}>
      <SigTopBar
        left={<>
          <button onClick={onBack} style={sigStyles.backBtn}><Ico.chev width={14} height={14} style={{ transform: 'rotate(180deg)' }}/></button>
          <div>
            <div style={sigStyles.detailTitle}>{invoice.invoiceNumber}</div>
            <div style={sigStyles.detailSub}>{fmt.shortDate(invoice.periodStart)} → {fmt.shortDate(invoice.periodEnd)}</div>
          </div>
        </>}
        right={<SigIconBtn><Ico.download width={16} height={16}/></SigIconBtn>}
      />

      <div style={sigStyles.padX}>
        <div style={sigStyles.billHeroCard}>
          <div style={sigStyles.cardCap}>total</div>
          <div style={sigStyles.billHeroAmt}>{fmt.usd(invoice.total)}</div>
          {!invoice.isPaid ? (
            <>
              <div style={{ ...sigStyles.heroSub, color: '#FBD53D' }}>due apr 28 · 8 days</div>
              <button style={sigStyles.payBtn}>pay now</button>
            </>
          ) : (
            <div style={{ ...sigStyles.heroSub, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Ico.check width={12} height={12} style={{ color: '#FBD53D' }}/>
              paid {fmt.shortDate(invoice.dateCreated)} · visa ···· {invoice.paymentCardLast4}
            </div>
          )}
        </div>

        <div style={sigStyles.sectionHead}><span>line items</span></div>
        <div style={sigStyles.listCard}>
          {invoice.items.map((it, i, arr) => (
            <div key={it.id} style={{ ...sigStyles.billItem, borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={sigStyles.billItemName}>{it.name}</div>
                {it.description && <div style={sigStyles.billItemDesc}>{it.description}</div>}
              </div>
              <div style={sigStyles.billItemPrice}>{fmt.usd(it.price)}</div>
            </div>
          ))}
        </div>

        {invoice.adjustments && invoice.adjustments.length > 0 && (
          <>
            <div style={sigStyles.sectionHead}><span>fees · taxes · adjustments</span></div>
            <div style={sigStyles.listCard}>
              {invoice.adjustments.map((a, i, arr) => (
                <div key={a.id} style={{ ...sigStyles.billItem, borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                  <div style={sigStyles.rowLabel}>{a.label}</div>
                  <div style={{ ...sigStyles.billItemPrice, color: a.amount < 0 ? '#FBD53D' : '#f4f4f2' }}>
                    {a.amount < 0 ? '−' : ''}{fmt.usd(Math.abs(a.amount))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={sigStyles.totalsBox}>
          <div style={sigStyles.totalsRow}><span style={sigStyles.rowLabel}>subtotal</span><span style={{ fontFamily: 'Geist Mono' }}>{fmt.usd(invoice.subtotal)}</span></div>
          <div style={sigStyles.totalsRow}>
            <span style={{ ...sigStyles.rowLabel, color: '#f4f4f2', fontWeight: 500 }}>total</span>
            <span style={{ fontFamily: 'Geist Mono', fontWeight: 600, fontSize: 16 }}>{fmt.usd(invoice.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- SETTINGS ----------
function SigSettings({ openPlanChange }) {
  const D = window.OPTIMERA;
  const { user, plan, fmt } = D;
  return (
    <div style={{ paddingTop: 54, paddingBottom: 110 }}>
      <SigTopBar
        left={<div style={sigStyles.pageTitle}>settings</div>}
        right={null}
      />

      <div style={sigStyles.padX}>
        {/* Profile */}
        <div style={sigStyles.profCard}>
          <Avatar name={user.fullName} size={54}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={sigStyles.profName}>{user.fullName.toLowerCase()}</div>
            <div style={sigStyles.profMail}>{user.email}</div>
            <div style={sigStyles.profAcct}>acct 8421 · {user.accountType}</div>
          </div>
          <Ico.chev width={14} height={14} style={{ color: 'rgba(244,244,242,.3)' }}/>
        </div>

        <div style={sigStyles.sectionHead}><span>plan</span></div>
        <button onClick={openPlanChange} style={{
          ...sigStyles.planCard,
          width: '100%', textAlign: 'left', cursor: 'pointer',
          color: '#f4f4f2',
          display: 'block',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={sigStyles.planName}>{plan.name}</div>
              <div style={sigStyles.planDesc}>{plan.speedDescription}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 18, fontWeight: 600, textAlign: 'right' }}>
                {fmt.usd(plan.pricePerMonth)}<span style={{ color: 'rgba(244,244,242,.4)', fontSize: 10, marginLeft: 2 }}>/mo</span>
              </div>
              <Ico.chev width={14} height={14} style={{ color: 'rgba(244,244,242,.3)' }}/>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            {plan.terms.map(t => <span key={t} style={sigStyles.chipSm}>{t}</span>)}
            <span style={sigStyles.chipSm}>{plan.dataAllocationGigs} gb</span>
            <span style={sigStyles.chipSm}>up to {plan.maxDevices} devices</span>
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed rgba(255,255,255,.08)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Geist Mono', fontSize: 10, color: '#FBD53D',
              textTransform: 'uppercase', letterSpacing: 0.08 }}>tap to compare plans</span>
            <span style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.4)',
              textTransform: 'uppercase', letterSpacing: 0.06 }}>3 tiers available</span>
          </div>
        </button>

        <div style={sigStyles.sectionHead}><span>billing</span></div>
        <div style={sigStyles.listCard}>
          {[
            ['billing day', `${user.billingDay}th of each month`],
            ['next bill', fmt.fullDate(user.nextBillingDate)],
            ['next invoice', fmt.fullDate(user.nextInvoiceDate)],
            ['grace period', `${user.billingGrace} days`],
          ].map(([k, v], i, arr) => (
            <div key={k} style={{ ...sigStyles.listRow, borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
              <span style={sigStyles.rowLabel}>{k}</span>
              <span style={sigStyles.rowValue}>{v}</span>
            </div>
          ))}
        </div>

        <div style={sigStyles.sectionHead}><span>payment</span></div>
        <div style={sigStyles.cardPay}>
          <Ico.card width={22} height={22} style={{ color: '#FBD53D' }}/>
          <div style={{ flex: 1 }}>
            <div style={sigStyles.profName}>visa ···· {user.defaultPaymentCard.lastFour}</div>
            <div style={sigStyles.profMail}>exp {user.defaultPaymentCard.expiration} · default</div>
          </div>
        </div>

        <div style={sigStyles.sectionHead}><span>address</span></div>
        <div style={sigStyles.listCard}>
          {[
            ['street', user.streetAddress.street],
            ['city', `${user.streetAddress.city}, ${user.streetAddress.state} ${user.streetAddress.zipcode}`],
          ].map(([k, v], i, arr) => (
            <div key={k} style={{ ...sigStyles.listRow, borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
              <span style={sigStyles.rowLabel}>{k}</span>
              <span style={sigStyles.rowValue}>{v}</span>
            </div>
          ))}
        </div>

        <button style={sigStyles.signOut}>
          <Ico.logout width={14} height={14}/>
          <span>sign out</span>
        </button>
      </div>
    </div>
  );
}

// ---------- styles ----------
const sigStyles = {
  root: { background: '#0a0a0a', height: '100%', color: '#f4f4f2',
    fontFamily: 'Geist, system-ui', fontSize: 14, letterSpacing: 0.01 },
  padX: { padding: '14px 16px 0' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '2px 16px 10px' },
  iconBtn: { width: 32, height: 32, borderRadius: 10,
    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)',
    color: '#f4f4f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer' },
  backBtn: { width: 30, height: 30, borderRadius: 10,
    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)',
    color: '#f4f4f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer' },
  greeting: { fontFamily: 'Geist', fontSize: 15, fontWeight: 500, lineHeight: 1.1 },
  greetingSub: { fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.45)',
    textTransform: 'uppercase', letterSpacing: 0.08, marginTop: 2 },
  pageTitle: { fontFamily: 'Space Grotesk', fontSize: 26, fontWeight: 600, letterSpacing: -0.3 },
  pageCount: { fontFamily: 'Geist Mono', fontSize: 13, color: 'rgba(244,244,242,.4)', fontWeight: 400, marginLeft: 4 },
  detailTitle: { fontFamily: 'Space Grotesk', fontSize: 17, fontWeight: 600 },
  detailSub: { fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.5)', marginTop: 1 },
  stripe: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
    background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
    borderRadius: 10, fontFamily: 'Geist Mono', fontSize: 9.5, marginBottom: 14 },
  stripeLabel: { color: 'rgba(244,244,242,.4)', textTransform: 'uppercase', letterSpacing: 0.06 },
  stripeValue: { color: '#f4f4f2' },
  stripeDivider: { width: 1, height: 10, background: 'rgba(255,255,255,.1)', margin: '0 4px' },
  heroCard: { background: 'linear-gradient(160deg, rgba(251,213,61,.05), rgba(255,255,255,.02))',
    border: '1px solid rgba(255,255,255,.08)', borderRadius: 18, padding: 16, marginBottom: 14 },
  cardCap: { fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.45)',
    textTransform: 'uppercase', letterSpacing: 0.1, marginBottom: 4 },
  heroNumber: { fontFamily: 'Geist Mono', fontSize: 42, fontWeight: 600, lineHeight: 1, letterSpacing: -1 },
  heroUnit: { fontSize: 18, color: 'rgba(244,244,242,.4)', marginLeft: 6, letterSpacing: 0 },
  heroSub: { fontSize: 12.5, color: 'rgba(244,244,242,.55)', marginTop: 4 },
  microStat: { flex: 1, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
    borderRadius: 10, padding: '8px 10px' },
  microLabel: { fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.45)',
    textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 2 },
  microValue: { fontFamily: 'Geist Mono', fontSize: 16, fontWeight: 600, letterSpacing: -0.3 },
  microUnit: { fontSize: 10, color: 'rgba(244,244,242,.4)', marginLeft: 3, fontWeight: 400 },
  microDelta: { fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.4)', marginTop: 2 },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
    margin: '20px 0 8px', fontFamily: 'Geist Mono', fontSize: 9.5,
    color: 'rgba(244,244,242,.45)', textTransform: 'uppercase', letterSpacing: 0.1 },
  linkBtn: { background: 'transparent', border: 'none', color: '#FBD53D',
    fontFamily: 'Geist Mono', fontSize: 9.5, cursor: 'pointer', letterSpacing: 0.05 },
  lineRow: { display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
    borderRadius: 10, padding: '10px 12px', width: '100%',
    color: '#f4f4f2', cursor: 'pointer', textAlign: 'left' },
  lineDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  lineName: { fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  lineNum: { fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.45)', marginTop: 1 },
  lineGb: { fontFamily: 'Geist Mono', fontSize: 14, fontWeight: 600, width: 52, textAlign: 'right' },
  billCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', padding: '14px 16px',
    background: '#0a0a0a', border: '1px solid rgba(251,213,61,.3)',
    borderRadius: 14, cursor: 'pointer', color: '#f4f4f2', textAlign: 'left' },
  billDate: { fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 600, color: '#FBD53D' },
  billLabel: { fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.5)', marginTop: 2 },
  billAmt: { fontFamily: 'Geist Mono', fontSize: 20, fontWeight: 600 },
  billMethod: { fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.4)', marginTop: 2 },
  actRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,.05)' },
  actIco: { width: 26, height: 26, borderRadius: 8, background: 'rgba(255,255,255,.04)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(244,244,242,.6)' },
  actMain: { fontSize: 13, fontWeight: 500 },
  actMeta: { fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.4)', marginTop: 1 },
  actTime: { fontFamily: 'Geist Mono', fontSize: 11, color: 'rgba(244,244,242,.5)' },
  totalCard: { background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
    borderRadius: 14, padding: 14, marginBottom: 12 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 5,
    fontFamily: 'Geist Mono', fontSize: 10 },
  legendDot: { width: 8, height: 8, borderRadius: 2, display: 'inline-block' },
  lineFullRow: { display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 4px', width: '100%', background: 'transparent',
    border: 'none', borderBottom: '1px solid rgba(255,255,255,.05)',
    cursor: 'pointer', color: '#f4f4f2', textAlign: 'left' },
  lineFullIco: { width: 36, height: 36, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  lineFullName: { fontSize: 14, fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: 6 },
  lineFullMeta: { fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.5)', marginTop: 2 },
  suspendedTag: { fontFamily: 'Geist Mono', fontSize: 9, color: '#888',
    textTransform: 'uppercase', letterSpacing: 0.06,
    border: '1px solid rgba(255,255,255,.12)', borderRadius: 3, padding: '1px 5px' },
  lineFullGb: { fontFamily: 'Geist Mono', fontSize: 14, fontWeight: 600 },
  lineFullCost: { fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.5)', marginTop: 2 },
  metaBlock: { display: 'flex', gap: 8, padding: '10px 12px',
    background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
    borderRadius: 10, marginBottom: 14 },
  metaCol: { flex: 1 },
  metaK: { fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.4)',
    textTransform: 'uppercase', letterSpacing: 0.08 },
  metaV: { fontFamily: 'Geist Mono', fontSize: 11.5, color: '#f4f4f2', marginTop: 2 },
  detailCard: { background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
    borderRadius: 14, padding: 14 },
  detailCardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  axisRow: { display: 'flex', justifyContent: 'space-between',
    fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.35)',
    textTransform: 'uppercase', letterSpacing: 0.08, marginTop: 6 },
  splitStat: { background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
    borderRadius: 10, padding: '10px 12px' },
  featRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  featChip: { display: 'flex', alignItems: 'center', gap: 4,
    padding: '5px 10px', borderRadius: 999,
    background: 'rgba(251,213,61,.1)', border: '1px solid rgba(251,213,61,.2)',
    color: '#FBD53D', fontFamily: 'Geist Mono', fontSize: 9.5,
    textTransform: 'uppercase', letterSpacing: 0.06 },
  listCard: { background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
    borderRadius: 12, overflow: 'hidden' },
  listRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '11px 14px' },
  rowLabel: { fontFamily: 'Geist', fontSize: 12.5, color: 'rgba(244,244,242,.65)' },
  rowValue: { fontFamily: 'Geist', fontSize: 12.5, color: '#f4f4f2' },
  billSummary: { background: 'linear-gradient(160deg, rgba(251,213,61,.05), rgba(255,255,255,.02))',
    border: '1px solid rgba(255,255,255,.08)', borderRadius: 18, padding: 16, marginBottom: 14 },
  billFullRow: { display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 4px', width: '100%', background: 'transparent',
    border: 'none', borderBottom: '1px solid rgba(255,255,255,.05)',
    cursor: 'pointer', color: '#f4f4f2', textAlign: 'left' },
  billFullDate: { fontFamily: 'Geist', fontSize: 13.5, fontWeight: 500,
    textTransform: 'capitalize' },
  billFullMeta: { fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.5)', marginTop: 2 },
  billFullAmt: { fontFamily: 'Geist Mono', fontSize: 15, fontWeight: 600 },
  billFullStatus: { fontFamily: 'Geist Mono', fontSize: 10, marginTop: 2,
    textTransform: 'uppercase', letterSpacing: 0.06 },
  billHeroCard: { background: 'linear-gradient(160deg, rgba(251,213,61,.08), rgba(255,255,255,.02))',
    border: '1px solid rgba(251,213,61,.2)', borderRadius: 18, padding: 20, marginBottom: 10 },
  billHeroAmt: { fontFamily: 'Geist Mono', fontSize: 40, fontWeight: 600, letterSpacing: -1, marginTop: 2 },
  payBtn: { background: '#FBD53D', color: '#0a0a0a', border: 'none', borderRadius: 10,
    padding: '10px 16px', fontFamily: 'Geist', fontSize: 13, fontWeight: 600,
    marginTop: 12, width: '100%', cursor: 'pointer' },
  billItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '11px 14px', gap: 10 },
  billItemName: { fontSize: 13, fontWeight: 500 },
  billItemDesc: { fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.45)', marginTop: 2 },
  billItemPrice: { fontFamily: 'Geist Mono', fontSize: 13, fontWeight: 500, flexShrink: 0 },
  totalsBox: { marginTop: 14, padding: '10px 14px',
    background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
    borderRadius: 10 },
  totalsRow: { display: 'flex', justifyContent: 'space-between', padding: '4px 0' },
  profCard: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
    background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
    borderRadius: 14, marginTop: 4 },
  profName: { fontSize: 15, fontWeight: 500 },
  profMail: { fontFamily: 'Geist Mono', fontSize: 11, color: 'rgba(244,244,242,.5)', marginTop: 1 },
  profAcct: { fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.4)', marginTop: 3,
    textTransform: 'uppercase', letterSpacing: 0.06 },
  planCard: { background: 'linear-gradient(160deg, rgba(251,213,61,.08), rgba(255,255,255,.02))',
    border: '1px solid rgba(251,213,61,.2)', borderRadius: 14, padding: 14 },
  planName: { fontFamily: 'Space Grotesk', fontSize: 15, fontWeight: 600 },
  planDesc: { fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.5)', marginTop: 2 },
  chipSm: { fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.65)',
    padding: '3px 7px', background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.08)', borderRadius: 4,
    textTransform: 'uppercase', letterSpacing: 0.05 },
  cardPay: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
    background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
    borderRadius: 12 },
  signOut: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '12px 16px', width: '100%', margin: '22px 0 0',
    background: 'transparent', color: '#d6593b',
    border: '1px solid rgba(214,89,59,.3)', borderRadius: 10,
    fontFamily: 'Geist', fontSize: 13, fontWeight: 500, cursor: 'pointer' },

  // Activate-line row
  addLineRow: {
    display: 'flex', alignItems: 'center', width: '100%', padding: '14px 14px',
    marginTop: 10,
    background: 'linear-gradient(to right, rgba(251,213,61,.04), rgba(251,213,61,.01))',
    border: '1px dashed rgba(251,213,61,.3)',
    borderRadius: 12, cursor: 'pointer',
    color: '#FBD53D', transition: 'all .15s',
  },
  addLineIco: {
    width: 36, height: 36, borderRadius: 10,
    background: 'rgba(251,213,61,.12)', color: '#FBD53D',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  addLineName: { fontFamily: 'Geist, system-ui', fontSize: 14, fontWeight: 500, color: '#FBD53D' },
  addLineMeta: { fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(251,213,61,.6)',
    marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.06 },
};

window.DirSignal = DirSignal;
