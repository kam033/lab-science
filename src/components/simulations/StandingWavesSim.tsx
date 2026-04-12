import { useState, useEffect, useRef } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, ArrowClockwise } from '@phosphor-icons/react'

// Wave speed on string (m/s) — fixed for simplicity
const WAVE_SPEED = 10

export function StandingWavesSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const timeRef = useRef(0)

  const [isRunning, setIsRunning] = useState(true)
  const [harmonicN, setHarmonicN] = useState(1)
  const [stringLength, setStringLength] = useState(1.0) // metres
  const [amplitude, setAmplitude] = useState(40)        // px

  // Derived quantities
  const frequency = (harmonicN * WAVE_SPEED) / (2 * stringLength)
  const wavelength = (2 * stringLength) / harmonicN
  const nodesCount = harmonicN + 1
  const antinodesCount = harmonicN

  // Canvas draw
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width
    const H = canvas.height
    const cx = H / 2

    const draw = (time: number) => {
      ctx.clearRect(0, 0, W, H)

      // Background grid
      ctx.strokeStyle = 'rgba(100,100,100,0.12)'
      ctx.lineWidth = 1
      for (let y = 0; y <= H; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }
      for (let x = 0; x <= W; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }

      const ω = 2 * Math.PI * frequency

      // Draw envelope (dashed)
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = 'rgba(99,102,241,0.35)'
      ctx.lineWidth = 1.5

      const drawEnvelope = (sign: 1 | -1) => {
        ctx.beginPath()
        for (let px = 0; px <= W; px++) {
          const x = (px / W) * stringLength
          const y = cx + sign * amplitude * Math.sin((harmonicN * Math.PI * x) / stringLength)
          px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y)
        }
        ctx.stroke()
      }
      drawEnvelope(1)
      drawEnvelope(-1)
      ctx.setLineDash([])

      // Draw wave
      const gradient = ctx.createLinearGradient(0, 0, W, 0)
      gradient.addColorStop(0, '#6366f1')
      gradient.addColorStop(0.5, '#8b5cf6')
      gradient.addColorStop(1, '#6366f1')
      ctx.strokeStyle = gradient
      ctx.lineWidth = 3
      ctx.shadowColor = '#6366f1'
      ctx.shadowBlur = 6

      ctx.beginPath()
      for (let px = 0; px <= W; px++) {
        const x = (px / W) * stringLength
        const standing =
          Math.sin((harmonicN * Math.PI * x) / stringLength) * Math.cos(ω * time)
        const y = cx + amplitude * standing
        px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y)
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      // Draw nodes (red dots)
      ctx.fillStyle = '#ef4444'
      for (let n = 0; n <= harmonicN; n++) {
        const px = (n / harmonicN) * W
        ctx.beginPath()
        ctx.arc(px, cx, 6, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw antinodes (green dots — peak positions)
      ctx.fillStyle = '#22c55e'
      for (let n = 0; n < harmonicN; n++) {
        const px = ((n + 0.5) / harmonicN) * W
        ctx.beginPath()
        ctx.arc(px, cx, 4, 0, Math.PI * 2)
        ctx.fill()
      }

      // Fixed end markers
      ctx.fillStyle = '#64748b'
      ctx.fillRect(-3, cx - 24, 8, 48)
      ctx.fillRect(W - 5, cx - 24, 8, 48)
    }

    const loop = () => {
      if (isRunning) timeRef.current += 0.016
      draw(timeRef.current)
      animFrameRef.current = requestAnimationFrame(loop)
    }

    animFrameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [isRunning, harmonicN, stringLength, amplitude, frequency])

  const reset = () => {
    timeRef.current = 0
    setHarmonicN(1)
    setStringLength(1.0)
    setAmplitude(40)
    setIsRunning(true)
  }

  return (
    <div className="space-y-4" dir="rtl">

      {/* Header */}
      <div>
        <h3 className="font-cairo font-bold text-base">🎸 الموجات المستقرة على سلك</h3>
        <p className="text-xs text-muted-foreground font-cairo mt-0.5">
          غيّر رقم الهارمونيك وطول السلك لترى كيف تتكون العقد والبطون
        </p>
      </div>

      {/* Canvas */}
      <div className="relative bg-slate-900 rounded-xl overflow-hidden border border-border">
        <canvas
          ref={canvasRef}
          width={700}
          height={200}
          className="w-full"
          style={{ display: 'block' }}
        />
        {/* Legend */}
        <div className="absolute bottom-2 left-3 flex gap-3 text-xs font-cairo">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            عقدة (Node)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
            بطن (Antinode)
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="space-y-1">
          <label className="text-xs font-cairo font-semibold">
            الهارمونيك (n): <span className="text-primary">{harmonicN}</span>
          </label>
          <Slider
            min={1} max={6} step={1}
            value={[harmonicN]}
            onValueChange={([v]) => setHarmonicN(v)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-cairo font-semibold">
            طول السلك: <span className="text-primary">{stringLength.toFixed(1)} m</span>
          </label>
          <Slider
            min={0.5} max={2.0} step={0.1}
            value={[stringLength]}
            onValueChange={([v]) => setStringLength(v)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-cairo font-semibold">
            السعة: <span className="text-primary">{amplitude} px</span>
          </label>
          <Slider
            min={10} max={70} step={5}
            value={[amplitude]}
            onValueChange={([v]) => setAmplitude(v)}
          />
        </div>
      </div>

      {/* Play / Reset buttons */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="font-cairo gap-1.5" onClick={() => setIsRunning(r => !r)}>
          {isRunning ? <Pause size={14} /> : <Play size={14} />}
          {isRunning ? 'إيقاف' : 'تشغيل'}
        </Button>
        <Button size="sm" variant="outline" className="font-cairo gap-1.5" onClick={reset}>
          <ArrowClockwise size={14} /> إعادة تعيين
        </Button>
      </div>

      {/* Readouts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'التردد (Hz)', value: frequency.toFixed(2) },
          { label: 'الطول الموجي (m)', value: wavelength.toFixed(2) },
          { label: 'عدد العقد', value: nodesCount },
          { label: 'عدد البطون', value: antinodesCount },
        ].map(({ label, value }) => (
          <div key={label} className="bg-muted/50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold font-mono text-primary">{value}</p>
            <p className="text-xs text-muted-foreground font-cairo">{label}</p>
          </div>
        ))}
      </div>

      {/* Formula */}
      <div className="bg-muted/40 rounded-lg p-3 text-xs font-cairo space-y-1">
        <p className="font-semibold text-sm">العلاقة الرياضية:</p>
        <p className="font-mono text-base text-center py-1">
          f<sub>n</sub> = n × v / (2L)
        </p>
        <p className="text-muted-foreground text-center">
          السرعة على السلك v = {WAVE_SPEED} m/s ،  L = طول السلك ،  n = رقم الهارمونيك
        </p>
      </div>

    </div>
  )
}
