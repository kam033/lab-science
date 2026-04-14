import { useState, useRef, useEffect, useCallback } from 'react'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, ArrowClockwise, Plus } from '@phosphor-icons/react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, ScatterChart, Scatter,
} from 'recharts'

// ═══════════════════════════════════════════════════════════════════════════════
// Constants & Physics model
// ═══════════════════════════════════════════════════════════════════════════════
const CW = 540
const CH = 360
const WATER_Y = 80
const PLANT_CX = CW / 2
const LIGHT_FIXED = 70   // fixed light % for this experiment

// Michaelis-Menten saturation model (realistic CO₂ response curve)
// rate = Vmax * [CO₂] / (Km + [CO₂])   — result in "units/s"
const VMAX = 12.0
const KM   = 0.12   // half-saturation (%)

function photoRate(co2Pct: number): number {
  return +(VMAX * co2Pct / (KM + co2Pct)).toFixed(2)
}

// Atmospheric reference
const ATM_CO2 = 0.04  // %

// ═══════════════════════════════════════════════════════════════════════════════
// Particle types
// ═══════════════════════════════════════════════════════════════════════════════
interface CO2Dot { x: number; y: number; vx: number; vy: number; absorbed: boolean; alpha: number }
interface O2Bubble { x: number; y: number; r: number; vy: number; alpha: number }

const leafZones = [
  { x: PLANT_CX - 35, y: 230, rw: 28, rh: 12 },
  { x: PLANT_CX + 35, y: 200, rw: 26, rh: 11 },
  { x: PLANT_CX - 32, y: 175, rw: 24, rh: 10 },
  { x: PLANT_CX + 30, y: 152, rw: 22, rh:  9 },
  { x: PLANT_CX - 28, y: 132, rw: 20, rh:  8 },
]

function inLeaf(x: number, y: number) {
  for (const l of leafZones) {
    if ((x - l.x) ** 2 / l.rw ** 2 + (y - l.y) ** 2 / l.rh ** 2 < 1) return true
  }
  return false
}

