import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, ArrowClockwise } from '@phosphor-icons/react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

// ─── Constants ────────────────────────────────────────────────────────────────

const F_THEORY  = 96485   // C/mol — ثابت فارادي النظري
const CU_M      = 63.55   // g/mol — كتلة مولية النحاس
const CU_N      = 2       // عدد الإلكترونات: Cu²⁺ + 2e⁻ → Cu
const AG_M      = 107.87  // g/mol — كتلة مولية الفضة
const AG_N      = 1       // عدد الإلكترونات: Ag⁺ + e⁻ → Ag
const GRAPH_INT = 5       // ثوانٍ بين نقاط الرسم البياني
const MAX_T     = 600     // 10 دقائق كحد أقصى

// ─── Wire polyline points (conventional current direction) ─────────────────
// W1: DC(+) → Anode 1 (top of left electrode)
const W1: [number, number][] = [[272, 70], [272, 18], [67, 18], [67, 157]]
// W2: Cathode 1 → Anode 2 (middle wire)
const W2: [number, number][] = [[189, 157], [298, 157], [407, 157]]
// W3: Cathode 2 → DC(−)
const W3: [number, number][] = [[533, 157], [533, 18], [328, 18], [328, 70]]
// Ion paths inside solutions
const I1: [number, number][] = [[78, 265], [183, 265]]   // Cu²⁺ in CuSO₄
const I2: [number, number][] = [[415, 265], [525, 265]]  // Ag⁺  in AgNO₃

// ─── Polyline interpolation ────────────────────────────────────────────────

function polyPoint(pts: [number, number][], t: number): [number, number] {
  const segs: number[] = []
  let total = 0
  for (let i = 0; i < pts.length - 1; i++) {
    segs.push(Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]))
    total += segs[i]
  }
  let rem = Math.max(0, Math.min(1, t)) * total
  for (let i = 0; i < segs.length; i++) {
    if (rem <= segs[i] || i === segs.length - 1) {
      const f = segs[i] > 0 ? Math.min(rem / segs[i], 1) : 0
      return [pts[i][0] + f * (pts[i + 1][0] - pts[i][0]), pts[i][1] + f * (pts[i + 1][1] - pts[i][1])]
    }
    rem -= segs[i]
  }
  return pts[pts.length - 1]
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface DataPt { t: number; cu: number; ag: number }

// ─── Component ────────────────────────────────────────────────────────────────

