import { useState, useRef, useEffect, useCallback } from 'react'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, ArrowClockwise } from '@phosphor-icons/react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

// ═══════════════════════════════════════════════════════════════════════════════
// Layout constants
// ═══════════════════════════════════════════════════════════════════════════════
const CW = 540
const CH = 280
const G  = 9.8
const DT = 1 / 60

// ═══════════════════════════════════════════════════════════════════════════════
// Draw helpers shared across all experiments
// ═══════════════════════════════════════════════════════════════════════════════

function drawGrid(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, CW, CH)
  ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1
  for (let x = 0; x < CW; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke() }
  for (let y = 0; y < CH; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke() }
}

function drawSurface(ctx: CanvasRenderingContext2D, y: number) {
  ctx.fillStyle = '#334155'; ctx.fillRect(0, y, CW, 18)
  ctx.fillStyle = '#475569'
  for (let x = 0; x < CW; x += 30) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 14, y + 18); ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 1; ctx.stroke()
  }
}

// Horizontal force arrow
function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, length: number, color: string, label: string) {
  if (length < 2) return
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + length, y); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + length, y)
  ctx.lineTo(x + length - 10, y - 6)
  ctx.lineTo(x + length - 10, y + 6)
  ctx.closePath(); ctx.fill()
  ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = color
  ctx.fillText(label, x + length / 2, y - 8)
}

// Cart box
function drawCart(ctx: CanvasRenderingContext2D, cx: number, cy: number, label: string, w = 60, h = 36, color = '#dc2626') {
  ctx.fillStyle = color
  ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h, w, h, 5); ctx.fill()
  ctx.fillStyle = '#fff'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center'
  ctx.fillText(label, cx, cy - h / 2 + 5)
  // Wheels
  for (const wx of [cx - w / 2 + 10, cx + w / 2 - 10]) {
    ctx.beginPath(); ctx.arc(wx, cy + 5, 7, 0, Math.PI * 2)
    ctx.fillStyle = '#0f172a'; ctx.fill()
    ctx.beginPath(); ctx.arc(wx, cy + 5, 3, 0, Math.PI * 2)
    ctx.fillStyle = '#94a3b8'; ctx.fill()
  }
}

