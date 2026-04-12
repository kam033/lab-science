import { useState, useEffect, useRef, useCallback } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, ArrowClockwise } from '@phosphor-icons/react'

const SOURCE_X = 90
const REF_DIST = 60

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export function InverseSquareLawSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const timeRef = useRef(0)
  const [isRunning, setIsRunning] = useState(true)
  const [frequency, setFrequency] = useState(2.0)
  const [amplitude, setAmplitude] = useState(60)
  const [distance, setDistance] = useState(180)

  const intensityAtListener = amplitude * (REF_DIST / distance) ** 2
  const intensityAtRef = amplitude
  const ratio = (distance / REF_DIST).toFixed(2)

  const draw = useCallback((t: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height, CY = H / 2
    ctx.clearRect(0, 0, W, H)
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, '#0f172a'); bg.addColorStop(1, '#1e1b4b')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(148,163,184,0.07)'; ctx.lineWidth = 1
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
    const waveSpeed = frequency * 55, wavelength = waveSpeed / frequency, maxR = W - SOURCE_X + 20
    for (let n = 0; n < 20; n++) {
      const r = ((t * waveSpeed) - n * wavelength) % (maxR + wavelength)
      if (r <= 0 || r > maxR) continue
      const waveAmp = amplitude * (REF_DIST / Math.max(r, 5))
      const baseAlpha = Math.min(1, waveAmp / amplitude)
      const alpha = baseAlpha * 0.85
      if (alpha < 0.01) continue
      const hue = 210 + 30 * (1 - baseAlpha)
      ctx.beginPath(); ctx.arc(SOURCE_X, CY, r, 0, Math.PI * 2)
      ctx.strokeStyle = `hsla(${hue}, 85%, 65%, ${alpha})`
      ctx.lineWidth = Math.max(0.5, 2.5 * baseAlpha); ctx.stroke()
    }
    const rulerY = CY + 75
    ctx.setLineDash([6, 5]); ctx.strokeStyle = 'rgba(148,163,184,0.4)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(SOURCE_X, rulerY); ctx.lineTo(SOURCE_X + distance, rulerY); ctx.stroke()
    ctx.setLineDash([])
    ;[0, distance].forEach(dx => {
      ctx.strokeStyle = 'rgba(148,163,184,0.6)'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(SOURCE_X + dx, rulerY - 5); ctx.lineTo(SOURCE_X + dx, rulerY + 5); ctx.stroke()
    })
    ctx.fillStyle = 'rgba(148,163,184,0.9)'; ctx.font = '12px Cairo,sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(`r = ${(distance / 60).toFixed(1)} م`, SOURCE_X + distance / 2, rulerY + 18)
    const spkX = SOURCE_X - 38, spkY = CY - 22
    roundRect(ctx, spkX, spkY, 18, 44, 4)
    const spkG = ctx.createLinearGradient(spkX, 0, spkX + 18, 0)
    spkG.addColorStop(0, '#6366f1'); spkG.addColorStop(1, '#818cf8')
    ctx.fillStyle = spkG; ctx.fill()
    ctx.beginPath()
    ctx.moveTo(spkX + 18, CY - 18); ctx.lineTo(SOURCE_X + 4, CY - 32)
    ctx.lineTo(SOURCE_X + 4, CY + 32); ctx.lineTo(spkX + 18, CY + 18); ctx.closePath()
    const coneG = ctx.createLinearGradient(spkX + 18, 0, SOURCE_X + 4, 0)
    coneG.addColorStop(0, '#f59e0b'); coneG.addColorStop(1, '#fbbf24')
    ctx.fillStyle = coneG; ctx.fill(); ctx.strokeStyle = '#d97706'; ctx.lineWidth = 1.5; ctx.stroke()
    ctx.fillStyle = '#c7d2fe'; ctx.font = 'bold 11px Cairo,sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('مصدر', spkX + 9, spkY - 7)
    const lx = SOURCE_X + distance
    const barW = 14, maxBarH = 55, barH = Math.min((intensityAtListener / intensityAtRef) * maxBarH * 2, maxBarH)
    const barX = lx - barW / 2, barY = CY - 70
    roundRect(ctx, barX, barY + (maxBarH - barH), barW, barH, 3)
    const barG = ctx.createLinearGradient(0, barY + maxBarH, 0, barY)
    barG.addColorStop(0, '#22c55e'); barG.addColorStop(0.5, '#facc15'); barG.addColorStop(1, '#ef4444')
    ctx.fillStyle = barG; ctx.fill()
    roundRect(ctx, barX, barY, barW, maxBarH, 3); ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.stroke()
    ctx.beginPath(); ctx.arc(lx, CY - 30, 13, 0, Math.PI * 2)
    const headG = ctx.createRadialGradient(lx - 3, CY - 33, 2, lx, CY - 30, 13)
    headG.addColorStop(0, '#fde68a'); headG.addColorStop(1, '#f59e0b')
    ctx.fillStyle = headG; ctx.fill(); ctx.strokeStyle = '#d97706'; ctx.lineWidth = 1.5; ctx.stroke()
    ;[-4, 4].forEach(ex => { ctx.beginPath(); ctx.arc(lx + ex, CY - 31, 2, 0, Math.PI * 2); ctx.fillStyle = '#1e1b4b'; ctx.fill() })
    ctx.beginPath(); ctx.arc(lx, CY - 27, 5, 0.2, Math.PI - 0.2); ctx.strokeStyle = '#92400e'; ctx.lineWidth = 1.5; ctx.stroke()
    roundRect(ctx, lx - 10, CY - 17, 20, 28, 4); ctx.fillStyle = '#f59e0b'; ctx.fill()
    ;[-5, 5].forEach(ll => { roundRect(ctx, lx + ll - 4, CY + 11, 8, 18, 3); ctx.fillStyle = '#1e1b4b'; ctx.fill() })
    ctx.fillStyle = '#86efac'; ctx.font = 'bold 11px Cairo,sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(`I = ${intensityAtListener.toFixed(1)}`, lx, barY - 5)
    ctx.fillStyle = '#c7d2fe'; ctx.font = '11px Cairo,sans-serif'
    ctx.fillText('مستمع', lx, CY + 35)
    const gx = W - 155, gy = 12, gw = 140, gh = 90
    roundRect(ctx, gx - 5, gy - 5, gw + 10, gh + 22, 6); ctx.fillStyle = 'rgba(15,23,42,0.85)'; ctx.fill()
    ctx.strokeStyle = 'rgba(99,102,241,0.4)'; ctx.lineWidth = 1; ctx.stroke()
    ctx.strokeStyle = 'rgba(148,163,184,0.5)'; ctx.lineWidth = 1; ctx.beginPath()
    ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.moveTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke()
    ctx.fillStyle = 'rgba(148,163,184,0.8)'; ctx.font = '9px Cairo,sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('المسافة r', gx + gw / 2, gy + gh + 14)
    ctx.save(); ctx.translate(gx - 12, gy + gh / 2); ctx.rotate(-Math.PI / 2)
    ctx.fillText('الشدة I', 0, 0); ctx.restore()
    ctx.beginPath()
    for (let px = 0; px <= gw; px++) {
      const r = REF_DIST + (px / gw) * (500 - REF_DIST), I = amplitude * (REF_DIST / r) ** 2
      const py = gy + gh - Math.min((I / amplitude) * gh, gh - 2)
      px === 0 ? ctx.moveTo(gx + px, py) : ctx.lineTo(gx + px, py)
    }
    ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 2; ctx.stroke()
    const dotPx = ((distance - REF_DIST) / (500 - REF_DIST)) * gw
    const dotPy = gy + gh - Math.min((amplitude * (REF_DIST / distance) ** 2 / amplitude) * gh, gh - 2)
    ctx.beginPath(); ctx.arc(gx + dotPx, dotPy, 5, 0, Math.PI * 2); ctx.fillStyle = '#f59e0b'; ctx.fill()
    ctx.fillStyle = 'rgba(199,210,254,0.9)'; ctx.font = 'bold 9.5px Cairo,sans-serif'; ctx.textAlign = 'left'
    ctx.fillText('I ∝ 1/r²', gx + 2, gy - 3)
  }, [frequency, amplitude, distance, intensityAtListener, intensityAtRef])

  useEffect(() => {
    if (!isRunning) return
    let last = performance.now()
    const loop = (now: number) => {
      timeRef.current += (now - last) / 1000; last = now; draw(timeRef.current)
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [isRunning, draw])

  useEffect(() => { if (!isRunning) draw(timeRef.current) }, [isRunning, draw])

  const reset = () => { timeRef.current = 0; setFrequency(2.0); setAmplitude(60); setDistance(180); setIsRunning(true) }

  return (
    <div className="space-y-4 font-cairo" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-base text-foreground">🌊 قانون التربيع العكسي للموجات من مصدر نقطي</h3>
          <p className="text-xs text-muted-foreground mt-0.5">محاكاة تفاعلية — وحدة 6: الموجات</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setIsRunning(r => !r)}>
            {isRunning ? <Pause size={13}/> : <Play size={13}/>}
            {isRunning ? 'إيقاف' : 'تشغيل'}
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={reset}>
            <ArrowClockwise size={13}/> إعادة ضبط
          </Button>
        </div>
      </div>
      <canvas ref={canvasRef} width={700} height={220} className="w-full rounded-xl border border-border/30" style={{background:'#0f172a'}}/>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card/50 rounded-xl p-3 space-y-2 border border-border/30">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-primary">التردد</span>
            <Badge variant="secondary" className="text-xs">{frequency.toFixed(1)} هرتز</Badge>
          </div>
          <Slider value={[frequency]} onValueChange={([v]) => setFrequency(v)} min={0.5} max={5} step={0.5}/>
          <p className="text-xs text-muted-foreground">عدد الموجات في الثانية</p>
        </div>
        <div className="bg-card/50 rounded-xl p-3 space-y-2 border border-border/30">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-primary">السعة</span>
            <Badge variant="secondary" className="text-xs">A = {amplitude}</Badge>
          </div>
          <Slider value={[amplitude]} onValueChange={([v]) => setAmplitude(v)} min={10} max={100} step={5}/>
          <p className="text-xs text-muted-foreground">سعة الموجة عند المصدر</p>
        </div>
        <div className="bg-card/50 rounded-xl p-3 space-y-2 border border-border/30">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-primary">المسافة</span>
            <Badge variant="secondary" className="text-xs">r = {(distance/60).toFixed(1)} م</Badge>
          </div>
          <Slider value={[distance]} onValueChange={([v]) => setDistance(v)} min={REF_DIST} max={520} step={10}/>
          <p className="text-xs text-muted-foreground">بُعد المستمع عن المصدر</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-blue-950/40 border border-blue-500/20 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">الشدة عند المصدر I₀</p>
          <p className="text-lg font-bold text-blue-400">{intensityAtRef.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">وحدة</p>
        </div>
        <div className="bg-green-950/40 border border-green-500/20 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">الشدة عند المستمع I</p>
          <p className="text-lg font-bold text-green-400">{intensityAtListener.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">وحدة</p>
        </div>
        <div className="bg-yellow-950/40 border border-yellow-500/20 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">نسبة المسافة r/r₀</p>
          <p className="text-lg font-bold text-yellow-400">{ratio}×</p>
          <p className="text-xs text-muted-foreground">ضعف</p>
        </div>
        <div className="bg-purple-950/40 border border-purple-500/20 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">انخفاض الشدة</p>
          <p className="text-lg font-bold text-purple-400">{(intensityAtRef/Math.max(intensityAtListener,0.01)).toFixed(1)}×</p>
          <p className="text-xs text-muted-foreground">أقل</p>
        </div>
      </div>
      <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-4">
        <p className="text-sm font-bold text-indigo-300 mb-2">⚛️ قانون التربيع العكسي</p>
        <div className="flex flex-wrap gap-4 text-sm items-center">
          <div className="bg-indigo-900/40 rounded-lg px-3 py-1.5 font-mono text-indigo-200 text-base">I = I₀ · (r₀ / r)²</div>
          <div className="text-muted-foreground text-xs leading-relaxed">
            عند مضاعفة المسافة → تنخفض الشدة إلى&nbsp;<span className="text-yellow-400 font-bold">¼</span> قيمتها<br/>
            عند تثليث المسافة → تنخفض إلى&nbsp;<span className="text-yellow-400 font-bold">⅑</span> قيمتها
          </div>
        </div>
      </div>
    </div>
  )
}
