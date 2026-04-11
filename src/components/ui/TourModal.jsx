import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/*
  Tour overlay — navigates to each page, spotlights it, and floats a
  thought bubble with animated typing over the live UI content.
*/

// Shorthand spotlight regions
const FULL_CONTENT  = { top: '52px', left: '200px', right: '0px', bottom: '0px' };
const FULL_SIDEBAR  = { top: '52px', left: '0px', width: '200px', bottom: '0px', borderRadius: 0 };
const FULL_HEADER   = { top: '0px', left: '0px', right: '0px', height: '52px', borderRadius: 0 };
const ALERTS_PILL   = { top: '7px', right: '78px', width: '204px', height: '38px' };

// Bubble anchored to bottom-center of the content area (floats over the live page)
const BUBBLE_OVER_CONTENT = { bottom: '28px', left: 'calc(50vw - 90px)', width: 380 };
// Bubble below header (in dark area)
const BUBBLE_BELOW_HEADER = { top: '72px', left: 'calc(50vw - 180px)', width: 360 };
// Bubble right of sidebar (in dark area)
const BUBBLE_RIGHT_SIDEBAR = { top: '150px', left: '218px', width: 340 };
// Bubble below alerts pill
const BUBBLE_BELOW_ALERTS = { top: '62px', right: '20px', width: 330 };
// Centered (no spotlight)
const BUBBLE_CENTER = { top: 'calc(50vh - 120px)', left: 'calc(50vw - 190px)', width: 380 };

