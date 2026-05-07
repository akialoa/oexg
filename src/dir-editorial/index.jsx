// Direction 02 · EDITORIAL — calm, big type, lots of air
// Instrument Serif for moments that matter; numbers as typography.

const { useState: useStateEd } = React;

function DirEditorial({ screen, lineId, invoiceId, onScreen, onLine, onInvoice }) {
  const D = window.OPTIMERA;
  const content = (() => {
    switch (screen) {
      case 'lines':    return <EdLines onLine={onLine}/>;
      case 'line':     return <EdLineDetail device={D.devices.find(x => x.id === lineId) || D.devices[0]} onBack={() => onScreen('lines')}/>;
      case 'bills':    return <EdBills onInvoice={onInvoice}/>;
      case 'bill':     return <EdBillDetail invoice={D.invoices.find(x => x.id === invoiceId) || D.invoices[0]} onBack={() => onScreen('bills')}/>;
      case 'settings': return <EdSettings/>;
      default:         return <EdHome onLine={onLine} onScreen={onScreen} onInvoice={onInvoice}/>;
    }
  })();
  return (
    <IOSDevice dark={true} width={402} height={874}>
      <div style={edS.root}>{content}</div>
      <TabBar active={screen === 'line' ? 'lines' : (screen === 'bill' ? 'bills' : screen)}
              onTab={onScreen} dark={true}/>
    </IOSDevice>
  );
}

// ---- HOME ----
function EdHome({ onLine, onScreen, onInvoice }) {
  const D = window.OPTIMERA;
  const { user, plan, activeDevices, totalDataUsed, dataPercent, periodProgress, invoices, fmt, daysElapsed, daysTotal } = D;
  const nextBill = invoices[0];
  const remainingGB = (plan.dataAllocationBytes - totalDataUsed) / 1073741824;

  return (
    <div style={{ paddingTop: 66, paddingBottom: 110 }}>
      {/* breath-first header */}
      <div style={{ padding: '0 24px' }}>
        <div style={edS.kicker}>april · week 3</div>
        <h1 style={edS.serifTitle}>
          Good morning,<br/>
          <span style={{ color: '#FBD53D' }}>Jordan.</span>
        </h1>
        <p style={edS.lede}>
          You've used <span style={edS.num}>{fmt.gb(totalDataUsed).toFixed(1)}</span> of your{' '}
          <span style={edS.num}>{plan.dataAllocationGigs}</span> gb this period, and everything is
          <em style={edS.em}> on track</em>.
        </p>
      </div>

      {/* Data as cover story */}
      <div style={{ padding: '32px 24px 0' }}>
        <div style={edS.hero}>
          <div style={edS.heroLabel}>data · this period</div>
          <div style={edS.heroNumber}>
            <span>{remainingGB.toFixed(1)}</span>
            <span style={edS.heroUnit}>gb remaining</span>
          </div>
          <div style={edS.heroProg}>
            <div style={{ ...edS.heroProgFill, width: `${dataPercent * 100}%` }}/>
          </div>
          <div style={edS.heroAxis}>
            <span>{fmt.gb(totalDataUsed).toFixed(0)} used</span>
            <span>{plan.dataAllocationGigs} gb</span>
          </div>
          <div style={edS.heroFoot}>
            day {daysElapsed} of {daysTotal} · at today's pace you'll end at ≈ {(fmt.gb(totalDataUsed) / periodProgress).toFixed(0)} gb
          </div>
        </div>
      </div>

      {/* Lines (minimal) */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={edS.sectionLbl}>your lines</div>
        {activeDevices.map(d => (
          <button key={d.id} onClick={() => onLine(d.id)} style={edS.edLineRow}>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={edS.edLineName}>{d.label.split(' · ')[0]}</div>
              <div style={edS.edLineMeta}>{d.phoneNumber ? fmt.phone(d.phoneNumber) : 'data only'}</div>
            </div>
            <div style={edS.edLineGb}>
              <span style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 22 }}>{fmt.gb(d.usage.dataTotalBytes).toFixed(1)}</span>
              <span style={{ fontSize: 11, color: 'rgba(244,244,242,.4)', marginLeft: 3, letterSpacing: 0.05 }}>gb</span>
            </div>
          </button>
        ))}
      </div>

      {/* Next bill */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={edS.sectionLbl}>next bill</div>
        <button onClick={() => onInvoice(nextBill.id)} style={edS.billRow}>
          <div style={{ textAlign: 'left' }}>
            <div style={edS.billRowDate}>April <span style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic' }}>28</span></div>
            <div style={edS.billRowMeta}>visa ending 4412</div>
          </div>
          <div style={edS.billRowAmt}>
            <span style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic' }}>{fmt.usd(nextBill.total)}</span>
          </div>
        </button>
      </div>
    </div>
  );
}

