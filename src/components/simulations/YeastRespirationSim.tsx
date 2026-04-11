import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, ArrowClockwise } from '@phosphor-icons/react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

// ─── Canvas layout ───────────────────────────────────────────────────────────
const CW = 560, CH = 360
const TX = 180, TY = 50, TW = 200, TH = 265   // test-tube region

// ─── Types ────────────────────────────────────────────────────────────────────
interface Particle {
  x: number; y: number; vx: number; vy: number
  type: 'yeast' | 'glucose' | 'co2'
  active: boolean; life?: number; alpha?: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const yeastSpeed = (temp: number) => 0.70 + (temp - 25) * 0.025
const glucoseN   = (conc: number) => Math.round(conc * 14)
const YEAST_N = 10

function spawnYeast(speed: number): Particle {
  const a = Math.random() * Math.PI * 2
  return {
    x: TX + 18 + Math.random() * (TW - 36),
    y: TY + 45 + Math.random() * (TH - 90),
    vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
    type: 'yeast', active: true,
  }
}

function spawnGlucose(): Particle {
  return {
    x: TX + 18 + Math.random() * (TW - 36),
    y: TY + 45 + Math.random() * (TH - 90),
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    type: 'glucose', active: true,
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export function YeastRespirationSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>()
  const psRef     = useRef<Particle[]>([])
  const simRef    = useRef({ isRunning: false, time: 0, blue: 100.0, lastUI: 0 })
  const concRef   = useRef(1.5)
  const tempRef   = useRef(30)

  const [mode, setMode]       = useState<'learning' | 'experiment'>('learning')
  const [isRunning, setIsRunning] = useState(false)
  const [conc, setConc]       = useState(1.5)
  const [temp, setTemp]       = useState(30)
  const [blueUI, setBlueUI]   = useState(100)
  const [elapsed, setElapsed] = useState(0)
  const [chart, setChart]     = useState<{ t: number; blue: number }[]>([{ t: 0, blue: 100 }])
  const [done, setDone]       = useState(false)

  // ── Init particles ──────────────────────────────────────────────────────────
  const init = useCallback(() => {
    const spd = yeastSpeed(tempRef.current)
    const gn  = glucoseN(concRef.current)
    psRef.current = [
      ...Array.from({ length: YEAST_N }, () => spawnYeast(spd)),
      ...Array.from({ length: gn }, spawnGlucose),
    ]
    simRef.current = { isRunning: false, time: 0, blue: 100, lastUI: 0 }
  }, [])

  const reset = useCallback(() => {
    setIsRunning(false)
    setDone(false)
    setBlueUI(100)
    setElapsed(0)
    setChart([{ t: 0, blue: 100 }])
    init()
  }, [init])

  // ── Draw loop ───────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const sim = simRef.current

    // ── Physics ─────────────────────────────────────────────────────────────
    if (sim.isRunning && sim.blue > 0) {
      sim.time += 1 / 60
      const spd = yeastSpeed(tempRef.current)

      // Update positions
      const updated: Particle[] = psRef.current.map(p => {
        if (!p.active) return p
        if (p.type === 'co2') {
          const life = (p.life ?? 0) - 1
          if (life <= 0) return { ...p, active: false }
          return { ...p, x: p.x + p.vx, y: p.y + p.vy, life, alpha: life / 70 }
        }
        if (p.type === 'yeast') {
          let { x, y, vx, vy } = p
          const cur = Math.hypot(vx, vy)
          if (cur > 0.001) { vx = (vx / cur) * spd; vy = (vy / cur) * spd }
          x += vx; y += vy
          if (x < TX + 10) { x = TX + 10; vx = Math.abs(vx) }
          if (x > TX + TW - 10) { x = TX + TW - 10; vx = -Math.abs(vx) }
          if (y < TY + 15) { y = TY + 15; vy = Math.abs(vy) }
          if (y > TY + TH - 10) { y = TY + TH - 10; vy = -Math.abs(vy) }
          return { ...p, x, y, vx, vy }
        }
        if (p.type === 'glucose') {
          let { x, y, vx, vy } = p
          x += vx; y += vy
          if (x < TX + 8 || x > TX + TW - 8) vx = -vx
          if (y < TY + 18 || y > TY + TH - 8) vy = -vy
          return { ...p, x, y, vx, vy }
        }
        return p
      }).filter(p => p.active)

      // Collision: yeast ↔ glucose → reaction → CO2
      const newCO2: Particle[] = []
      const consumed = new Set<number>()
      for (let i = 0; i < updated.length; i++) {
        if (updated[i].type !== 'yeast') continue
        for (let j = 0; j < updated.length; j++) {
          if (updated[j].type !== 'glucose' || consumed.has(j)) continue
          if (Math.hypot(updated[i].x - updated[j].x, updated[i].y - updated[j].y) < 15
              && Math.random() < 0.028) {
            consumed.add(j)
            sim.blue = Math.max(0, sim.blue - 1.1)
            newCO2.push({
              x: updated[j].x, y: updated[j].y,
              vx: (Math.random() - 0.5) * 0.5,
              vy: -(0.65 + Math.random() * 0.45),
              type: 'co2', active: true, life: 65, alpha: 1,
            })
          }
        }
      }

      const final = updated.map((p, i) => consumed.has(i) ? { ...p, active: false } : p).filter(p => p.active)

      // Respawn glucose to maintain concentration
      const activeG = final.filter(p => p.type === 'glucose').length
      if (activeG < glucoseN(concRef.current) * 0.45 && sim.blue > 5) {
        for (let k = 0; k < 2; k++) final.push(spawnGlucose())
      }
      psRef.current = [...final, ...newCO2]
    }

    // ── Render ──────────────────────────────────────────────────────────────
    const blueF = sim.blue / 100   // 0→1

    // Background
    ctx.fillStyle = '#f1f5f9'
    ctx.fillRect(0, 0, CW, CH)

    // Lab bench
    ctx.fillStyle = '#cbd5e1'
    ctx.fillRect(0, CH - 24, CW, 24)

    // Solution color (blue → colorless)
    const sr = Math.round(30 + (1 - blueF) * 200)
    const sg = Math.round(110 + (1 - blueF) * 130)
    ctx.fillStyle = `rgba(${sr}, ${sg}, 255, ${0.3 + blueF * 0.55})`
    ctx.fillRect(TX, TY + 28, TW, TH - 28)

    // Test tube glass
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 3
    ctx.strokeRect(TX, TY, TW, TH)

    // Tube stopper (top)
    ctx.fillStyle = '#f97316'
    ctx.fillRect(TX + 10, TY - 12, TW - 20, 14)

    // Tube label
    ctx.fillStyle = '#1e293b'
    ctx.font = 'bold 12px Cairo, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('أنبوب الاختبار', TX + TW / 2, TY - 20)

    // Blue-intensity bar (left side)
    const bx = 22, by = 65, bw = 24, bh = 195
    ctx.fillStyle = '#e2e8f0'; ctx.fillRect(bx, by, bw, bh)
    ctx.fillStyle = `rgba(59,130,246,${0.25 + blueF * 0.75})`
    ctx.fillRect(bx, by + bh * (1 - blueF), bw, bh * blueF)
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5; ctx.strokeRect(bx, by, bw, bh)
    ctx.fillStyle = '#475569'; ctx.font = '10px Cairo, Arial'; ctx.textAlign = 'center'
    ctx.fillText('الأزرق', bx + bw / 2, by - 6)
    ctx.fillText(`${Math.round(sim.blue)}%`, bx + bw / 2, by + bh + 13)

    // Legend (right side)
    const lx = CW - 105, ly = 55
    const legendItems = [
      { color: '#16a34a', label: 'Y = خميرة' },
      { color: '#f97316', label: 'G = جلوكوز' },
      { color: '#ef4444', label: 'CO₂ ناتج' },
    ]
    ctx.font = '11px Cairo, Arial'; ctx.textAlign = 'left'
    legendItems.forEach(({ color, label }, i) => {
      ctx.fillStyle = color
      ctx.beginPath(); ctx.arc(lx, ly + i * 20, 5, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#334155'; ctx.fillText(label, lx + 10, ly + i * 20 + 4)
    })

    // Particles
    for (const p of psRef.current) {
      if (!p.active) continue
      ctx.beginPath()
      if (p.type === 'yeast') {
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2)
        ctx.fillStyle = '#16a34a'; ctx.fill()
        ctx.strokeStyle = '#15803d'; ctx.lineWidth = 1.5; ctx.stroke()
        ctx.fillStyle = '#fff'; ctx.font = 'bold 7px Arial'; ctx.textAlign = 'center'
        ctx.fillText('Y', p.x, p.y + 3)
      } else if (p.type === 'glucose') {
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#f97316'; ctx.fill()
        ctx.strokeStyle = '#c2410c'; ctx.lineWidth = 1; ctx.stroke()
        ctx.fillStyle = '#fff'; ctx.font = '6px Arial'; ctx.textAlign = 'center'
        ctx.fillText('G', p.x, p.y + 2)
      } else if (p.type === 'co2') {
        const a = p.alpha ?? 1
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(239,68,68,${a * 0.35})`; ctx.fill()
        ctx.strokeStyle = `rgba(239,68,68,${a})`; ctx.lineWidth = 1; ctx.stroke()
        ctx.fillStyle = `rgba(185,28,28,${a})`; ctx.font = '5px Arial'; ctx.textAlign = 'center'
        ctx.fillText('CO₂', p.x, p.y + 2)
      }
    }

    // Done overlay
    if (sim.blue <= 0) {
      ctx.fillStyle = 'rgba(34,197,94,0.88)'
      ctx.fillRect(TX + 14, TY + 95, TW - 28, 52)
      ctx.fillStyle = '#fff'; ctx.font = 'bold 15px Cairo, Arial'; ctx.textAlign = 'center'
      ctx.fillText('✓ اكتمل التلاشي!', TX + TW / 2, TY + 128)
      ctx.font = '11px Cairo, Arial'
      ctx.fillText(`الزمن: ${sim.time.toFixed(1)} ث`, TX + TW / 2, TY + 145)
    }

    // Timer
    ctx.fillStyle = '#334155'; ctx.font = '11px Cairo, Arial'; ctx.textAlign = 'right'
    ctx.fillText(`${sim.time.toFixed(1)} ث`, CW - 12, CH - 28)

    // ── UI sync (every 0.5 s) ────────────────────────────────────────────────
    if (sim.isRunning && sim.time - sim.lastUI >= 0.5) {
      sim.lastUI = sim.time
      setBlueUI(Math.round(sim.blue))
      setElapsed(Math.round(sim.time * 10) / 10)
      setChart(prev => [...prev, { t: Math.round(sim.time * 10) / 10, blue: Math.round(sim.blue) }])
      if (sim.blue <= 0) {
        sim.isRunning = false
        setIsRunning(false)
        setDone(true)
      }
    }

    rafRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [draw])

  useEffect(() => { simRef.current.isRunning = isRunning }, [isRunning])
  useEffect(() => { init() }, [init])

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4" dir="rtl">

      {/* Mode buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        <Button variant={mode === 'learning' ? 'default' : 'outline'} onClick={() => setMode('learning')} className="font-cairo">💡 التعلم</Button>
        <Button variant={mode === 'experiment' ? 'default' : 'outline'} onClick={() => setMode('experiment')} className="font-cairo">🔬 التجربة</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">

        {/* Canvas + Chart */}
        <div className="lg:col-span-2 space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-base">🧫 تنفس الخميرة — أزرق الميثيلين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl overflow-hidden border-2 border-blue-200">
                <canvas ref={canvasRef} width={CW} height={CH} className="w-full block" />
              </div>
              <div className="flex gap-2 mt-3 justify-center">
                <Button onClick={() => setIsRunning(r => !r)} disabled={done} className="gap-2 font-cairo">
                  {isRunning ? <><Pause size={16} weight="fill" />إيقاف</> : <><Play size={16} weight="fill" />تشغيل</>}
                </Button>
                <Button onClick={reset} variant="outline" className="gap-2 font-cairo">
                  <ArrowClockwise size={16} />إعادة ضبط
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm">📊 تراجع اللون الأزرق عبر الزمن</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }}
                    label={{ value: 'الزمن (ث)', position: 'insideBottomRight', offset: -5, style: { fontFamily: 'Cairo', fontSize: 10 } }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontFamily: 'Cairo', direction: 'rtl', fontSize: 11 }} />
                  <Line type="monotone" dataKey="blue" stroke="#3b82f6" strokeWidth={2} dot={false} name="شدة الأزرق %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="font-cairo text-sm">⚙️ التحكم</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {([
                { label: 'تركيز الجلوكوز', val: conc, unit: ' %', min: 0.5, max: 3, step: 0.5, fn: (v: number) => { setConc(v); concRef.current = v; reset() } },
                { label: 'درجة الحرارة', val: temp, unit: ' °C', min: 15, max: 40, step: 5, fn: (v: number) => { setTemp(v); tempRef.current = v; reset() } },
              ] as { label: string; val: number; unit: string; min: number; max: number; step: number; fn: (v: number) => void }[]).map(({ label, val, unit, min, max, step, fn }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-cairo font-semibold">{label}</label>
                    <Badge variant="secondary" className="font-cairo text-xs">{val}{unit}</Badge>
                  </div>
                  <Slider value={[val]} onValueChange={v => fn(v[0])} min={min} max={max} step={step} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="font-cairo text-sm">📈 القياسات</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'شدة اللون الأزرق', value: `${blueUI}%` },
                { label: 'الزمن المنقضي', value: `${elapsed} ث` },
                { label: 'تركيز الجلوكوز', value: `${conc}%` },
                { label: 'درجة الحرارة', value: `${temp}°C` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs font-cairo text-muted-foreground">{label}</span>
                  <Badge variant="outline" className="font-cairo text-xs">{value}</Badge>
                </div>
              ))}
              {done && (
                <div className="mt-1 p-2 bg-green-100 dark:bg-green-900/40 rounded text-xs font-cairo text-green-800 dark:text-green-200 font-bold text-center">
                  ✓ زمن التلاشي: {elapsed} ث
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="font-cairo text-sm">🎯 خطوات التجربة</CardTitle></CardHeader>
            <CardContent>
              <ol className="text-xs font-cairo space-y-1.5 text-muted-foreground">
                <li className="flex gap-2"><span className="text-primary font-bold">١</span>اضبط تركيز الجلوكوز</li>
                <li className="flex gap-2"><span className="text-primary font-bold">٢</span>شغّل وراقب اللون الأزرق</li>
                <li className="flex gap-2"><span className="text-primary font-bold">٣</span>سجّل زمن التلاشي الكامل</li>
                <li className="flex gap-2"><span className="text-primary font-bold">٤</span>كرّر بتركيزات مختلفة</li>
                <li className="flex gap-2"><span className="text-primary font-bold">٥</span>قارن تأثير الحرارة أيضاً</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Learning mode panels */}
      {mode === 'learning' && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm text-blue-700">🧪 المبدأ العلمي</CardTitle>
            </CardHeader>
            <CardContent className="font-cairo text-xs text-blue-900 dark:text-blue-200 space-y-2">
              <div className="bg-white dark:bg-blue-950 rounded p-2 border border-blue-200 font-mono text-center text-sm font-bold">
                C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP
              </div>
              <ul className="space-y-1">
                <li>• <span className="font-bold text-green-700">Y</span>: خلية خميرة — تتنفس وتستهلك الأكسجين</li>
                <li>• <span className="font-bold text-orange-600">G</span>: جزيء جلوكوز — وقود التنفس</li>
                <li>• عند التقاء Y+G → يُنتج CO₂ ويتلاشى الأزرق</li>
                <li>• معدل التلاشي ∝ تركيز الجلوكوز ودرجة الحرارة</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm text-green-700">❓ أسئلة تحليلية</CardTitle>
            </CardHeader>
            <CardContent className="font-cairo text-xs text-green-900 dark:text-green-200 space-y-1.5">
              <div>١. ما العلاقة بين تركيز الجلوكوز وزمن التلاشي؟</div>
              <div>٢. لماذا يُستخدم أزرق الميثيلين مؤشراً للتنفس؟</div>
              <div>٣. كيف تؤثر درجة الحرارة على سرعة التفاعل؟</div>
              <div>٤. ما المتغير المستقل في هذه التجربة؟</div>
              <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded font-semibold">
                الاستنتاج: ↑ جلوكوز → ↑ معدل التنفس → ↓ زمن التلاشي.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
