// Direction 03 · STACK — iOS 26 liquid glass · layered SIM cards
const { useState: useStateSp } = React;

function DirSpatial({ screen, lineId, invoiceId, onScreen, onLine, onInvoice }) {
  const D = window.OPTIMERA;
  const content = (() => {
    switch (screen) {
      case 'lines':    return <SpLines onLine={onLine}/>;
      case 'line':     return <SpLineDetail device={D.devices.find(x => x.id === lineId) || D.devices[0]} onBack={() => onScreen('lines')}/>;
      case 'bills':    return <SpBills onInvoice={onInvoice}/>;
      case 'bill':     return <SpBillDetail invoice={D.invoices.find(x => x.id === invoiceId) || D.invoices[0]} onBack={() => onScreen('bills')}/>;
      case 'settings': return <SpSettings/>;
      default:         return <SpHome onLine={onLine} onScreen={onScreen} onInvoice={onInvoice}/>;
    }
  })();
  return (
    <IOSDevice dark={true} width={402} height={874}>
      <div style={spS.root}>
        <div style={spS.bgGlow1}/>
        <div style={spS.bgGlow2}/>
        {content}
      </div>
      <TabBar active={screen === 'line' ? 'lines' : (screen === 'bill' ? 'bills' : screen)}
              onTab={onScreen} dark={true}/>
    </IOSDevice>
  );
}

// --- SIM card (physical object) ---
function SimCard({ device, size = 'lg', onClick, stackIndex = 0 }) {
  const D = window.OPTIMERA;
  const { fmt } = D;
  const isData = !device.phoneNumber;
  const isSuspended = device.state === 'suspended';
  const pct = device.usage.dataTotalBytes / (60 * 1073741824 / 4); // per-line share vs 15gb
  const h = size === 'lg' ? 220 : size === 'md' ? 120 : 96;
  return (
    <button onClick={onClick} style={{
      ...spS.simCard,
      height: h,
      background: isSuspended
        ? 'linear-gradient(135deg, #222, #111)'
        : 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 60%, #222 100%)',
      border: isSuspended ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(251,213,61,.18)',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      {/* gold chip */}
      <div style={{
        position: 'absolute', top: 16, left: 16,
        width: 38, height: 30, borderRadius: 5,
        background: isSuspended
          ? 'linear-gradient(135deg, #3a3a35, #1a1a18)'
          : 'linear-gradient(135deg, #FBD53D, #a47c00)',
        boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,.25), inset 0 -2px 4px rgba(0,0,0,.3)',
      }}>
        <div style={{
          position: 'absolute', inset: 4,
          backgroundImage: `
            linear-gradient(to bottom, rgba(0,0,0,.35) 1px, transparent 1px),
            linear-gradient(to right, rgba(0,0,0,.35) 1px, transparent 1px)
          `,
          backgroundSize: '6px 4px',
          opacity: 0.6,
        }}/>
      </div>

      {/* brand mark */}
      <div style={{
        position: 'absolute', top: 16, right: 18,
        fontFamily: 'Space Grotesk', fontSize: 11, fontWeight: 600,
        color: 'rgba(251,213,61,.85)', letterSpacing: 0.08,
      }}>OPTIM<span style={{ opacity: 0.5 }}>ERA</span></div>

      {/* label */}
      {size !== 'sm' && (
        <div style={{
          position: 'absolute', bottom: 16, left: 16, right: 16,
          color: isSuspended ? 'rgba(244,244,242,.45)' : '#f4f4f2',
          textAlign: 'left',
        }}>
          <div style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.4)',
            textTransform: 'uppercase', letterSpacing: 0.1, marginBottom: 4 }}>
            {isData ? 'data only' : device.simType}
          </div>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: size === 'lg' ? 18 : 14, fontWeight: 500 }}>
            {device.label.split(' · ')[0]}
          </div>
          <div style={{ fontFamily: 'Geist Mono', fontSize: 11, color: 'rgba(244,244,242,.55)', marginTop: 2 }}>
            {device.phoneNumber ? fmt.phone(device.phoneNumber) : device.deviceModel || '—'}
          </div>
          {size === 'lg' && (
            <div style={{
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              marginTop: 12,
            }}>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 22, fontWeight: 600 }}>
                {fmt.gb(device.usage.dataTotalBytes).toFixed(1)}<span style={{ fontSize: 10, color: 'rgba(244,244,242,.45)', marginLeft: 3 }}>gb</span>
              </div>
              <div style={{ width: 120, height: 24 }}>
                <Spark values={device.usage.spark} width={120} height={24} color="#FBD53D"
                       fill="rgba(251,213,61,.15)" strokeWidth={1.3}/>
              </div>
            </div>
          )}
        </div>
      )}

      {/* glossy highlight */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 16, pointerEvents: 'none',
        background: 'linear-gradient(160deg, rgba(255,255,255,.08) 0%, transparent 30%)',
      }}/>
      {isSuspended && (
        <div style={{
          position: 'absolute', top: 12, right: 60,
          fontFamily: 'Geist Mono', fontSize: 9, letterSpacing: 0.1,
          textTransform: 'uppercase', color: '#d6593b',
          border: '1px solid rgba(214,89,59,.4)', padding: '2px 6px', borderRadius: 4,
        }}>suspended</div>
      )}
    </button>
  );
}

