// Mock data shaped after the real Swift domain models in the OptimERA repo.
// userProfile, wirelessPlan, simDevice[], deviceUsage[], invoiceSummary[], paymentCard

const fmt = {
  usd: (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n),
  usdShort: (n) => {
    const s = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
    return s;
  },
  gb: (bytes) => (bytes / 1073741824),
  gbText: (bytes) => {
    const g = bytes / 1073741824;
    if (g >= 100) return g.toFixed(0) + ' GB';
    if (g >= 10) return g.toFixed(1) + ' GB';
    return g.toFixed(2) + ' GB';
  },
  phone: (e164) => {
    // naive US format
    const d = (e164 || '').replace(/\D/g, '').slice(-10);
    if (d.length !== 10) return e164;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  },
  shortDate: (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  monthDay: (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  fullDate: (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  monthYear: (d) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  duration: (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  },
};

// --- user + plan ------------------------------------------------------------
const user = {
  id: 8421,
  email: 'emmett@optimeraxg.com',
  firstName: 'emmett',
  lastName: 'fitch',
  fullName: 'emmett fitch',
  accountType: 'fitch industries',  // not in the original model; harmless tag
  streetAddress: {
    street: ' 3540 32nd way nw',
    city: 'olympia',
    state: 'wa',
    zipcode: '98502',
    country: 'united states',
  },
  billingDay: 14,
  billingGrace: 5,
  nextBillingDate: new Date(2026, 3, 28),   // Apr 28, 2026
  nextInvoiceDate: new Date(2026, 3, 26),
  numSims: 5,
  numLines: 4,
  defaultPaymentCard: {
    cardType: 'visa',
    lastFour: '4412',
    label: 'visa ending 4412',
    expiration: '08/29',
    isDefault: true,
  },
};

const plan = {
  id: 302,
  name: 'optima unlimited',
  description: 'nationwide 5g · priority data · unlimited talk & text',
  pricePerMonth: 48,
  pricePerLine: 12,
  pricePerDevice: 0,
  dataAllocationBytes: 60 * 1073741824,
  dataAllocationGigs: 60,
  speedDescription: '5g · up to 300 mbps',
  terms: ['30-day contract', 'priority until 60gb', 'roaming included'],
  isUnlimited: false,
  maxDevices: 10,
  roamingCapable: true,
};

// --- devices / lines --------------------------------------------------------
// Each device has a usage object matching deviceUsage shape.
// dataTotalBytes across all 4 primary lines sums to 42.8 GB — 71% of 60 GB plan.

const devices = [
  {
    id: 'sim-01',
    imsi: '310260000000001',
    iccid: '8901260000000000001',
    label: 'emmett',
    state: 'active',
    hasVoice: true, hasData: true, hasSms: true, hasMms: true,
    isEsim: true, simType: 'esim',
    phoneNumber: '+17185550142',
    deviceBrand: 'apple', deviceModel: 'iphone 15 pro',
    callWaiting: true,
    cfuActive: false, cfbActive: false, cfnaActive: true, cfnaNumber: '+17185550198', cfnrActive: false,
    usage: {
      minutesTotal: 284, smsTotal: 612,
      dataTotalBytes: 18.2 * 1073741824, dataUploadBytes: 2.1 * 1073741824, dataDownloadBytes: 16.1 * 1073741824,
      spark: [2, 4, 3, 6, 5, 7, 9, 8, 11, 10, 13, 12, 14, 18],  // 14 days, GB/day
    },
  },
  {
    id: 'sim-02',
    imsi: '310260000000002',
    iccid: '8901260000000000002',
    label: 'spence',
    state: 'active',
    hasVoice: true, hasData: true, hasSms: true, hasMms: true,
    isEsim: true, simType: 'esim',
    phoneNumber: '+19175550118',
    deviceBrand: 'apple', deviceModel: 'iphone 14',
    callWaiting: true,
    cfuActive: false, cfbActive: false, cfnaActive: false, cfnrActive: false,
    usage: {
      minutesTotal: 142, smsTotal: 208,
      dataTotalBytes: 11.6 * 1073741824, dataUploadBytes: 1.4 * 1073741824, dataDownloadBytes: 10.2 * 1073741824,
      spark: [4, 3, 5, 4, 6, 5, 7, 6, 8, 9, 8, 10, 11, 12],
    },
  },
  {
    id: 'sim-03',
    imsi: '310260000000003',
    iccid: '8901260000000000003',
    label: 'heather',
    state: 'active',
    hasVoice: true, hasData: true, hasSms: true, hasMms: true,
    isEsim: false, simType: 'physical',
    phoneNumber: '+16465550177',
    deviceBrand: 'samsung', deviceModel: 'galaxy s24',
    callWaiting: false,
    cfuActive: true, cfuNumber: '+16465550177', cfbActive: false, cfnaActive: false, cfnrActive: false,
    usage: {
      minutesTotal: 518, smsTotal: 94,
      dataTotalBytes: 9.4 * 1073741824, dataUploadBytes: 0.8 * 1073741824, dataDownloadBytes: 8.6 * 1073741824,
      spark: [3, 4, 5, 7, 6, 8, 7, 9, 8, 6, 10, 9, 8, 7],
    },
  },
  {
    id: 'sim-04',
    imsi: '310260000000004',
    iccid: '8901260000000000004',
    label: 'studio',
    state: 'active',
    hasVoice: false, hasData: true, hasSms: false, hasMms: false,
    isEsim: false, simType: 'data',
    phoneNumber: null,
    deviceBrand: 'netgear', deviceModel: 'nighthawk m6',
    callWaiting: false,
    cfuActive: false, cfbActive: false, cfnaActive: false, cfnrActive: false,
    usage: {
      minutesTotal: 0, smsTotal: 0,
      dataTotalBytes: 3.6 * 1073741824, dataUploadBytes: 0.4 * 1073741824, dataDownloadBytes: 3.2 * 1073741824,
      spark: [0.5, 0.3, 0.8, 0.4, 0.6, 0.2, 0.1, 0.2, 0.3, 0.1, 0.0, 0.2, 0.4, 0.3],
    },
  },
  {
    id: 'sim-05',
    imsi: '310260000000005',
    iccid: '8901260000000000005',
    label: 'travel · spare',
    state: 'suspended',
    hasVoice: true, hasData: true, hasSms: true, hasMms: true,
    isEsim: true, simType: 'esim',
    phoneNumber: '+12125550133',
    deviceBrand: null, deviceModel: null,
    callWaiting: false,
    cfuActive: false, cfbActive: false, cfnaActive: false, cfnrActive: false,
    usage: {
      minutesTotal: 0, smsTotal: 0,
      dataTotalBytes: 0, dataUploadBytes: 0, dataDownloadBytes: 0,
      spark: Array(14).fill(0),
    },
  },
];

// --- invoices ---------------------------------------------------------------
const invoices = [
  {
    id: 90704, invoiceNumber: 'inv-2026-04', total: 184.62, subtotal: 168.00, amountPaid: 0, amountDue: 184.62,
    isPaid: false, isDue: true, isOverdue: false,
    periodStart: new Date(2026, 3, 1), periodEnd: new Date(2026, 3, 30),
    dateCreated: new Date(2026, 3, 14),
    items: [
      { id: 'i1', name: 'plan · optima unlimited', description: '60 gb · 5 lines', price: 60, quantity: 1 },
      { id: 'i2', name: 'line fees', description: '5 × $12', price: 60, quantity: 5 },
      { id: 'i3', name: 'international · mexico', description: '1 day pass', price: 5, quantity: 1 },
      { id: 'i4', name: 'device credit', description: 'iphone 15 pro · mo 14 of 24', price: 43, quantity: 1 },
    ],
    adjustments: [
      { id: 'a1', label: 'state & local tax', amount: 9.84 },
      { id: 'a2', label: 'fcc regulatory fee', amount: 2.14 },
      { id: 'a3', label: 'e911 surcharge', amount: 4.64 },
    ],
    paymentLabel: 'visa ending 4412',
    paymentCardLast4: '4412',
  },
  {
    id: 90703, invoiceNumber: 'inv-2026-03', total: 179.48, subtotal: 162.00, amountPaid: 179.48, amountDue: 0,
    isPaid: true, isDue: false, isOverdue: false,
    periodStart: new Date(2026, 2, 1), periodEnd: new Date(2026, 2, 31),
    dateCreated: new Date(2026, 2, 14),
    items: [
      { id: 'i1', name: 'plan · optima unlimited', description: '60 gb · 5 lines', price: 60, quantity: 1 },
      { id: 'i2', name: 'line fees', description: '5 × $12', price: 60, quantity: 5 },
      { id: 'i3', name: 'device credit', description: 'iphone 15 pro · mo 13 of 24', price: 42, quantity: 1 },
    ],
    adjustments: [
      { id: 'a1', label: 'state & local tax', amount: 9.42 },
      { id: 'a2', label: 'fcc regulatory fee', amount: 2.14 },
      { id: 'a3', label: 'e911 surcharge', amount: 4.64 },
      { id: 'a4', label: 'returning-customer credit', amount: -10.00 },
    ],
    paymentLabel: 'visa ending 4412',
    paymentCardLast4: '4412',
  },
  {
    id: 90702, invoiceNumber: 'inv-2026-02', total: 168.24, total2: 168.24, subtotal: 152.00, amountPaid: 168.24, amountDue: 0,
    isPaid: true, isDue: false, isOverdue: false,
    periodStart: new Date(2026, 1, 1), periodEnd: new Date(2026, 1, 28),
    dateCreated: new Date(2026, 1, 14),
    items: [
      { id: 'i1', name: 'plan · optima unlimited', description: '60 gb · 4 lines', price: 60, quantity: 1 },
      { id: 'i2', name: 'line fees', description: '4 × $12', price: 48, quantity: 4 },
      { id: 'i3', name: 'device credit', description: 'iphone 15 pro · mo 12 of 24', price: 42, quantity: 1 },
    ],
    adjustments: [
      { id: 'a1', label: 'state & local tax', amount: 9.02 },
      { id: 'a2', label: 'fcc regulatory fee', amount: 2.14 },
      { id: 'a3', label: 'e911 surcharge', amount: 4.64 },
    ],
    paymentLabel: 'visa ending 4412',
    paymentCardLast4: '4412',
  },
  {
    id: 90701, invoiceNumber: 'inv-2026-01', total: 167.82, subtotal: 152.00, amountPaid: 167.82, amountDue: 0,
    isPaid: true, isDue: false, isOverdue: false,
    periodStart: new Date(2026, 0, 1), periodEnd: new Date(2026, 0, 31),
    dateCreated: new Date(2026, 0, 14),
    items: [
      { id: 'i1', name: 'plan · optima unlimited', description: '60 gb · 4 lines', price: 60, quantity: 1 },
      { id: 'i2', name: 'line fees', description: '4 × $12', price: 48, quantity: 4 },
      { id: 'i3', name: 'device credit', description: 'iphone 15 pro · mo 11 of 24', price: 42, quantity: 1 },
    ],
    adjustments: [
      { id: 'a1', label: 'state & local tax', amount: 8.60 },
      { id: 'a2', label: 'fcc regulatory fee', amount: 2.14 },
      { id: 'a3', label: 'e911 surcharge', amount: 4.64 },
      { id: 'a4', label: 'paperless credit', amount: -0.56 },
    ],
    paymentLabel: 'visa ending 4412',
    paymentCardLast4: '4412',
  },
  {
    id: 90700, invoiceNumber: 'inv-2025-12', total: 174.11, subtotal: 158.00, amountPaid: 174.11, amountDue: 0,
    isPaid: true, isDue: false, isOverdue: false,
    periodStart: new Date(2025, 11, 1), periodEnd: new Date(2025, 11, 31),
    dateCreated: new Date(2025, 11, 14),
    items: [
      { id: 'i1', name: 'plan · optima unlimited', description: '60 gb · 4 lines', price: 60, quantity: 1 },
      { id: 'i2', name: 'line fees', description: '4 × $12', price: 48, quantity: 4 },
      { id: 'i3', name: 'roaming · canada', description: 'toronto trip, 3 days', price: 12, quantity: 1 },
      { id: 'i4', name: 'device credit', description: 'iphone 15 pro · mo 10 of 24', price: 38, quantity: 1 },
    ],
    adjustments: [
      { id: 'a1', label: 'state & local tax', amount: 9.23 },
      { id: 'a2', label: 'fcc regulatory fee', amount: 2.14 },
      { id: 'a3', label: 'e911 surcharge', amount: 4.64 },
    ],
    paymentLabel: 'visa ending 4412',
    paymentCardLast4: '4412',
  },
  {
    id: 90699, invoiceNumber: 'inv-2025-11', total: 162.18, subtotal: 146.00, amountPaid: 162.18, amountDue: 0,
    isPaid: true, isDue: false, isOverdue: false,
    periodStart: new Date(2025, 10, 1), periodEnd: new Date(2025, 10, 30),
    dateCreated: new Date(2025, 10, 14),
    items: [
      { id: 'i1', name: 'plan · optima unlimited', description: '60 gb · 4 lines', price: 60, quantity: 1 },
      { id: 'i2', name: 'line fees', description: '4 × $12', price: 48, quantity: 4 },
      { id: 'i3', name: 'device credit', description: 'iphone 15 pro · mo 9 of 24', price: 38, quantity: 1 },
    ],
    adjustments: [
      { id: 'a1', label: 'state & local tax', amount: 8.40 },
      { id: 'a2', label: 'fcc regulatory fee', amount: 2.14 },
      { id: 'a3', label: 'e911 surcharge', amount: 5.64 },
    ],
    paymentLabel: 'visa ending 4412',
    paymentCardLast4: '4412',
  },
];

// Derived values
const activeDevices = devices.filter(d => d.state === 'active');
const totalDataUsed = activeDevices.reduce((s, d) => s + d.usage.dataTotalBytes, 0);
const dataPercent = totalDataUsed / plan.dataAllocationBytes;
const totalMinutes = activeDevices.reduce((s, d) => s + d.usage.minutesTotal, 0);
const totalSms = activeDevices.reduce((s, d) => s + d.usage.smsTotal, 0);

// Period progress (used for "X days into a Y-day cycle")
const now = new Date(2026, 3, 20); // April 20, 2026 — matches injected system date
const periodStart = new Date(2026, 3, 1);
const periodEnd = new Date(2026, 3, 30);
const daysElapsed = Math.round((now - periodStart) / 86400000);
const daysTotal = Math.round((periodEnd - periodStart) / 86400000);
const periodProgress = daysElapsed / daysTotal;

// Recent activity (for home feed on Signal dashboard)
const recentActivity = [
  { kind: 'call', deviceId: 'sim-03', dir: 'out', other: '+16465550201', dur: 842, at: new Date(2026, 3, 20, 9, 14) },
  { kind: 'data', deviceId: 'sim-01', bytes: 0.42 * 1073741824, at: new Date(2026, 3, 20, 8, 2) },
  { kind: 'sms', deviceId: 'sim-01', dir: 'in', other: '+17185550198', at: new Date(2026, 3, 19, 22, 17) },
  { kind: 'call', deviceId: 'sim-01', dir: 'in', other: '+12125550902', dur: 312, at: new Date(2026, 3, 19, 18, 3) },
  { kind: 'data', deviceId: 'sim-02', bytes: 1.04 * 1073741824, at: new Date(2026, 3, 19, 14, 41) },
  { kind: 'call', deviceId: 'sim-03', dir: 'out', other: '+16465550177', dur: 64, at: new Date(2026, 3, 19, 11, 22) },
  { kind: 'sms', deviceId: 'sim-02', dir: 'out', other: '+19175550704', at: new Date(2026, 3, 18, 16, 55) },
];

// Cost allocation per line (for bill explainer)
const lineCostThisMonth = {
  'sim-01': 68.20,
  'sim-02': 41.30,
  'sim-03': 38.90,
  'sim-04': 22.40,
  'sim-05': 0,
};

window.OPTIMERA = {
  user, plan, devices, invoices,
  activeDevices, totalDataUsed, dataPercent, totalMinutes, totalSms,
  now, periodStart, periodEnd, daysElapsed, daysTotal, periodProgress,
  recentActivity, lineCostThisMonth,
  fmt,
};
