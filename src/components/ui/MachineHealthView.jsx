import { useMemo } from 'react';
import { Activity, AlertTriangle, CheckCircle2, TrendingDown, Zap } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

function calcHealth(wos) {
  const total = wos.length;
  if (total === 0) return { score: 100, breakdown: { frequency: 100, severity: 100, resolution: 100, recurrence: 100, downtime: 100 } };

  const recent = wos.filter((wo) => {
    const d = new Date(wo.createdAt);
    return (Date.now() - d.getTime()) < 30 * 86400000;
  });

  // Frequency (fewer WOs = better) — baseline: 0 WOs = 100, 10+ = 0
  const freqScore = Math.max(0, 100 - recent.length * 10);

  // Severity — weight critical/high heavily
  const sevWeights = { critical: 30, high: 15, medium: 7, low: 2 };
  const sevPenalty = wos.reduce((acc, wo) => acc + (sevWeights[wo.priority] || 5), 0);
  const sevScore = Math.max(0, 100 - sevPenalty);

  // Resolution — % resolved
  const resolved = wos.filter((w) => w.status === 'resolved' || w.status === 'closed').length;
  const resScore = total > 0 ? Math.round((resolved / total) * 100) : 100;

  // Recurrence — WOs with same issue type
  const issueCounts = {};
  wos.forEach((wo) => { const key = (wo.issueTitle || '').split(' ').slice(0, 3).join(' ').toLowerCase(); issueCounts[key] = (issueCounts[key] || 0) + 1; });
  const maxRecur = Math.max(...Object.values(issueCounts), 1);
  const recurScore = Math.max(0, 100 - (maxRecur - 1) * 20);

  // Downtime — hours open for unresolved WOs
  const downtimeHours = wos.filter((w) => w.status !== 'resolved' && w.status !== 'closed')
    .reduce((acc, wo) => acc + (Date.now() - new Date(wo.createdAt).getTime()) / 3600000, 0);
  const downtimeScore = Math.max(0, 100 - Math.round(downtimeHours / 2));

  const score = Math.round((freqScore + sevScore + resScore + recurScore + downtimeScore) / 5);

  return {
    score,
    breakdown: { frequency: freqScore, severity: sevScore, resolution: resScore, recurrence: recurScore, downtime: downtimeScore },
  };
}

function healthColor(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#84cc16';
  if (score >= 40) return '#FF9900';
  if (score >= 20) return '#f97316';
  return '#ef4444';
}

function healthLabel(score) {
  if (score >= 80) return 'Healthy';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'At Risk';
  if (score >= 20) return 'Critical';
  return 'Failed';
}

function ScoreRing({ score }) {
  const color = healthColor(score);
  const r = 44;
  const circ = 2 * Math.PI * r;
  const progress = (score / 100) * circ;
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
      <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${progress} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 55 55)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="55" y="52" textAnchor="middle" fill={color} fontSize="22" fontWeight="900" fontFamily="monospace">{score}</text>
      <text x="55" y="67" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="Inter,sans-serif">{healthLabel(score)}</text>
    </svg>
  );
}

