import { useState, useRef, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Waves, Play, Pause, ArrowClockwise } from '@phosphor-icons/react'

// ─── Constants ────────────────────────────────────────────────────────────────
const CW = 560
const CH = 200
const WAVE_SPEED = 340  // m/s (speed of sound in air)
const DEFAULT_FREQ = 2
const DEFAULT_AMP = 50

export function WaveFrequencySim() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const timeRef = useRef<number>(0)

  const [frequency, setFrequency] = useState(DEFAULT_FREQ)   // Hz (2–10)
  const [amplitude, setAmplitude] = useState(DEFAULT_AMP)    // px
  const [isRunning, setIsRunning] = useState(true)

  const wavelength = +(WAVE_SPEED / frequency).toFixed(2)
  const period = +(1 / frequency).toFixed(3)

  const handleReset = () => {
    setFrequency(DEFAULT_FREQ)
    setAmplitude(DEFAULT_AMP)
    timeRef.current = 0
    setIsRunning(true)
  }

  // ─── Animation ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const draw = () => {
      ctx.clearRect(0, 0, CW, CH)

      // Background
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, CW, CH)

      // Grid lines
      ctx.strokeStyle = '#1e293b'
      ctx.lineWidth = 1
      for (let y = 0; y <= CH; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke()
      }
      for (let x = 0; x <= CW; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke()
      }

      // Centre line
      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 1
      ctx.setLineDash([6, 4])
      ctx.beginPath(); ctx.moveTo(0, CH / 2); ctx.lineTo(CW, CH / 2); ctx.stroke()
      ctx.setLineDash([])

      // Wave — y(x,t) = A sin(kx - ωt)
      const omega = 2 * Math.PI * frequency
      // pixels per metre mapping: 1 metre → 60 px
      const ppm = 60
      const k = (2 * Math.PI) / wavelength  // rad/m
      const t = timeRef.current

      // Primary wave
      const grad = ctx.createLinearGradient(0, 0, CW, 0)
      grad.addColorStop(0, '#3b82f6')
      grad.addColorStop(0.5, '#8b5cf6')
      grad.addColorStop(1, '#06b6d4')
      ctx.strokeStyle = grad
      ctx.lineWidth = 3
      ctx.beginPath()
      for (let px = 0; px <= CW; px++) {
        const xMetres = px / ppm
        const y = CH / 2 + amplitude * Math.sin(k * xMetres - omega * t)
        if (px === 0) ctx.moveTo(px, y)
        else ctx.lineTo(px, y)
      }
      ctx.stroke()

      // Wavelength annotation – first full cycle
      const lambda_px = wavelength * ppm
      if (lambda_px < CW - 10) {
        const yRef = CH / 2 + amplitude + 22
        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 1.5
        // bracket
        ctx.beginPath()
        ctx.moveTo(10, yRef - 6); ctx.lineTo(10, yRef); ctx.lineTo(10 + lambda_px, yRef); ctx.lineTo(10 + lambda_px, yRef - 6)
        ctx.stroke()
        ctx.fillStyle = '#f59e0b'
        ctx.font = 'bold 12px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(`λ = ${wavelength} m`, 10 + lambda_px / 2, yRef + 14)
      }

      // Amplitude annotation
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 1.5
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(CW - 20, CH / 2)
      ctx.lineTo(CW - 20, CH / 2 - amplitude)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 11px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(`A = ${amplitude} u`, CW - 24, CH / 2 - amplitude / 2)

      if (isRunning) timeRef.current += 0.016
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [frequency, amplitude, wavelength, isRunning])

  return (
    <div className="space-y-4 font-cairo" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Waves size={20} weight="fill" className="text-blue-500" />
          <h3 className="font-bold text-lg">محاكاة الموجات: v = f · λ</h3>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={isRunning ? 'secondary' : 'default'}
            className="gap-1.5 text-xs" onClick={() => setIsRunning(r => !r)}>
            {isRunning ? <><Pause size={13} weight="fill"/> إيقاف</> : <><Play size={13} weight="fill"/> تشغيل</>}
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleReset}>
            <ArrowClockwise size={13}/> إعادة ضبط
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="rounded-xl overflow-hidden border border-slate-700">
        <canvas ref={canvasRef} width={CW} height={CH} className="w-full" />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-cairo">التردد (f)</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <Slider
              min={1} max={10} step={0.5}
              value={[frequency]}
              onValueChange={([v]) => setFrequency(v)}
              className="direction-ltr"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 Hz</span>
              <Badge variant="secondary">{frequency} Hz</Badge>
              <span>10 Hz</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-cairo">السعة (A)</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <Slider
              min={10} max={80} step={5}
              value={[amplitude]}
              onValueChange={([v]) => setAmplitude(v)}
              className="direction-ltr"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>صغيرة</span>
              <Badge variant="secondary">{amplitude}</Badge>
              <span>كبيرة</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">سرعة الموجة</p>
            <p className="text-xl font-bold text-blue-400">{WAVE_SPEED}</p>
            <p className="text-xs text-muted-foreground">m/s</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">الطول الموجي</p>
            <p className="text-xl font-bold text-amber-400">{wavelength}</p>
            <p className="text-xs text-muted-foreground">متر (m)</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">الدور الزمني</p>
            <p className="text-xl font-bold text-purple-400">{period}</p>
            <p className="text-xs text-muted-foreground">ثانية (s)</p>
          </CardContent>
        </Card>
      </div>

      {/* Equation box */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-4">
          <p className="text-center text-lg font-mono font-bold tracking-widest text-slate-200">
            v = f × λ &nbsp;→&nbsp; {WAVE_SPEED} = {frequency} × {wavelength}
          </p>
          <p className="text-center text-sm text-muted-foreground mt-1 font-cairo">
            سرعة الموجة = التردد × الطول الموجي
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