const STEPS = [
  {
    id: 'welcome',
    color: '#FF9900',
    title: 'Welcome to MT Services',
    desc: 'Your centralized operations platform for managing work orders, tracking machine health, monitoring downtime costs, and coordinating your maintenance team — all in real time.',
    view: null,
    spotlight: null,
    bubble: BUBBLE_CENTER,
    trail: null,
  },
  {
    id: 'header',
    color: '#FF9900',
    title: 'Live Status Header',
    desc: 'Shows real-time Supabase connection status (green = live, orange = syncing, red = offline). Manual refresh, IT support tickets, alert settings, and the tour compass all live here.',
    view: null,
    spotlight: FULL_HEADER,
    bubble: BUBBLE_BELOW_HEADER,
    trail: 'up',
  },
  {
    id: 'sidebar',
    color: '#818cf8',
    title: 'Navigation Sidebar',
    desc: 'Switch between all 12+ views using the sidebar. Four mode groups (Overview, Normal Services, Accidents, MEWP) can be toggled from the header buttons above.',
    view: null,
    spotlight: FULL_SIDEBAR,
    bubble: BUBBLE_RIGHT_SIDEBAR,
    trail: 'left',
  },
  {
    id: 'dashboard',
    color: '#FF9900',
    title: 'System Dashboard',
    desc: 'Your command center — 6 live KPI cards, a 14-day created-vs-resolved trend chart, a priority pie chart, a downtime alerts panel sorted by urgency, and a live activity feed of every system event.',
    view: 'dashboard',
    spotlight: FULL_CONTENT,
    bubble: BUBBLE_OVER_CONTENT,
    trail: null,
  },
  {
    id: 'table',
    color: '#FF9900',
    title: 'Work Orders Table',
    desc: 'Create, filter, sort, and manage every work order. Sort by priority, status, machine, or date. Bulk-select multiple WOs to update status or priority at once. Export any view to CSV in one click.',
    view: 'table',
    spotlight: FULL_CONTENT,
    bubble: BUBBLE_OVER_CONTENT,
    trail: null,
  },
  {
    id: 'board',
    color: '#FF9900',
    title: 'Machine State Board',
    desc: 'A kanban-style card layout that groups work orders by machine state — Operational, Degraded, Down, Maintenance. Drag or click any card to open the full detail panel.',
    view: 'board',
    spotlight: FULL_CONTENT,
    bubble: BUBBLE_OVER_CONTENT,
    trail: null,
  },
  {
    id: 'downtime',
    color: '#ef4444',
    title: 'Downtime Cost Tracker',
    desc: 'A live dollar clock ticks on every open work order — showing exactly how much revenue is being lost per minute. Configure your production rate, log manual incidents, and resolve WOs to stop the clock.',
    view: 'downtime',
    spotlight: FULL_CONTENT,
    bubble: BUBBLE_OVER_CONTENT,
    trail: null,
  },
  {
    id: 'health',
    color: '#22c55e',
    title: 'Machine Health Score',
    desc: 'Every machine gets an automatic 0–100 health score calculated from WO frequency, severity, resolution rate, recurrence, and active downtime. A radar chart breaks each dimension down visually.',
    view: 'health',
    spotlight: FULL_CONTENT,
    bubble: BUBBLE_OVER_CONTENT,
    trail: null,
  },
  {
    id: 'pm',
    color: '#818cf8',
    title: 'PM Scheduler',
    desc: 'Schedule and track preventive maintenance tasks per machine. OVERDUE and DUE SOON badges appear automatically. Mark Done to reset the clock to today. Filter by area or status.',
    view: 'pm',
    spotlight: FULL_CONTENT,
    bubble: BUBBLE_OVER_CONTENT,
    trail: null,
  },
  {
    id: 'parts',
    color: '#22c55e',
    title: 'Parts Inventory',
    desc: 'Track spare parts on hand with OUT OF STOCK (red) and LOW STOCK (orange) alerts. Edit quantities inline with the pencil icon. Total inventory value is calculated automatically.',
    view: 'parts',
    spotlight: FULL_CONTENT,
    bubble: BUBBLE_OVER_CONTENT,
    trail: null,
  },
  {
    id: 'handoff',
    color: '#06b6d4',
    title: 'Shift Handoff Report',
    desc: 'Generate a complete end-of-shift report in seconds. Open WOs are auto-populated. Add priority alerts, safety notes, pending parts, and outgoing/incoming tech names. Save or print directly.',
    view: 'handoff',
    spotlight: FULL_CONTENT,
    bubble: BUBBLE_OVER_CONTENT,
    trail: null,
  },
  {
    id: 'scorecard',
    color: '#818cf8',
    title: 'Technician Scorecards',
    desc: 'Every tech gets a performance grade (A–F) based on completion rate, first-time fix rate, and average resolution time — all derived automatically from their work order history.',
    view: 'scorecard',
    spotlight: FULL_CONTENT,
    bubble: BUBBLE_OVER_CONTENT,
    trail: null,
  },
  {
    id: 'safety',
    color: '#22c55e',
    title: 'Safety & LOTO',
    desc: 'Interactive 12-step LOTO lockout/tagout checklist (OSHA 29 CFR 1910.147), preventable incident category reference, and an incident log with date, type, location, and preventability tracking.',
    view: 'safety',
    spotlight: FULL_CONTENT,
    bubble: BUBBLE_OVER_CONTENT,
    trail: null,
  },
  {
    id: 'charts',
    color: '#06b6d4',
    title: 'Analytics',
    desc: 'Bar charts, pie charts, and line charts across all work order data — breakdowns by priority, status, machine type, and technician. Spot trends and identify recurring problem areas.',
    view: 'charts',
    spotlight: FULL_CONTENT,
    bubble: BUBBLE_OVER_CONTENT,
    trail: null,
  },
  {
    id: 'history',
    color: '#FF9900',
    title: 'Work Order History',
    desc: 'A read-only archive of all work orders grouped by Year → Month → Day. Each level shows summary stats — total, resolved, critical, and resolve rate — so you can spot patterns over time.',
    view: 'history',
    spotlight: FULL_CONTENT,
    bubble: BUBBLE_OVER_CONTENT,
    trail: null,
  },
  {
    id: 'alerts',
    color: '#FF9900',
    title: 'Smart Alerts',
    desc: 'Click the bell icon to configure browser push, email, and SMS alerts. Get notified the instant a machine goes down, a critical WO is created, or a WO goes overdue — even with the tab closed.',
    view: null,
    spotlight: ALERTS_PILL,
    bubble: BUBBLE_BELOW_ALERTS,
    trail: 'up',
  },
  {
    id: 'install',
    color: '#22c55e',
    title: 'Install as an App',
    desc: 'MT Services is a PWA — installable on any device. On Android or Windows, click the green "Install App" button in the header. On iPhone, tap Share → "Add to Home Screen". Once installed, it runs fullscreen like a native app with no browser bar.',
    view: null,
    spotlight: { top: '7px', right: '152px', width: '108px', height: '38px' },
    bubble: BUBBLE_BELOW_ALERTS,
    trail: 'up',
  },
  {
    id: 'finish',
    color: '#FF9900',
    title: "You're all set!",
    desc: "You've seen every page. Use the sidebar to navigate, the bell for alerts, and the Compass icon in the header to reopen this tour any time.",
    view: 'dashboard',
    spotlight: null,
    bubble: BUBBLE_CENTER,
    trail: null,
  },
];

