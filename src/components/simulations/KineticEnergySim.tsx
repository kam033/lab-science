import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, ArrowClockwise, ArrowSquareOut } from '@phosphor-icons/react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const CW = 560, CH = 320
const GROUND_Y = CH - 50
const G = 9.8

export function KineticEnergySim() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>()
  const simRef = useRef({ isRunning: false, time: 0, x: 80, y: 60, vx: 0, vy: 0 })
  const massRef = useRef(2)
  const heightRef = useRef(150)
  const frictionRef = useRef(0)

  const [mode, setMode] = useState<'learning' | 'experiment'>('learning')
  const [isRunning, setIsRunning] = useState(false)
  const [mass, setMass] = useState(2)
  const [height, setHeight] = useState(150)
  const [friction, setFriction] = useState(0)
  const [liveKE, setLiveKE] = useState(0)
  const [livePE, setLivePE] = useState(0)
  const [liveTotal, setLiveTotal] = useState(0)

  const getInitialPE = useCallback(() => massRef.current * G * (heightRef.current / 100), [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const sim = simRef.current
    const m = massRef.current
    const mu = frictionRef.current

    if (sim.isRunning) {
      const dt = 1 / 60
      sim.time += dt

      if (sim.y < GROUND_Y - 20) {
        // Falling
        sim.vy += G * dt * 60
        sim.y += sim.vy * dt
        if (sim.y >= GROUND_Y - 20) {
          sim.vy = -sim.vy * 0.7
          sim.y = GROUND_Y - 20
        }
      } else {
        // Rolling on ground
        sim.vx += (sim.vx > 0 ? -1 : 1) * mu * G * dt * 30
        sim.x += sim.vx * dt * 30
        if (Math.abs(sim.vx) < 0.01) sim.vx = 0
        if (sim.x > CW - 30) { sim.x = CW - 30; sim.vx = -sim.vx * 0.5 }
        if (sim.x < 30) { sim.x = 30; sim.vx = -sim.vx * 0.5 }
      }

      const currentH = Math.max(0, (GROUND_Y - 20 - sim.y) / 100)
      const v = Math.sqrt(Math.abs(sim.vy * sim.vy + sim.vx * sim.vx)) * 0.5
      const KE = 0.5 * m * v * v
      const PE = m * G * currentH
      const total = KE + PE
      setLiveKE(Math.round(KE * 100) / 100)
      setLivePE(Math.round(PE * 100) / 100)
      setLiveTotal(Math.round(total * 100) / 100)
    }

    // BG sky
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y)
    sky.addColorStop(0, '#0ea5e9')
    sky.addColorStop(1, '#bae6fd')
    ctx.fillStyle = sky; ctx.fillRect(0, 0, CW, GROUND_Y)

    // Ground
    ctx.fillStyle = '#16a34a'; ctx.fillRect(0, GROUND_Y, CW, CH - GROUND_Y)
    ctx.fillStyle = '#15803d'; ctx.fillRect(0, GROUND_Y, CW, 6)

    // Height indicator line
    const dropY = GROUND_Y - heightRef.current
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.setLineDash([6, 4])
    ctx.beginPath(); ctx.moveTo(50, dropY); ctx.lineTo(CW - 50, dropY); ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 12px Cairo,Arial'; ctx.textAlign = 'left'
    ctx.fillText(`h = ${(heightRef.current / 100).toFixed(1)} m`, 55, dropY - 6)

    // Height arrow
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(35, dropY); ctx.lineTo(35, GROUND_Y - 5); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(30, dropY + 8); ctx.lineTo(35, dropY); ctx.lineTo(40, dropY + 8); ctx.stroke()

    // Ball shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.beginPath(); ctx.ellipse(sim.x, GROUND_Y - 2, 18, 5, 0, 0, Math.PI * 2); ctx.fill()

    // Ball
    const ballGrad = ctx.createRadialGradient(sim.x - 5, sim.y - 5, 2, sim.x, sim.y, 18)
    ballGrad.addColorStop(0, '#60a5fa')
    ballGrad.addColorStop(1, '#1d4ed8')
    ctx.fillStyle = ballGrad
    ctx.beginPath(); ctx.arc(sim.x, sim.y, 18, 0, Math.PI * 2)
    ctx.fill(); ctx.strokeStyle = '#1e40af'; ctx.lineWidth = 2; ctx.stroke()

    ctx.fillStyle = '#fff'; ctx.font = `bold ${massRef.current >= 10 ? 9 : 11}px Cairo,Arial`; ctx.textAlign = 'center'
    ctx.fillText(`${massRef.current}kg`, sim.x, sim.y + 4)

    // Velocity arrow
    if (sim.isRunning && (Math.abs(sim.vx) > 0.1 || Math.abs(sim.vy) > 0.5)) {
      const spd = Math.hypot(sim.vx, sim.vy)
      const len = Math.min(50, spd * 3)
      const nx = sim.vx / (spd || 1), ny = sim.vy / (spd || 1)
      ctx.strokeStyle = '#10b981'; ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(sim.x, sim.y); ctx.lineTo(sim.x + nx * len, sim.y + ny * len); ctx.stroke()
      ctx.fillStyle = '#10b981'; ctx.beginPath()
      ctx.moveTo(sim.x + nx * len, sim.y + ny * len)
      ctx.lineTo(sim.x + nx * len - ny * 6 - nx * 8, sim.y + ny * len + nx * 6 - ny * 8)
      ctx.lineTo(sim.x + nx * len + ny * 6 - nx * 8, sim.y + ny * len - nx * 6 - ny * 8)
      ctx.fill()
    }

    // Energy HUD
    const initialPE = getInitialPE()
    const energyBars = [
      { label: 'KE', val: liveKE, max: initialPE, color: '#f59e0b' },
      { label: 'PE', val: livePE, max: initialPE, color: '#3b82f6' },
    ]
    energyBars.forEach((e, i) => {
      const bx = CW - 110, by = 12 + i * 38, bw = 95, bh = 28
      ctx.fillStyle = 'rgba(15,23,42,0.75)'; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 4); ctx.fill()
      const ratio = Math.min(1, initialPE > 0 ? e.val / initialPE : 0)
      ctx.fillStyle = e.color + '40'; ctx.fillRect(bx + 2, by + 2, (bw - 4) * ratio, bh - 4)
      ctx.fillStyle = e.color; ctx.font = 'bold 11px Cairo,Arial'; ctx.textAlign = 'center'
      ctx.fillText(`${e.label}: ${e.val.toFixed(1)} J`, bx + bw / 2, by + 18)
    })

    rafRef.current = requestAnimationFrame(draw)
  }, [getInitialPE, liveKE, livePE])

  useEffect(() => { rafRef.current = requestAnimationFrame(draw); return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) } }, [draw])
  useEffect(() => { simRef.current.isRunning = isRunning }, [isRunning])

  const reset = useCallback(() => {
    setIsRunning(false)
    const startY = GROUND_Y - heightRef.current
    simRef.current = { isRunning: false, time: 0, x: 80, y: Math.max(20, startY), vx: 3, vy: 0 }
    const PE0 = massRef.current * G * (heightRef.current / 100)
    setLiveKE(0); setLivePE(Math.round(PE0 * 100) / 100); setLiveTotal(Math.round(PE0 * 100) / 100)
  }, [])

  useEffect(() => { reset() }, [reset])

  const chartData = [
    { name: 'الطاقة الحركية KE', قيمة: liveKE },
    { name: 'الطاقة الكامنة PE', قيمة: livePE },
    { name: 'المجموع E', قيمة: liveTotal },
  ]

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex gap-2 justify-center flex-wrap">
        <Button variant={mode === 'learning' ? 'default' : 'outline'} onClick={() => setMode('learning')} className="font-cairo">💡 التعلم</Button>
        <Button variant={mode === 'experiment' ? 'default' : 'outline'} onClick={() => setMode('experiment')} className="font-cairo">🔬 التجربة</Button>
        <Button variant="outline" className="gap-2 font-cairo border-orange-400 text-orange-600 hover:bg-orange-50"
          onClick={() => window.open('https://phet.colorado.edu/sims/html/energy-skate-park/latest/energy-skate-park_all.html', '_blank')}>
          <ArrowSquareOut size={16} /> PhET — Energy Skate Park
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="font-cairo text-base">⚡ تحويل الطاقة — الحركية والكامنة</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-xl overflow-hidden border-2 border-blue-200">
                <canvas ref={canvasRef} width={CW} height={CH} className="w-full block" />
              </div>
              <div className="flex gap-2 mt-3 justify-center">
                <Button onClick={() => setIsRunning(r => !r)} className="gap-2 font-cairo">
                  {isRunning ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
                  {isRunning ? 'إيقاف' : 'إسقاط الكرة'}
                </Button>
                <Button onClick={reset} variant="outline" className="gap-2 font-cairo"><ArrowClockwise size={16} /> إعادة ضبط</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="font-cairo text-sm">📊 مخطط الطاقة (Joules)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontFamily: 'Cairo', fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontFamily: 'Cairo', direction: 'rtl', fontSize: 11 }} />
                  <Bar dataKey="قيمة" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="font-cairo text-sm">⚙️ التحكم</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {([
                { label: 'الكتلة', val: mass, unit: ' kg', min: 0.5, max: 10, step: 0.5, fn: (v: number) => { setMass(v); massRef.current = v; reset() } },
                { label: 'الارتفاع الابتدائي', val: height, unit: ' cm', min: 20, max: 250, step: 10, fn: (v: number) => { setHeight(v); heightRef.current = v; reset() } },
                { label: 'معامل الاحتكاك μ', val: friction, unit: '', min: 0, max: 0.6, step: 0.05, fn: (v: number) => { setFriction(v); frictionRef.current = v } },
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
                { label: 'الطاقة الحركية KE', value: `${liveKE} J`, hi: true },
                { label: 'الطاقة الكامنة PE', value: `${livePE} J` },
                { label: 'الطاقة الكلية E', value: `${liveTotal} J` },
                { label: 'PE ابتدائي (mgh)', value: `${getInitialPE().toFixed(2)} J` },
              ].map(({ label, value, hi }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs font-cairo text-muted-foreground">{label}</span>
                  <Badge variant={hi ? 'default' : 'outline'} className="font-cairo text-xs">{value}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="font-cairo text-sm">🎯 خطوات التجربة</CardTitle></CardHeader>
            <CardContent>
              <ol className="text-xs font-cairo space-y-1.5 text-muted-foreground">
                <li className="flex gap-2"><span className="text-primary font-bold">١</span> اضبط الكتلة والارتفاع</li>
                <li className="flex gap-2"><span className="text-primary font-bold">٢</span> لاحظ PE الابتدائي</li>
                <li className="flex gap-2"><span className="text-primary font-bold">٣</span> اسقط الكرة وراقب التحويل</li>
                <li className="flex gap-2"><span className="text-primary font-bold">٤</span> تحقق: KE + PE = ثابت</li>
                <li className="flex gap-2"><span className="text-primary font-bold">٥</span> جرّب الاحتكاك وشاهد الفرق</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {mode === 'learning' && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <CardHeader className="pb-2"><CardTitle className="font-cairo text-sm text-amber-700">📐 المعادلات</CardTitle></CardHeader>
            <CardContent className="space-y-2 font-cairo text-xs">
              <div className="bg-white dark:bg-amber-950 rounded p-2 border border-amber-200 font-mono text-center space-y-1">
                <div className="text-base font-bold text-amber-700">KE = ½mv²</div>
                <div className="text-base font-bold text-blue-700">PE = mgh</div>
                <div className="text-sm font-bold text-indigo-700">E = KE + PE = ثابت</div>
              </div>
              <ul className="space-y-1 text-amber-900 dark:text-amber-200">
                <li>• في الأعلى: كل الطاقة كامنة (KE=0)</li>
                <li>• في الأسفل: كل الطاقة حركية (PE=0)</li>
                <li>• المجموع يبقى ثابتاً (بدون احتكاك)</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="pb-2"><CardTitle className="font-cairo text-sm text-green-700">❓ أسئلة تحليلية</CardTitle></CardHeader>
            <CardContent className="space-y-1.5 text-xs font-cairo text-green-900 dark:text-green-200">
              <div>١. ما الطاقة السائدة في الأعلى؟ وفي الأسفل؟</div>
              <div>٢. كيف تؤثر الكتلة على كل من KE وPE؟</div>
              <div>٣. هل يتغير مجموع الطاقة مع الارتفاع؟</div>
              <div>٤. ما تأثير الاحتكاك على الطاقة الكلية؟</div>
              <div>٥. كيف نحسب سرعة الكرة عند الأسفل؟</div>
              <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded font-semibold">
                الاستنتاج: الطاقة تتحول من كامنة لحركية لكن مجموعها يبقى ثابتاً (انحفاظ الطاقة).
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