function spawnCO2(co2Pct: number): CO2Dot {
  return {
    x: 30 + Math.random() * (CW - 60),
    y: WATER_Y + 15 + Math.random() * (CH - WATER_Y - 30),
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    absorbed: false,
    alpha: 0.5 + (co2Pct / 0.5) * 0.35,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Drawing helpers
// ═══════════════════════════════════════════════════════════════════════════════
function drawBackground(ctx: CanvasRenderingContext2D, t: number) {
  // Sky (fixed light)
  const sky = ctx.createLinearGradient(0, 0, 0, WATER_Y)
  sky.addColorStop(0, '#fef3c7')
  sky.addColorStop(1, '#fde68a')
  ctx.fillStyle = sky; ctx.fillRect(0, 0, CW, WATER_Y)

  // Light rays
  ctx.strokeStyle = 'rgba(253,224,71,0.2)'; ctx.lineWidth = 18
  for (const rx of [80, 200, 320, 440]) {
    ctx.beginPath(); ctx.moveTo(rx, 0); ctx.lineTo(rx + 20, WATER_Y); ctx.stroke()
  }

  // Water
  const water = ctx.createLinearGradient(0, WATER_Y, 0, CH)
  water.addColorStop(0, '#dbeafe')
  water.addColorStop(1, '#93c5fd')
  ctx.fillStyle = water; ctx.fillRect(0, WATER_Y, CW, CH - WATER_Y)

  // Shimmer
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  for (let wx = 0; wx < CW; wx += 50) {
    ctx.beginPath()
    ctx.ellipse(wx + Math.sin(t * 1.5 + wx * 0.08) * 5, WATER_Y, 20, 3.5, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawPlant(ctx: CanvasRenderingContext2D, t: number) {
  const sway = Math.sin(t * 0.5) * 2.5
  ctx.strokeStyle = '#15803d'; ctx.lineWidth = 6; ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(PLANT_CX, CH - 20)
  ctx.quadraticCurveTo(PLANT_CX + sway * 2, (CH - 20 + 130) / 2, PLANT_CX + sway, 130)
  ctx.stroke()

  for (const l of leafZones) {
    ctx.fillStyle = '#16a34a'
    ctx.save(); ctx.translate(l.x + sway * 0.4, l.y)
    ctx.rotate(l.x < PLANT_CX ? -Math.PI / 5 : Math.PI / 5)
    ctx.beginPath(); ctx.ellipse(0, 0, l.rw, l.rh, 0, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }

  // Root
  ctx.fillStyle = '#78350f'
  ctx.beginPath(); ctx.ellipse(PLANT_CX, CH - 20, 16, 7, 0, 0, Math.PI * 2); ctx.fill()
}

function drawNaHCO3(ctx: CanvasRenderingContext2D, co2Pct: number) {
  // Little container on the left showing NaHCO₃
  const bx = 18, by = CH - 70, bw = 55, bh = 55
  ctx.fillStyle = 'rgba(15,23,42,0.65)'
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 5); ctx.fill()
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 5); ctx.stroke()

  // Liquid level based on concentration
  const fillH = Math.round((co2Pct / 0.5) * (bh - 14))
  ctx.fillStyle = '#bfdbfe88'
  ctx.beginPath()
  ctx.roundRect(bx + 3, by + bh - 4 - fillH, bw - 6, fillH, [0, 0, 4, 4])
  ctx.fill()

  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center'
  ctx.fillText('NaHCO₃', bx + bw / 2, by + 13)
  ctx.fillStyle = '#7dd3fc'; ctx.font = '9px Cairo, Arial'
  ctx.fillText(`CO₂: ${co2Pct.toFixed(2)}%`, bx + bw / 2, by + bh + 13)
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════════════════════════════════════════
interface DataRow { co2: number; rate: number }

export function CO2PhotosynthesisSim() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const rafRef     = useRef<number>()
  const co2Dots    = useRef<CO2Dot[]>([])
  const o2Bubbles  = useRef<O2Bubble[]>([])
  const simRef     = useRef({ running: false, time: 0, o2: 0, lastSpawn: 0 })
  const co2Ref     = useRef(0.12)
  const tRef       = useRef(0)

  const [running, setRunning] = useState(false)
  const [co2Pct, setCo2Pct]   = useState(0.12)
  const [rateUI, setRateUI]   = useState(0)
  const [o2UI,   setO2UI]     = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [dataTable, setDataTable] = useState<DataRow[]>([])
  const [tab, setTab] = useState<'sim' | 'graph' | 'analysis'>('sim')

  // ── draw loop ──────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const sim = simRef.current
    const co2 = co2Ref.current

    if (sim.running) {
      sim.time += 1 / 60
      const rate = photoRate(co2)

      // Spawn CO₂ dots proportional to concentration
      const targetCount = Math.round(co2 * 120)
      while (co2Dots.current.length < targetCount) co2Dots.current.push(spawnCO2(co2))
      while (co2Dots.current.length > targetCount + 5) co2Dots.current.shift()

      // Move CO₂, absorb at leaves
      const newBubbles: O2Bubble[] = []
      co2Dots.current = co2Dots.current.map(d => {
        if (d.absorbed) return d
        let { x, y, vx, vy } = d
        // drift toward plant with slight bias
        vx += (PLANT_CX - x) * 0.0002
        x += vx; y += vy
        if (x < 20 || x > CW - 20) vx = -vx
        if (y < WATER_Y + 10 || y > CH - 15) vy = -vy

        if (inLeaf(x, y) && Math.random() < (rate / VMAX) * 0.025) {
          // Absorbed → emit O₂ bubble
          sim.o2 += 0.3
          newBubbles.push({
            x: x + (Math.random() - 0.5) * 14,
            y,
            r: 3.5 + Math.random() * 3,
            vy: -(0.5 + Math.random() * 0.4),
            alpha: 0.85,
          })
          return { ...d, absorbed: true }
        }
        return { ...d, x, y, vx, vy }
      }).filter(d => !d.absorbed)
      // Refill absorbed
      while (co2Dots.current.length < targetCount - 5) co2Dots.current.push(spawnCO2(co2))

      // Update O₂ bubbles
      o2Bubbles.current = [
        ...o2Bubbles.current.map(b => ({
          ...b,
          y: b.y + b.vy,
          alpha: b.y < WATER_Y ? b.alpha - 0.045 : b.alpha - 0.006,
        })).filter(b => b.alpha > 0),
        ...newBubbles,
      ]
    }

    // ── Render ────────────────────────────────────────────────────────────────
    drawBackground(ctx, sim.time)
    drawNaHCO3(ctx, co2)

    // CO₂ molecules — colour by concentration
    const co2Hue = `rgba(${Math.round(153 + co2 * 200)},27,27,`
    for (const d of co2Dots.current) {
      ctx.beginPath(); ctx.arc(d.x, d.y, 3.5, 0, Math.PI * 2)
      ctx.fillStyle = co2Hue + d.alpha + ')'
      ctx.fill()
      if (co2 > 0.08) {
        ctx.fillStyle = `rgba(254,202,202,${d.alpha * 0.7})`
        ctx.font = '6px monospace'; ctx.textAlign = 'center'
        ctx.fillText('CO₂', d.x, d.y - 5)
      }
    }

    drawPlant(ctx, sim.time)

    // O₂ bubbles
    for (const b of o2Bubbles.current) {
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${b.alpha * 0.5})`; ctx.fill()
      ctx.strokeStyle = `rgba(96,165,250,${b.alpha})`; ctx.lineWidth = 1; ctx.stroke()
      if (b.r > 4.5) {
        ctx.fillStyle = `rgba(37,99,235,${b.alpha * 0.9})`
        ctx.font = '6px Arial'; ctx.textAlign = 'center'
        ctx.fillText('O₂', b.x, b.y + 2.5)
      }
    }

    // Light label (fixed)
    ctx.fillStyle = '#92400e'; ctx.font = '11px Cairo, Arial'; ctx.textAlign = 'center'
    ctx.fillText('☀ ضوء ثابت 70%', CW / 2, WATER_Y - 8)

    // HUD
    ctx.fillStyle = 'rgba(15,23,42,0.75)'
    ctx.beginPath(); ctx.roundRect(CW - 140, 5, 134, 38, 5); ctx.fill()
    ctx.fillStyle = '#86efac'; ctx.font = 'bold 11px Cairo, Arial'; ctx.textAlign = 'center'
    ctx.fillText(`معدل: ${photoRate(co2)} وحدة/ث`, CW - 73, 21)
    ctx.fillStyle = '#7dd3fc'
    ctx.fillText(`O₂: ${simRef.current.o2.toFixed(1)} وحدة`, CW - 73, 36)

    // Time
    ctx.fillStyle = 'rgba(15,23,42,0.65)'
    ctx.beginPath(); ctx.roundRect(5, 5, 72, 25, 4); ctx.fill()
    ctx.fillStyle = '#e2e8f0'; ctx.font = '10px Cairo'
    ctx.fillText(`${sim.time.toFixed(1)} ث`, 41, 21)

    // ── UI sync every 0.5s ────────────────────────────────────────────────────
    if (sim.running && sim.time - tRef.current >= 0.5) {
      tRef.current = sim.time
      setRateUI(photoRate(co2Ref.current))
      setO2UI(+(simRef.current.o2.toFixed(1)))
      setElapsed(+(sim.time.toFixed(1)))
    }

    rafRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [draw])

  useEffect(() => { simRef.current.running = running }, [running])

  const reset = () => {
    setRunning(false); simRef.current.running = false
    simRef.current.time = 0; simRef.current.o2 = 0
    tRef.current = 0
    co2Dots.current = []; o2Bubbles.current = []
    setO2UI(0); setRateUI(0); setElapsed(0)
  }

  const handleCO2 = (v: number) => {
    setCo2Pct(v); co2Ref.current = v
    co2Dots.current = []   // respawn
  }

  const recordPoint = () => {
    const row: DataRow = { co2: co2Pct, rate: photoRate(co2Pct) }
    setDataTable(prev => {
      const filtered = prev.filter(r => Math.abs(r.co2 - row.co2) > 0.005)
      return [...filtered, row].sort((a, b) => a.co2 - b.co2)
    })
  }

  // Pre-computed curve for graph overlay
  const curve = Array.from({ length: 50 }, (_, i) => {
    const co2 = 0.01 + i * (0.50 / 49)
    return { co2: +co2.toFixed(3), rate: photoRate(co2) }
  })

  return (
    <div className="space-y-4 font-cairo" dir="rtl">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="font-bold text-base">تأثير تركيز CO₂ على معدل التمثيل الضوئي</h3>
        <p className="text-xs text-slate-400">
          الضوء ثابت (70%) — المتغير المستقل: تركيز CO₂ — المتغير التابع: معدل إنتاج O₂
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['sim', 'graph', 'analysis'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg border text-sm transition-all font-cairo ${tab === t
              ? 'bg-green-700 border-green-600 text-white'
              : 'border-slate-600 hover:bg-slate-700 text-slate-300'}`}>
            {{ sim: '🔬 المحاكاة', graph: '📊 الرسم البياني', analysis: '🧪 التحليل' }[t]}
          </button>
        ))}
      </div>

      {/* ── Simulation tab ─────────────────────────────────────────────────── */}
      {tab === 'sim' && (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Canvas */}
          <div className="lg:col-span-2 space-y-3">
            <div className="rounded-xl overflow-hidden border-2 border-green-700">
              <canvas ref={canvasRef} width={CW} height={CH} className="w-full block" />
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setRunning(r => !r)}
                className={`px-4 py-2 rounded-lg text-sm font-cairo flex items-center gap-2 transition-colors ${running
                  ? 'bg-amber-700 hover:bg-amber-600 text-white'
                  : 'bg-green-700 hover:bg-green-600 text-white'}`}>
                {running ? <><Pause size={15} />إيقاف</> : <><Play size={15} />تشغيل</>}
              </button>
              <button onClick={reset}
                className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 text-sm font-cairo flex items-center gap-2">
                <ArrowClockwise size={15} />إعادة
              </button>
              <button onClick={recordPoint}
                className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-sm font-cairo flex items-center gap-2">
                <Plus size={15} />تسجيل نقطة
              </button>
            </div>
          </div>

          {/* Controls + readings */}
          <div className="space-y-3">
            {/* CO₂ slider */}
            <Card className="border-green-800/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-cairo flex justify-between">
                  <span>تركيز CO₂</span>
                  <Badge className="bg-green-700 text-white font-mono">{co2Pct.toFixed(2)}%</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                <Slider min={0.01} max={0.50} step={0.01}
                  value={[co2Pct]} onValueChange={([v]) => handleCO2(v)} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.01%</span>
                  <span className="text-amber-400">↑ جوي: {ATM_CO2}%</span>
                  <span>0.50%</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-cairo bg-slate-800/50 rounded p-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="text-slate-300">كثافة النقاط الحمراء = تركيز CO₂</span>
                </div>
              </CardContent>
            </Card>

            {/* Readings */}
            <Card>
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm font-cairo">القياسات</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {[
                  { label: 'معدل التمثيل الضوئي', val: `${rateUI} و/ث`, color: 'text-green-400' },
                  { label: 'O₂ المتراكم', val: `${o2UI} وحدة`, color: 'text-blue-400' },
                  { label: 'الزمن', val: `${elapsed} ث`, color: 'text-slate-300' },
                  { label: 'الضوء (ثابت)', val: `${LIGHT_FIXED}%`, color: 'text-amber-400' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-cairo">{label}</span>
                    <span className={`font-mono font-bold ${color}`}>{val}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Data table */}
            {dataTable.length > 0 && (
              <Card>
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-sm font-cairo">جدول البيانات</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <table className="w-full text-xs font-cairo">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="text-right pb-1">CO₂ %</th>
                        <th className="text-center pb-1">المعدل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataTable.map((r, i) => (
                        <tr key={i} className="border-b border-slate-800 text-slate-200">
                          <td className="py-1 font-mono">{r.co2.toFixed(2)}</td>
                          <td className="py-1 text-center text-green-400 font-mono">{r.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ── Graph tab ──────────────────────────────────────────────────────── */}
      {tab === 'graph' && (
        <div className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-cairo">
                منحنى تأثير CO₂ على معدل التمثيل الضوئي (تحت ضوء ثابت)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={curve} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="co2" type="number" domain={[0, 0.5]}
                    tickFormatter={v => v.toFixed(2)}
                    label={{ value: 'تركيز CO₂ (%)', position: 'insideBottom', offset: -15, fill: '#94a3b8', fontFamily: 'Cairo', fontSize: 11 }}
                    tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis domain={[0, VMAX]}
                    label={{ value: 'معدل التمثيل (و/ث)', angle: -90, position: 'insideLeft', offset: 15, fill: '#94a3b8', fontFamily: 'Cairo', fontSize: 10 }}
                    tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    formatter={(v: number) => [`${v} و/ث`, 'المعدل']}
                    labelFormatter={(l: number) => `CO₂: ${Number(l).toFixed(2)}%`}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', fontFamily: 'Cairo', direction: 'rtl' }} />
                  {/* Atmospheric CO₂ reference */}
                  <ReferenceLine x={ATM_CO2} stroke="#f59e0b" strokeDasharray="4 3"
                    label={{ value: 'تركيز جوي', position: 'top', fill: '#f59e0b', fontSize: 9, fontFamily: 'Cairo' }} />
                  {/* Saturation reference */}
                  <ReferenceLine x={KM * 5} stroke="#a78bfa" strokeDasharray="4 3"
                    label={{ value: 'منطقة التشبع', position: 'top', fill: '#a78bfa', fontSize: 9, fontFamily: 'Cairo' }} />
                  <Line type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={2.5}
                    dot={false} name="معدل التمثيل الضوئي" />
                  {/* User data points */}
                  {dataTable.length > 0 && dataTable.map((r, i) => (
                    <ReferenceLine key={i} x={r.co2}
                      stroke="#60a5fa" strokeDasharray="2 2" strokeWidth={1} />
                  ))}
                </LineChart>
              </ResponsiveContainer>

              {/* User points scatter overlay */}
              {dataTable.length > 1 && (
                <>
                  <p className="text-xs text-center text-slate-400 font-cairo mt-1 mb-2">نقاطك المسجّلة:</p>
                  <ResponsiveContainer width="100%" height={100}>
                    <ScatterChart margin={{ top: 5, right: 20, bottom: 10, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="co2" type="number" domain={[0, 0.5]}
                        tickFormatter={v => v.toFixed(2)}
                        tick={{ fill: '#94a3b8', fontSize: 9 }} />
                      <YAxis dataKey="rate" type="number" domain={[0, VMAX]}
                        tick={{ fill: '#94a3b8', fontSize: 9 }} />
                      <Tooltip
                        formatter={(v: number) => [`${v}`, '']}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', fontFamily: 'Cairo', fontSize: 10 }} />
                      <Scatter data={dataTable} fill="#60a5fa" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </>
              )}
            </CardContent>
          </Card>

          {/* Graph interpretation */}
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { zone: '0–0.05%', color: 'text-red-400', title: 'منطقة النقص', desc: 'CO₂ هو العامل المحدِّد — كل زيادة ترفع المعدل بشكل حاد' },
              { zone: '0.05–0.15%', color: 'text-amber-400', title: 'منطقة الانتقال', desc: 'المعدل يرتفع لكن بشكل أبطأ — العوامل الأخرى تبدأ بالتأثير' },
              { zone: '> 0.20%', color: 'text-green-400', title: 'منطقة التشبع', desc: 'عوامل أخرى (ضوء، إنزيمات) تصبح محدِّدة — المعدل يستقر' },
            ].map(({ zone, color, title, desc }) => (
              <Card key={zone} className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-3 text-xs font-cairo">
                  <p className={`font-bold font-mono mb-1 ${color}`}>{zone}</p>
                  <p className="font-bold text-slate-200 mb-1">{title}</p>
                  <p className="text-slate-400 leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Analysis tab ───────────────────────────────────────────────────── */}
      {tab === 'analysis' && (
        <div className="space-y-4">
          {/* Equation */}
          <Card className="bg-green-950/30 border-green-800/40">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-bold text-green-300 font-cairo">المعادلة الكيميائية:</h4>
              <div className="text-center font-mono text-sm bg-slate-900 rounded p-3 text-slate-200">
                6CO₂ + 6H₂O <span className="text-amber-400">+ ضوء</span> →
                <span className="text-green-400"> C₆H₁₂O₆</span> +
                <span className="text-blue-400"> 6O₂</span>
              </div>
              <p className="text-xs text-slate-300 font-cairo leading-relaxed">
                CO₂ يدخل عبر الثغور إلى البلاستيدات الخضراء حيث يُثبَّت في دورة كالفن
                (Calvin Cycle) بمساعدة الإنزيم RuBisCO. المنتج النهائي: جلوكوز + أكسجين.
              </p>
            </CardContent>
          </Card>

          {/* Variables */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-4">
              <h4 className="font-bold font-cairo mb-3 text-sm">متغيرات التجربة:</h4>
              <div className="grid md:grid-cols-3 gap-3 text-xs font-cairo">
                {[
                  { type: 'المتغير المستقل', val: 'تركيز CO₂ (%)', color: 'bg-blue-950/50 border-blue-800/40 text-blue-300' },
                  { type: 'المتغير التابع', val: 'معدل إنتاج O₂ (وحدة/ث)', color: 'bg-green-950/50 border-green-800/40 text-green-300' },
                  { type: 'المتغيرات الثابتة', val: 'الضوء، الحرارة، نوع النبات، الماء', color: 'bg-slate-800/50 border-slate-700 text-slate-300' },
                ].map(({ type, val, color }) => (
                  <div key={type} className={`rounded-lg border p-3 ${color}`}>
                    <p className="font-bold mb-1">{type}</p>
                    <p>{val}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Limiting factors */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-bold font-cairo text-sm">نظرية العوامل المحدِّدة (Blackman, 1905):</h4>
              <p className="text-xs text-slate-300 font-cairo leading-relaxed">
                معدل التمثيل الضوئي يتحكم فيه العامل الذي يكون أقل من مستواه الأمثل.
                عند تركيز CO₂ منخفض → هو العامل المحدِّد. عند تركيز CO₂ مرتفع →
                الضوء أو درجة الحرارة يصبح هو المحدِّد.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-cairo border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-right p-2 text-slate-400">CO₂</th>
                      <th className="text-center p-2 text-slate-400">تأثير رفع الضوء</th>
                      <th className="text-center p-2 text-slate-400">العامل المحدِّد</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {[
                      ['0.04% (جوي)', 'تأثير كبير ↑', 'CO₂ و الضوء معاً'],
                      ['0.10%', 'تأثير متوسط', 'CO₂ بدأ يكفي'],
                      ['0.30%+', 'تأثير ضئيل', 'الضوء هو المحدِّد الآن'],
                    ].map(([co2, light, factor], i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-slate-900/30' : ''}>
                        <td className="p-2 font-mono">{co2}</td>
                        <td className="p-2 text-center">{light}</td>
                        <td className="p-2 text-center text-amber-400">{factor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card className="bg-amber-950/20 border-amber-800/30">
            <CardContent className="p-4 space-y-2 font-cairo text-sm">
              <h4 className="font-bold text-amber-400">أسئلة تحليلية:</h4>
              {[
                'ما شكل العلاقة بين تركيز CO₂ ومعدل التمثيل الضوئي؟ (خطية أم منحنية؟)',
                'لماذا يتوقف المعدل عن الارتفاع عند تركيزات CO₂ عالية جداً؟',
                'كيف يؤثر رفع شدة الضوء على شكل المنحنى عند تركيزات CO₂ عالية؟',
                'ما التركيز الأمثل لـ CO₂ في البيوت الزجاجية الزراعية؟ ولماذا؟',
              ].map((q, i) => (
                <p key={i} className="text-xs text-slate-300 leading-relaxed">
                  <span className="text-amber-400 font-bold ml-1">{i + 1}.</span> {q}
                </p>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
