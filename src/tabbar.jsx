// Shared tab bar — glass, pill active indicator, yellow accent
function TabBar({ active, onTab, dark = true, variant = 'glass' }) {
  const tabs = [
    { id: 'home', label: 'home', icon: Ico.home },
    { id: 'lines', label: 'lines', icon: Ico.lines },
    { id: 'bills', label: 'bills', icon: Ico.bills },
    { id: 'settings', label: 'settings', icon: Ico.settings },
  ];
  const bg = dark ? 'rgba(14,14,16,0.78)' : 'rgba(255,255,255,0.85)';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const inactive = dark ? 'rgba(244,244,242,0.5)' : 'rgba(0,0,0,0.55)';

  return (
    <div style={{
      position: 'absolute', left: 10, right: 10, bottom: 12, zIndex: 30,
      background: bg,
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      border: `0.5px solid ${border}`,
      borderRadius: 28,
      padding: '8px 10px 20px',
      display: 'flex', justifyContent: 'space-around',
      boxShadow: '0 14px 30px rgba(0,0,0,0.35)',
    }}>
      {tabs.map(t => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button key={t.id}
            onClick={() => onTab && onTab(t.id)}
            style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: isActive ? '#FBD53D' : inactive,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '4px 10px', fontFamily: 'Geist, system-ui',
              fontSize: 9.5, fontWeight: 500, letterSpacing: 0.02,
              transition: 'color .15s ease',
            }}>
            <Icon width={22} height={22} style={{
              filter: isActive ? 'drop-shadow(0 0 8px rgba(251,213,61,.35))' : 'none',
            }}/>
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { TabBar });
