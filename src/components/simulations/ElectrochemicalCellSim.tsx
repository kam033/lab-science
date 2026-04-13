import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, ArrowClockwise } from '@phosphor-icons/react'

// ─── Half-cell data (standard reduction potentials vs SHE at 25°C) ─────────

const HALF_CELLS = [
  { id: 'zn', metal: 'Zn',     ion: 'Zn²⁺', n: 2, formula: 'ZnSO₄',    nameAr: 'زنك / ZnSO₄',          e0: -0.76, solColor: '#bcd8ec', metalColor: '#9e9e9e' },
  { id: 'fe', metal: 'Fe',     ion: 'Fe²⁺', n: 2, formula: 'FeSO₄',    nameAr: 'حديد / FeSO₄',          e0: -0.44, solColor: '#cde8c0', metalColor: '#7a7a7a' },
  { id: 'ni', metal: 'Ni',     ion: 'Ni²⁺', n: 2, formula: 'NiSO₄',    nameAr: 'نيكل / NiSO₄',          e0: -0.23, solColor: '#c0deb8', metalColor: '#808070' },
  { id: 'sn', metal: 'Sn',     ion: 'Sn²⁺', n: 2, formula: 'SnCl₂',    nameAr: 'قصدير / SnCl₂',         e0: -0.14, solColor: '#d8e8e8', metalColor: '#b0b8b8' },
  { id: 'pb', metal: 'Pb',     ion: 'Pb²⁺', n: 2, formula: 'Pb(NO₃)₂', nameAr: 'رصاص / Pb(NO₃)₂',      e0: -0.13, solColor: '#d0d4e8', metalColor: '#606878' },
  { id: 'h2', metal: 'Pt/H₂',  ion: 'H⁺',   n: 1, formula: 'HCl 1M',   nameAr: 'SHE — Pt/H₂ | HCl',    e0:  0.00, solColor: '#deeef8', metalColor: '#c0c0c0' },
  { id: 'cu', metal: 'Cu',     ion: 'Cu²⁺', n: 2, formula: 'CuSO₄',    nameAr: 'نحاس / CuSO₄',          e0: +0.34, solColor: '#88c4f0', metalColor: '#b87333' },
  { id: 'ag', metal: 'Ag',     ion: 'Ag⁺',  n: 1, formula: 'AgNO₃',    nameAr: 'فضة / AgNO₃',           e0: +0.80, solColor: '#e8e8cc', metalColor: '#d8d8d8' },
]

// ─── Wire path (left electrode top → voltmeter → right electrode top) ───────
const WIRE_PTS: [number, number][] = [
  [115, 115], [115, 46], [272, 46],
  [328, 46],  [485, 46], [485, 115],
]

// ─── Salt-bridge path (U-tube between beakers) ───────────────────────────────
const SALT_PTS: [number, number][] = [
  [192, 318], [192, 366], [300, 384], [408, 366], [408, 318],
]