// ---- LINES ----
function EdLines({ onLine }) {
  const D = window.OPTIMERA;
  const { devices, fmt } = D;
  return (
    <div style={{ paddingTop: 66, paddingBottom: 110, padding: '66px 24px 110px' }}>
      <div style={edS.kicker}>5 lines · 4 active</div>
      <h1 style={edS.serifTitle}>Your <em style={{ color: '#FBD53D' }}>lines</em>.</h1>
      <div style={{ marginTop: 40 }}>
        {devices.map((d, i) => (
          <button key={d.id} onClick={() => onLine(d.id)} style={edS.edLineBig}>
            <div style={edS.edIndex}>0{i + 1}</div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={edS.edBigName}>{d.label.split(' · ')[0]}</div>
              <div style={edS.edBigMeta}>
                {d.phoneNumber ? fmt.phone(d.phoneNumber) : 'data only'}
                {d.state === 'suspended' && <span style={{ color: '#888', marginLeft: 8 }}>· suspended</span>}
              </div>
            </div>
            <div style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 26, color: d.state === 'suspended' ? '#555' : '#f4f4f2' }}>
              {fmt.gb(d.usage.dataTotalBytes).toFixed(1)}
              <span style={{ fontFamily: 'Geist Mono', fontStyle: 'normal', fontSize: 10, color: 'rgba(244,244,242,.4)', marginLeft: 3 }}>gb</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- LINE DETAIL ----
function EdLineDetail({ device, onBack }) {
  const D = window.OPTIMERA;
  const { fmt } = D;
  return (
    <div style={{ paddingTop: 66, paddingBottom: 110, padding: '66px 24px 110px' }}>
      <button onClick={onBack} style={edS.back}>← back</button>
      <div style={{ ...edS.kicker, marginTop: 20 }}>line · {device.simType}</div>
      <h1 style={{ ...edS.serifTitle, fontSize: 42 }}>{device.label.split(' · ')[0]}</h1>
      <div style={edS.lede}>{device.phoneNumber ? fmt.phone(device.phoneNumber) : 'data only'} · {device.deviceModel || '—'}</div>

      <div style={{ marginTop: 36 }}>
        <div style={edS.sectionLbl}>data · 14 days</div>
        <div style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 72, lineHeight: 1, marginTop: 4, letterSpacing: -2 }}>
          {fmt.gb(device.usage.dataTotalBytes).toFixed(2)}
          <span style={{ fontFamily: 'Geist Mono', fontStyle: 'normal', fontSize: 20, color: 'rgba(244,244,242,.4)', marginLeft: 8 }}>gb</span>
        </div>
        <div style={{ marginTop: 18 }}>
          <SparkBars values={device.usage.spark} width={340} height={72} color="#FBD53D" gap={4}/>
        </div>
      </div>

      <div style={{ marginTop: 36, display: 'flex', gap: 40 }}>
        <div>
          <div style={edS.sectionLbl}>voice</div>
          <div style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 36 }}>{device.usage.minutesTotal}<span style={{ fontFamily: 'Geist Mono', fontSize: 12, color: 'rgba(244,244,242,.4)', marginLeft: 4, fontStyle: 'normal' }}>min</span></div>
        </div>
        <div>
          <div style={edS.sectionLbl}>sms</div>
          <div style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 36 }}>{device.usage.smsTotal}</div>
        </div>
      </div>

      <div style={{ marginTop: 36 }}>
        <div style={edS.sectionLbl}>features</div>
        <div style={edS.feats}>
          {[['voice', device.hasVoice], ['data', device.hasData], ['sms', device.hasSms], ['mms', device.hasMms], ['call waiting', device.callWaiting]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <span>{k}</span>
              <span style={{ color: v ? '#FBD53D' : 'rgba(244,244,242,.3)' }}>{v ? '●' : '○'}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={edS.sectionLbl}>identifiers</div>
        <div style={edS.feats}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.06)', fontFamily: 'Geist Mono', fontSize: 11 }}>
            <span style={{ color: 'rgba(244,244,242,.5)' }}>imsi</span>
            <span>{device.imsi}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontFamily: 'Geist Mono', fontSize: 11 }}>
            <span style={{ color: 'rgba(244,244,242,.5)' }}>iccid</span>
            <span>{device.iccid}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- BILLS ----
