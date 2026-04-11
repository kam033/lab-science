import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, ArrowClockwise, ArrowsOut } from '@phosphor-icons/react'

const PHET_URL = 'https://phet.colorado.edu/sims/html/sound-waves/latest/sound-waves_all.html'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────
interface WaveRing {
  r: number       // current radius (px)
  born: number    // time created (s)
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CW = 560
const CH = 340
const SRC_X = 60         // source x position
const SRC_Y = CH / 2
const WAVE_SPEED = 70    // px/s
const WAVE_INTERVAL = 0.4 // seconds between new rings
const MAX_R = CW - SRC_X + 20

// ─── Physics ──────────────────────────────────────────────────────────────────
function intensity(power: number, distPx: number): number {
  const distM = distPx / 100   // 100px = 1m
  if (distM <= 0) return Infinity
  return power / (4 * Math.PI * distM * distM)
}

// ─── Component ────────────────────────────────────────────────────────────────
export function InverseSquareLawSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>()
  const ringsRef = useRef<WaveRing[]>([])
  const simRef = useRef({ time: 0, lastRing: 0, isRunning: false })
  const detectorRef = useRef(200)   // detector x position in px from source
  const powerRef = useRef(100)

  const [mode, setMode]   = useState<'learning' | 'experiment'>('learning')
  const [simTab, setSimTab] = useState<'custom' | 'phet'>('custom')
  const [phetFull, setPhetFull] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [detectorDist, setDetectorDist] = useState(200)   // px
  const [sourcePower, setSourcePower] = useState(100)
  const [currentI, setCurrentI] = useState(0)
  const [measurements, setMeasurements] = useState<{ d: number; I: number; inv_d2: number }[]>([])

  // ── Animation loop ──────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const sim = simRef.current
    const detX = SRC_X + detectorRef.current

    if (sim.isRunning) {
      sim.time += 1 / 60

      // Spawn new ring
      if (sim.time - sim.lastRing >= WAVE_INTERVAL) {
        sim.lastRing = sim.time
        ringsRef.current.push({ r: 0, born: sim.time })
      }

      // Expand rings
      ringsRef.current = ringsRef.current
        .map(w => ({ ...w, r: w.r + WAVE_SPEED / 60 }))
        .filter(w => w.r < MAX_R)
    }

