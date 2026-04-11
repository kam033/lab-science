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
const CW = 560, CH = 380
const WATER_Y  = 90          // water surface
const PLANT_CX = 280         // plant center x
const PLANT_BOT = CH - 20   // plant root y
const PLANT_TOP = 165        // highest leaf y
const LEAF_R   = 85          // leaf zone collision radius

// ─── Types ────────────────────────────────────────────────────────────────────
interface Photon {
  x: number; y: number; vx: number; vy: number; active: boolean
}
interface Bubble {
  x: number; y: number; r: number; vy: number; alpha: number; active: boolean
}
interface CO2Mol {
  x: number; y: number; vx: number; vy: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function spawnPhoton(lightPct: number): Photon {
  return {
    x: 30 + Math.random() * (CW - 60),
    y: -8,
    vx: (Math.random() - 0.5) * 0.4,
    vy: 1.2 + (lightPct / 100) * 1.2,
    active: true,
  }
}

function spawnCO2(): CO2Mol {
  return {
    x: TX() + Math.random() * (CW - 2 * TX()),
    y: WATER_Y + 20 + Math.random() * (CH - WATER_Y - 40),
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
  }
}
function TX() { return 25 }

const co2N = (conc: number) => Math.round(conc * 7)

// ─── Plant draw helper (called each frame) ───────────────────────────────────
function drawPlant(ctx: CanvasRenderingContext2D, t: number) {
  const sway = Math.sin(t * 0.6) * 3

  // Stem
  ctx.strokeStyle = '#15803d'
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(PLANT_CX, PLANT_BOT)
  ctx.quadraticCurveTo(PLANT_CX + sway * 2, (PLANT_BOT + PLANT_TOP) / 2, PLANT_CX + sway, PLANT_TOP)
  ctx.stroke()

  // Leaf pairs
  const pairs = [
    { y: PLANT_BOT - 50,  ew: 30, eh: 11, spread: 28 },
    { y: PLANT_BOT - 100, ew: 32, eh: 12, spread: 30 },
    { y: PLANT_BOT - 145, ew: 28, eh: 10, spread: 26 },
    { y: PLANT_BOT - 185, ew: 24, eh: 9,  spread: 22 },
    { y: PLANT_BOT - 218, ew: 20, eh: 8,  spread: 18 },
  ]

  ctx.fillStyle = '#16a34a'
  for (const { y, ew, eh, spread } of pairs) {
    const sw = sway * 0.6
    // Left leaf
    ctx.save()
    ctx.translate(PLANT_CX - spread + sw, y)
    ctx.rotate(-Math.PI / 5 + sw * 0.02)
    ctx.beginPath()
    ctx.ellipse(0, 0, ew, eh, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    // Right leaf
    ctx.save()
    ctx.translate(PLANT_CX + spread + sw, y)
    ctx.rotate(Math.PI / 5 + sw * 0.02)
    ctx.beginPath()
    ctx.ellipse(0, 0, ew, eh, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // Root
  ctx.fillStyle = '#92400e'
  ctx.beginPath()
  ctx.ellipse(PLANT_CX, PLANT_BOT, 18, 7, 0, 0, Math.PI * 2)
  ctx.fill()
}

// ─── Component ────────────────────────────────────────────────────────────────
export function PhotosynthesisSim() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const rafRef     = useRef<number>()
  const photonsRef = useRef<Photon[]>([])
  const bubblesRef = useRef<Bubble[]>([])
  const co2Ref     = useRef<CO2Mol[]>([])
  const simRef     = useRef({ isRunning: false, time: 0, o2: 0, lastUI: 0 })
  const lightRef   = useRef(50)
  const concRef    = useRef(2)

  const [mode, setMode]         = useState<'learning' | 'experiment'>('learning')
  const [isRunning, setIsRunning] = useState(false)
  const [light, setLight]       = useState(50)
  const [co2Conc, setCo2Conc]   = useState(2)
  const [o2UI, setO2UI]         = useState(0)
  const [rateUI, setRateUI]     = useState(0)
  const [elapsed, setElapsed]   = useState(0)
  const [chart, setChart]       = useState<{ t: number; o2: number }[]>([{ t: 0, o2: 0 }])

  const lastO2Ref = useRef(0)

  const initCO2 = useCallback(() => {
    co2Ref.current = Array.from({ length: co2N(concRef.current) }, spawnCO2)
  }, [])

  const reset = useCallback(() => {
    setIsRunning(false)
    setO2UI(0); setRateUI(0); setElapsed(0)
    setChart([{ t: 0, o2: 0 }])
    photonsRef.current = []
    bubblesRef.current = []
    lastO2Ref.current  = 0
    simRef.current = { isRunning: false, time: 0, o2: 0, lastUI: 0 }
    initCO2()
  }, [initCO2])

  // ── Draw loop ───────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const sim = simRef.current

    // ── Physics ─────────────────────────────────────────────────────────────
    if (sim.isRunning) {
      sim.time += 1 / 60
      const L = lightRef.current
      const C = concRef.current

      // Spawn photons based on light intensity
      if (Math.random() < (L / 100) * 0.18) {
        photonsRef.current.push(spawnPhoton(L))
      }

      // Update photons
      const newBubbles: Bubble[] = []
      photonsRef.current = photonsRef.current.map(ph => {
        if (!ph.active) return ph
        let { x, y, vx, vy } = ph
        // Refract at water surface (slow down)
        if (y > WATER_Y) vy = Math.min(vy, 0.9)
        x += vx; y += vy
        if (x < 0 || x > CW || y > CH) return { ...ph, active: false }

        // Check leaf-zone collision
        const dy = y - PLANT_TOP
        if (y >= PLANT_TOP - 30 && Math.hypot(x - PLANT_CX, dy) < LEAF_R) {
          const reactionProb = (C / 5) * 0.055
          if (Math.random() < reactionProb) {
            sim.o2 += 0.5
            newBubbles.push({
              x: x + (Math.random() - 0.5) * 22,
              y,
              r: 3 + Math.random() * 3,
              vy: -(0.45 + Math.random() * 0.35),
              alpha: 0.9,
              active: true,
            })
            return { ...ph, active: false }
          }
        }
        return { ...ph, x, y, vx, vy }
      }).filter(ph => ph.active)

      // Update O2 bubbles
      bubblesRef.current = [
        ...bubblesRef.current.map(b => {
          const y = b.y + b.vy
          const alpha = b.y < WATER_Y ? b.alpha - 0.04 : b.alpha - 0.005
          if (alpha <= 0) return { ...b, active: false }
          return { ...b, y, alpha }
        }).filter(b => b.active),
        ...newBubbles,
      ]

      // Update CO2 molecules (drift, maintain count)
      co2Ref.current = co2Ref.current.map(c => {
        let { x, y, vx, vy } = c
        x += vx; y += vy
        if (x < 20 || x > CW - 20) vx = -vx
        if (y < WATER_Y + 10 || y > CH - 20) vy = -vy
        return { x, y, vx, vy }
      })
      if (co2Ref.current.length < co2N(concRef.current)) {
        co2Ref.current.push(spawnCO2())
      }
    }

    // ── Render ──────────────────────────────────────────────────────────────
    const t = sim.time

    // Sky / light source
    const skyGrad = ctx.createLinearGradient(0, 0, 0, WATER_Y)
    const li = lightRef.current
    skyGrad.addColorStop(0, `rgba(255, ${200 + Math.round(li * 0.5)}, ${100 + Math.round(li)}, 0.95)`)
    skyGrad.addColorStop(1, '#fef9c3')
    ctx.fillStyle = skyGrad
    ctx.fillRect(0, 0, CW, WATER_Y)

    // Water body
    const waterGrad = ctx.createLinearGradient(0, WATER_Y, 0, CH)
    waterGrad.addColorStop(0, '#bfdbfe')
    waterGrad.addColorStop(1, '#60a5fa')
    ctx.fillStyle = waterGrad
    ctx.fillRect(0, WATER_Y, CW, CH - WATER_Y)

    // Water surface shimmer
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    for (let wx = 0; wx < CW; wx += 40) {
      const sx = wx + Math.sin(t * 2 + wx * 0.1) * 6
      ctx.beginPath()
      ctx.ellipse(sx, WATER_Y, 18, 3, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    // Light rays (background)
    if (li > 5) {
      const rays = [80, 200, 280, 360, 480]
      for (const rx of rays) {
        const grad = ctx.createLinearGradient(rx, 0, rx + 40, WATER_Y)
        grad.addColorStop(0, `rgba(253,224,71,${li / 400})`)
        grad.addColorStop(1, 'rgba(253,224,71,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.moveTo(rx, 0); ctx.lineTo(rx + 40, 0); ctx.lineTo(rx + 60, WATER_Y); ctx.lineTo(rx - 10, WATER_Y)
        ctx.closePath(); ctx.fill()
      }
    }

    // CO2 molecules (small dark-red dots)
    ctx.fillStyle = 'rgba(153,27,27,0.55)'
    for (const c of co2Ref.current) {
      ctx.beginPath(); ctx.arc(c.x, c.y, 3, 0, Math.PI * 2); ctx.fill()
    }

    // Plant
    drawPlant(ctx, t)

    // O2 bubbles
    for (const b of bubblesRef.current) {
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${b.alpha * 0.55})`; ctx.fill()
      ctx.strokeStyle = `rgba(147,197,253,${b.alpha})`; ctx.lineWidth = 1; ctx.stroke()
      if (b.r > 4 && b.alpha > 0.4) {
        ctx.fillStyle = `rgba(59,130,246,${b.alpha * 0.8})`
        ctx.font = '5px Arial'; ctx.textAlign = 'center'
        ctx.fillText('O₂', b.x, b.y + 2)
      }
    }

    // Photon particles
    for (const ph of photonsRef.current) {
      ctx.beginPath()
      ctx.arc(ph.x, ph.y, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#fde047'; ctx.fill()
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.2; ctx.stroke()
      // Glow
      ctx.beginPath()
      ctx.arc(ph.x, ph.y, 9, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(253,224,71,0.18)'; ctx.fill()
    }

    // Beaker outline
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 3
    ctx.strokeRect(1, WATER_Y, CW - 2, CH - WATER_Y - 1)

    // Labels
    ctx.fillStyle = '#1e3a8a'; ctx.font = '12px Cairo, Arial, sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('نبات مائي (إيلوديا)', PLANT_CX, CH - 6)
    ctx.fillStyle = '#78350f'; ctx.font = '11px Cairo, Arial'
    ctx.fillText('↓ فوتون (ضوء)', CW / 2 + 80, WATER_Y - 8)
    ctx.fillStyle = '#1d4ed8'
    ctx.fillText('↑ O₂', PLANT_CX - 70, WATER_Y - 8)

    // O2 counter HUD
    ctx.fillStyle = 'rgba(15,23,42,0.75)'
    ctx.beginPath(); ctx.roundRect(CW - 130, 5, 125, 36, 5); ctx.fill()
    ctx.fillStyle = '#86efac'; ctx.font = 'bold 12px Cairo, Arial'; ctx.textAlign = 'center'
    ctx.fillText(`O₂: ${sim.o2.toFixed(1)} وحدة`, CW - 67, 28)

    // Timer
    ctx.fillStyle = 'rgba(15,23,42,0.6)'
    ctx.beginPath(); ctx.roundRect(5, 5, 80, 26, 4); ctx.fill()
    ctx.fillStyle = '#e2e8f0'; ctx.font = '11px Cairo, Arial'; ctx.textAlign = 'center'
    ctx.fillText(`${t.toFixed(1)} ث`, 45, 22)

    // ── UI sync ──────────────────────────────────────────────────────────────
    if (sim.isRunning && t - sim.lastUI >= 0.5) {
      sim.lastUI = t
      const rate = Math.round((sim.o2 - lastO2Ref.current) * 2 * 10) / 10  // per second
      lastO2Ref.current = sim.o2
      setO2UI(Math.round(sim.o2 * 10) / 10)
      setRateUI(rate)
      setElapsed(Math.round(t * 10) / 10)
      setChart(prev => [...prev, { t: Math.round(t * 10) / 10, o2: Math.round(sim.o2 * 10) / 10 }])
    }

    rafRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [draw])

  useEffect(() => { simRef.current.isRunning = isRunning }, [isRunning])
  useEffect(() => { initCO2() }, [initCO2])

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4" dir="rtl">

      <div className="flex gap-2 justify-center flex-wrap">
        <Button variant={mode === 'learning' ? 'default' : 'outline'} onClick={() => setMode('learning')} className="font-cairo">💡 التعلم</Button>
        <Button variant={mode === 'experiment' ? 'default' : 'outline'} onClick={() => setMode('experiment')} className="font-cairo">🔬 التجربة</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">

        {/* Canvas + Chart */}
        <div className="lg:col-span-2 space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-base">🌿 التمثيل الضوئي — فوتونات + ورق إيلوديا</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl overflow-hidden border-2 border-green-200">
                <canvas ref={canvasRef} width={CW} height={CH} className="w-full block" />
              </div>
              <div className="flex gap-2 mt-3 justify-center">
                <Button onClick={() => setIsRunning(r => !r)} className="gap-2 font-cairo">
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
              <CardTitle className="font-cairo text-sm">📊 إنتاج الأكسجين عبر الزمن</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }}
                    label={{ value: 'الزمن (ث)', position: 'insideBottomRight', offset: -5, style: { fontFamily: 'Cairo', fontSize: 10 } }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontFamily: 'Cairo', direction: 'rtl', fontSize: 11 }} />
                  <Line type="monotone" dataKey="o2" stroke="#22c55e" strokeWidth={2} dot={false} name="O₂ (وحدة)" />
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
                { label: 'شدة الضوء', val: light, unit: '%', min: 0, max: 100, step: 10,
                  fn: (v: number) => { setLight(v); lightRef.current = v } },
                { label: 'تركيز CO₂', val: co2Conc, unit: '%', min: 0.5, max: 5, step: 0.5,
                  fn: (v: number) => { setCo2Conc(v); concRef.current = v } },
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
                { label: 'O₂ المنتج', value: `${o2UI} وحدة` },
                { label: 'معدل الإنتاج', value: `${rateUI} و/ث` },
                { label: 'الزمن المنقضي', value: `${elapsed} ث` },
                { label: 'شدة الضوء', value: `${light}%` },
                { label: 'تركيز CO₂', value: `${co2Conc}%` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs font-cairo text-muted-foreground">{label}</span>
                  <Badge variant="outline" className="font-cairo text-xs">{value}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="font-cairo text-sm">🎯 خطوات التجربة</CardTitle></CardHeader>
            <CardContent>
              <ol className="text-xs font-cairo space-y-1.5 text-muted-foreground">
                <li className="flex gap-2"><span className="text-primary font-bold">١</span>اضبط شدة الضوء</li>
                <li className="flex gap-2"><span className="text-primary font-bold">٢</span>شغّل وعدّ فقاعات O₂</li>
                <li className="flex gap-2"><span className="text-primary font-bold">٣</span>سجّل معدل الإنتاج</li>
                <li className="flex gap-2"><span className="text-primary font-bold">٤</span>غيّر تركيز CO₂ وقارن</li>
                <li className="flex gap-2"><span className="text-primary font-bold">٥</span>ما العامل المحدِّد للمعدل؟</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {mode === 'learning' && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm text-green-700">🌱 المعادلة الكيميائية</CardTitle>
            </CardHeader>
            <CardContent className="font-cairo text-xs text-green-900 dark:text-green-200 space-y-2">
              <div className="bg-white dark:bg-green-950 rounded p-2 border border-green-200 font-mono text-center text-sm font-bold">
                6CO₂ + 6H₂O + ضوء → C₆H₁₂O₆ + 6O₂
              </div>
              <ul className="space-y-1">
                <li>• الفوتونات (⬤ صفراء) تُطلق طاقة الضوء</li>
                <li>• CO₂ (• حمراء) يُمتص من الماء</li>
                <li>• كلاهما لازم لإنتاج O₂ (⬤ بيضاء)</li>
                <li>• زيادة الضوء أو CO₂ → ↑ معدل التمثيل</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm text-yellow-700">❓ أسئلة تحليلية</CardTitle>
            </CardHeader>
            <CardContent className="font-cairo text-xs text-yellow-900 dark:text-yellow-200 space-y-1.5">
              <div>١. كيف تؤثر شدة الضوء على عدد الفقاعات؟</div>
              <div>٢. ما دور CO₂ في عملية التمثيل الضوئي؟</div>
              <div>٣. ما العامل المحدِّد (المقيِّد) للعملية؟</div>
              <div>٤. ماذا يحدث عند خفض الضوء إلى 0؟</div>
              <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded font-semibold">
                الاستنتاج: ↑ ضوء و↑ CO₂ → ↑ إنتاج O₂ (حتى العامل المحدِّد).
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
