import { useMemo } from 'react';
import { User, Star, Clock, CheckCircle2, Target, TrendingUp, Award } from 'lucide-react';

function avgResolutionHours(wos) {
  const resolved = wos.filter((wo) => wo.status === 'resolved' || wo.status === 'closed');
  if (!resolved.length) return null;
  const total = resolved.reduce((acc, wo) => {
    const created = new Date(wo.createdAt).getTime();
    const updated = new Date(wo.updatedAt || wo.createdAt).getTime();
    return acc + (updated - created) / 3600000;
  }, 0);
  return (total / resolved.length).toFixed(1);
}

function firstTimeFixRate(wos) {
  const resolved = wos.filter((wo) => wo.status === 'resolved' || wo.status === 'closed');
  if (!resolved.length) return 0;
  const firstTimeFix = resolved.filter((wo) => !wo.notes || wo.notes.length <= 1);
  return Math.round((firstTimeFix.length / resolved.length) * 100);
}

function grade(score) {
  if (score >= 90) return { letter: 'A', color: '#22c55e' };
  if (score >= 75) return { letter: 'B', color: '#84cc16' };
  if (score >= 60) return { letter: 'C', color: '#FF9900' };
  if (score >= 40) return { letter: 'D', color: '#f97316' };
  return { letter: 'F', color: '#ef4444' };
}

function calcScore(stats) {
  let score = 0;
  // Completion rate (40 pts)
  score += Math.min(40, (stats.resolved / Math.max(stats.total, 1)) * 40);
  // First-time fix (30 pts)
  score += (stats.ftfr / 100) * 30;
  // Avg resolution time (30 pts) — lower is better, baseline 8h
  if (stats.avgHours !== null) {
    const timeScore = Math.max(0, 30 - (stats.avgHours / 8) * 30);
    score += timeScore;
  }
  return Math.round(score);
}

const MEDAL = ['🥇', '🥈', '🥉'];

export default function TechScorecardView({ workOrders = [] }) {
  const scorecards = useMemo(() => {
    const byTech = {};
    workOrders.forEach((wo) => {
      const tech = wo.assignedTo || wo.technician || 'Unassigned';
      if (!byTech[tech]) byTech[tech] = [];
      byTech[tech].push(wo);
    });
    return Object.entries(byTech).map(([tech, wos]) => {
      const total = wos.length;
      const resolved = wos.filter((w) => w.status === 'resolved' || w.status === 'closed').length;
      const open = wos.filter((w) => w.status !== 'resolved' && w.status !== 'closed').length;
      const critical = wos.filter((w) => w.priority === 'critical').length;
      const avgHours = avgResolutionHours(wos);
      const ftfr = firstTimeFixRate(wos);
      const completionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
      const score = calcScore({ total, resolved, avgHours: avgHours ? Number(avgHours) : null, ftfr });
      const g = grade(score);
      return { tech, total, resolved, open, critical, avgHours, ftfr, completionRate, score, grade: g };
    }).sort((a, b) => b.score - a.score);
  }, [workOrders]);

  if (scorecards.length === 0) {
    return (
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
        No work orders with assigned technicians yet.
      </div>
    );
  }

  const topTech = scorecards[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Top performer spotlight */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,153,0,0.1), rgba(129,140,248,0.08))',
        border: '1px solid rgba(255,153,0,0.3)', borderRadius: '12px', padding: '20px',
        display: 'flex', alignItems: 'center', gap: '18px',
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'rgba(255,153,0,0.15)', border: '2px solid #FF9900',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Award size={24} color="#FF9900" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.68rem', color: '#FF9900', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Top Performer This Period</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '6px' }}>{topTech.tech}</div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.78rem' }}>
            <span style={{ color: '#22c55e' }}><CheckCircle2 size={12} style={{ marginRight: '3px', verticalAlign: 'middle' }} />{topTech.resolved} resolved</span>
            <span style={{ color: '#818cf8' }}><Target size={12} style={{ marginRight: '3px', verticalAlign: 'middle' }} />{topTech.ftfr}% first-time fix</span>
            <span style={{ color: '#FF9900' }}><Clock size={12} style={{ marginRight: '3px', verticalAlign: 'middle' }} />{topTech.avgHours ? `${topTech.avgHours}h avg` : 'N/A'}</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: topTech.grade.color, lineHeight: 1, fontFamily: 'monospace' }}>{topTech.grade.letter}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Score: {topTech.score}</div>
        </div>
      </div>

      {/* Scorecards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
        {scorecards.map(({ tech, total, resolved, open, critical, avgHours, ftfr, completionRate, score, grade: g }, idx) => (
          <div key={tech} style={{
            background: 'var(--bg-surface)', border: `1px solid ${g.color}33`,
            borderRadius: '10px', overflow: 'hidden',
            boxShadow: idx === 0 ? `0 0 16px ${g.color}18` : 'none',
          }}>
            {/* Header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px', background: `${g.color}08` }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${g.color}18`, border: `1px solid ${g.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={16} color={g.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{tech}</span>
                  {idx < 3 && <span style={{ fontSize: '0.9rem' }}>{MEDAL[idx]}</span>}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{total} total WOs</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: g.color, lineHeight: 1, fontFamily: 'monospace' }}>{g.letter}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{score}/100</div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Completion rate bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '5px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Completion Rate</span>
                  <span style={{ color: g.color, fontWeight: 700 }}>{completionRate}%</span>
                </div>
                <div style={{ height: '5px', background: 'var(--bg-elevated)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${completionRate}%`, background: g.color, borderRadius: '99px', transition: 'width 0.4s' }} />
                </div>
              </div>

              {/* First-time fix rate bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '5px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>First-Time Fix Rate</span>
                  <span style={{ color: '#818cf8', fontWeight: 700 }}>{ftfr}%</span>
                </div>
                <div style={{ height: '5px', background: 'var(--bg-elevated)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${ftfr}%`, background: '#818cf8', borderRadius: '99px', transition: 'width 0.4s' }} />
                </div>
              </div>

              {/* Stat row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', paddingTop: '4px' }}>
                {[
                  { label: 'Open', value: open, color: '#FF9900' },
                  { label: 'Resolved', value: resolved, color: '#22c55e' },
                  { label: 'Critical', value: critical, color: '#ef4444' },
                  { label: 'Avg Time', value: avgHours ? `${avgHours}h` : '—', color: '#06b6d4' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign: 'center', padding: '7px 4px', background: 'var(--bg-elevated)', borderRadius: '7px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color, fontFamily: 'monospace' }}>{value}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
