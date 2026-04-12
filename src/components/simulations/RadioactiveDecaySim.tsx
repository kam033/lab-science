import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Pause, ArrowClockwise } from '@phosphor-icons/react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'

interface Isotope {
  name: string
  symbol: string
  halfLifeYears: number
  color: string
}

const ISOTOPES: Isotope[] = [
  { name: 'كربون-14',    symbol: '¹⁴C',   halfLifeYears: 5730,      color: '#6366f1' },
  { name: 'راديوم-226',  symbol: '²²⁶Ra', halfLifeYears: 1600,      color: '#ec4899' },
  { name: 'يوراني-238',  symbol: '²³⁸U',  halfLifeYears: 4.47e9,    color: '#f59e0b' },
  { name: 'آيودين-131',  symbol: '¹³¹I',  halfLifeYears: 8.02 / 365, color: '#10b981' },
]

const ATOM_COUNT = 80  // dots on canvas

export function RadioactiveDecaySim() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [isotopeIdx, setIsotopeIdx] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)       // in half-lives
  const [speed, setSpeed] = useState(1)           // half-lives per second

  const isotope = ISOTOPES[isotopeIdx]
  const λ = Math.LN2                              // decay constant in units of half-lives

  // N(t) = N₀ · e^(-λ·t)  where t in half-lives
  const N0 = 100
  const N = Math.round(N0 * Math.exp(-λ * elapsed))

  // Chart data: from 0 to 5 half-lives
  const chartData = useMemo(() => {
    const pts: { t: number; N: number; lnN: number }[] = []
    for (let t = 0; t <= 5; t += 0.1) {
      pts.push({
        t: Number(t.toFixed(2)),
        N: N0 * Math.exp(-λ * t),
        lnN: Math.log(N0 * Math.exp(-λ * t)),
      })
    }
    return pts
  }, [])

  // Animation tick
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isRunning) {
      tickRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + speed * 0.05
          if (next >= 5) { setIsRunning(false); return 5 }
          return next
        })
      }, 50)
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [isRunning, speed])

  // Canvas: atom dots
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    // Background
    ctx.fillStyle = 'rgba(15,23,42,1)'
    ctx.fillRect(0, 0, W, H)

    // Total atoms on canvas = ATOM_COUNT
    const decayed = Math.round(ATOM_COUNT * (1 - N / N0))
    const remaining = ATOM_COUNT - decayed

    const cols = 10
    const rows = Math.ceil(ATOM_COUNT / cols)
    const cellW = W / cols
    const cellH = H / rows

    for (let i = 0; i < ATOM_COUNT; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      const cx = col * cellW + cellW / 2
      const cy = row * cellH + cellH / 2

      const isDecayed = i >= remaining

      ctx.beginPath()
      ctx.arc(cx, cy, 8, 0, Math.PI * 2)
      ctx.fillStyle = isDecayed ? '#374151' : isotope.color
      ctx.fill()
      ctx.strokeStyle = isDecayed ? '#1f2937' : `${isotope.color}88`
      ctx.lineWidth = 2
      ctx.stroke()

      // Glow for active atoms
      if (!isDecayed) {
        ctx.shadowColor = isotope.color
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(cx, cy, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff44'
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }
  }, [N, isotope])

  const reset = useCallback(() => {
    setIsRunning(false)
    setElapsed(0)
  }, [])

  const halfLifeLabel = isotope.halfLifeYears >= 1e6
    ? `${(isotope.halfLifeYears / 1e9).toFixed(2)} × 10⁹ سنة`
    : isotope.halfLifeYears >= 1
    ? `${isotope.halfLifeYears.toFixed(0)} سنة`
    : `${(isotope.halfLifeYears * 365).toFixed(1)} يوم`

  return (
    <div className="space-y-4" dir="rtl">

      {/* Header */}
      <div>
        <h3 className="font-cairo font-bold text-base">☢️ الانحلال الإشعاعي وإيجاد ثابت الانحلال</h3>
        <p className="text-xs text-muted-foreground font-cairo mt-0.5">
          اختر النظير، شغّل التجربة، وارسم ln(N) مقابل الزمن لإيجاد ثابت الانحلال λ
        </p>
      </div>

      {/* Isotope selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {ISOTOPES.map((iso, i) => (
          <button
            key={iso.symbol}
            onClick={() => { setIsotopeIdx(i); reset() }}
            className={`rounded-xl border-2 p-2 text-center transition-all cursor-pointer ${
              isotopeIdx === i ? 'border-primary scale-105 shadow-md' : 'border-border hover:border-primary/50'
            }`}
          >
            <p className="text-lg font-mono font-bold" style={{ color: iso.color }}>{iso.symbol}</p>
            <p className="text-xs font-cairo">{iso.name}</p>
            <p className="text-xs text-muted-foreground font-cairo mt-0.5">T½ = {
              iso.halfLifeYears >= 1e6
                ? `${(iso.halfLifeYears / 1e9).toFixed(2)}G سنة`
                : iso.halfLifeYears >= 1
                ? `${iso.halfLifeYears.toFixed(0)} سنة`
                : `${(iso.halfLifeYears * 365).toFixed(0)} يوم`
            }</p>
          </button>
        ))}
      </div>

      {/* Canvas + controls side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Atom canvas */}
        <div className="space-y-2">
          <p className="text-xs font-cairo font-semibold text-center">
            الذرات المتبقية: {N} من {N0}
          </p>
          <canvas
            ref={canvasRef}
            width={300}
            height={180}
            className="w-full rounded-xl border border-border"
          />
          <div className="flex items-center gap-3 justify-center text-xs font-cairo">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: isotope.color }} />
              ذرة نشطة
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-gray-700 inline-block" />
              انحلّت
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3 flex flex-col justify-center">

          <div className="space-y-1">
            <label className="text-xs font-cairo font-semibold">
              الزمن: <span className="text-primary font-mono">{elapsed.toFixed(2)}</span> أنصاف أعمار
            </label>
            <Slider
              min={0} max={5} step={0.01}
              value={[elapsed]}
              onValueChange={([v]) => { setIsRunning(false); setElapsed(v) }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-cairo font-semibold">
              سرعة التشغيل: <span className="text-primary font-mono">{speed}×</span>
            </label>
            <Slider
              min={1} max={10} step={1}
              value={[speed]}
              onValueChange={([v]) => setSpeed(v)}
            />
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="font-cairo gap-1.5 flex-1"
              onClick={() => setIsRunning(r => !r)}>
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
              {isRunning ? 'إيقاف' : 'تشغيل'}
            </Button>
            <Button size="sm" variant="outline" className="font-cairo gap-1.5" onClick={reset}>
              <ArrowClockwise size={14} /> إعادة
            </Button>
          </div>

          {/* Readouts */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'N المتبقية', value: N },
              { label: 'الانحلال %', value: `${(100 - N).toFixed(0)}%` },
              { label: 'T½', value: halfLifeLabel },
              { label: 'λ (بوحدة T½)', value: '0.693' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/50 rounded-lg p-2 text-center">
                <p className="text-sm font-bold font-mono text-primary">{value}</p>
                <p className="text-xs text-muted-foreground font-cairo">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts: N vs t  and  ln(N) vs t */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* N(t) curve */}
        <div className="space-y-1">
          <p className="text-xs font-cairo font-semibold text-center">N مقابل t (أنصاف الأعمار)</p>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-border p-2" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="t" tick={{ fontSize: 10 }} label={{ value: 'T½', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [v.toFixed(1), 'N']} />
                <Line dataKey="N" stroke={isotope.color} strokeWidth={2} dot={false} />
                <ReferenceLine x={elapsed} stroke="#64748b" strokeDasharray="4 2" />
                <ReferenceLine y={N} stroke="#64748b" strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ln(N) vs t — should be linear */}
        <div className="space-y-1">
          <p className="text-xs font-cairo font-semibold text-center">ln(N) مقابل t (الميل = −λ)</p>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-border p-2" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="t" tick={{ fontSize: 10 }} label={{ value: 'T½', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [v.toFixed(2), 'ln(N)']} />
                <Line dataKey="lnN" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <ReferenceLine x={elapsed} stroke="#64748b" strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Formula */}
      <div className="bg-muted/40 rounded-lg p-3 text-xs font-cairo space-y-2">
        <p className="font-semibold text-sm">العلاقات الرياضية:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center font-mono">
          <div className="bg-muted/60 rounded-lg py-2">
            <p className="text-sm">N(t) = N₀ · e<sup>−λt</sup></p>
            <p className="text-muted-foreground text-xs mt-1">قانون الانحلال</p>
          </div>
          <div className="bg-muted/60 rounded-lg py-2">
            <p className="text-sm">T½ = ln2 / λ ≈ 0.693/λ</p>
            <p className="text-muted-foreground text-xs mt-1">نصف العمر</p>
          </div>
          <div className="bg-muted/60 rounded-lg py-2">
            <p className="text-sm">ln(N) = ln(N₀) − λt</p>
            <p className="text-muted-foreground text-xs mt-1">خط مستقيم — ميله = −λ</p>
          </div>
        </div>
      </div>

    </div>
  )
}