// HUD panel
function drawHUD(ctx: CanvasRenderingContext2D, rows: { l: string; v: string; c: string }[]) {
  rows.forEach((r, i) => {
    ctx.fillStyle = 'rgba(15,23,42,0.82)'
    ctx.beginPath(); ctx.roundRect(CW - 155, 8 + i * 30, 148, 24, 4); ctx.fill()
    ctx.fillStyle = r.c; ctx.font = 'bold 11px Cairo, monospace'; ctx.textAlign = 'right'
    ctx.fillText(`${r.l}: ${r.v}`, CW - 12, 24 + i * 30)
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXP 1 — Force vs Acceleration  (F = ma, vary F, fix m)
// ═══════════════════════════════════════════════════════════════════════════════

const SURF1 = CH - 30
const FIXED_MASS_1 = 2   // kg (fixed)

function drawExp1(ctx: CanvasRenderingContext2D, pos: number, vel: number, t: number, F: number) {
  drawGrid(ctx)
  drawSurface(ctx, SURF1)

  const a = F / FIXED_MASS_1
  const cartX = Math.min(60 + pos * 55, CW - 80)

  // Force arrow (left of cart)
  drawArrow(ctx, cartX - 70, SURF1 - 18, Math.min(60, F * 2.5), '#22d3ee', `F=${F}N`)
  // Acceleration arrow (above cart, smaller)
  drawArrow(ctx, cartX + 30, SURF1 - 55, Math.min(50, a * 10), '#4ade80', `a=${a.toFixed(1)}m/s²`)

  drawCart(ctx, cartX, SURF1, `${FIXED_MASS_1} kg`, 60, 38, '#dc2626')

  // Formula
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'left'
  ctx.fillText(`F = ma  →  ${F} = ${FIXED_MASS_1} × ${a.toFixed(1)}`, 10, 22)

  drawHUD(ctx, [
    { l: 'القوة F',    v: `${F} N`,          c: '#22d3ee' },
    { l: 'التسارع a',  v: `${a.toFixed(2)} m/s²`, c: '#4ade80' },
    { l: 'السرعة v',   v: `${vel.toFixed(2)} m/s`, c: '#f59e0b' },
    { l: 'الزمن t',    v: `${t.toFixed(1)} s`,    c: '#a78bfa' },
  ])
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXP 2 — Mass vs Acceleration  (F = ma, vary m, fix F)
// ═══════════════════════════════════════════════════════════════════════════════

const FIXED_FORCE_2 = 10   // N (fixed)
const SURF2 = CH - 30

function drawExp2(ctx: CanvasRenderingContext2D, pos: number, vel: number, t: number, m: number) {
  drawGrid(ctx)
  drawSurface(ctx, SURF2)

  const a = FIXED_FORCE_2 / m
  const cartX = Math.min(60 + pos * 40, CW - 90)
  const cw = 44 + m * 5   // wider box = heavier

  // Fixed force arrow
  drawArrow(ctx, cartX - 80, SURF2 - 20, 65, '#22d3ee', `F=${FIXED_FORCE_2}N`)
  // Acceleration (smaller when heavier)
  drawArrow(ctx, cartX + cw / 2 + 5, SURF2 - 60, Math.min(55, a * 14), '#4ade80', `a=${a.toFixed(1)}`)

  drawCart(ctx, cartX, SURF2, `${m} kg`, cw, 38, '#7c3aed')

  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'left'
  ctx.fillText(`a = F/m  →  a = ${FIXED_FORCE_2}/${m} = ${a.toFixed(2)} m/s²`, 10, 22)

  drawHUD(ctx, [
    { l: 'الكتلة m',   v: `${m} kg`,          c: '#a78bfa' },
    { l: 'التسارع a',  v: `${a.toFixed(2)} m/s²`, c: '#4ade80' },
    { l: 'السرعة v',   v: `${vel.toFixed(2)} m/s`, c: '#f59e0b' },
    { l: 'الزمن t',    v: `${t.toFixed(1)} s`,    c: '#22d3ee' },
  ])
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXP 3 — Atwood / Pulley   a = m2·g / (m1 + m2)
// ═══════════════════════════════════════════════════════════════════════════════

const TABLE_Y  = CH - 80
const PULLEY_X = CW - 45
const PULLEY_Y = TABLE_Y - 10

function drawExp3(ctx: CanvasRenderingContext2D, s: number, vel: number, t: number, m1: number, m2: number) {
  drawGrid(ctx)

  // Table surface
  ctx.fillStyle = '#334155'; ctx.fillRect(30, TABLE_Y, PULLEY_X - 30, 16)
  ctx.fillStyle = '#475569'
  for (let x = 30; x < PULLEY_X; x += 28) {
    ctx.beginPath(); ctx.moveTo(x, TABLE_Y); ctx.lineTo(x + 12, TABLE_Y + 16)
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1; ctx.stroke()
  }

  // Pulley circle
  ctx.beginPath(); ctx.arc(PULLEY_X, PULLEY_Y, 14, 0, Math.PI * 2)
  ctx.fillStyle = '#1e3a5f'; ctx.fill()
  ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2.5; ctx.stroke()
  ctx.beginPath(); ctx.arc(PULLEY_X, PULLEY_Y, 5, 0, Math.PI * 2)
  ctx.fillStyle = '#60a5fa'; ctx.fill()

  // Cart m1 position on table
  const a = m2 * G / (m1 + m2)
  const cartX = Math.min(60 + s * 50, PULLEY_X - 50)
  drawCart(ctx, cartX, TABLE_Y, `m₁\n${m1}kg`, 60, 38, '#dc2626')

  // String: horizontal from cart to pulley, then vertical down
  ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cartX + 30, TABLE_Y - 19)
  ctx.lineTo(PULLEY_X, TABLE_Y - 19)
  ctx.stroke()
  const m2Top = PULLEY_Y + 14
  const m2Drop = Math.min(s * 55, CH - m2Top - 50)
  ctx.beginPath()
  ctx.moveTo(PULLEY_X, PULLEY_Y + 14)
  ctx.lineTo(PULLEY_X, m2Top + m2Drop)
  ctx.stroke()

  // m2 hanging
  const m2cy = m2Top + m2Drop + 30
  ctx.fillStyle = '#16a34a'
  ctx.beginPath(); ctx.roundRect(PULLEY_X - 22, m2cy - 30, 44, 30, 5); ctx.fill()
  ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center'
  ctx.fillText(`m₂`, PULLEY_X, m2cy - 18)
  ctx.fillText(`${m2}kg`, PULLEY_X, m2cy - 5)

  // Gravity arrow on m2
  if (m2cy + 10 < CH - 8) {
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.moveTo(PULLEY_X, m2cy); ctx.lineTo(PULLEY_X, m2cy + 22); ctx.stroke()
    ctx.fillStyle = '#ef4444'; ctx.beginPath()
    ctx.moveTo(PULLEY_X, m2cy + 22)
    ctx.lineTo(PULLEY_X - 5, m2cy + 14)
    ctx.lineTo(PULLEY_X + 5, m2cy + 14)
    ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#ef4444'; ctx.font = '9px monospace'; ctx.fillText('m₂g', PULLEY_X + 14, m2cy + 18)
  }

  // Velocity arrow on m1
  if (vel > 0.05) {
    drawArrow(ctx, cartX + 30, TABLE_Y - 45, Math.min(50, vel * 15), '#4ade80', 'v')
  }

  // Formula
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'left'
  ctx.fillText(`a = m₂g/(m₁+m₂) = ${m2}×${G}/${m1+m2} = ${a.toFixed(2)} m/s²`, 10, 22)

  drawHUD(ctx, [
    { l: 'التسارع a', v: `${a.toFixed(2)} m/s²`, c: '#4ade80' },
    { l: 'السرعة v',  v: `${vel.toFixed(2)} m/s`, c: '#f59e0b' },
    { l: 'المسافة s', v: `${s.toFixed(2)} m`,     c: '#22d3ee' },
    { l: 'الزمن t',   v: `${t.toFixed(1)} s`,     c: '#a78bfa' },
  ])
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

type ExpId = 1 | 2 | 3
interface Pt { t: number; v: number; s: number }

export function AccelerationSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>()
  const simRef    = useRef({ running: false, t: 0, v: 0, s: 0, lastPt: 0 })

  const [exp, setExp]     = useState<ExpId>(1)
  const [running, setRunning] = useState(false)
  const [data, setData]   = useState<Pt[]>([])

  // Exp-1 controls
  const [force, setForce] = useState(10)
  const forceRef = useRef(10)

  // Exp-2 controls
  const [mass2, setMass2] = useState(3)
  const mass2Ref = useRef(3)

  // Exp-3 controls
  const [m1, setM1] = useState(2)
  const [m2, setM2] = useState(1)
  const m1Ref = useRef(2)
  const m2Ref = useRef(1)

  // live readings
  const [liveV, setLiveV] = useState(0)
  const [liveS, setLiveS] = useState(0)
  const [liveT, setLiveT] = useState(0)

  // ── acceleration helper ────────────────────────────────────────────────────
  const getA = useCallback(() => {
    if (exp === 1) return forceRef.current / FIXED_MASS_1
    if (exp === 2) return FIXED_FORCE_2 / mass2Ref.current
    return m2Ref.current * G / (m1Ref.current + m2Ref.current)
  }, [exp])

  // ── draw loop ──────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const sim = simRef.current

    if (sim.running) {
      const a = (exp === 1) ? forceRef.current / FIXED_MASS_1
               : (exp === 2) ? FIXED_FORCE_2 / mass2Ref.current
               : m2Ref.current * G / (m1Ref.current + m2Ref.current)

      sim.t += DT
      sim.v += a * DT
      sim.s += sim.v * DT

      // Stop if cart reaches end
      const maxS = exp === 3 ? 2.2 : 3.5
      if (sim.s >= maxS) { sim.running = false; setRunning(false) }

      // Record data point every 0.2s
      if (sim.t - sim.lastPt >= 0.2) {
        sim.lastPt = sim.t
        const pt: Pt = { t: +sim.t.toFixed(2), v: +sim.v.toFixed(2), s: +sim.s.toFixed(2) }
        setData(prev => [...prev.slice(-60), pt])
      }

      setLiveV(+sim.v.toFixed(2))
      setLiveS(+sim.s.toFixed(2))
      setLiveT(+sim.t.toFixed(1))
    }

    // Draw correct experiment
    if (exp === 1) drawExp1(ctx, sim.s, sim.v, sim.t, forceRef.current)
    else if (exp === 2) drawExp2(ctx, sim.s, sim.v, sim.t, mass2Ref.current)
    else drawExp3(ctx, sim.s, sim.v, sim.t, m1Ref.current, m2Ref.current)

    rafRef.current = requestAnimationFrame(draw)
  }, [exp])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [draw])

  useEffect(() => { simRef.current.running = running }, [running])

  const reset = () => {
    setRunning(false)
    simRef.current = { running: false, t: 0, v: 0, s: 0, lastPt: 0 }
    setData([]); setLiveV(0); setLiveS(0); setLiveT(0)
  }

  const switchExp = (e: ExpId) => { setExp(e); reset() }

  const a = getA()

  // ── Experiment metadata ────────────────────────────────────────────────────
  const expMeta = {
    1: {
      title: 'تجربة ١ — القوة والتسارع (F ∝ a)',
      eq: `a = F/m = ${force}/${FIXED_MASS_1} = ${(force/FIXED_MASS_1).toFixed(2)} m/s²`,
      formula: 'F = m·a',
      color: 'bg-cyan-700',
      border: 'border-cyan-700',
      desc: 'الكتلة ثابتة — زيادة القوة تزيد التسارع بشكل مطرد (علاقة طردية)',
    },
    2: {
      title: 'تجربة ٢ — الكتلة والتسارع (m ∝ 1/a)',
      eq: `a = F/m = ${FIXED_FORCE_2}/${mass2} = ${(FIXED_FORCE_2/mass2).toFixed(2)} m/s²`,
      formula: 'a = F/m',
      color: 'bg-violet-700',
      border: 'border-violet-700',
      desc: 'القوة ثابتة — زيادة الكتلة تُقلل التسارع (علاقة عكسية)',
    },
    3: {
      title: 'تجربة ٣ — آلة أتوود (البكرة)',
      eq: `a = m₂g/(m₁+m₂) = ${m2}×${G}/${m1+m2} = ${a.toFixed(2)} m/s²`,
      formula: 'a = m₂g/(m₁+m₂)',
      color: 'bg-green-700',
      border: 'border-green-700',
      desc: 'الكتلة المعلّقة m₂ تسحب العربة m₁ — القانون الثاني لنيوتن على منظومة',
    },
  } as const

  const meta = expMeta[exp]

  return (
    <div className="space-y-4 font-cairo" dir="rtl">
      {/* Header */}
      <h3 className="font-bold text-base">قياس التسارع — قانون نيوتن الثاني (F = ma)</h3>

      {/* Experiment selector */}
      <div className="flex gap-2 flex-wrap">
        {([1, 2, 3] as ExpId[]).map(e => (
          <button key={e} onClick={() => switchExp(e)}
            className={`px-4 py-2 rounded-lg border text-sm font-cairo transition-all ${exp === e
              ? `${expMeta[e].color} text-white border-transparent shadow-md`
              : 'border-slate-600 hover:bg-slate-700 text-slate-300'}`}>
            {expMeta[e].title}
          </button>
        ))}
      </div>

      {/* Formula badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <code className="bg-slate-800 text-amber-400 px-3 py-1 rounded font-mono text-sm font-bold">
          {meta.formula}
        </code>
        <span className="text-xs text-slate-400 font-cairo">{meta.desc}</span>
      </div>

      {/* Main layout: canvas + graph side by side on large, stacked on small */}
      <div className="grid lg:grid-cols-5 gap-4">

        {/* Canvas */}
        <div className="lg:col-span-3 space-y-3">
          <div className={`rounded-xl overflow-hidden border-2 ${meta.border}`}>
            <canvas ref={canvasRef} width={CW} height={CH} className="w-full block" />
          </div>
          {/* Buttons */}
          <div className="flex gap-2 justify-center">
            <button onClick={() => setRunning(r => !r)}
              className={`px-5 py-2 rounded-lg text-sm font-cairo flex items-center gap-2 transition-colors ${running
                ? 'bg-amber-700 hover:bg-amber-600 text-white'
                : 'bg-green-700 hover:bg-green-600 text-white'}`}>
              {running ? <><Pause size={15} />إيقاف</> : <><Play size={15} />تشغيل</>}
            </button>
            <button onClick={reset}
              className="px-5 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 text-sm font-cairo flex items-center gap-2">
              <ArrowClockwise size={15} />إعادة
            </button>
          </div>
        </div>

        {/* Controls + Readings */}
        <div className="lg:col-span-2 space-y-3">
          {/* Current equation */}
          <Card className="bg-slate-900/70 border-slate-700">
            <CardContent className="p-3 space-y-2">
              <p className="text-xs text-slate-400 font-cairo">المعادلة الحالية:</p>
              <code className="text-xs text-amber-300 font-mono block leading-relaxed">{meta.eq}</code>
            </CardContent>
          </Card>

          {/* Sliders */}
          <Card className="border-slate-700">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-cairo">المتغير المستقل</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              {exp === 1 && (
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-cairo">القوة المطبّقة (F)</span>
                    <Badge className="bg-cyan-700 text-white font-mono text-xs">{force} N</Badge>
                  </div>
                  <Slider min={1} max={30} step={1} value={[force]}
                    onValueChange={([v]) => { setForce(v); forceRef.current = v; reset() }} />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>1 N</span><span>30 N</span>
                  </div>
                </div>
              )}
              {exp === 2 && (
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-cairo">كتلة العربة (m)</span>
                    <Badge className="bg-violet-700 text-white font-mono text-xs">{mass2} kg</Badge>
                  </div>
                  <Slider min={0.5} max={8} step={0.5} value={[mass2]}
                    onValueChange={([v]) => { setMass2(v); mass2Ref.current = v; reset() }} />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0.5 kg</span><span>8 kg</span>
                  </div>
                </div>
              )}
              {exp === 3 && (
                <>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-cairo">كتلة العربة m₁ (على المنضدة)</span>
                      <Badge className="bg-red-700 text-white font-mono text-xs">{m1} kg</Badge>
                    </div>
                    <Slider min={0.5} max={8} step={0.5} value={[m1]}
                      onValueChange={([v]) => { setM1(v); m1Ref.current = v; reset() }} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-cairo">كتلة الثقل المعلّق m₂</span>
                      <Badge className="bg-green-700 text-white font-mono text-xs">{m2} kg</Badge>
                    </div>
                    <Slider min={0.1} max={5} step={0.1} value={[m2]}
                      onValueChange={([v]) => { setM2(v); m2Ref.current = v; reset() }} />
                  </div>
                </>
              )}
              {/* Fixed variable info */}
              <div className="text-xs text-slate-400 bg-slate-800/50 rounded p-2 font-cairo">
                {exp === 1 && <>المتغير الثابت: الكتلة m = {FIXED_MASS_1} kg</>}
                {exp === 2 && <>المتغير الثابت: القوة F = {FIXED_FORCE_2} N</>}
                {exp === 3 && <>g = {G} m/s² | نظام متصل ببكرة</>}
              </div>
            </CardContent>
          </Card>

          {/* Live readings */}
          <Card className="border-slate-700">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-cairo">القياسات الفورية</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {[
                { l: 'التسارع a', v: `${a.toFixed(3)} m/s²`, c: 'text-green-400' },
                { l: 'السرعة v',  v: `${liveV} m/s`,          c: 'text-amber-400' },
                { l: 'المسافة s', v: `${liveS} m`,             c: 'text-cyan-400' },
                { l: 'الزمن t',   v: `${liveT} s`,             c: 'text-purple-400' },
              ].map(({ l, v, c }) => (
                <div key={l} className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-cairo">{l}</span>
                  <span className={`font-mono font-bold ${c}`}>{v}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Live graph ──────────────────────────────────────────────────────── */}
      <Card className={`border-2 ${meta.border}`}>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-cairo flex items-center gap-2">
            📊 الرسم البياني الحي — السرعة والمسافة عبر الزمن
            {running && (
              <Badge className="bg-green-700 text-white text-xs animate-pulse">● يسجّل</Badge>
            )}
            {!running && data.length > 0 && (
              <Badge variant="secondary" className="text-xs">{data.length} نقطة</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {data.length < 3 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm font-cairo">
              شغّل التجربة لتظهر البيانات...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="t" type="number" domain={['dataMin', 'dataMax']}
                  label={{ value: 'الزمن t (s)', position: 'insideBottom', offset: -12, fill: '#94a3b8', fontFamily: 'Cairo', fontSize: 11 }}
                  tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', fontFamily: 'Cairo', direction: 'rtl', fontSize: 11 }}
                  formatter={(v: number, name: string) => [
                    `${v}`,
                    name === 'v' ? 'السرعة (m/s)' : 'المسافة (m)'
                  ]}
                  labelFormatter={(l: number) => `t = ${Number(l).toFixed(2)} s`}
                />
                <Legend
                  formatter={(v) => v === 'v' ? 'السرعة v (m/s)' : 'المسافة s (m)'}
                  wrapperStyle={{ fontFamily: 'Cairo', fontSize: 12, color: '#e2e8f0', paddingTop: '8px' }}
                />
                <Line type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={2.5}
                  dot={false} name="v" animationDuration={0} />
                <Line type="monotone" dataKey="s" stroke="#22d3ee" strokeWidth={2.5}
                  dot={false} name="s" animationDuration={0} />
              </LineChart>
            </ResponsiveContainer>
          )}

          {/* Graph interpretation */}
          {data.length >= 10 && (
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-cairo">
              <div className="bg-amber-950/30 border border-amber-800/40 rounded p-2">
                <p className="font-bold text-amber-400">v(t) — خط مستقيم</p>
                <p className="text-slate-300">v = at → التسارع منتظم = ميل المنحنى</p>
              </div>
              <div className="bg-cyan-950/30 border border-cyan-800/40 rounded p-2">
                <p className="font-bold text-cyan-400">s(t) — منحنى تربيعي</p>
                <p className="text-slate-300">s = ½at² → مساحة تحت منحنى v(t)</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-3">
        {[
          {
            n: '١', title: 'F ∝ a (كتلة ثابتة)', color: 'border-cyan-800/40 bg-cyan-950/20',
            body: 'ضعف القوة = ضعف التسارع. الرسم: خط مستقيم يمر بالأصل.'
          },
          {
            n: '٢', title: 'a ∝ 1/m (قوة ثابتة)', color: 'border-violet-800/40 bg-violet-950/20',
            body: 'ضعف الكتلة = نصف التسارع. الرسم: منحنى هذبولي.'
          },
          {
            n: '٣', title: 'قانون نيوتن الثاني', color: 'border-green-800/40 bg-green-950/20',
            body: 'F = ma على المنظومة الكلية. a = m₂g/(m₁+m₂).'
          },
        ].map(({ n, title, color, body }) => (
          <Card key={n} className={`${color} border`}>
            <CardContent className="p-3 text-xs font-cairo">
              <p className="font-bold text-slate-200 mb-1">تجربة {n}: {title}</p>
              <p className="text-slate-400 leading-relaxed">{body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
