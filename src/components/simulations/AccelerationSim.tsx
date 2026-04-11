import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, ArrowClockwise, ArrowSquareOut } from '@phosphor-icons/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const CW = 560, CH = 320
const G = 9.8, SCALE = 55

interface DataPoint { t: number; v: number; s: number }

export function AccelerationSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>()
  const simRef = useRef({ isRunning: false, time: 0, vel: 0, pos: 0, lastData: 0 })
  const angleRef = useRef(30)
  const frictionRef = useRef(0)
  const massRef = useRef(1)

  const [mode, setMode] = useState<'learning' | 'experiment'>('learning')
  const [isRunning, setIsRunning] = useState(false)
  const [angle, setAngle] = useState(30)
  const [friction, setFriction] = useState(0)
  const [mass, setMass] = useState(1)
  const [liveV, setLiveV] = useState(0)
  const [data, setData] = useState<DataPoint[]>([])

  const getAccel = useCallback(() => {
    const rad = angleRef.current * Math.PI / 180
    return Math.max(0, G * (Math.sin(rad) - frictionRef.current * Math.cos(rad)))
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const sim = simRef.current
    const aRad = angleRef.current * Math.PI / 180
    const accel = getAccel()

    if (sim.isRunning) {
      const dt = 1 / 60
      sim.time += dt
      sim.vel = Math.max(0, sim.vel + accel * dt)
      sim.pos += sim.vel * dt
      if (sim.time - sim.lastData >= 0.25) {
        sim.lastData = sim.time
        setData(p => [...p.slice(-40), { t: +sim.time.toFixed(2), v: +sim.vel.toFixed(2), s: +sim.pos.toFixed(2) }])
      }
      setLiveV(+sim.vel.toFixed(2))
      const maxPos = (CW * 0.68) / Math.cos(aRad) / SCALE
      if (sim.pos >= maxPos) { sim.isRunning = false; setIsRunning(false) }
    }

    ctx.fillStyle = '#f0f9ff'; ctx.fillRect(0, 0, CW, CH)
    ctx.strokeStyle = 'rgba(148,163,184,0.18)'; ctx.lineWidth = 1
    for (let x = 0; x < CW; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke() }
    for (let y = 0; y < CH; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke() }

    const bX = 30, bY = CH - 30
    const pLen = CW * 0.72
    const tX = bX + pLen * Math.cos(aRad), tY = bY - pLen * Math.sin(aRad)
    ctx.beginPath(); ctx.moveTo(bX, bY); ctx.lineTo(tX, tY); ctx.lineTo(tX, bY); ctx.closePath()
    ctx.fillStyle = '#dbeafe'; ctx.fill()
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 3; ctx.stroke()

    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(bX, bY); ctx.lineTo(CW - 10, bY); ctx.stroke()

    ctx.beginPath(); ctx.arc(bX, bY, 45, -aRad, 0)
    ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([])
    ctx.fillStyle = '#7c3aed'; ctx.font = 'bold 13px Cairo,Arial'; ctx.textAlign = 'center'
    ctx.fillText(`${angleRef.current}°`, bX + 60, bY - 10)

    const distPx = Math.min(sim.pos * SCALE, pLen - 32)
    const bkX = bX + distPx * Math.cos(aRad), bkY = bY - distPx * Math.sin(aRad)
    const bw = 38, bh = 30
    ctx.save(); ctx.translate(bkX, bkY); ctx.rotate(-aRad)
    ctx.fillStyle = '#1d4ed8'; ctx.strokeStyle = '#1e40af'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.roundRect(-bw / 2, -bh, bw, bh, 5); ctx.fill(); ctx.stroke()
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Cairo,Arial'; ctx.textAlign = 'center'
    ctx.fillText(`${massRef.current}kg`, 0, -bh / 2 + 5)

    if (sim.vel > 0.05) {
      const aLen = Math.min(55, sim.vel * 12)
      ctx.strokeStyle = '#10b981'; ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(bw / 2, -bh / 2); ctx.lineTo(bw / 2 + aLen, -bh / 2); ctx.stroke()
      ctx.fillStyle = '#10b981'; ctx.beginPath()
      ctx.moveTo(bw / 2 + aLen, -bh / 2)
      ctx.lineTo(bw / 2 + aLen - 8, -bh / 2 - 5)
      ctx.lineTo(bw / 2 + aLen - 8, -bh / 2 + 5)
      ctx.fill()
    }
    ctx.restore()

    const rows = [
      { l: 'الزمن', v: `${sim.time.toFixed(1)}s`, c: '#818cf8' },
      { l: 'السرعة', v: `${sim.vel.toFixed(2)} m/s`, c: '#10b981' },
      { l: 'التسارع', v: `${accel.toFixed(2)} m/s²`, c: '#f59e0b' },
      { l: 'المسافة', v: `${sim.pos.toFixed(2)} m`, c: '#3b82f6' },
    ]
    rows.forEach((r, i) => {
      ctx.fillStyle = 'rgba(15,23,42,0.78)'; ctx.beginPath(); ctx.roundRect(CW - 148, 10 + i * 28, 138, 22, 4); ctx.fill()
      ctx.fillStyle = r.c; ctx.font = 'bold 11px Cairo,Arial'; ctx.textAlign = 'right'
      ctx.fillText(`${r.l}: ${r.v}`, CW - 14, 25 + i * 28)
    })

    rafRef.current = requestAnimationFrame(draw)
  }, [getAccel])

  useEffect(() => { rafRef.current = requestAnimationFrame(draw); return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) } }, [draw])
  useEffect(() => { simRef.current.isRunning = isRunning }, [isRunning])

  const reset = () => {
    setIsRunning(false)
    simRef.current = { isRunning: false, time: 0, vel: 0, pos: 0, lastData: 0 }
    setLiveV(0); setData([])
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex gap-2 justify-center flex-wrap">
        <Button variant={mode === 'learning' ? 'default' : 'outline'} onClick={() => setMode('learning')} className="font-cairo">💡 التعلم</Button>
        <Button variant={mode === 'experiment' ? 'default' : 'outline'} onClick={() => setMode('experiment')} className="font-cairo">🔬 التجربة</Button>
        <Button variant="outline" className="gap-2 font-cairo border-orange-400 text-orange-600 hover:bg-orange-50"
          onClick={() => window.open('https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html', '_blank')}>
          <ArrowSquareOut size={16} /> PhET — Forces & Motion
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="font-cairo text-base">⛰️ التسارع على المستوى المائل</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-xl overflow-hidden border-2 border-blue-200">
                <canvas ref={canvasRef} width={CW} height={CH} className="w-full block" />
              </div>
              <div className="flex gap-2 mt-3 justify-center">
                <Button onClick={() => setIsRunning(r => !r)} className="gap-2 font-cairo">
                  {isRunning ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
                  {isRunning ? 'إيقاف' : 'تشغيل'}
                </Button>
                <Button onClick={reset} variant="outline" className="gap-2 font-cairo"><ArrowClockwise size={16} /> إعادة ضبط</Button>
              </div>
            </CardContent>
          </Card>

          {data.length >= 4 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="font-cairo text-sm">📊 السرعة والمسافة عبر الزمن</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={170}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="t" label={{ value: 'الزمن (s)', position: 'insideBottom', offset: -2, style: { fontFamily: 'Cairo' } }} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontFamily: 'Cairo', direction: 'rtl', fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontFamily: 'Cairo', fontSize: 12 }} />
                    <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} name="السرعة m/s" />
                    <Line type="monotone" dataKey="s" stroke="#3b82f6" strokeWidth={2} dot={false} name="المسافة m" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="font-cairo text-sm">⚙️ التحكم</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {([
                { label: 'زاوية الميل θ', val: angle, unit: '°', min: 5, max: 80, step: 1, setFn: (v: number) => { setAngle(v); angleRef.current = v; reset() } },
                { label: 'الكتلة', val: mass, unit: ' kg', min: 0.5, max: 10, step: 0.5, setFn: (v: number) => { setMass(v); massRef.current = v } },
                { label: 'معامل الاحتكاك μ', val: friction, unit: '', min: 0, max: 0.7, step: 0.05, setFn: (v: number) => { setFriction(v); frictionRef.current = v; reset() } },
              ] as { label: string; val: number; unit: string; min: number; max: number; step: number; setFn: (v: number) => void }[]).map(({ label, val, unit, min, max, step, setFn }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-cairo font-semibold">{label}</label>
                    <Badge variant="secondary" className="font-cairo text-xs">{val}{unit}</Badge>
                  </div>
                  <Slider value={[val]} onValueChange={v => setFn(v[0])} min={min} max={max} step={step} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="font-cairo text-sm">📈 القياسات</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'التسارع النظري', value: `${getAccel().toFixed(3)} m/s²`, hi: true },
                { label: 'السرعة الحالية', value: `${liveV} m/s` },
                { label: 'g sinθ', value: `${(G * Math.sin(angle * Math.PI / 180)).toFixed(3)}` },
                { label: 'μ g cosθ', value: `${(friction * G * Math.cos(angle * Math.PI / 180)).toFixed(3)}` },
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
                <li className="flex gap-2"><span className="text-primary font-bold">١</span> اضبط زاوية الميل</li>
                <li className="flex gap-2"><span className="text-primary font-bold">٢</span> شغّل وراقب الحركة</li>
                <li className="flex gap-2"><span className="text-primary font-bold">٣</span> غيّر الكتلة: هل يتغير a؟</li>
                <li className="flex gap-2"><span className="text-primary font-bold">٤</span> أضف احتكاكاً وقارن</li>
                <li className="flex gap-2"><span className="text-primary font-bold">٥</span> تحقق من a = g(sinθ−μcosθ)</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {mode === 'learning' && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-indigo-200 bg-indigo-50 dark:bg-indigo-950/20">
            <CardHeader className="pb-2"><CardTitle className="font-cairo text-sm text-indigo-700">📐 المعادلات</CardTitle></CardHeader>
            <CardContent className="space-y-2 font-cairo text-xs">
              <div className="bg-white dark:bg-indigo-950 rounded p-2 border border-indigo-200 font-mono text-center">
                <div className="text-lg font-bold text-indigo-700">a = g(sinθ − μcosθ)</div>
                <div className="text-muted-foreground mt-1">v = at &nbsp;|&nbsp; s = ½at²</div>
              </div>
              <ul className="space-y-1 text-indigo-900 dark:text-indigo-200">
                <li>• <strong>mg sinθ</strong>: مركبة الوزن على المستوى</li>
                <li>• <strong>μN</strong>: قوة الاحتكاك</li>
                <li>• الكتلة لا تؤثر على التسارع</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="pb-2"><CardTitle className="font-cairo text-sm text-green-700">❓ أسئلة تحليلية</CardTitle></CardHeader>
            <CardContent className="space-y-1.5 text-xs font-cairo text-green-900 dark:text-green-200">
              <div>١. ما تأثير زيادة الزاوية على التسارع؟</div>
              <div>٢. لماذا الكتلة لا تؤثر على التسارع؟</div>
              <div>٣. عند أي زاوية يتوازن الاحتكاك مع الانزلاق؟</div>
              <div>٤. ارسم علاقة a بـ sinθ</div>
              <div>٥. ما تأثير الاحتكاك على المسافة المقطوعة؟</div>
              <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded font-semibold">
                الاستنتاج: التسارع يزداد بزيادة الزاوية ويستقل عن الكتلة.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
