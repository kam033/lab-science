import { useState, useRef, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plant } from '@phosphor-icons/react'

// ─── Constants ────────────────────────────────────────────────────────────────
const CW = 500
const CH = 320

// Light colour configurations
interface LightColour {
  id: string
  nameAr: string
  wavelength: string   // nm range
  css: string
  auxinEffect: number  // 0–1 (how strongly it causes bending)
  bendAngle: number    // max degrees bending
}

const LIGHT_COLOURS: LightColour[] = [
  { id: 'blue',    nameAr: 'أزرق',    wavelength: '450–495', css: '#3b82f6', auxinEffect: 0.95, bendAngle: 42 },
  { id: 'violet',  nameAr: 'بنفسجي', wavelength: '380–450', css: '#8b5cf6', auxinEffect: 0.85, bendAngle: 38 },
  { id: 'green',   nameAr: 'أخضر',   wavelength: '495–570', css: '#22c55e', auxinEffect: 0.25, bendAngle: 12 },
  { id: 'red',     nameAr: 'أحمر',   wavelength: '625–750', css: '#ef4444', auxinEffect: 0.15, bendAngle: 8  },
  { id: 'dark',    nameAr: 'ظلام',   wavelength: '—',       css: '#1e293b', auxinEffect: 0,    bendAngle: 0  },
]

// ─── Canvas ────────────────────────────────────────────────────────────────────

