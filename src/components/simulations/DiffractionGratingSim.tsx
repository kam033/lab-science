import { useState, useRef, useEffect, useCallback } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowClockwise, Play, Pause } from '@phosphor-icons/react'

// ─── Laser colours ────────────────────────────────────────────────────────────
function wavelengthToColor(nm: number): string {
  if (nm < 380) return '#8b00ff'
  if (nm < 440) return `hsl(${270 + (nm-380)*0.5}, 100%, 55%)`
  if (nm < 490) return `hsl(${240 + (nm-440)*0.8}, 100%, 55%)`
  if (nm < 510) return `hsl(${180 + (nm-490)*3}, 100%, 45%)`
  if (nm < 580) return `hsl(${120 - (nm-510)*1.7}, 100%, 45%)`
  if (nm < 645) return `hsl(${30 - (nm-580)*0.5}, 100%, 50%)`
  return `hsl(0, 100%, 50%)`
}

// ─── Canvas simulation ────────────────────────────────────────────────────────
function DiffractionCanvas({
  wavelengthNm, gratingLinesPerMm, distanceCm, orderCount
}: {
  wavelengthNm: number
  gratingLinesPerMm: number
  distanceCm: number
  orderCount: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height

    ctx.clearRect(0, 0, W, H)

    // background
    const bg = ctx.createLinearGradient(0, 0, W, 0)
    bg.addColorStop(0, '#0a0a1a')
    bg.addColorStop(1, '#0a1a2a')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    const laserX = 40
    const gratingX = W * 0.42
    const screenX = W - 30
    const CY = H / 2

    // ── physics ──────────────────────────────────────────────────────────────
    const λ = wavelengthNm * 1e-6       // mm
    const d = 1 / gratingLinesPerMm     // mm spacing between lines
    const L = distanceCm * 10           // mm (screen distance)
    const color = wavelengthToColor(wavelengthNm)

    // Calculate fringe positions on screen (canvas units)
    const screenHeightMm = 80           // physical screen height = 80 mm
    const screenPxHeight = H - 20
    const mmToPx = screenPxHeight / screenHeightMm

    const fringes: { y: number; order: number; bright: boolean }[] = []
    for (let m = -orderCount; m <= orderCount; m++) {
      const sinTheta = (m * λ) / d
      if (Math.abs(sinTheta) >= 1) continue
      const theta = Math.asin(sinTheta)
      const x_mm = L * Math.tan(theta)
      const yPx = CY + x_mm * mmToPx
      if (yPx < 10 || yPx > H - 10) continue
      fringes.push({ y: yPx, order: m, bright: true })
    }

    // ── Laser beam (incident) ────────────────────────────────────────────────
    ctx.shadowBlur = 10
    ctx.shadowColor = color
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.globalAlpha = 0.9
    ctx.beginPath()
    ctx.moveTo(laserX, CY)
    ctx.lineTo(gratingX, CY)
    ctx.stroke()
    ctx.shadowBlur = 0
    ctx.globalAlpha = 1

    // ── Diffracted beams ─────────────────────────────────────────────────────
    fringes.forEach(({ y, order }) => {
      const intensity = Math.max(0.15, 1 - Math.abs(order) * 0.25)
      ctx.shadowBlur = 8
      ctx.shadowColor = color
      ctx.strokeStyle = color
      ctx.lineWidth = order === 0 ? 3 : 2
      ctx.globalAlpha = intensity * 0.85
      ctx.setLineDash(order !== 0 ? [4, 3] : [])
      ctx.beginPath()
      ctx.moveTo(gratingX, CY)
      ctx.lineTo(screenX, y)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
    })

    // ── Laser source ─────────────────────────────────────────────────────────
    ctx.fillStyle = '#333'
    ctx.strokeStyle = '#888'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(laserX - 30, CY - 14, 28, 28, 4)
    ctx.fill(); ctx.stroke()
    ctx.fillStyle = color
    ctx.font = 'bold 9px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('LASER', laserX - 16, CY + 3)

    // ── Grating ───────────────────────────────────────────────────────────────
    ctx.strokeStyle = 'rgba(200,200,255,0.8)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(gratingX, 10); ctx.lineTo(gratingX, H - 10); ctx.stroke()
    // grating lines
    for (let y = 15; y < H - 10; y += 6) {
      ctx.strokeStyle = 'rgba(150,150,255,0.4)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(gratingX - 4, y); ctx.lineTo(gratingX + 4, y); ctx.stroke()
    }
    ctx.fillStyle = 'rgba(150,150,255,0.9)'
    ctx.font = 'bold 9px Cairo,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('محزوز', gratingX, H - 3)
    ctx.fillText(`${gratingLinesPerMm} خط/mm`, gratingX, H - 14)

    // ── Screen ────────────────────────────────────────────────────────────────
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(screenX, 10); ctx.lineTo(screenX, H - 10); ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '9px Cairo,sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('شاشة', screenX - 2, H - 3)

    // ── Fringe spots on screen ────────────────────────────────────────────────
    fringes.forEach(({ y, order }) => {
      const intensity = Math.max(0.2, 1 - Math.abs(order) * 0.25)
      const r = order === 0 ? 9 : 6
      // glow
      const grd = ctx.createRadialGradient(screenX, y, 0, screenX, y, r * 2)
      grd.addColorStop(0, color)
      grd.addColorStop(1, 'transparent')
      ctx.fillStyle = grd
      ctx.globalAlpha = intensity
      ctx.beginPath()
      ctx.arc(screenX, y, r * 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      // spot
      ctx.beginPath()
      ctx.arc(screenX, y, r, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.globalAlpha = intensity
      ctx.fill()
      ctx.globalAlpha = 1

      // order label
      if (order !== 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.font = '9px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(`m=${order}`, screenX - 14, y + 3)
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.font = 'bold 9px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText('m=0', screenX - 14, y + 3)
      }
    })

    // ── Distance annotation ───────────────────────────────────────────────────
    const annotY = H - 28
    ctx.strokeStyle = 'rgba(255,255,200,0.4)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(gratingX, annotY)
    ctx.lineTo(screenX, annotY)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = 'rgba(255,255,200,0.8)'
    ctx.font = '10px Cairo,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`L = ${distanceCm} cm`, (gratingX + screenX) / 2, annotY - 4)

    // ── m=1 fringe spacing annotation ─────────────────────────────────────────
    const m1 = fringes.find(f => f.order === 1)
    const m_1 = fringes.find(f => f.order === -1)
    if (m1 && m_1) {
      ctx.strokeStyle = 'rgba(255,200,100,0.6)'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(screenX + 12, m_1.y)
      ctx.lineTo(screenX + 12, m1.y)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = 'rgba(255,200,100,0.9)'
      ctx.font = '9px Cairo,sans-serif'
      ctx.textAlign = 'left'
      const xMm = (L * Math.tan(Math.asin(λ / d)) * 2)
      ctx.fillText(`2x=${xMm.toFixed(1)}mm`, screenX + 14, (m_1.y + m1.y) / 2 + 3)
    }

  }, [wavelengthNm, gratingLinesPerMm, distanceCm, orderCount])

  useEffect(() => { draw() }, [draw])

  return (
    <canvas ref={canvasRef} width={620} height={240}
      className="w-full rounded-xl border border-border/30"
      style={{background:'#0a0a1a'}}/>
  )
}

// ─── Calculation panel ────────────────────────────────────────────────────────
function CalcPanel({ wavelengthNm, gratingLinesPerMm, distanceCm }: {
  wavelengthNm: number; gratingLinesPerMm: number; distanceCm: number
}) {
  const λ = wavelengthNm * 1e-6       // mm
  const d = 1 / gratingLinesPerMm     // mm
  const L = distanceCm * 10           // mm

  const sinTheta1 = λ / d
  const validM1 = Math.abs(sinTheta1) < 1
  const theta1Deg = validM1 ? (Math.asin(sinTheta1) * 180 / Math.PI) : NaN
  const x1mm = validM1 ? L * Math.tan(Math.asin(sinTheta1)) : NaN

  // reverse: measure x1, calculate λ
  const [measuredX, setMeasuredX] = useState(0)
  const calcLambda = measuredX > 0
    ? (d * Math.sin(Math.atan(measuredX / L)) / 1) * 1e6
    : NaN

  return (
    <div className="space-y-3">
      {/* Theoretical values */}
      <div className="bg-card/40 border border-border/20 rounded-xl p-3">
        <p className="text-xs font-bold text-primary mb-2">📊 القيم النظرية (الرتبة m=1)</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-card/50 rounded-lg p-2">
            <p className="text-muted-foreground">ثابت الشبكة d</p>
            <p className="font-bold font-mono">{(d * 1000).toFixed(2)} μm</p>
          </div>
          <div className="bg-card/50 rounded-lg p-2">
            <p className="text-muted-foreground">زاوية الانحراف θ₁</p>
            <p className="font-bold font-mono">
              {validM1 ? `${theta1Deg.toFixed(2)}°` : 'خارج النطاق'}
            </p>
          </div>
          <div className="bg-card/50 rounded-lg p-2">
            <p className="text-muted-foreground">بُعد الهدب x₁</p>
            <p className="font-bold font-mono">
              {validM1 ? `${x1mm.toFixed(1)} mm` : '—'}
            </p>
          </div>
          <div className="bg-card/50 rounded-lg p-2">
            <p className="text-muted-foreground">الطول الموجي λ</p>
            <p className="font-bold font-mono">{wavelengthNm} nm</p>
          </div>
        </div>
      </div>

      {/* Reverse calculation: measure x → get λ */}
      <div className="bg-yellow-950/30 border border-yellow-500/20 rounded-xl p-3">
        <p className="text-xs font-bold text-yellow-400 mb-2">🔬 احسب الطول الموجي من القياس</p>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">المسافة المقاسة x₁</span>
            <Badge variant="secondary">{measuredX.toFixed(0)} mm</Badge>
          </div>
          <Slider value={[measuredX]} onValueChange={([v]) => setMeasuredX(v)}
            min={0} max={100} step={1}/>
          {!isNaN(calcLambda) && calcLambda > 0 && (
            <div className="bg-yellow-900/30 rounded-lg p-2 text-center">
              <p className="text-xs text-muted-foreground">الطول الموجي المحسوب</p>
              <p className="text-lg font-bold text-yellow-400 font-mono">{calcLambda.toFixed(0)} nm</p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.abs(calcLambda - wavelengthNm) < 5
                  ? '✅ دقيق!'
                  : `الخطأ: ${Math.abs(calcLambda - wavelengthNm).toFixed(0)} nm`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function DiffractionGratingSim() {
  const [wavelength, setWavelength] = useState(532)    // nm (green laser)
  const [gratingN, setGratingN]     = useState(600)    // lines/mm
  const [distCm, setDistCm]         = useState(50)     // cm
  const [orders, setOrders]         = useState(3)
  const [isRunning, setIsRunning]   = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const reset = () => {
    setIsRunning(false)
    setWavelength(532); setGratingN(600); setDistCm(50); setOrders(3)
  }

  // Sweep through visible spectrum when running
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
      return
    }
    intervalRef.current = setInterval(() => {
      setWavelength(w => w >= 700 ? 380 : w + 10)
    }, 120)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning])

  const color = wavelengthToColor(wavelength)

  return (
    <div className="space-y-4 font-cairo" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-base text-foreground">🔬 قياس طول موجة الليزر بمحزوز الحيود</h3>
          <p className="text-xs text-muted-foreground mt-0.5">التخطيط لتجربة — وحدة الفيزياء الضوئية</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={isRunning ? 'secondary' : 'default'}
            className="gap-1.5 text-xs" onClick={() => setIsRunning(r => !r)}>
            {isRunning ? <><Pause size={13} weight="fill"/> إيقاف</> : <><Play size={13} weight="fill"/> تشغيل</>}
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={reset}>
            <ArrowClockwise size={13}/> إعادة ضبط
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <DiffractionCanvas
        wavelengthNm={wavelength}
        gratingLinesPerMm={gratingN}
        distanceCm={distCm}
        orderCount={orders}
      />

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

        <div className="bg-card/50 rounded-xl p-3 space-y-2 border border-border/30">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-primary">الطول الموجي λ</span>
            <Badge variant="secondary" style={{background: color + '40', color}}>
              {wavelength} nm
            </Badge>
          </div>
          <Slider value={[wavelength]} onValueChange={([v]) => setWavelength(v)}
            min={380} max={700} step={1}/>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>380nm بنفسجي</span><span>700nm أحمر</span>
          </div>
          <div className="h-3 rounded-full" style={{
            background:'linear-gradient(to left,#ff0000,#ff8000,#ffff00,#00ff00,#0000ff,#8b00ff)'
          }}/>
        </div>

        <div className="bg-card/50 rounded-xl p-3 space-y-2 border border-border/30">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-primary">كثافة الشبكة N</span>
            <Badge variant="secondary">{gratingN} خط/mm</Badge>
          </div>
          <Slider value={[gratingN]} onValueChange={([v]) => setGratingN(v)}
            min={100} max={1200} step={50}/>
          <p className="text-xs text-muted-foreground">
            d = {(1000 / gratingN).toFixed(2)} μm
          </p>
        </div>

        <div className="bg-card/50 rounded-xl p-3 space-y-2 border border-border/30">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-primary">المسافة L</span>
            <Badge variant="secondary">{distCm} cm</Badge>
          </div>
          <Slider value={[distCm]} onValueChange={([v]) => setDistCm(v)}
            min={10} max={150} step={5}/>
          <p className="text-xs text-muted-foreground">بُعد الشاشة عن المحزوز</p>
        </div>

        <div className="bg-card/50 rounded-xl p-3 space-y-2 border border-border/30">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-primary">عدد الرتب</span>
            <Badge variant="secondary">±{orders}</Badge>
          </div>
          <Slider value={[orders]} onValueChange={([v]) => setOrders(v)}
            min={1} max={5} step={1}/>
          <p className="text-xs text-muted-foreground">رتب الهدب m = 0,±1,±2…</p>
        </div>
      </div>

      {/* Calculations */}
      <CalcPanel wavelengthNm={wavelength} gratingLinesPerMm={gratingN} distanceCm={distCm}/>

      {/* Formula */}
      <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-4">
        <p className="text-sm font-bold text-indigo-300 mb-3">📐 معادلة الحيود</p>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="bg-indigo-900/40 rounded-lg px-4 py-2 font-mono text-indigo-200 text-xl text-center">
            d sin θ = m λ
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <span><strong className="text-foreground">d</strong> = ثابت الشبكة (mm) = 1/N</span>
            <span><strong className="text-foreground">θ</strong> = زاوية الانحراف</span>
            <span><strong className="text-foreground">m</strong> = رتبة الهدب (0,±1,±2…)</span>
            <span><strong className="text-foreground">λ</strong> = الطول الموجي (nm)</span>
          </div>
        </div>
        <div className="mt-3 bg-indigo-900/30 rounded-lg p-2 text-xs text-indigo-200 font-mono text-center">
          λ = (d × x) / (m × L) &nbsp;|&nbsp; tan θ = x / L
        </div>
      </div>

    </div>
  )
}