/* ── Three circles pointing from bubble toward the spotlight ── */
function TrailCircles({ direction, color }) {
  const circles = [
    { s: 6,  delay: '0s'    },
    { s: 10, delay: '0.15s' },
    { s: 14, delay: '0.30s' },
  ];
  const base = { position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', pointerEvents: 'none' };
  const dot = (c) => ({
    width: c.s, height: c.s, borderRadius: '50%',
    background: '#fff', border: `1.5px solid ${color}66`,
    boxShadow: `0 0 8px ${color}50`,
    animation: `tb-float 2.8s ease-in-out infinite`,
    animationDelay: c.delay,
    flexShrink: 0,
  });
  if (direction === 'up')    return <div style={{ ...base, bottom: '100%', left: '50%', transform: 'translateX(-50%)', flexDirection: 'column-reverse', paddingBottom: '5px' }}>{circles.map((c, i) => <div key={i} style={dot(c)} />)}</div>;
  if (direction === 'down')  return <div style={{ ...base, top: '100%',    left: '50%', transform: 'translateX(-50%)', flexDirection: 'column',         paddingTop: '5px'    }}>{circles.map((c, i) => <div key={i} style={dot(c)} />)}</div>;
  if (direction === 'left')  return <div style={{ ...base, right: '100%',  top: '38%',  transform: 'translateY(-50%)', flexDirection: 'row-reverse',     paddingRight: '5px'  }}>{circles.map((c, i) => <div key={i} style={dot(c)} />)}</div>;
  if (direction === 'right') return <div style={{ ...base, left: '100%',   top: '38%',  transform: 'translateY(-50%)', flexDirection: 'row',             paddingLeft: '5px'   }}>{circles.map((c, i) => <div key={i} style={dot(c)} />)}</div>;
  return null;
}

/* ── Bouncing thinking dots ── */
function ThinkingDots({ color }) {
  return (
    <div style={{ display: 'flex', gap: '6px', padding: '4px 0', alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: 9, height: 9, borderRadius: '50%',
          background: color,
          display: 'inline-block',
          animation: 'tb-think 1.1s ease-in-out infinite',
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

/* ── The floating thought bubble ── */
function ThoughtBubble({ current, step, total, phase, displayed, onNext, onBack, onClose, isFirst, isLast }) {
  const { bubble, color, title, trail } = current;
  return (
    <div style={{
      position: 'fixed',
      top: bubble.top, bottom: bubble.bottom,
      left: bubble.left, right: bubble.right,
      width: bubble.width, maxWidth: '92vw',
      zIndex: 402, pointerEvents: 'all',
    }}>
      <div style={{ position: 'relative', animation: 'tb-float 3.5s ease-in-out infinite' }}>
        {trail && <TrailCircles direction={trail} color={color} />}

        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: `2px solid ${color}50`,
          padding: '18px 20px 14px',
          boxShadow: `0 16px 50px rgba(0,0,0,0.22), 0 0 0 6px ${color}12`,
        }}>
          {/* Badge + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{
              padding: '2px 8px', borderRadius: '99px', flexShrink: 0,
              background: `${color}18`, border: `1px solid ${color}44`,
              fontSize: '0.58rem', fontWeight: 800, color,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              {step + 1} / {total}
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#111827' }}>{title}</span>
          </div>

          {/* Animated content */}
          <div style={{ minHeight: '54px' }}>
            {phase === 'thinking' ? (
              <ThinkingDots color={color} />
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.68, margin: 0 }}>
                {displayed}
                {phase === 'typing' && (
                  <span style={{
                    display: 'inline-block', width: '2px', height: '0.9em',
                    background: color, marginLeft: '2px', verticalAlign: 'text-bottom',
                    animation: 'tb-cursor 0.65s steps(1) infinite',
                  }} />
                )}
              </p>
            )}
          </div>

          {/* Nav row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: '14px', paddingTop: '12px',
            borderTop: `1px solid ${color}25`,
          }}>
            {/* Progress dots */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', maxWidth: '160px' }}>
              {Array.from({ length: total }, (_, i) => (
                <div key={i} style={{
                  width: i === step ? '14px' : '5px',
                  height: '5px', borderRadius: '99px',
                  background: i === step ? color : `${color}35`,
                  transition: 'all 0.25s ease',
                  flexShrink: 0,
                }} />
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '0.7rem', color: '#9ca3af', cursor: 'pointer', padding: '4px 6px', borderRadius: '5px' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#6b7280'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; }}>
                Skip
              </button>
              {!isFirst && (
                <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '6px 11px', borderRadius: '7px', background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                  <ChevronLeft size={12} /> Back
                </button>
              )}
              <button onClick={onNext} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 16px', borderRadius: '7px', background: color, border: 'none', color: color === '#FF9900' ? '#000' : '#fff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', boxShadow: `0 3px 14px ${color}55`, transition: 'filter 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}>
                {isLast ? 'Get Started' : (<>Next <ChevronRight size={12} /></>)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main tour component ── */
export default function TourModal({ onClose, onNavigate }) {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('thinking');
  const [displayed, setDisplayed] = useState('');

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // When step changes: navigate to the view, then start the animation sequence
  useEffect(() => {
    // Navigate to the page this step describes
    if (current.view && onNavigate) {
      onNavigate(current.view);
    }

    setPhase('thinking');
    setDisplayed('');

    const thinkTimer = setTimeout(() => {
      setPhase('typing');
      const text = current.desc;
      let i = 0;
      const typingTimer = setInterval(() => {
        i += 3;
        if (i >= text.length) {
          setDisplayed(text);
          clearInterval(typingTimer);
          setPhase('done');
        } else {
          setDisplayed(text.slice(0, i));
        }
      }, 18);
      return () => clearInterval(typingTimer);
    }, 520);

    return () => clearTimeout(thinkTimer);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  function goStep(s) {
    setStep(Math.max(0, Math.min(STEPS.length - 1, s)));
  }

  return (
    <>
      {/* Block app interaction during tour */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 399, pointerEvents: 'all' }} />

      <div style={{ position: 'fixed', inset: 0, zIndex: 400, pointerEvents: 'none' }}>
        {/* Full backdrop for steps without a spotlight */}
        {!current.spotlight && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(3px)' }} />
        )}

        {/* Spotlight cutout — box-shadow darkens everything outside */}
        {current.spotlight && (
          <div style={{
            position: 'fixed',
            top:    current.spotlight.top,
            left:   current.spotlight.left,
            right:  current.spotlight.right,
            bottom: current.spotlight.bottom,
            width:  current.spotlight.width,
            height: current.spotlight.height,
            borderRadius: current.spotlight.borderRadius !== undefined ? current.spotlight.borderRadius : 10,
            boxShadow: `0 0 0 9999px rgba(0,0,0,0.58)`,
            border: `2px solid ${current.color}`,
            outline: `4px solid ${current.color}28`,
            zIndex: 401,
            animation: 'tb-spotlight-pulse 2.5s ease-in-out infinite',
          }} />
        )}

        {/* Thought bubble */}
        <ThoughtBubble
          current={current}
          step={step}
          total={STEPS.length}
          phase={phase}
          displayed={displayed}
          onNext={() => isLast ? onClose() : goStep(step + 1)}
          onBack={() => goStep(step - 1)}
          onClose={onClose}
          isFirst={step === 0}
          isLast={isLast}
        />
      </div>

      <style>{`
        @keyframes tb-float {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-7px); }
        }
        @keyframes tb-think {
          0%, 80%, 100% { transform: translateY(0px);  opacity: 0.45; }
          40%            { transform: translateY(-8px); opacity: 1;    }
        }
        @keyframes tb-cursor {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes tb-spotlight-pulse {
          0%, 100% { box-shadow: 0 0 0 9999px rgba(0,0,0,0.58); }
          50%       { box-shadow: 0 0 0 9999px rgba(0,0,0,0.58), 0 0 22px 4px rgba(255,255,255,0.07); }
        }
      `}</style>
    </>
  );
}