export default function MachineHealthView({ workOrders = [] }) {
  const machines = useMemo(() => {
    const byMachine = {};
    workOrders.forEach((wo) => {
      const mid = wo.machineId || wo.machine || 'Unknown';
      if (!byMachine[mid]) byMachine[mid] = [];
      byMachine[mid].push(wo);
    });
    return Object.entries(byMachine).map(([machineId, wos]) => {
      const { score, breakdown } = calcHealth(wos);
      const color = healthColor(score);
      const lastWO = wos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      const topIssue = (() => {
        const counts = {};
        wos.forEach((wo) => { const k = wo.issueTitle || 'Unknown'; counts[k] = (counts[k] || 0) + 1; });
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
      })();
      const radarData = [
        { axis: 'Frequency', value: breakdown.frequency },
        { axis: 'Severity', value: breakdown.severity },
        { axis: 'Resolution', value: breakdown.resolution },
        { axis: 'Recurrence', value: breakdown.recurrence },
        { axis: 'Uptime', value: breakdown.downtime },
      ];
      return { machineId, wos, score, breakdown, color, lastWO, topIssue, radarData };
    }).sort((a, b) => a.score - b.score);
  }, [workOrders]);

  const critCount = machines.filter((m) => m.score < 40).length;
  const atRisk = machines.filter((m) => m.score >= 40 && m.score < 60).length;
  const healthy = machines.filter((m) => m.score >= 80).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px' }}>
        {[
          { label: 'Critical Machines', value: critCount, color: '#ef4444', icon: AlertTriangle },
          { label: 'At Risk', value: atRisk, color: '#FF9900', icon: TrendingDown },
          { label: 'Healthy', value: healthy, color: '#22c55e', icon: CheckCircle2 },
          { label: 'Total Tracked', value: machines.length, color: '#818cf8', icon: Activity },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{ background: 'var(--bg-surface)', border: `1px solid ${color}33`, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={16} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color, fontFamily: 'monospace', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '3px' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Machine cards */}
      {machines.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          No work orders yet — machine health scores will appear here.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '14px' }}>
          {machines.map(({ machineId, wos, score, color, lastWO, topIssue, radarData }) => (
            <div key={machineId} style={{
              background: 'var(--bg-surface)', border: `1px solid ${color}33`,
              borderRadius: '12px', overflow: 'hidden',
              boxShadow: score < 40 ? `0 0 16px ${color}18` : 'none',
            }}>
              {/* Header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', background: `${color}08` }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '7px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={15} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{machineId}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{wos.length} work order{wos.length !== 1 ? 's' : ''} on record</div>
                </div>
                <div style={{ padding: '3px 10px', borderRadius: '99px', background: `${color}20`, border: `1px solid ${color}44`, fontSize: '0.7rem', fontWeight: 700, color, whiteSpace: 'nowrap' }}>
                  {healthLabel(score)}
                </div>
              </div>

              <div style={{ padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                {/* Score ring */}
                <div style={{ flexShrink: 0 }}>
                  <ScoreRing score={score} />
                </div>

                {/* Radar chart */}
                <div style={{ flex: 1, height: '110px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} margin={{ top: 0, right: 10, bottom: 0, left: 10 }}>
                      <PolarGrid stroke="rgba(0,0,0,0.1)" />
                      <PolarAngleAxis dataKey="axis" tick={{ fill: '#64748b', fontSize: 8 }} />
                      <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.15} />
                      <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #dde3ee', borderRadius: '6px', fontSize: '0.72rem', color: '#0f172a' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom stats */}
              <div style={{ padding: '10px 16px 14px', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Top Issue: </span>{topIssue}
                </div>
                {lastWO && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Last WO: </span>
                    <span style={{ fontFamily: 'monospace', color: '#FF9900' }}>{lastWO.id}</span> — {new Date(lastWO.createdAt).toLocaleDateString()}
                  </div>
                )}
                {/* Breakdown bars */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '4px', marginTop: '4px' }}>
                  {[
                    { label: 'Freq', key: 'frequency' },
                    { label: 'Sev', key: 'severity' },
                    { label: 'Res', key: 'resolution' },
                    { label: 'Recur', key: 'recurrence' },
                    { label: 'Up', key: 'downtime' },
                  ].map(({ label, key }) => {
                    const v = radarData.find((d) => d.axis.toLowerCase().includes(key.slice(0, 3).toLowerCase()))?.value ?? 0;
                    const c = healthColor(v);
                    return (
                      <div key={key} style={{ textAlign: 'center' }}>
                        <div style={{ height: '28px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                          <div style={{ width: '100%', height: `${v}%`, background: c, transition: 'height 0.4s' }} />
                        </div>
                        <div style={{ fontSize: '0.58rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