function PhototrophismCanvas({ bendDeg, lightColour, elapsed }: {
  bendDeg: number
  lightColour: LightColour
  elapsed: number  // 0–1 progress
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, CW, CH)

    // Background (dark box)
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, CW, CH)

    // Grid floor
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 1
    for (let x = 0; x < CW; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke()
    }
    for (let y = 0; y < CH; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke()
    }

    // Light source on left
    if (lightColour.id !== 'dark') {
      const gradient = ctx.createRadialGradient(30, CH / 2, 5, 30, CH / 2, 220)
      gradient.addColorStop(0, lightColour.css + 'cc')
      gradient.addColorStop(1, lightColour.css + '00')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, CW, CH)

      // Rays
      ctx.strokeStyle = lightColour.css + '66'
      ctx.lineWidth = 1.5
      for (let i = -4; i <= 4; i++) {
        ctx.beginPath()
        ctx.moveTo(35, CH / 2 + i * 25)
        ctx.lineTo(280, CH / 2 + i * 15)
        ctx.stroke()
      }

      // Light label
      ctx.fillStyle = lightColour.css
      ctx.font = 'bold 12px Cairo, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`ضوء ${lightColour.nameAr}`, 35, CH - 12)
      ctx.fillText(`${lightColour.wavelength} nm`, 35, CH - 0)
    }

    // Soil
    ctx.fillStyle = '#451a03'
    ctx.fillRect(200, CH - 50, 100, 50)
    ctx.fillStyle = '#78350f'
    ctx.fillRect(200, CH - 53, 100, 8)
    // Soil texture dots
    ctx.fillStyle = '#92400e'
    for (let i = 0; i < 12; i++) {
      const dx = 205 + i * 7
      const dy = CH - 40 + (i % 3) * 7
      ctx.beginPath(); ctx.arc(dx, dy, 2, 0, Math.PI * 2); ctx.fill()
    }

    // Seedling stem with curve toward light
    const baseX = 250
    const baseY = CH - 54
    const stemHeight = 120
    const anglRad = (bendDeg * elapsed * Math.PI) / 180

    // Draw curved stem using bezier
    const tipX = baseX - Math.sin(anglRad) * stemHeight
    const tipY = baseY - Math.cos(anglRad) * stemHeight
    const cpX = baseX - Math.sin(anglRad * 0.5) * stemHeight * 0.5
    const cpY = baseY - stemHeight * 0.7

    ctx.strokeStyle = '#4ade80'
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(baseX, baseY)
    ctx.quadraticCurveTo(cpX, cpY, tipX, tipY)
    ctx.stroke()

    // Leaves
    const drawLeaf = (lx: number, ly: number, angle: number, size: number) => {
      ctx.save()
      ctx.translate(lx, ly)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.ellipse(0, -size / 2, size * 0.4, size / 2, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#16a34a'
      ctx.fill()
      ctx.strokeStyle = '#4ade80'
      ctx.lineWidth = 1
      ctx.stroke()
      // midrib
      ctx.beginPath()
      ctx.moveTo(0, 0); ctx.lineTo(0, -size)
      ctx.strokeStyle = '#86efac'; ctx.lineWidth = 0.8; ctx.stroke()
      ctx.restore()
    }

    const midX = baseX - Math.sin(anglRad * 0.5) * stemHeight * 0.4
    const midY = baseY - stemHeight * 0.45
    drawLeaf(midX - 15, midY, -anglRad - 0.4, 20)
    drawLeaf(midX + 12, midY - 5, anglRad + 0.5, 18)
    drawLeaf(tipX - 5, tipY + 5, -anglRad - 0.2, 22)

    // Angle annotation
    if (bendDeg > 0 && elapsed > 0.2) {
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 3])
      ctx.beginPath()
      ctx.moveTo(baseX, baseY - 10)
      ctx.lineTo(baseX, baseY - stemHeight * 0.6)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 14px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`${Math.round(bendDeg * elapsed)}°`, tipX + 8, tipY + 5)
    }

    // Auxin distribution arrows
    if (lightColour.id !== 'dark' && elapsed > 0.3) {
      ctx.font = '10px Cairo, sans-serif'
      ctx.fillStyle = '#a78bfa'
      ctx.textAlign = 'center'
      // high auxin on shadow side
      ctx.fillText('أوكسين ↑ (الجانب المظلل)', baseX + 55, baseY - stemHeight * 0.55)
      ctx.fillStyle = '#64748b'
      ctx.fillText('أوكسين ↓ (جانب الضوء)', baseX - 80, baseY - stemHeight * 0.65)
    }
  }, [bendDeg, lightColour, elapsed])

  return (
    <canvas ref={canvasRef} width={CW} height={CH} className="w-full rounded-lg border border-slate-700" />
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PhototrophismSim() {
  const [selectedColour, setSelectedColour] = useState<LightColour>(LIGHT_COLOURS[0])
  const [elapsed, setElapsed] = useState(0)   // 0–1 animation progress
  const [intensity, setIntensity] = useState(80)
  const animRef = useRef<number>(0)
  const progressRef = useRef(0)

  const effectiveBend = selectedColour.bendAngle * (intensity / 100)

  const startAnimation = () => {
    progressRef.current = 0
    const step = () => {
      progressRef.current = Math.min(1, progressRef.current + 0.008)
      setElapsed(progressRef.current)
      if (progressRef.current < 1) animRef.current = requestAnimationFrame(step)
    }
    cancelAnimationFrame(animRef.current)
    animRef.current = requestAnimationFrame(step)
  }

  const reset = () => {
    cancelAnimationFrame(animRef.current)
    progressRef.current = 0
    setElapsed(0)
  }

  return (
    <div className="space-y-4 font-cairo" dir="rtl">
      <div className="flex items-center gap-2">
        <Plant size={20} weight="fill" className="text-green-400" />
        <h3 className="font-bold text-lg">محاكاة الانتحاء الضوئي — بادرات القمح</h3>
      </div>

      {/* Light colour selector */}
      <div className="flex gap-2 flex-wrap">
        {LIGHT_COLOURS.map(c => (
          <button key={c.id}
            onClick={() => { setSelectedColour(c); reset() }}
            className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${selectedColour.id === c.id
              ? 'text-white shadow-md'
              : 'border-slate-600 hover:bg-slate-700 text-slate-300'}`}
            style={selectedColour.id === c.id ? { backgroundColor: c.css, borderColor: c.css } : {}}
          >
            {c.nameAr}
            {c.wavelength !== '—' && <span className="text-xs opacity-75 mr-1">{c.wavelength}</span>}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <PhototrophismCanvas bendDeg={effectiveBend} lightColour={selectedColour} elapsed={elapsed} />

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm">شدة الضوء: <span className="text-green-400">{intensity}%</span></CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <Slider min={10} max={100} step={5} value={[intensity]}
              onValueChange={([v]) => { setIntensity(v); reset() }} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>خافتة</span><span>ساطعة</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm">التجربة</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 flex gap-2">
            <button onClick={startAnimation}
              className="flex-1 px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm transition-colors font-cairo">
              ▶ تشغيل
            </button>
            <button onClick={reset}
              className="flex-1 px-3 py-1.5 border border-slate-600 hover:bg-slate-700 rounded-lg text-sm transition-colors font-cairo">
              ↺ إعادة
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-purple-950/30 border-purple-800/40">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-purple-400 font-cairo">الطول الموجي</p>
            <p className="font-bold text-purple-300">{selectedColour.wavelength} nm</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-950/30 border-amber-800/40">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-amber-400 font-cairo">زاوية الانحناء</p>
            <p className="text-xl font-bold text-amber-300">{Math.round(effectiveBend * elapsed)}°</p>
          </CardContent>
        </Card>
        <Card className="bg-green-950/30 border-green-800/40">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-green-400 font-cairo">استجابة الأوكسين</p>
            <p className="font-bold text-green-300">{Math.round(selectedColour.auxinEffect * 100)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Explanation */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-4 text-sm font-cairo space-y-2 text-slate-300 leading-relaxed">
          <p className="font-bold text-slate-200">آلية الانتحاء الضوئي:</p>
          <p>
            الضوء الأزرق يُفعّل بروتين <strong className="text-blue-400">الفوتوتروبين</strong> في جانب الضوء.
            يُثبط الفوتوتروبين انتقال هرمون الأوكسين إلى الجانب المضاء.
            يتراكم الأوكسين في <strong className="text-purple-400">الجانب المظلل</strong> →
            ينمو بشكل أسرع → ينحني الساق نحو الضوء.
          </p>
          <p className="text-xs text-slate-400">
            الضوء الأحمر: تأثير ضعيف | الضوء الأخضر: تأثير بسيط | الضوء الأزرق: الأقوى
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