// ─── Helper: point along a polyline at fractional distance t ∈ [0,1] ────────
function polyPoint(pts: [number, number][], t: number): [number, number] {
  const segs: number[] = []
  let total = 0
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1][0] - pts[i][0]
    const dy = pts[i + 1][1] - pts[i][1]
    segs.push(Math.hypot(dx, dy))
    total += segs[i]
  }
  let rem = Math.max(0, Math.min(1, t)) * total
  for (let i = 0; i < segs.length; i++) {
    if (rem <= segs[i] || i === segs.length - 1) {
      const frac = segs[i] > 0 ? Math.min(rem / segs[i], 1) : 0
      return [
        pts[i][0] + frac * (pts[i + 1][0] - pts[i][0]),
        pts[i][1] + frac * (pts[i + 1][1] - pts[i][1]),
      ]
    }
    rem -= segs[i]
  }
  return pts[pts.length - 1]
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ElectrochemicalCellSim() {
  const [leftId,    setLeftId]    = useState('zn')
  const [rightId,   setRightId]   = useState('cu')
  const [isRunning, setIsRunning] = useState(false)
  const [tick,      setTick]      = useState(0)
  const rafRef  = useRef<number>(0)
  const lastRef = useRef(0)
  const tickRef = useRef(0)

  const left  = HALF_CELLS.find(h => h.id === leftId)!
  const right = HALF_CELLS.find(h => h.id === rightId)!
  const same  = leftId === rightId

  // lower E° = anode (oxidised), higher E° = cathode (reduced)
  const anodeIsLeft = left.e0 <= right.e0
  const anode   = anodeIsLeft ? left  : right
  const cathode = anodeIsLeft ? right : left
  const cellVoltage = cathode.e0 - anode.e0   // always ≥ 0

  // ── Animation loop ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }
    const loop = (ts: number) => {
      if (ts - lastRef.current > 16) {
        lastRef.current = ts
        tickRef.current += 1
        setTick(tickRef.current)
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [isRunning])

  const reset = () => {
    setIsRunning(false)
    tickRef.current = 0
    setTick(0)
    setLeftId('zn')
    setRightId('cu')
  }

  // ── Particle positions ────────────────────────────────────────────────────
  const N_E = 5, N_I = 4
  const SPEED_E = 0.003, SPEED_I = 0.0022

  const electrons = !same && isRunning
    ? Array.from({ length: N_E }, (_, i) => {
        const t = (tick * SPEED_E + i / N_E) % 1
        return polyPoint(WIRE_PTS, anodeIsLeft ? t : 1 - t)
      })
    : []

  // cations (K⁺) migrate toward cathode
  const cations = !same && isRunning
    ? Array.from({ length: N_I }, (_, i) => {
        const t = (tick * SPEED_I + i / N_I) % 1
        return polyPoint(SALT_PTS, anodeIsLeft ? t : 1 - t)
      })
    : []

  // anions (Cl⁻) migrate toward anode (opposite direction)
  const anions = !same && isRunning
    ? Array.from({ length: N_I }, (_, i) => {
        const t = (tick * SPEED_I + i / N_I) % 1
        return polyPoint(SALT_PTS, anodeIsLeft ? 1 - t : t)
      })
    : []

  // ── Style helpers ─────────────────────────────────────────────────────────
  const leftIsAnode  = anodeIsLeft
  const rightIsAnode = !anodeIsLeft

  const leftLabelTxt   = leftIsAnode  ? 'أنود (−)'  : 'كاثود (+)'
  const rightLabelTxt  = rightIsAnode ? 'أنود (−)'  : 'كاثود (+)'
  const leftLabelFill  = leftIsAnode  ? '#dc2626'   : '#15803d'
  const rightLabelFill = rightIsAnode ? '#dc2626'   : '#15803d'
  const leftBadgeFill  = leftIsAnode  ? '#fee2e2'   : '#dcfce7'
  const rightBadgeFill = rightIsAnode ? '#fee2e2'   : '#dcfce7'
  const leftTerm       = leftIsAnode  ? '−'         : '+'
  const rightTerm      = rightIsAnode ? '−'         : '+'

  return (
    <div className="space-y-4 p-2" dir="rtl">

      {/* ── Controls ── */}
      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div className="flex gap-4 flex-wrap">
          {[
            { label: 'نصف الخلية اليسرى', val: leftId,  set: setLeftId  },
            { label: 'نصف الخلية اليمنى', val: rightId, set: setRightId },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <p className="text-xs font-cairo text-muted-foreground mb-1">{label}</p>
              <select
                value={val}
                onChange={e => { set(e.target.value); tickRef.current = 0; setTick(0) }}
                className="border rounded px-2 py-1.5 text-sm font-cairo bg-background w-56"
              >
                {HALF_CELLS.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.nameAr} (E°={h.e0 >= 0 ? '+' : ''}{h.e0.toFixed(2)} V)
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setIsRunning(r => !r)}
            disabled={same}
            className="gap-1 font-cairo"
          >
            {isRunning ? <><Pause size={14} /> إيقاف</> : <><Play size={14} /> تشغيل</>}
          </Button>
          <Button size="sm" variant="outline" onClick={reset} className="gap-1 font-cairo">
            <ArrowClockwise size={14} /> إعادة
          </Button>
        </div>
      </div>

      {/* ── SVG Canvas ── */}
      <div className="border rounded-xl overflow-hidden bg-slate-50">
        <svg viewBox="0 0 600 415" className="w-full" style={{ maxHeight: 415 }}>
          <rect width="600" height="415" fill="#f8fafc" />

          {/* ── Wires ── */}
          <polyline points="115,115 115,46 272,46" fill="none" stroke="#2a2a2a" strokeWidth="3" strokeLinecap="round" />
          <polyline points="328,46 485,46 485,115"  fill="none" stroke="#2a2a2a" strokeWidth="3" strokeLinecap="round" />

          {/* ── Voltmeter ── */}
          <rect x="243" y="18" width="114" height="58" rx="8" fill="#1a1a2e" stroke="#444" strokeWidth="1.5" />
          <rect x="251" y="26" width="98"  height="34" rx="4" fill="#001204" />
          <text
            x="300" y="50"
            textAnchor="middle" fill="#00ff41"
            fontFamily="monospace" fontSize="17" fontWeight="bold"
          >
            {same ? '0.000' : cellVoltage.toFixed(3)} V
          </text>
          {/* terminals */}
          <circle cx="272" cy="46" r="6" fill="#555" />
          <text x="272" y="50" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">{leftTerm}</text>
          <circle cx="328" cy="46" r="6" fill="#555" />
          <text x="328" y="50" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">{rightTerm}</text>
          <text x="300" y="90" textAnchor="middle" fill="#666" fontFamily="sans-serif" fontSize="11">فولتميتر (Voltmeter)</text>

          {/* ── Electron-flow hint ── */}
          {!same && (
            <text x="300" y="38" textAnchor="middle" fill="#2563eb" fontFamily="sans-serif" fontSize="11">
              {anodeIsLeft ? '→ e⁻ →' : '← e⁻ ←'}
            </text>
          )}

          {/* ── Salt Bridge ── */}
          <path d="M192,318 L192,366 Q300,392 408,366 L408,318"
                fill="none" stroke="#c8a000" strokeWidth="14" strokeLinecap="round" />
          <path d="M192,318 L192,366 Q300,392 408,366 L408,318"
                fill="none" stroke="#f8df68" strokeWidth="10" strokeLinecap="round" />
          <text x="300" y="408" textAnchor="middle" fill="#888" fontFamily="sans-serif" fontSize="10.5">
            K⁺ Cl⁻ — قنطرة ملحية (Salt Bridge)
          </text>

          {/* ── Left Beaker ── */}
          {/* solution fill */}
          <rect x="38"  y="165" width="154" height="153" rx="4" fill={left.solColor}  opacity="0.88" />
          {/* glass */}
          <rect x="38"  y="135" width="154" height="183" rx="6" fill="none" stroke="#888" strokeWidth="2.5" />
          <rect x="34"  y="130" width="162" height="13"  rx="4" fill="none" stroke="#888" strokeWidth="2"   />
          {/* electrode */}
          <rect x="106" y="113" width="18"  height="205" rx="3" fill={left.metalColor}  stroke="#555" strokeWidth="1" />
          <text x="115" y="109" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fontWeight="bold" fill="#111">{left.metal}</text>
          {/* solution label */}
          <text x="115" y="190" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fill="#335">1 M {left.formula}</text>
          {/* anode/cathode badge */}
          <rect x="44" y="138" width="64" height="20" rx="5" fill={leftBadgeFill} />
          <text x="76" y="152" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="bold" fill={leftLabelFill}>
            {leftLabelTxt}
          </text>
          {/* ion label in solution */}
          <text x="115" y="260" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fill={leftIsAnode ? '#dc2626' : '#15803d'} opacity="0.7">
            {leftIsAnode ? `${left.ion}↑` : `${left.ion}↓`}
          </text>

          {/* ── Right Beaker ── */}
          <rect x="408" y="165" width="154" height="153" rx="4" fill={right.solColor} opacity="0.88" />
          <rect x="408" y="135" width="154" height="183" rx="6" fill="none" stroke="#888" strokeWidth="2.5" />
          <rect x="404" y="130" width="162" height="13"  rx="4" fill="none" stroke="#888" strokeWidth="2"   />
          <rect x="476" y="113" width="18"  height="205" rx="3" fill={right.metalColor} stroke="#555" strokeWidth="1" />
          <text x="485" y="109" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fontWeight="bold" fill="#111">{right.metal}</text>
          <text x="485" y="190" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fill="#335">1 M {right.formula}</text>
          <rect x="492" y="138" width="64" height="20" rx="5" fill={rightBadgeFill} />
          <text x="524" y="152" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="bold" fill={rightLabelFill}>
            {rightLabelTxt}
          </text>
          <text x="485" y="260" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fill={rightIsAnode ? '#dc2626' : '#15803d'} opacity="0.7">
            {rightIsAnode ? `${right.ion}↑` : `${right.ion}↓`}
          </text>

          {/* ── H₂ bubbles at SHE anode ── */}
          {isRunning && !same && left.id === 'h2' && leftIsAnode && (
            <>
              <circle cx={108 + Math.sin(tick * 0.18) * 4} cy={200 - (tick * 0.9 % 55)} r={3}   fill="white" opacity={0.65} stroke="#aaa" strokeWidth="0.5" />
              <circle cx={118 + Math.sin(tick * 0.25) * 3} cy={215 - (tick * 0.7 % 65)} r={2.5} fill="white" opacity={0.55} stroke="#aaa" strokeWidth="0.5" />
            </>
          )}
          {isRunning && !same && right.id === 'h2' && rightIsAnode && (
            <>
              <circle cx={478 + Math.sin(tick * 0.18) * 4} cy={200 - (tick * 0.9 % 55)} r={3}   fill="white" opacity={0.65} stroke="#aaa" strokeWidth="0.5" />
              <circle cx={488 + Math.sin(tick * 0.25) * 3} cy={215 - (tick * 0.7 % 65)} r={2.5} fill="white" opacity={0.55} stroke="#aaa" strokeWidth="0.5" />
            </>
          )}

          {/* ── Animated electrons ── */}
          {electrons.map(([x, y], i) => (
            <g key={`e${i}`}>
              <circle cx={x} cy={y} r={5.5} fill="#2563eb" opacity={0.92} />
              <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">e⁻</text>
            </g>
          ))}

          {/* ── Animated cations K⁺ ── */}
          {cations.map(([x, y], i) => (
            <g key={`k${i}`}>
              <circle cx={x} cy={y} r={5} fill="#ef4444" opacity={0.88} />
              <text x={x} y={y + 3.5} textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">K⁺</text>
            </g>
          ))}

          {/* ── Animated anions Cl⁻ ── */}
          {anions.map(([x, y], i) => (
            <g key={`cl${i}`}>
              <circle cx={x} cy={y} r={5} fill="#7c3aed" opacity={0.88} />
              <text x={x} y={y + 3.5} textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">Cl⁻</text>
            </g>
          ))}
        </svg>
      </div>

      {/* ── Half-reactions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { hc: left,  isAnode: leftIsAnode,  side: 'اليسرى' },
          { hc: right, isAnode: rightIsAnode, side: 'اليمنى' },
        ].map(({ hc, isAnode, side }) => (
          <div
            key={hc.id}
            className={`p-3 rounded-lg border-2 ${isAnode ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}
          >
            <p className={`text-xs font-bold font-cairo mb-1.5 ${isAnode ? 'text-red-700' : 'text-green-700'}`}>
              {isAnode ? '🔴' : '🟢'} نصف الخلية {side} — {isAnode ? 'أنود (أكسدة)' : 'كاثود (اختزال)'}
            </p>
            <p className="font-mono text-sm">
              {isAnode
                ? `${hc.metal} → ${hc.ion} + ${hc.n}e⁻`
                : `${hc.ion} + ${hc.n}e⁻ → ${hc.metal}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              E° = {hc.e0 >= 0 ? '+' : ''}{hc.e0.toFixed(2)} V
            </p>
          </div>
        ))}
      </div>

      {/* ── Voltage summary ── */}
      <div className={`p-4 rounded-xl border text-center space-y-1 ${
        same           ? 'bg-gray-50  border-gray-200'  :
        cellVoltage > 0 ? 'bg-green-50 border-green-200' :
                          'bg-gray-50  border-gray-200'
      }`}>
        {same ? (
          <p className="font-cairo text-muted-foreground">اختر نصفَي خلية مختلفين لحساب الجهد</p>
        ) : (
          <>
            <p className="font-cairo text-base">
              <span className="font-bold">E°خلية</span>
              {' = E°(كاثود) − E°(أنود) = '}
              {cathode.e0 >= 0 ? '+' : ''}{cathode.e0.toFixed(2)}
              {' − ('}
              {anode.e0 >= 0 ? '+' : ''}{anode.e0.toFixed(2)}
              {') = '}
              <span className={`font-bold text-lg ${cellVoltage > 0.001 ? 'text-green-700' : 'text-gray-600'}`}>
                {cellVoltage.toFixed(3)} V
              </span>
            </p>
            <p className="text-sm font-cairo text-muted-foreground">
              {cellVoltage > 0.001
                ? '✅ خلية جلفانية — تفاعل تلقائي (ΔG < 0)'
                : '⚡ جهد الخلية صفر — لا تدفق للتيار'}
            </p>
          </>
        )}
      </div>

      {/* ── Standard reduction potentials table ── */}
      <details className="border rounded-lg overflow-hidden">
        <summary className="p-3 cursor-pointer font-cairo text-sm font-semibold bg-muted/30 select-none">
          📊 جدول جهود الاختزال القياسية E° (V) — بالترتيب التنازلي
        </summary>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-2 text-right font-cairo border-b">نصف التفاعل (اختزال)</th>
                <th className="px-4 py-2 font-cairo border-b text-center">E° (V)</th>
                <th className="px-4 py-2 font-cairo border-b text-center text-xs">النشاط</th>
              </tr>
            </thead>
            <tbody>
              {[...HALF_CELLS].sort((a, b) => b.e0 - a.e0).map(h => (
                <tr
                  key={h.id}
                  className={`border-b hover:bg-muted/20 transition-colors ${
                    h.id === leftId || h.id === rightId ? 'bg-yellow-50 font-semibold' : ''
                  }`}
                >
                  <td className="px-4 py-1.5 font-mono text-xs">
                    {h.ion} + {h.n}e⁻ → {h.metal} &nbsp;|&nbsp; {h.formula}
                  </td>
                  <td className={`px-4 py-1.5 text-center font-mono ${
                    h.e0 > 0 ? 'text-green-700' : h.e0 < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {h.e0 >= 0 ? '+' : ''}{h.e0.toFixed(2)}
                  </td>
                  <td className="px-4 py-1.5 text-center text-xs font-cairo">
                    {h.e0 >= 0.5 ? '⬆ مؤكسد قوي' : h.e0 <= -0.5 ? '⬇ مختزل قوي' : '↔ متوسط'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
