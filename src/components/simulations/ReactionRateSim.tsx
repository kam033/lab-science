import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, ArrowClockwise } from '@phosphor-icons/react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  type: 'hcl' | 'co2'
  life: number   // CO2 only: frames until disappear
  alpha: number  // CO2 only: fade value
}

interface SimState {
  isRunning: boolean
  time: number          // seconds
  collisions: number
  lastUIUpdate: number  // seconds
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CW = 560   // canvas width
const CH = 360   // canvas height
const MARBLE_H = 70
const MARBLE_Y = CH - MARBLE_H
const HCL_RADIUS = 6
const CO2_RADIUS = 5
const BASE_SPEED = 1.8

// ─── Physics helpers ──────────────────────────────────────────────────────────

function particleCount(conc: number) {
  return Math.round(conc * 18)   // 0.5M → 9  |  2.5M → 45
}

function particleSpeed(conc: number, temp: number) {
  const tempFactor = 1 + (temp - 25) / 60
  return BASE_SPEED * Math.sqrt(conc) * tempFactor
}

function makeHCL(conc: number, temp: number): Particle {
  const spd = particleSpeed(conc, temp)
  const angle = Math.random() * Math.PI * 2
  return {
    x: HCL_RADIUS + Math.random() * (CW - HCL_RADIUS * 2),
    y: HCL_RADIUS + Math.random() * (MARBLE_Y - HCL_RADIUS * 2 - 20),
    vx: Math.cos(angle) * spd,
    vy: Math.sin(angle) * spd,
    type: 'hcl',
    life: 0,
    alpha: 1,
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReactionRateSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const simRef = useRef<SimState>({
    isRunning: false, time: 0, collisions: 0, lastUIUpdate: 0,
  })
  const concRef = useRef(1.0)
  const tempRef = useRef(25)

  const [mode, setMode] = useState<'learning' | 'experiment'>('learning')
  const [isRunning, setIsRunning] = useState(false)
  const [concentration, setConcentration] = useState(1.0)
  const [temperature, setTemperature] = useState(25)
  const [collisionCount, setCollisionCount] = useState(0)
  const [reactionRate, setReactionRate] = useState(0)
  const [totalCo2, setTotalCo2] = useState(0)
  const [chartData, setChartData] = useState<{ t: number; co2: number }[]>([{ t: 0, co2: 0 }])

  // ── Draw one frame ──────────────────────────────────────────────────────────

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const sim = simRef.current
    const conc = concRef.current
    const temp = tempRef.current

    // ── Physics update ──────────────────────────────────────────────────────
    if (sim.isRunning) {
      sim.time += 1 / 60

      const spd = particleSpeed(conc, temp)

      particlesRef.current = particlesRef.current
        .map(p => {
          if (p.type === 'co2') {
            const life = p.life - 1
            if (life <= 0) return null as unknown as Particle
            return {
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              vy: p.vy - 0.04,   // buoyancy
              life,
              alpha: life / 90,
            }
          }

          // HCl particle
          let { x, y, vx, vy } = p
          x += vx
          y += vy

          // Wall bounces
          if (x - HCL_RADIUS < 0)  { x = HCL_RADIUS; vx = Math.abs(vx) }
          if (x + HCL_RADIUS > CW) { x = CW - HCL_RADIUS; vx = -Math.abs(vx) }
          if (y - HCL_RADIUS < 0)  { y = HCL_RADIUS; vy = Math.abs(vy) }

          // Marble collision → reaction
          if (y + HCL_RADIUS >= MARBLE_Y) {
            y = MARBLE_Y - HCL_RADIUS
            vy = -Math.abs(vy)
            sim.collisions++

            // Spawn CO2 bubble
            particlesRef.current.push({
              x, y: MARBLE_Y - CO2_RADIUS,
              vx: (Math.random() - 0.5) * 0.8,
              vy: -(0.8 + Math.random() * 0.6),
              type: 'co2', life: 90, alpha: 1,
            })
          }

          // Keep speed constant (no energy loss except reaction)
          const curSpd = Math.hypot(vx, vy)
          if (curSpd > 0) {
            vx = (vx / curSpd) * spd
            vy = (vy / curSpd) * spd
          }

          return { ...p, x, y, vx, vy }
        })
        .filter(Boolean)
    }

    // ── Render ──────────────────────────────────────────────────────────────

    // Background (solution)
    ctx.fillStyle = '#e0f2fe'
    ctx.fillRect(0, 0, CW, CH)

    // Solution color deepens with concentration
    const alpha = Math.min(0.35, (concRef.current - 0.5) / 6)
    ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`
    ctx.fillRect(0, 0, CW, MARBLE_Y)

    // Marble (CaCO₃)
    const grad = ctx.createLinearGradient(0, MARBLE_Y, 0, CH)
    grad.addColorStop(0, '#e2e8f0')
    grad.addColorStop(1, '#94a3b8')
    ctx.fillStyle = grad
    ctx.fillRect(0, MARBLE_Y, CW, MARBLE_H)

    // Marble texture lines
    ctx.strokeStyle = 'rgba(148,163,184,0.5)'
    ctx.lineWidth = 1
    for (let i = 0; i < CW; i += 40) {
      ctx.beginPath()
      ctx.moveTo(i, MARBLE_Y)
      ctx.lineTo(i + 20, CH)
      ctx.stroke()
    }

    // Marble label
    ctx.fillStyle = '#475569'
    ctx.font = 'bold 14px Cairo, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('CaCO₃  (رخام كربونات الكالسيوم)', CW / 2, MARBLE_Y + MARBLE_H / 2 + 5)

    // Beaker border
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 3
    ctx.strokeRect(0, 0, CW, CH)

    // HCl label top-left
    ctx.fillStyle = '#1e40af'
    ctx.font = '13px Cairo, Arial, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`HCl  ${concRef.current.toFixed(1)} M`, 10, 20)

    // Draw particles
    particlesRef.current.forEach(p => {
      ctx.beginPath()
      if (p.type === 'hcl') {
        ctx.arc(p.x, p.y, HCL_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = '#3b82f6'
        ctx.fill()
        ctx.strokeStyle = '#1d4ed8'
        ctx.lineWidth = 1.5
        ctx.stroke()
        // H⁺ label
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 7px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('H⁺', p.x, p.y + 3)
      } else {
        // CO₂ bubble
        ctx.arc(p.x, p.y, CO2_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(239, 68, 68, ${p.alpha * 0.5})`
        ctx.fill()
        ctx.strokeStyle = `rgba(239, 68, 68, ${p.alpha})`
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.fillStyle = `rgba(239,68,68,${p.alpha})`
        ctx.font = 'bold 6px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('CO₂', p.x, p.y + 2)
      }
    })

    // Collision flash near marble surface
    if (sim.isRunning) {
      const flashCount = particlesRef.current.filter(
        p => p.type === 'hcl' && Math.abs(p.y + HCL_RADIUS - MARBLE_Y) < 5
      ).length
      if (flashCount > 0) {
        ctx.fillStyle = `rgba(251, 191, 36, ${Math.min(0.3, flashCount * 0.1)})`
        ctx.fillRect(0, MARBLE_Y - 10, CW, 10)
      }
    }

    // ── Update React state every 0.5s ──────────────────────────────────────
    if (sim.isRunning && sim.time - sim.lastUIUpdate >= 0.5) {
      sim.lastUIUpdate = sim.time
      const rate = sim.time > 0 ? sim.collisions / sim.time : 0
      const co2vol = sim.collisions * 0.5
      setCollisionCount(sim.collisions)
      setReactionRate(Math.round(rate * 10) / 10)
      setTotalCo2(Math.round(co2vol * 10) / 10)
      setChartData(prev => [
        ...prev,
        { t: Math.round(sim.time * 10) / 10, co2: Math.round(co2vol * 10) / 10 },
      ])
    }

    rafRef.current = requestAnimationFrame(draw)
  }, [])

  // ── Start / stop animation loop ────────────────────────────────────────────

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [draw])

  // ── Sync isRunning to ref ──────────────────────────────────────────────────

  useEffect(() => {
    simRef.current.isRunning = isRunning
  }, [isRunning])

  // ── Init particles on mount ────────────────────────────────────────────────

  useEffect(() => {
    const count = particleCount(concentration)
    particlesRef.current = Array.from({ length: count }, () =>
      makeHCL(concentration, temperature)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleConcentrationChange = (val: number[]) => {
    const c = val[0]
    setConcentration(c)
    concRef.current = c
    // Rebuild HCl particles, keep CO2 bubbles
    const count = particleCount(c)
    const co2 = particlesRef.current.filter(p => p.type === 'co2')
    const hcl = Array.from({ length: count }, () => makeHCL(c, tempRef.current))
    particlesRef.current = [...hcl, ...co2]
  }

  const handleTemperatureChange = (val: number[]) => {
    const t = val[0]
    setTemperature(t)
    tempRef.current = t
    // Adjust HCl speeds
    const spd = particleSpeed(concRef.current, t)
    particlesRef.current = particlesRef.current.map(p => {
      if (p.type !== 'hcl') return p
      const curSpd = Math.hypot(p.vx, p.vy) || 1
      return { ...p, vx: (p.vx / curSpd) * spd, vy: (p.vy / curSpd) * spd }
    })
  }

  const reset = () => {
    setIsRunning(false)
    simRef.current = { isRunning: false, time: 0, collisions: 0, lastUIUpdate: 0 }
    setCollisionCount(0)
    setReactionRate(0)
    setTotalCo2(0)
    setChartData([{ t: 0, co2: 0 }])
    const count = particleCount(concRef.current)
    particlesRef.current = Array.from({ length: count }, () =>
      makeHCL(concRef.current, tempRef.current)
    )
  }

  // ── Concentration color ────────────────────────────────────────────────────

  const concColor =
    concentration <= 1 ? '#22c55e' :
    concentration <= 1.5 ? '#f59e0b' :
    concentration <= 2 ? '#ef4444' : '#7c3aed'

  // ─── JSX ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4" dir="rtl">

      {/* Mode toggle */}
      <div className="flex gap-2 justify-center">
        <Button
          variant={mode === 'learning' ? 'default' : 'outline'}
          onClick={() => setMode('learning')}
          className="font-cairo"
        >
          💡 وضع التعلم
        </Button>
        <Button
          variant={mode === 'experiment' ? 'default' : 'outline'}
          onClick={() => setMode('experiment')}
          className="font-cairo"
        >
          🔬 وضع التجربة
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">

        {/* ── Canvas ── */}
        <div className="lg:col-span-2 space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-base flex items-center gap-2">
                🧪 منطقة المحاكاة — تصادم جزيئات HCl مع كربونات الكالسيوم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl overflow-hidden border-2 border-slate-300 shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={CW}
                  height={CH}
                  className="w-full block"
                  style={{ imageRendering: 'auto' }}
                />
              </div>

              {/* Playback controls */}
              <div className="flex gap-2 mt-3 justify-center">
                <Button
                  onClick={() => setIsRunning(r => !r)}
                  className="gap-2 font-cairo"
                >
                  {isRunning ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
                  {isRunning ? 'إيقاف' : 'تشغيل'}
                </Button>
                <Button onClick={reset} variant="outline" className="gap-2 font-cairo">
                  <ArrowClockwise size={16} />
                  إعادة ضبط
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── Chart ── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm">📊 حجم CO₂ المنتج بمرور الزمن</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="t"
                    label={{ value: 'الزمن (s)', position: 'insideBottom', offset: -2, style: { fontFamily: 'Cairo' } }}
                    tick={{ fontFamily: 'Cairo', fontSize: 11 }}
                  />
                  <YAxis
                    label={{ value: 'CO₂ (mL)', angle: -90, position: 'insideLeft', style: { fontFamily: 'Cairo' } }}
                    tick={{ fontFamily: 'Cairo', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ fontFamily: 'Cairo', direction: 'rtl', fontSize: 12 }}
                    formatter={(v: number) => [`${v} mL`, 'حجم CO₂']}
                    labelFormatter={l => `الزمن: ${l}s`}
                  />
                  <ReferenceLine y={0} stroke="#94a3b8" />
                  <Line
                    type="monotone"
                    dataKey="co2"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── Controls ── */}
        <div className="space-y-3">

          {/* Concentration */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm">⚗️ المتغير المستقل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-cairo font-semibold">تركيز HCl</label>
                  <Badge
                    className="font-cairo font-bold text-white"
                    style={{ backgroundColor: concColor }}
                  >
                    {concentration.toFixed(1)} M
                  </Badge>
                </div>
                <Slider
                  value={[concentration]}
                  onValueChange={handleConcentrationChange}
                  min={0.5} max={2.5} step={0.1}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1 font-cairo">
                  <span>0.5 M (مخفف)</span>
                  <span>2.5 M (مركّز)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-cairo font-semibold">درجة الحرارة</label>
                  <Badge variant="secondary" className="font-cairo">
                    {temperature} °C
                  </Badge>
                </div>
                <Slider
                  value={[temperature]}
                  onValueChange={handleTemperatureChange}
                  min={20} max={80} step={5}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1 font-cairo">
                  <span>20°C</span>
                  <span>80°C</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live readings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm">📈 القياسات المباشرة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'عدد التصادمات', value: collisionCount, unit: 'تصادم' },
                { label: 'معدل التفاعل', value: reactionRate, unit: 'تصادم/s' },
                { label: 'حجم CO₂ المنتج', value: totalCo2, unit: 'mL' },
                { label: 'عدد جزيئات HCl', value: particleCount(concentration), unit: 'جزيء' },
              ].map(({ label, value, unit }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs font-cairo text-muted-foreground">{label}</span>
                  <Badge variant="outline" className="font-cairo font-bold text-xs">
                    {value} {unit}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Color legend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm">🎨 دليل الألوان</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { color: '#3b82f6', label: 'جزيئات HCl (H⁺ + Cl⁻)' },
                { color: '#ef4444', label: 'فقاعات CO₂ (ناتج التفاعل)' },
                { color: '#94a3b8', label: 'CaCO₃ (سطح الرخام)' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-xs font-cairo">{label}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Learning mode card ── */}
      {mode === 'learning' && (
        <Card className="border-green-300 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="font-cairo text-base text-green-800 dark:text-green-300">
              📚 الشرح العلمي — نظرية التصادم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-cairo text-sm">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold mb-2 text-green-800 dark:text-green-300">🎯 الهدف:</h4>
                <p className="text-green-900 dark:text-green-200">
                  دراسة تأثير تركيز حمض الهيدروكلوريك على معدل تفاعله مع كربونات الكالسيوم
                  وقياس كمية غاز ثاني أكسيد الكربون المنتج.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2 text-green-800 dark:text-green-300">🧪 المعادلة:</h4>
                <div className="bg-white dark:bg-green-950 rounded p-2 font-mono text-xs text-center border border-green-200">
                  2HCl + CaCO₃ → CaCl₂ + H₂O + CO₂↑
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-2 text-green-800 dark:text-green-300">👁️ ماذا تلاحظ؟</h4>
              <ul className="space-y-1 list-inside text-green-900 dark:text-green-200">
                <li>• عند <strong>زيادة التركيز</strong>: يزيد عدد الجزيئات → تصادمات أكثر → تفاعل أسرع</li>
                <li>• عند <strong>زيادة الحرارة</strong>: تزيد سرعة الجزيئات → تصادمات بطاقة أعلى</li>
                <li>• الفقاعات الحمراء هي CO₂ الناتج من كل تصادم ناجح مع الرخام</li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded p-3 border border-yellow-200">
              <h4 className="font-bold mb-1 text-yellow-800 dark:text-yellow-300">
                📐 معادلة سرعة التفاعل (قانون السرعة):
              </h4>
              <div className="font-mono text-center text-lg my-2">
                Rate = k · [HCl]ⁿ
              </div>
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                حيث k = ثابت السرعة، [HCl] = التركيز، n = رتبة التفاعل
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-2 text-green-800 dark:text-green-300">📊 المتغيرات:</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded p-2 border border-blue-200">
                  <div className="font-bold text-blue-700 dark:text-blue-300 mb-1">المستقل:</div>
                  <div>تركيز HCl</div>
                </div>
                <div className="bg-red-50 dark:bg-red-950/30 rounded p-2 border border-red-200">
                  <div className="font-bold text-red-700 dark:text-red-300 mb-1">التابع:</div>
                  <div>معدل إنتاج CO₂</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 border border-gray-200">
                  <div className="font-bold text-gray-700 dark:text-gray-300 mb-1">الثابتة:</div>
                  <div>الحرارة، كتلة الرخام</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