function EdBills({ onInvoice }) {
  const D = window.OPTIMERA;
  const { invoices, fmt } = D;
  const ytd = invoices.filter(i => i.periodStart.getFullYear() === 2026).reduce((s, i) => s + i.total, 0);
  return (
    <div style={{ paddingTop: 66, paddingBottom: 110, padding: '66px 24px 110px' }}>
      <div style={edS.kicker}>year to date</div>
      <h1 style={edS.serifTitle}>
        <span style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic' }}>{fmt.usd(ytd)}</span>
      </h1>
      <div style={edS.lede}>across <em style={edS.em}>{invoices.filter(i => i.periodStart.getFullYear() === 2026).length}</em> bills in 2026</div>

      <div style={{ marginTop: 36 }}>
        {invoices.map(inv => (
          <button key={inv.id} onClick={() => onInvoice(inv.id)} style={edS.edBillRow}>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={edS.edBillMonth}>{fmt.monthYear(inv.periodStart)}</div>
              <div style={edS.edBillMeta}>{inv.invoiceNumber} · {inv.isPaid ? 'paid' : 'due apr 28'}</div>
            </div>
            <div style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 26, color: inv.isPaid ? 'rgba(244,244,242,.6)' : '#FBD53D' }}>
              {fmt.usd(inv.total)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- BILL DETAIL ----
function EdBillDetail({ invoice, onBack }) {
  const D = window.OPTIMERA;
  const { fmt } = D;
  return (
    <div style={{ paddingTop: 66, paddingBottom: 110, padding: '66px 24px 110px' }}>
      <button onClick={onBack} style={edS.back}>← back</button>
      <div style={{ ...edS.kicker, marginTop: 20 }}>{fmt.shortDate(invoice.periodStart)} — {fmt.shortDate(invoice.periodEnd)}</div>
      <h1 style={{ ...edS.serifTitle, fontSize: 56 }}>
        <span style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', color: invoice.isPaid ? '#f4f4f2' : '#FBD53D' }}>
          {fmt.usd(invoice.total)}
        </span>
      </h1>
      <div style={edS.lede}>
        {invoice.isPaid ? `paid ${fmt.shortDate(invoice.dateCreated)} · visa ···· ${invoice.paymentCardLast4}` : 'due April 28'}
      </div>

      <div style={{ marginTop: 36 }}>
        <div style={edS.sectionLbl}>on this invoice</div>
        <div style={edS.feats}>
          {invoice.items.map((it, i, arr) => (
            <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14 }}>{it.name}</div>
                {it.description && <div style={{ fontFamily: 'Geist Mono', fontSize: 10.5, color: 'rgba(244,244,242,.4)', marginTop: 2 }}>{it.description}</div>}
              </div>
              <div style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 18 }}>{fmt.usd(it.price)}</div>
            </div>
          ))}
        </div>
      </div>

      {invoice.adjustments && (
        <div style={{ marginTop: 24 }}>
          <div style={edS.sectionLbl}>fees · taxes</div>
          <div style={edS.feats}>
            {invoice.adjustments.map((a, i, arr) => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none', fontSize: 13 }}>
                <span style={{ color: 'rgba(244,244,242,.6)' }}>{a.label}</span>
                <span style={{ fontFamily: 'Geist Mono', color: a.amount < 0 ? '#FBD53D' : 'inherit' }}>{a.amount < 0 ? '−' : ''}{fmt.usd(Math.abs(a.amount))}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- SETTINGS ----
function EdSettings() {
  const D = window.OPTIMERA;
  const { user, plan, fmt } = D;
  return (
    <div style={{ paddingTop: 66, paddingBottom: 110, padding: '66px 24px 110px' }}>
      <div style={edS.kicker}>signed in as</div>
      <h1 style={edS.serifTitle}>{user.firstName} <em style={{ color: '#FBD53D' }}>{user.lastName}</em>.</h1>
      <div style={edS.lede}>{user.email} · account 8421</div>

      <div style={{ marginTop: 36 }}>
        <div style={edS.sectionLbl}>plan</div>
        <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 32 }}>{plan.name}</div>
          <div style={{ fontFamily: 'Geist Mono', fontSize: 11, color: 'rgba(244,244,242,.5)', marginTop: 4 }}>{plan.speedDescription} · {fmt.usd(plan.pricePerMonth)}/mo</div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={edS.sectionLbl}>billing</div>
        <div style={edS.feats}>
          {[['billing day', `${user.billingDay}th of each month`], ['next bill', fmt.fullDate(user.nextBillingDate)], ['grace period', `${user.billingGrace} days`]].map(([k, v], i, a) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < a.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
              <span style={{ color: 'rgba(244,244,242,.55)' }}>{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={edS.sectionLbl}>payment</div>
        <div style={{ padding: '12px 0' }}>
          <div style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 22 }}>visa ···· {user.defaultPaymentCard.lastFour}</div>
          <div style={{ fontFamily: 'Geist Mono', fontSize: 11, color: 'rgba(244,244,242,.5)', marginTop: 2 }}>expires {user.defaultPaymentCard.expiration}</div>
        </div>
      </div>

      <button style={{ ...edS.back, marginTop: 30, color: '#d6593b', fontSize: 13 }}>sign out →</button>
    </div>
  );
}

const edS = {
  root: { background: '#0a0a0a', height: '100%', color: '#f4f4f2',
    fontFamily: 'Geist, system-ui', fontSize: 14 },
  kicker: { fontFamily: 'Geist Mono', fontSize: 10, textTransform: 'uppercase',
    letterSpacing: 0.18, color: 'rgba(244,244,242,.45)', marginBottom: 6 },
  serifTitle: { fontFamily: 'Instrument Serif', fontWeight: 400, fontSize: 54,
    lineHeight: 1.02, margin: '0', letterSpacing: -0.5 },
  lede: { fontSize: 14.5, color: 'rgba(244,244,242,.7)', lineHeight: 1.55,
    marginTop: 16, textWrap: 'pretty', maxWidth: 310 },
  em: { fontFamily: 'Instrument Serif', fontStyle: 'italic', fontWeight: 400 },
  num: { fontFamily: 'Instrument Serif', fontStyle: 'italic', fontWeight: 400 },
  hero: { borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 20 },
  heroLabel: { fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.45)',
    textTransform: 'uppercase', letterSpacing: 0.14 },
  heroNumber: { fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 80,
    lineHeight: 1, letterSpacing: -2, display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 2 },
  heroUnit: { fontFamily: 'Geist', fontStyle: 'normal', fontSize: 13, color: 'rgba(244,244,242,.55)',
    letterSpacing: 0.04 },
  heroProg: { height: 3, background: 'rgba(255,255,255,.08)', marginTop: 16, borderRadius: 2, overflow: 'hidden' },
  heroProgFill: { height: '100%', background: '#FBD53D', transition: 'width .9s' },
  heroAxis: { display: 'flex', justifyContent: 'space-between', fontFamily: 'Geist Mono', fontSize: 10,
    color: 'rgba(244,244,242,.4)', marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.08 },
  heroFoot: { fontSize: 12.5, color: 'rgba(244,244,242,.55)', marginTop: 16, lineHeight: 1.5 },
  sectionLbl: { fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.4)',
    textTransform: 'uppercase', letterSpacing: 0.16, marginBottom: 12 },
  edLineRow: { display: 'flex', alignItems: 'center', width: '100%', padding: '14px 0',
    background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,.07)',
    color: '#f4f4f2', cursor: 'pointer' },
  edLineName: { fontSize: 15, fontWeight: 400 },
  edLineMeta: { fontFamily: 'Geist Mono', fontSize: 10.5, color: 'rgba(244,244,242,.45)', marginTop: 2 },
  edLineGb: { display: 'flex', alignItems: 'baseline' },
  billRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', padding: '16px 0', background: 'transparent', border: 'none',
    borderTop: '1px solid rgba(255,255,255,.07)', borderBottom: '1px solid rgba(255,255,255,.07)',
    color: '#f4f4f2', cursor: 'pointer' },
  billRowDate: { fontSize: 18, fontWeight: 400 },
  billRowMeta: { fontFamily: 'Geist Mono', fontSize: 10.5, color: 'rgba(244,244,242,.45)', marginTop: 2 },
  billRowAmt: { fontSize: 28 },
  back: { background: 'transparent', border: 'none', color: 'rgba(244,244,242,.5)',
    fontFamily: 'Geist Mono', fontSize: 11, cursor: 'pointer', padding: 0,
    textTransform: 'uppercase', letterSpacing: 0.08 },
  edLineBig: { display: 'flex', alignItems: 'center', width: '100%', padding: '18px 0',
    background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,.07)',
    color: '#f4f4f2', cursor: 'pointer', gap: 14 },
  edIndex: { fontFamily: 'Geist Mono', fontSize: 10, color: 'rgba(244,244,242,.35)',
    width: 24 },
  edBigName: { fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 22 },
  edBigMeta: { fontFamily: 'Geist Mono', fontSize: 10.5, color: 'rgba(244,244,242,.45)', marginTop: 3 },
  feats: { borderTop: '1px solid rgba(255,255,255,.06)' },
  edBillRow: { display: 'flex', alignItems: 'center', width: '100%', padding: '16px 0',
    background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,.07)',
    color: '#f4f4f2', cursor: 'pointer' },
  edBillMonth: { fontSize: 15, fontWeight: 400, textTransform: 'capitalize' },
  edBillMeta: { fontFamily: 'Geist Mono', fontSize: 10.5, color: 'rgba(244,244,242,.45)', marginTop: 3,
    textTransform: 'uppercase', letterSpacing: 0.06 },
};

window.DirEditorial = DirEditorial;