function GlassCard({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'rgba(255,255,255,.04)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255,255,255,.08)',
      borderRadius: 20,
      padding: 16,
      boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,.04), 0 8px 24px rgba(0,0,0,.25)',
      cursor: onClick ? 'pointer' : undefined,
      ...style,
    }}>{children}</div>
  );
}

// ---- HOME ----
function SpHome({ onLine, onScreen, onInvoice }) {
  const D = window.OPTIMERA;
  const { user, plan, activeDevices, totalDataUsed, dataPercent, fmt, daysElapsed, daysTotal, invoices } = D;
  const nextBill = invoices[0];
  const primary = activeDevices[0];

  return (
    <div style={{ paddingTop: 56, paddingBottom: 110, position: 'relative', zIndex: 1 }}>
      {/* brand row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 20px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={user.fullName} size={32}/>
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: 13, fontWeight: 500 }}>emmett</div>
            <div style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.45)', textTransform: 'uppercase', letterSpacing: 0.08 }}>fitch industries</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={spS.glassPill}><Ico.bell width={15} height={15}/></div>
          <div style={spS.glassPill}><Ico.search width={15} height={15}/></div>
        </div>
      </div>

      {/* hero featured SIM */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ position: 'relative' }}>
          <SimCard device={primary} size="lg" onClick={() => onLine(primary.id)}/>
          {/* floating meta pill */}
          <div style={{
            position: 'absolute', top: -10, left: 20,
            background: 'rgba(10,10,10,.9)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(251,213,61,.3)', borderRadius: 999,
            padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'Geist Mono', fontSize: 10, letterSpacing: 0.1, textTransform: 'uppercase', color: '#FBD53D',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FBD53D', boxShadow: '0 0 8px #FBD53D' }}/>
            primary · esim
          </div>
        </div>
      </div>

      {/* pool glass widget */}
      <div style={{ padding: '20px 20px 0' }}>
        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={spS.cap}>pool · shared data</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <span style={{ fontFamily: 'Geist Mono', fontSize: 36, fontWeight: 600, letterSpacing: -1 }}>
                  {fmt.gb(totalDataUsed).toFixed(1)}
                </span>
                <span style={{ fontFamily: 'Geist Mono', fontSize: 13, color: 'rgba(244,244,242,.45)' }}>
                  / {plan.dataAllocationGigs} gb
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(244,244,242,.55)', marginTop: 4 }}>
                day {daysElapsed} of {daysTotal}
              </div>
            </div>
            <Donut percent={dataPercent} size={78} stroke={8} color="#FBD53D">
              <div style={{ fontFamily: 'Geist Mono', fontSize: 13, fontWeight: 600 }}>{(dataPercent * 100).toFixed(0)}%</div>
            </Donut>
          </div>
        </GlassCard>
      </div>

      {/* small SIM stack preview */}
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={spS.cap}>other lines</div>
          <button style={spS.link} onClick={() => onScreen('lines')}>see stack →</button>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
          {activeDevices.slice(1).map(d => (
            <div key={d.id} style={{ minWidth: 180, flex: '0 0 auto' }}>
              <SimCard device={d} size="md" onClick={() => onLine(d.id)}/>
            </div>
          ))}
        </div>
      </div>

      {/* next bill glass */}
      <div style={{ padding: '18px 20px 0' }}>
        <GlassCard onClick={() => onInvoice(nextBill.id)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={spS.cap}>next bill · apr 28</div>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 24, fontWeight: 600, marginTop: 2 }}>{fmt.usd(nextBill.total)}</div>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.5)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.06 }}>auto · visa ···· 4412</div>
            </div>
            <div style={{
              padding: '8px 14px', background: 'rgba(251,213,61,.14)',
              border: '1px solid rgba(251,213,61,.25)', borderRadius: 999,
              fontFamily: 'Geist', fontSize: 12, color: '#FBD53D', fontWeight: 500,
            }}>8 days</div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ---- LINES ----