export function FaradayConstantSim() {
  const [current,   setCurrent]   = useState(2.0)
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed,   setElapsed]   = useState(0)
  const [graphData, setGraphData] = useState<DataPt[]>([{ t: 0, cu: 0, ag: 0 }])
  const [tick,      setTick]      = useState(0)

  const rafRef      = useRef<number>(0)
  const lastRef     = useRef(0)
  const tickRef     = useRef(0)
  const secRef      = useRef(0)
  const lastGrRef   = useRef(0)

  // ── Derived values ──────────────────────────────────────────────────────
  const Q      = current * elapsed
  const mCu_g  = (current * elapsed * CU_M) / (CU_N * F_THEORY)
  const mAg_g  = (current * elapsed * AG_M) / (AG_N * F_THEORY)
  const mCu_mg = mCu_g * 1000
  const mAg_mg = mAg_g * 1000

  // Faraday constant derived from each cell (educational display)
  const F_cu = elapsed > 0 ? (current * elapsed * CU_M) / (CU_N * mCu_g) : 0
  const F_ag = elapsed > 0 ? (current * elapsed * AG_M) / (AG_N * mAg_g) : 0

  // ── Animation loop ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning) {
      cancelAnimationFrame(rafRef.current)
      return
    }
    const loop = (ts: number) => {
      const dt = lastRef.current > 0 ? (ts - lastRef.current) / 1000 : 0
      lastRef.current = ts
      if (dt > 0 && dt < 0.5) {
        secRef.current = Math.min(secRef.current + dt, MAX_T)
        setElapsed(Math.floor(secRef.current))
      }
      tickRef.current += 1
      setTick(tickRef.current)
      if (secRef.current >= MAX_T) { setIsRunning(false); return }
      rafRef.current = requestAnimationFrame(loop)
    }
    lastRef.current = 0
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isRunning])

  // ── Graph data ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning || elapsed === 0) return
    if (elapsed % GRAPH_INT === 0 && elapsed !== lastGrRef.current) {
      lastGrRef.current = elapsed
      const cu = +((current * elapsed * CU_M) / (CU_N * F_THEORY) * 1000).toFixed(3)
      const ag = +((current * elapsed * AG_M) / (AG_N * F_THEORY) * 1000).toFixed(3)
      setGraphData(prev => [...prev, { t: elapsed, cu, ag }])
    }
  }, [elapsed, isRunning, current])

  const reset = () => {
    setIsRunning(false); setElapsed(0)
    setGraphData([{ t: 0, cu: 0, ag: 0 }])
    secRef.current = 0; tickRef.current = 0
    lastRef.current = 0; lastGrRef.current = 0; setTick(0)
  }

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // ── Particles ────────────────────────────────────────────────────────────
  const SPD = 0.0022
  const particles = isRunning
    ? Array.from({ length: 4 }, (_, i) => {
        const t = (tick * SPD + i / 4) % 1
        return { w1: polyPoint(W1, t), w2: polyPoint(W2, t), w3: polyPoint(W3, t) }
      })
    : []

  const ions1 = isRunning
    ? Array.from({ length: 3 }, (_, i) => polyPoint(I1, (tick * 0.0018 + i / 3) % 1))
    : []
  const ions2 = isRunning
    ? Array.from({ length: 3 }, (_, i) => polyPoint(I2, (tick * 0.0018 + i / 3) % 1))
    : []

  // Deposit visual height (px, max 90)
  const cuDep = Math.min(mCu_mg / 500,  1) * 90
  const agDep = Math.min(mAg_mg / 1500, 1) * 90

  // O₂ bubbles at Pt anode (Cell 2)
  const bubbles = isRunning
    ? Array.from({ length: 3 }, (_, i) => ({
        x: 402 + i * 6,
        y: 195 - ((tick * 0.55 + i * 25) % 75),
      }))
    : []

  return (
    <div className="space-y-4 p-2" dir="rtl">

      {/* ── Controls ── */}
      <div className="flex flex-wrap gap-4 items-end justify-between">
        <div className="flex-1 min-w-44 max-w-72">
          <p className="text-xs font-cairo text-muted-foreground mb-1">
            شدة التيار الكهربائي (I): <span className="font-bold text-foreground">{current.toFixed(1)} A</span>
          </p>
          <Slider
            min={0.5} max={3.0} step={0.1}
            value={[current]}
            onValueChange={([v]) => { setCurrent(v); reset() }}
            disabled={isRunning}
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setIsRunning(r => !r)} className="gap-1 font-cairo">
            {isRunning ? <><Pause size={14} /> إيقاف</> : <><Play size={14} /> تشغيل</>}
          </Button>
          <Button size="sm" variant="outline" onClick={reset} className="gap-1 font-cairo">
            <ArrowClockwise size={14} /> إعادة
          </Button>
        </div>
      </div>

      {/* ── SVG Simulation ── */}
      <div className="border rounded-xl overflow-hidden bg-slate-50">
        <svg viewBox="0 0 600 340" className="w-full" style={{ maxHeight: 340 }}>
          <rect width="600" height="340" fill="#f8fafc" />

          {/* ── External Wires ── */}
          <polyline points="272,70 272,18 67,18 67,157"    fill="none" stroke="#2a2a2a" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="189" y1="157" x2="407" y2="157"        stroke="#2a2a2a" strokeWidth="2.5" strokeLinecap="round" />
          <polyline points="533,157 533,18 328,18 328,70"  fill="none" stroke="#2a2a2a" strokeWidth="2.5" strokeLinecap="round" />

          {/* ── DC Source ── */}
          <circle cx="300" cy="70" r="30" fill="#ffd6e7" stroke="#d0748a" strokeWidth="2" />
          <line x1="292" y1="54" x2="292" y2="86" stroke="#333" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="308" y1="60" x2="308" y2="80" stroke="#333" strokeWidth="2"   strokeLinecap="round" />
          <text x="265" y="67" fill="#15803d" fontFamily="sans-serif" fontSize="16" fontWeight="bold">+</text>
          <text x="334" y="67" fill="#dc2626" fontFamily="sans-serif" fontSize="14" fontWeight="bold">−</text>
          <text x="300" y="115" textAnchor="middle" fill="#666" fontFamily="sans-serif" fontSize="11">مصدر DC</text>

          {/* ── Current direction arrow + t label ── */}
          <polygon points="315,154 325,157 315,160" fill="#555" />
          <text x="298" y="148" textAnchor="middle" fill="#555" fontFamily="sans-serif" fontSize="12" fontStyle="italic">t , I</text>

          {/* ══ Left Beaker — CuSO₄ ══ */}
          {/* Solution fill */}
          <rect x="32"  y="183" width="175" height="132" rx="4" fill="#88c8f0" opacity="0.72" />
          {/* Beaker glass */}
          <rect x="32"  y="155" width="175" height="160" rx="6" fill="none" stroke="#777" strokeWidth="2.5" />
          <rect x="28"  y="149" width="183" height="13"  rx="4" fill="none" stroke="#777" strokeWidth="2"   />
          {/* Solution label */}
          <text x="119" y="332" textAnchor="middle" fill="#335" fontFamily="sans-serif" fontSize="12" fontWeight="bold">CuSO₄ (aq)</text>

          {/* Anode 1 — Cu, dissolves */}
          <rect x="59" y="153" width="16" height="162" rx="3" fill="#c87010" stroke="#a05808" strokeWidth="1" />
          <text x="67" y="148" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="bold" fill="#111">Cu</text>
          <rect x="28" y="158" width="56" height="19" rx="4" fill="#fee2e2" />
          <text x="56" y="172" textAnchor="middle" fill="#dc2626" fontFamily="sans-serif" fontSize="10.5" fontWeight="bold">أنود (+)</text>
          {/* Reaction at anode 1 */}
          <text x="67" y="298" textAnchor="middle" fill="#a05808" fontFamily="sans-serif" fontSize="9" fontStyle="italic">Cu → Cu²⁺ + 2e⁻</text>

          {/* Cathode 1 — Cu deposit */}
          <rect x="181" y="153" width="16" height="162" rx="3" fill="#b87333" stroke="#906028" strokeWidth="1" />
          {cuDep > 1 && <rect x="174" y={315 - cuDep} width="9" height={cuDep} rx="2" fill="#b87333" opacity="0.9" />}
          <text x="189" y="148" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="bold" fill="#111">Cu</text>
          <rect x="153" y="158" width="56" height="19" rx="4" fill="#dcfce7" />
          <text x="181" y="172" textAnchor="middle" fill="#15803d" fontFamily="sans-serif" fontSize="10.5" fontWeight="bold">كاثود (−)</text>
          <text x="189" y="298" textAnchor="middle" fill="#15803d" fontFamily="sans-serif" fontSize="9" fontStyle="italic">Cu²⁺ + 2e⁻ → Cu</text>

          {/* ══ Right Beaker — AgNO₃ ══ */}
          <rect x="393" y="183" width="175" height="132" rx="4" fill="#c0d8ec" opacity="0.60" />
          <rect x="393" y="155" width="175" height="160" rx="6" fill="none" stroke="#777" strokeWidth="2.5" />
          <rect x="389" y="149" width="183" height="13"  rx="4" fill="none" stroke="#777" strokeWidth="2"   />
          <text x="480" y="332" textAnchor="middle" fill="#335" fontFamily="sans-serif" fontSize="12" fontWeight="bold">AgNO₃ (aq)</text>

          {/* Anode 2 — Pt (inert), O₂ bubbles */}
          <rect x="399" y="153" width="16" height="162" rx="3" fill="#cccccc" stroke="#999" strokeWidth="1" />
          <text x="407" y="148" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="bold" fill="#111">Pt</text>
          <rect x="389" y="158" width="56" height="19" rx="4" fill="#fee2e2" />
          <text x="417" y="172" textAnchor="middle" fill="#dc2626" fontFamily="sans-serif" fontSize="10.5" fontWeight="bold">أنود (+)</text>
          <text x="407" y="298" textAnchor="middle" fill="#666" fontFamily="sans-serif" fontSize="8.5" fontStyle="italic">2H₂O → O₂ + 4H⁺ + 4e⁻</text>

          {/* Cathode 2 — Ag deposit */}
          <rect x="524" y="153" width="16" height="162" rx="3" fill="#d8d8d8" stroke="#aaa" strokeWidth="1" />
          {agDep > 1 && <rect x="517" y={315 - agDep} width="9" height={agDep} rx="2" fill="#b0b0b0" opacity="0.9" />}
          <text x="532" y="148" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="bold" fill="#111">Ag</text>
          <rect x="524" y="158" width="56" height="19" rx="4" fill="#dcfce7" />
          <text x="552" y="172" textAnchor="middle" fill="#15803d" fontFamily="sans-serif" fontSize="10.5" fontWeight="bold">كاثود (−)</text>
          <text x="532" y="298" textAnchor="middle" fill="#15803d" fontFamily="sans-serif" fontSize="9" fontStyle="italic">Ag⁺ + e⁻ → Ag</text>

          {/* ── O₂ Bubbles at Pt Anode ── */}
          {bubbles.map((b, i) => (
            <circle key={`b${i}`} cx={b.x} cy={b.y} r={3} fill="white" opacity={0.75} stroke="#aaa" strokeWidth="0.5" />
          ))}

          {/* ── Animated Current Particles (conventional direction) ── */}
          {particles.map((p, i) => (
            <g key={`p${i}`}>
              <circle cx={p.w1[0]} cy={p.w1[1]} r={4.5} fill="#ef4444" opacity={0.88} />
              <circle cx={p.w2[0]} cy={p.w2[1]} r={4.5} fill="#ef4444" opacity={0.88} />
              <circle cx={p.w3[0]} cy={p.w3[1]} r={4.5} fill="#ef4444" opacity={0.88} />
            </g>
          ))}

          {/* ── Animated Cations in Solutions ── */}
          {ions1.map((pt, i) => (
            <g key={`i1${i}`}>
              <circle cx={pt[0]} cy={pt[1]} r={5} fill="#2563eb" opacity={0.82} />
              <text x={pt[0]} y={pt[1] + 3.5} textAnchor="middle" fill="white" fontSize="5.5" fontWeight="bold">Cu²⁺</text>
            </g>
          ))}
          {ions2.map((pt, i) => (
            <g key={`i2${i}`}>
              <circle cx={pt[0]} cy={pt[1]} r={4.5} fill="#7c3aed" opacity={0.82} />
              <text x={pt[0]} y={pt[1] + 3.5} textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">Ag⁺</text>
            </g>
          ))}
        </svg>
      </div>

      {/* ── Live Data Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="border rounded-lg p-3 text-center bg-muted/30">
          <p className="text-xs text-muted-foreground font-cairo mb-1">الزمن المنقضي</p>
          <p className="text-2xl font-mono font-bold">{fmt(elapsed)}</p>
          <p className="text-xs text-muted-foreground">د : ث</p>
        </div>
        <div className="border rounded-lg p-3 text-center bg-muted/30">
          <p className="text-xs text-muted-foreground font-cairo mb-1">الشحنة الكلية</p>
          <p className="text-2xl font-mono font-bold">{Q.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">كولوم (C)</p>
        </div>
        <div className="border rounded-lg p-3 text-center bg-orange-50 border-orange-200">
          <p className="text-xs text-muted-foreground font-cairo mb-1">ترسّب النحاس (Cu)</p>
          <p className="text-2xl font-mono font-bold text-orange-700">{mCu_mg.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">ملليغرام (mg)</p>
        </div>
        <div className="border rounded-lg p-3 text-center bg-slate-100 border-slate-300">
          <p className="text-xs text-muted-foreground font-cairo mb-1">ترسّب الفضة (Ag)</p>
          <p className="text-2xl font-mono font-bold text-slate-600">{mAg_mg.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">ملليغرام (mg)</p>
        </div>
      </div>

      {/* ── Live Graph ── */}
      <div className="border rounded-xl p-4 bg-white">
        <p className="text-sm font-cairo font-bold mb-3 text-center text-slate-700">
          📈 الكتلة المترسّبة بدلالة الزمن (قانون فارادي الأول)
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={graphData} margin={{ top: 5, right: 20, bottom: 25, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis
              dataKey="t"
              label={{ value: 'الزمن (ثانية)', position: 'insideBottom', offset: -12, fontFamily: 'Cairo,sans-serif', fontSize: 12 }}
              tick={{ fontFamily: 'sans-serif', fontSize: 11 }}
            />
            <YAxis
              label={{ value: 'الكتلة (mg)', angle: -90, position: 'insideLeft', offset: 18, fontFamily: 'Cairo,sans-serif', fontSize: 12 }}
              tick={{ fontFamily: 'sans-serif', fontSize: 11 }}
            />
            <Tooltip
              formatter={(v: number, name: string) => [`${v.toFixed(3)} mg`, name === 'cu' ? 'نحاس Cu' : 'فضة Ag']}
              labelFormatter={(l: number) => `الزمن = ${l} ثانية`}
            />
            <Legend
              formatter={(v: string) => (v === 'cu' ? 'نحاس (Cu)' : 'فضة (Ag)')}
              wrapperStyle={{ fontFamily: 'Cairo,sans-serif', fontSize: 13 }}
            />
            <Line type="monotone" dataKey="cu" stroke="#c25a00" strokeWidth={2.5} dot={false} name="cu" />
            <Line type="monotone" dataKey="ag" stroke="#6b6bcc" strokeWidth={2.5} dot={false} name="ag" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Faraday Calculation ── */}
      <div className="border rounded-xl p-4 bg-blue-50/60 space-y-3">
        <p className="font-cairo font-bold text-sm text-blue-900">📐 حساب ثابت فارادي من بيانات التجربة</p>

        <div className="bg-white rounded-lg p-3 font-mono text-sm border" dir="ltr">
          <p className="text-center font-bold mb-2 text-slate-700">m = (I × t × M) / (n × F)  ⟹  F = (I × t × M) / (n × m)</p>
          {elapsed > 5 ? (
            <div className="space-y-1.5">
              <p className="text-orange-700">
                <span className="font-bold">من النحاس:</span>&nbsp;
                F = ({current.toFixed(1)} × {elapsed} × {CU_M}) / ({CU_N} × {mCu_g.toFixed(5)})
                &nbsp;= <strong>{F_cu.toFixed(0)}</strong> C/mol
              </p>
              <p className="text-purple-700">
                <span className="font-bold">من الفضة:</span>&nbsp;
                F = ({current.toFixed(1)} × {elapsed} × {AG_M}) / ({AG_N} × {mAg_g.toFixed(5)})
                &nbsp;= <strong>{F_ag.toFixed(0)}</strong> C/mol
              </p>
              <p className="text-green-700 font-bold border-t pt-1.5">
                ✅ القيمة النظرية لثابت فارادي: F = 96,485 C/mol
              </p>
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-xs" style={{ fontFamily: 'Cairo,sans-serif' }}>
              شغّل التجربة لحساب ثابت فارادي…
            </p>
          )}
        </div>

        {elapsed > 5 && (
          <div className="bg-white rounded-lg p-3 border space-y-1.5 text-sm font-cairo">
            <p className="font-bold text-slate-700">نسبة الكتلتين — التحقق من قانون فارادي الثاني:</p>
            <p className="text-muted-foreground">
              m(Ag) / m(Cu) = {(mAg_mg / (mCu_mg || 1)).toFixed(3)}
              &nbsp;≈&nbsp;
              [M(Ag)/n(Ag)] ÷ [M(Cu)/n(Cu)] = [{AG_M}/{AG_N}] ÷ [{CU_M}/{CU_N}] = {(AG_M / AG_N / (CU_M / CU_N)).toFixed(3)}
            </p>
            <p className="text-xs text-green-700 font-semibold">
              ✅ النسبتان متساويتان — يتحقق قانون فارادي الثاني
            </p>
          </div>
        )}

        <div className="text-xs font-cairo text-muted-foreground space-y-1 border-t pt-2">
          <p><span className="font-bold">قانون فارادي الأول:</span> الكتلة المترسّبة ∝ الشحنة الكهربائية (m ∝ Q = I·t)</p>
          <p><span className="font-bold">قانون فارادي الثاني:</span> لشحنة واحدة، الكتلة ∝ (M/n) — الكتلة المكافئة الكيميائية</p>
        </div>
      </div>
    </div>
  )
}