    // ── Draw ───────────────────────────────────────────────────────────────
    // Background (dark space)
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, CW, CH)

    // Grid lines
    ctx.strokeStyle = 'rgba(148,163,184,0.1)'
    ctx.lineWidth = 1
    for (let x = 0; x < CW; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke()
    }
    for (let y = 0; y < CH; y += 50) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke()
    }

    // Draw wave rings
    ringsRef.current.forEach(w => {
      if (w.r <= 0) return
      const alpha = Math.max(0, 1 - (w.r / MAX_R))  // fade with distance
      const ampFactor = Math.pow(SRC_X / (SRC_X + w.r), 2) // I ∝ 1/r²
      const brightness = Math.round(ampFactor * 255)

      ctx.beginPath()
      ctx.arc(SRC_X, SRC_Y, w.r, -Math.PI / 2, Math.PI / 2)  // right half only
      ctx.strokeStyle = `rgba(${brightness}, ${Math.round(brightness * 0.8)}, 50, ${alpha * 0.85})`
      ctx.lineWidth = Math.max(0.5, 2 * ampFactor)
      ctx.stroke()
    })

    // Source glow
    const gradient = ctx.createRadialGradient(SRC_X, SRC_Y, 0, SRC_X, SRC_Y, 30)
    gradient.addColorStop(0, 'rgba(251,191,36,0.9)')
    gradient.addColorStop(0.4, 'rgba(251,191,36,0.4)')
    gradient.addColorStop(1, 'rgba(251,191,36,0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(SRC_X, SRC_Y, 30, 0, Math.PI * 2)
    ctx.fill()

    // Source core
    ctx.beginPath()
    ctx.arc(SRC_X, SRC_Y, 10, 0, Math.PI * 2)
    ctx.fillStyle = '#fbbf24'
    ctx.fill()
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2
    ctx.stroke()

    // Source label
    ctx.fillStyle = '#fde68a'
    ctx.font = 'bold 11px Cairo, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('مصدر', SRC_X, SRC_Y + 28)

    // Distance axis
    ctx.strokeStyle = 'rgba(148,163,184,0.4)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(SRC_X, SRC_Y)
    ctx.lineTo(CW - 10, SRC_Y)
    ctx.stroke()
    ctx.setLineDash([])

    // Ruler ticks
    ctx.fillStyle = '#94a3b8'
    ctx.font = '10px Arial'
    ctx.textAlign = 'center'
    for (let d = 50; d <= 450; d += 50) {
      const x = SRC_X + d
      if (x >= CW) break
      ctx.beginPath()
      ctx.moveTo(x, SRC_Y - 5)
      ctx.lineTo(x, SRC_Y + 5)
      ctx.strokeStyle = 'rgba(148,163,184,0.5)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillText(`${d / 100}m`, x, SRC_Y + 16)
    }

    // Detector position
    const dX = SRC_X + detectorRef.current
    // Detector beam
    ctx.strokeStyle = 'rgba(99,102,241,0.5)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(dX, 10)
    ctx.lineTo(dX, CH - 10)
    ctx.stroke()
    ctx.setLineDash([])

    // Detector box
    const dw = 22, dh = 44
    const dr = 6
    ctx.fillStyle = '#1e40af'
    ctx.strokeStyle = '#60a5fa'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(dX - dw / 2, SRC_Y - dh / 2, dw, dh, dr)
    ctx.fill()
    ctx.stroke()

    // Detector screen
    const screenColor = () => {
      const I = intensity(powerRef.current, detectorRef.current)
      const maxI = intensity(powerRef.current, 50)
      const ratio = Math.min(1, I / maxI)
      const r = Math.round(ratio * 251)
      const g = Math.round(ratio * 191)
      return `rgb(${r},${g},36)`
    }
    ctx.fillStyle = screenColor()
    ctx.fillRect(dX - 8, SRC_Y - 14, 16, 28)

    ctx.fillStyle = '#bfdbfe'
    ctx.font = 'bold 9px Cairo, Arial'
    ctx.textAlign = 'center'
    ctx.fillText('مستشعر', dX, SRC_Y + dh / 2 + 14)

    // Distance label
    ctx.fillStyle = '#a78bfa'
    ctx.font = 'bold 12px Cairo, Arial'
    ctx.fillText(`d = ${(detectorRef.current / 100).toFixed(1)} m`, (SRC_X + dX) / 2, SRC_Y - 18)

    // Intensity readout top-right
    const I = intensity(powerRef.current, detectorRef.current)
    ctx.fillStyle = 'rgba(15,23,42,0.85)'
    ctx.beginPath()
    ctx.roundRect(CW - 170, 10, 160, 65, 8)
    ctx.fill()
    ctx.strokeStyle = '#6366f1'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.fillStyle = '#a78bfa'
    ctx.font = 'bold 11px Cairo, Arial'
    ctx.textAlign = 'right'
    ctx.fillText('الشدة الحالية:', CW - 15, 32)
    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 14px Arial'
    ctx.fillText(`${I.toFixed(3)} W/m²`, CW - 15, 52)
    ctx.fillStyle = '#94a3b8'
    ctx.font = '10px Arial'
    ctx.fillText(`I = P / (4π d²)`, CW - 15, 68)

    // Update React intensity display
    setCurrentI(Math.round(I * 1000) / 1000)

    rafRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [draw])

  useEffect(() => { simRef.current.isRunning = isRunning }, [isRunning])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDistanceChange = (v: number[]) => {
    setDetectorDist(v[0])
    detectorRef.current = v[0]
  }

  const handlePowerChange = (v: number[]) => {
    setSourcePower(v[0])
    powerRef.current = v[0]
  }

  const recordMeasurement = () => {
    const d = detectorRef.current / 100
    const I = intensity(powerRef.current, detectorRef.current)
    setMeasurements(prev => {
      const existing = prev.find(m => Math.abs(m.d - d) < 0.05)
      const entry = { d: Math.round(d * 100) / 100, I: Math.round(I * 1000) / 1000, inv_d2: Math.round((1 / (d * d)) * 100) / 100 }
      if (existing) return prev.map(m => Math.abs(m.d - d) < 0.05 ? entry : m).sort((a, b) => a.d - b.d)
      return [...prev, entry].sort((a, b) => a.d - b.d)
    })
  }

  const reset = () => {
    setIsRunning(false)
    simRef.current = { time: 0, lastRing: 0, isRunning: false }
    ringsRef.current = []
    setMeasurements([])
    setDetectorDist(200)
    detectorRef.current = 200
  }

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4" dir="rtl">

      {/* Mode + sim tab toggles */}
      <div className="flex gap-2 justify-center flex-wrap">
        <Button variant={mode === 'learning' ? 'default' : 'outline'} onClick={() => setMode('learning')} className="font-cairo">
          💡 وضع التعلم
        </Button>
        <Button variant={mode === 'experiment' ? 'default' : 'outline'} onClick={() => setMode('experiment')} className="font-cairo">
          🔬 وضع التجربة
        </Button>
        <div className="flex rounded-lg overflow-hidden border border-orange-300">
          <Button
            variant={simTab === 'custom' ? 'default' : 'ghost'}
            onClick={() => setSimTab('custom')}
            className="font-cairo rounded-none text-sm px-3 h-9"
          >
            🌊 محاكاة مخصصة
          </Button>
          <Button
            variant={simTab === 'phet' ? 'default' : 'ghost'}
            onClick={() => setSimTab('phet')}
            className="font-cairo rounded-none text-sm px-3 h-9 border-r border-orange-300"
          >
            ⚛️ PhET مباشر
          </Button>
        </div>
      </div>

      {/* ── PhET embedded iframe ────────────────────────────────────────────── */}
      {simTab === 'phet' && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="font-cairo text-base">
              ⚛️ Sound Waves — PhET Interactive
            </CardTitle>
            <Button size="sm" variant="outline" className="gap-1.5 font-cairo text-xs"
              onClick={() => setPhetFull(f => !f)}>
              <ArrowsOut size={14} />
              {phetFull ? 'تصغير' : 'تكبير'}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className={`w-full transition-all duration-300 ${phetFull ? 'h-[85vh]' : 'h-[560px]'}`}>
              <iframe
                src={PHET_URL}
                title="Sound Waves — PhET Interactive Simulations"
                className="w-full h-full border-0"
                allow="fullscreen"
                loading="lazy"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Custom simulation ───────────────────────────────────────────────── */}
      {simTab === 'custom' && (
      <div className="grid lg:grid-cols-3 gap-4">

        {/* ── Canvas ── */}
        <div className="lg:col-span-2 space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-base">
                🌊 انتشار الموجات من مصدر نقطي — قانون التربيع العكسي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl overflow-hidden border-2 border-slate-700 shadow-inner">
                <canvas ref={canvasRef} width={CW} height={CH} className="w-full block" />
              </div>
              <div className="flex gap-2 mt-3 justify-center">
                <Button onClick={() => setIsRunning(r => !r)} className="gap-2 font-cairo">
                  {isRunning ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
                  {isRunning ? 'إيقاف' : 'تشغيل الأمواج'}
                </Button>
                <Button onClick={recordMeasurement} variant="outline" className="font-cairo">
                  📌 تسجيل قياس
                </Button>
                <Button onClick={reset} variant="outline" className="gap-2 font-cairo">
                  <ArrowClockwise size={16} />
                  إعادة ضبط
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Graph */}
          {measurements.length >= 2 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-cairo text-sm">📊 الشدة مقابل المسافة — I ∝ 1/d²</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={measurements}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="d" label={{ value: 'المسافة d (m)', position: 'insideBottom', offset: -2, style: { fontFamily: 'Cairo' } }} tick={{ fontFamily: 'Cairo', fontSize: 11 }} />
                    <YAxis label={{ value: 'I (W/m²)', angle: -90, position: 'insideLeft', style: { fontFamily: 'Cairo' } }} tick={{ fontFamily: 'Cairo', fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontFamily: 'Cairo', direction: 'rtl', fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontFamily: 'Cairo', fontSize: 12 }} />
                    <Line type="monotone" dataKey="I" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 5 }} name="الشدة I" />
                  </LineChart>
                </ResponsiveContainer>
                {measurements.length >= 3 && (
                  <div className="mt-2 text-center text-xs text-muted-foreground font-cairo">
                    عند مضاعفة المسافة → الشدة تصبح ¼ القيمة الأصلية ✓
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Measurements table */}
          {measurements.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-cairo text-sm">📋 جدول القياسات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-cairo text-center">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 border">المسافة d (m)</th>
                        <th className="p-2 border">الشدة I (W/m²)</th>
                        <th className="p-2 border">1/d²</th>
                        <th className="p-2 border">I × d²</th>
                      </tr>
                    </thead>
                    <tbody>
                      {measurements.map((m, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                          <td className="p-2 border">{m.d}</td>
                          <td className="p-2 border font-bold text-indigo-600">{m.I}</td>
                          <td className="p-2 border">{m.inv_d2}</td>
                          <td className="p-2 border text-green-600">{Math.round(m.I * m.d * m.d * 100) / 100}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-muted-foreground text-center mt-1 font-cairo">
                    القيم في عمود "I × d²" يجب أن تكون ثابتة ≈ P/(4π) — هذا يثبت القانون
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Controls ── */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm">⚙️ لوحة التحكم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-cairo font-semibold">موضع المستشعر</label>
                  <Badge variant="secondary" className="font-cairo">{(detectorDist / 100).toFixed(1)} م</Badge>
                </div>
                <Slider value={[detectorDist]} onValueChange={handleDistanceChange} min={50} max={460} step={10} />
                <div className="flex justify-between text-xs text-muted-foreground mt-1 font-cairo">
                  <span>0.5 م</span>
                  <span>4.6 م</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-cairo font-semibold">قدرة المصدر</label>
                  <Badge variant="secondary" className="font-cairo">{sourcePower} W</Badge>
                </div>
                <Slider value={[sourcePower]} onValueChange={handlePowerChange} min={10} max={500} step={10} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm">📈 القياسات المباشرة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'المسافة d', value: `${(detectorDist / 100).toFixed(2)} م` },
                { label: 'الشدة I', value: `${currentI} W/m²`, highlight: true },
                { label: 'قدرة المصدر P', value: `${sourcePower} W` },
                { label: 'I × d²', value: (currentI * Math.pow(detectorDist / 100, 2)).toFixed(3) },
                { label: 'P / (4π)', value: (sourcePower / (4 * Math.PI)).toFixed(3) },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs font-cairo text-muted-foreground">{label}</span>
                  <Badge variant={highlight ? 'default' : 'outline'} className="font-cairo text-xs font-bold">{value}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm">🎯 خطوات التجربة</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-xs font-cairo space-y-2 text-muted-foreground">
                <li className="flex gap-2"><span className="font-bold text-primary">١</span> شغّل الأمواج واضبط قوة المصدر</li>
                <li className="flex gap-2"><span className="font-bold text-primary">٢</span> ضع المستشعر عند 0.5م وسجّل القياس</li>
                <li className="flex gap-2"><span className="font-bold text-primary">٣</span> حرّك المستشعر إلى 1م، 1.5م، 2م...</li>
                <li className="flex gap-2"><span className="font-bold text-primary">٤</span> سجّل قياساً عند كل مسافة</li>
                <li className="flex gap-2"><span className="font-bold text-primary">٥</span> تحقق أن I × d² ثابت</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      )} {/* end simTab === 'custom' */}

      {/* Learning mode */}
      {mode === 'learning' && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-indigo-300 bg-indigo-50 dark:bg-indigo-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-base text-indigo-800 dark:text-indigo-300">
                📐 قانون التربيع العكسي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 font-cairo text-sm">
              <div className="bg-white dark:bg-indigo-950 rounded p-3 border border-indigo-200 text-center">
                <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 font-mono">I = P / (4πd²)</div>
                <div className="text-xs text-muted-foreground mt-1">الشدة = القدرة ÷ (4π × المسافة²)</div>
              </div>
              <ul className="space-y-1 text-indigo-900 dark:text-indigo-200 text-xs">
                <li>• <strong>I</strong> = شدة الموجة (W/m²)</li>
                <li>• <strong>P</strong> = قدرة المصدر (W)</li>
                <li>• <strong>d</strong> = المسافة من المصدر (m)</li>
                <li>• <strong>4πd²</strong> = مساحة كرة نصف قطرها d</li>
              </ul>
              <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded p-2 border border-yellow-200 text-xs">
                <strong>💡 عند مضاعفة المسافة (d → 2d):</strong><br />
                الشدة تصبح I / 4 (ربع القيمة)
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-300 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-base text-green-800 dark:text-green-300">
                ❓ أسئلة للتحليل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 font-cairo text-xs text-green-900 dark:text-green-200">
              <div className="flex gap-2"><span className="font-bold">١.</span> ما العلاقة بين شدة الصوت والمسافة؟</div>
              <div className="flex gap-2"><span className="font-bold">٢.</span> إذا تضاعفت المسافة، بكم تنخفض الشدة؟</div>
              <div className="flex gap-2"><span className="font-bold">٣.</span> لماذا تنخفض الشدة بتربيع المسافة وليس خطياً؟</div>
              <div className="flex gap-2"><span className="font-bold">٤.</span> ما الذي يثبت أن عمود I × d² ثابت في الجدول؟</div>
              <div className="flex gap-2"><span className="font-bold">٥.</span> كيف نطبق هذا القانون في تصميم نظام صوتي لقاعة؟</div>
              <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded border border-green-200 text-green-800 dark:text-green-200">
                <strong>الاستنتاج:</strong> الشدة تتناسب عكسياً مع مربع المسافة لأن الطاقة تتوزع على مساحة كروية تزداد بمربع نصف القطر.
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm">🔬 المتغيرات والهدف</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-xs font-cairo">
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded p-3 border border-blue-200">
                  <div className="font-bold text-blue-700 dark:text-blue-300 mb-1">المتغير المستقل:</div>
                  <div>المسافة من المصدر (d)</div>
                </div>
                <div className="bg-red-50 dark:bg-red-950/30 rounded p-3 border border-red-200">
                  <div className="font-bold text-red-700 dark:text-red-300 mb-1">المتغير التابع:</div>
                  <div>شدة الموجة (I)</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 border">
                  <div className="font-bold text-gray-700 dark:text-gray-300 mb-1">المتغيرات الثابتة:</div>
                  <div>قدرة المصدر، الوسط</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