function SpLines({ onLine }) {
  const D = window.OPTIMERA;
  const { devices } = D;
  return (
    <div style={{ paddingTop: 56, paddingBottom: 110, position: 'relative', zIndex: 1 }}>
      <div style={{ padding: '6px 20px 16px' }}>
        <div style={spS.cap}>five lines</div>
        <div style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 600, marginTop: 2 }}>the stack</div>
      </div>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {devices.map((d) => (
          <SimCard key={d.id} device={d} size="lg" onClick={() => onLine(d.id)}/>
        ))}
      </div>
    </div>
  );
}

// ---- LINE DETAIL ----
function SpLineDetail({ device, onBack }) {
  const D = window.OPTIMERA;
  const { fmt } = D;
  return (
    <div style={{ paddingTop: 56, paddingBottom: 110, position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 20px 18px' }}>
        <button onClick={onBack} style={spS.glassPill}><Ico.chev width={14} height={14} style={{ transform: 'rotate(180deg)' }}/></button>
        <div style={{ fontFamily: 'Geist Mono', fontSize: 11, color: 'rgba(244,244,242,.5)', textTransform: 'uppercase', letterSpacing: 0.08 }}>line detail</div>
        <div style={spS.glassPill}><Ico.dot3 width={14} height={14}/></div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <SimCard device={device} size="lg"/>
      </div>

      <div style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <GlassCard>
          <div style={spS.cap}>voice</div>
          <div style={{ fontFamily: 'Geist Mono', fontSize: 22, fontWeight: 600, marginTop: 2 }}>
            {device.usage.minutesTotal}<span style={{ fontSize: 11, color: 'rgba(244,244,242,.4)', marginLeft: 3 }}>min</span>
          </div>
        </GlassCard>
        <GlassCard>
          <div style={spS.cap}>sms</div>
          <div style={{ fontFamily: 'Geist Mono', fontSize: 22, fontWeight: 600, marginTop: 2 }}>{device.usage.smsTotal}</div>
        </GlassCard>
      </div>

      <div style={{ padding: '10px 20px 0' }}>
        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={spS.cap}>data · 14 days</div>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 22, fontWeight: 600, marginTop: 2 }}>
                {fmt.gb(device.usage.dataTotalBytes).toFixed(2)}<span style={{ fontSize: 11, color: 'rgba(244,244,242,.4)', marginLeft: 3 }}>gb</span>
              </div>
            </div>
            <div style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.5)', textAlign: 'right' }}>
              <div>↓ {fmt.gb(device.usage.dataDownloadBytes).toFixed(1)} gb</div>
              <div>↑ {fmt.gb(device.usage.dataUploadBytes).toFixed(1)} gb</div>
            </div>
          </div>
          <SparkBars values={device.usage.spark} width={320} height={48} color="#FBD53D" gap={3}/>
        </GlassCard>
      </div>

      <div style={{ padding: '10px 20px 0' }}>
        <GlassCard>
          <div style={spS.cap}>features</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {[['voice', device.hasVoice], ['data', device.hasData], ['sms', device.hasSms], ['mms', device.hasMms], ['call waiting', device.callWaiting]].map(([k, v]) => (
              <div key={k} style={{
                padding: '5px 10px', borderRadius: 999,
                fontFamily: 'Geist Mono', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.06,
                background: v ? 'rgba(251,213,61,.12)' : 'rgba(255,255,255,.04)',
                border: `1px solid ${v ? 'rgba(251,213,61,.25)' : 'rgba(255,255,255,.08)'}`,
                color: v ? '#FBD53D' : 'rgba(244,244,242,.35)',
              }}>{k}</div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div style={{ padding: '10px 20px 0' }}>
        <GlassCard>
          <div style={spS.cap}>identifiers</div>
          <div style={{ marginTop: 10, fontFamily: 'Geist Mono', fontSize: 11, color: 'rgba(244,244,242,.7)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}><span style={{ color: 'rgba(244,244,242,.45)' }}>imsi</span><span>{device.imsi}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span style={{ color: 'rgba(244,244,242,.45)' }}>iccid</span><span>{device.iccid}</span></div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ---- BILLS ----
function SpBills({ onInvoice }) {
  const D = window.OPTIMERA;
  const { invoices, fmt } = D;
  const ytd = invoices.filter(i => i.periodStart.getFullYear() === 2026).reduce((s, i) => s + i.total, 0);
  return (
    <div style={{ paddingTop: 56, paddingBottom: 110, position: 'relative', zIndex: 1 }}>
      <div style={{ padding: '6px 20px 14px' }}>
        <div style={spS.cap}>billing</div>
        <div style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 600, marginTop: 2 }}>history</div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <GlassCard>
          <div style={spS.cap}>year to date · 2026</div>
          <div style={{ fontFamily: 'Geist Mono', fontSize: 32, fontWeight: 600, marginTop: 4, letterSpacing: -0.5 }}>{fmt.usd(ytd)}</div>
          <div style={{ marginTop: 12 }}>
            <SparkBars values={[...invoices].reverse().map(i => i.total)} width={330} height={36} color="#FBD53D" gap={8}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.4)', textTransform: 'uppercase', letterSpacing: 0.08 }}>
              <span>nov</span><span>dec</span><span>jan</span><span>feb</span><span>mar</span><span style={{ color: '#FBD53D' }}>apr</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {invoices.map(inv => (
          <GlassCard key={inv.id} onClick={() => onInvoice(inv.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>{fmt.monthYear(inv.periodStart)}</div>
                <div style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.45)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.06 }}>
                  {inv.invoiceNumber} · {inv.isPaid ? 'paid' : 'due apr 28'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Geist Mono', fontSize: 16, fontWeight: 600 }}>{fmt.usd(inv.total)}</div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3,
                  fontFamily: 'Geist Mono', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.08,
                  color: inv.isPaid ? 'rgba(244,244,242,.4)' : '#FBD53D',
                }}>● {inv.isPaid ? 'paid' : 'due'}</div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// ---- BILL DETAIL ----
function SpBillDetail({ invoice, onBack }) {
  const D = window.OPTIMERA;
  const { fmt } = D;
  return (
    <div style={{ paddingTop: 56, paddingBottom: 110, position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 20px 18px' }}>
        <button onClick={onBack} style={spS.glassPill}><Ico.chev width={14} height={14} style={{ transform: 'rotate(180deg)' }}/></button>
        <div style={{ fontFamily: 'Geist Mono', fontSize: 11, color: 'rgba(244,244,242,.5)', textTransform: 'uppercase', letterSpacing: 0.08 }}>{invoice.invoiceNumber}</div>
        <div style={spS.glassPill}><Ico.download width={14} height={14}/></div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <GlassCard style={{ background: 'linear-gradient(160deg, rgba(251,213,61,.1), rgba(255,255,255,.02))', border: '1px solid rgba(251,213,61,.2)' }}>
          <div style={spS.cap}>total · {fmt.shortDate(invoice.periodStart)} — {fmt.shortDate(invoice.periodEnd)}</div>
          <div style={{ fontFamily: 'Geist Mono', fontSize: 44, fontWeight: 600, letterSpacing: -1, marginTop: 4 }}>{fmt.usd(invoice.total)}</div>
          {invoice.isPaid ? (
            <div style={{ fontFamily: 'Geist Mono', fontSize: 11, color: 'rgba(244,244,242,.55)', marginTop: 4 }}>paid · visa ···· {invoice.paymentCardLast4}</div>
          ) : (
            <button style={{
              marginTop: 14, width: '100%', padding: '12px 16px',
              background: '#FBD53D', color: '#0a0a0a',
              border: 'none', borderRadius: 12, fontFamily: 'Geist', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>pay now</button>
          )}
        </GlassCard>
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        <GlassCard>
          <div style={spS.cap}>items</div>
          <div style={{ marginTop: 8 }}>
            {invoice.items.map((it, i, arr) => (
              <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{it.name}</div>
                  {it.description && <div style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.45)', marginTop: 2 }}>{it.description}</div>}
                </div>
                <div style={{ fontFamily: 'Geist Mono', fontSize: 13 }}>{fmt.usd(it.price)}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {invoice.adjustments && (
        <div style={{ padding: '10px 20px 0' }}>
          <GlassCard>
            <div style={spS.cap}>fees · taxes</div>
            <div style={{ marginTop: 8 }}>
              {invoice.adjustments.map((a, i, arr) => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none', fontSize: 12 }}>
                  <span style={{ color: 'rgba(244,244,242,.6)' }}>{a.label}</span>
                  <span style={{ fontFamily: 'Geist Mono', color: a.amount < 0 ? '#FBD53D' : 'inherit' }}>{a.amount < 0 ? '−' : ''}{fmt.usd(Math.abs(a.amount))}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

// ---- SETTINGS ----
function SpSettings() {
  const D = window.OPTIMERA;
  const { user, plan, fmt } = D;
  return (
    <div style={{ paddingTop: 56, paddingBottom: 110, position: 'relative', zIndex: 1 }}>
      <div style={{ padding: '6px 20px 14px' }}>
        <div style={spS.cap}>settings</div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={user.fullName} size={48}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 500 }}>{user.fullName.toLowerCase()}</div>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 11, color: 'rgba(244,244,242,.5)', marginTop: 2 }}>{user.email}</div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div style={{ padding: '12px 20px 0' }}>
        <GlassCard>
          <div style={spS.cap}>plan</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 }}>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 600 }}>{plan.name}</div>
            <div style={{ fontFamily: 'Geist Mono', fontSize: 16, fontWeight: 600 }}>{fmt.usd(plan.pricePerMonth)}<span style={{ fontSize: 10, color: 'rgba(244,244,242,.4)', marginLeft: 2 }}>/mo</span></div>
          </div>
          <div style={{ fontFamily: 'Geist Mono', fontSize: 9.5, color: 'rgba(244,244,242,.5)', marginTop: 4 }}>{plan.speedDescription}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            {[`${plan.dataAllocationGigs} gb`, `up to ${plan.maxDevices} devices`, 'roaming'].map(x =>
              <span key={x} style={{ fontFamily: 'Geist Mono', fontSize: 10, padding: '3px 7px', border: '1px solid rgba(255,255,255,.1)', borderRadius: 4, color: 'rgba(244,244,242,.7)', textTransform: 'uppercase', letterSpacing: 0.05 }}>{x}</span>
            )}
          </div>
        </GlassCard>
      </div>

      <div style={{ padding: '12px 20px 0' }}>
        <GlassCard>
          <div style={spS.cap}>billing · payment</div>
          <div style={{ marginTop: 10, fontSize: 12.5 }}>
            {[['next bill', fmt.fullDate(user.nextBillingDate)], ['billing day', `${user.billingDay}th of each month`], ['grace', `${user.billingGrace} days`], ['card', `visa ···· ${user.defaultPaymentCard.lastFour}`]].map(([k, v], i, a) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < a.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
                <span style={{ color: 'rgba(244,244,242,.55)' }}>{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <button style={{
          width: '100%', padding: '12px', background: 'transparent', color: '#d6593b',
          border: '1px solid rgba(214,89,59,.3)', borderRadius: 12,
          fontFamily: 'Geist', fontSize: 13, cursor: 'pointer',
        }}>sign out</button>
      </div>
    </div>
  );
}

const spS = {
  root: { background: '#0a0a0a', height: '100%', color: '#f4f4f2',
    fontFamily: 'Geist, system-ui', fontSize: 14, position: 'relative', overflow: 'hidden' },
  bgGlow1: { position: 'absolute', top: -80, right: -80, width: 320, height: 320,
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,213,61,.16), transparent 60%)',
    filter: 'blur(30px)', pointerEvents: 'none' },
  bgGlow2: { position: 'absolute', bottom: 120, left: -60, width: 260, height: 260,
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(214,89,59,.1), transparent 60%)',
    filter: 'blur(30px)', pointerEvents: 'none' },
  cap: { fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.5)',
    textTransform: 'uppercase', letterSpacing: 0.12 },
  link: { background: 'transparent', border: 'none', color: '#FBD53D',
    fontFamily: 'Geist Mono', fontSize: 9.5, cursor: 'pointer', letterSpacing: 0.05 },
  glassPill: { width: 32, height: 32, borderRadius: '50%',
    background: 'rgba(255,255,255,.06)', backdropFilter: 'blur(14px)',
    border: '1px solid rgba(255,255,255,.08)', color: 'rgba(244,244,242,.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  simCard: { position: 'relative', width: '100%', borderRadius: 16,
    overflow: 'hidden', padding: 0, border: 'none',
    boxShadow: '0 10px 30px rgba(0,0,0,.4), inset 0 0 0 0.5px rgba(255,255,255,.06)' },
};

window.DirSpatial = DirSpatial;
