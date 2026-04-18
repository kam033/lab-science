'use client'

import { useEffect, useRef, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { Play, Pause, ArrowClockwise } from '@phosphor-icons/react'

// ── Physics constants ──────────────────────────────────────────────────────
const hc_eVnm = 1240   // h·c in eV·nm  → E(eV) = 1240 / λ(nm)
const h_eVs   = 4.136e-15  // eV·s

// ── Metals ─────────────────────────────────────────────────────────────────
const METALS = [
  { name: 'الصوديوم (Na)',   symbol: 'Na', phi: 2.28, plateColor: '#d4d49a', plateBg: '#b8b860' },
  { name: 'البوتاسيوم (K)',  symbol: 'K',  phi: 2.30, plateColor: '#c8c8e8', plateBg: '#a0a0d0' },
  { name: 'الزنك (Zn)',      symbol: 'Zn', phi: 4.33, plateColor: '#8ec8c8', plateBg: '#5a9898' },
  { name: 'النحاس (Cu)',     symbol: 'Cu', phi: 4.70, plateColor: '#c87844', plateBg: '#a05828' },
  { name: 'البلاتين (Pt)',   symbol: 'Pt', phi: 5.65, plateColor: '#d8d8e4', plateBg: '#a8a8c0' },
]

// ── Wavelength → RGB ────────────────────────────────────────────────────────
function λToRGB(nm: number): [number, number, number] {
  if (nm < 380) return [120, 0, 180]
  if (nm < 440) return [Math.round((440 - nm) / 60 * 160), 0, 255]
  if (nm < 490) return [0, Math.round((nm - 440) / 50 * 200), 255]
  if (nm < 510) return [0, 200, Math.round((510 - nm) / 20 * 255)]
  if (nm < 580) return [Math.round((nm - 510) / 70 * 255), 200, 0]
  if (nm < 645) return [255, Math.round((645 - nm) / 65 * 180), 0]
  return [200, 0, 0]
}
function λColor(nm: number, alpha = 1) {
  const [r, g, b] = λToRGB(nm)
  return `rgba(${r},${g},${b},${alpha})`
}

// ── Canvas dimensions ───────────────────────────────────────────────────────
const CW = 660, CH = 360

// ── Particle types ──────────────────────────────────────────────────────────
type Particle = { x: number; y: number; vx: number; vy: number; age: number; maxAge: number }

// ── Main component ──────────────────────────────────────────────────────────
export function PhotoelectricEffectSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef(0)
  const electrons = useRef<Particle[]>([])
  const photons   = useRef<Particle[]>([])
  const frameRef  = useRef(0)
  const lastSpawnRef = useRef(0)

  // ── Param refs (read inside RAF without closures) ──
  const lambdaR    = useRef(400)
  const intensityR = useRef(50)
  const metalIdxR  = useRef(0)
  const batteryR   = useRef(0)
  const runningR   = useRef(true)

  // ── React state ────────────────────────────────────────────────────────────
  const [lambda,    setLambda]    = useState(400)
  const [intensity, setIntensity] = useState(50)
  const [metalIdx,  setMetalIdx]  = useState(0)
  const [battery,   setBattery]   = useState(0)   // stopping voltage control
  const [tab, setTab]             = useState<'sim' | 'graph' | 'info'>('sim')
  const [liveI,     setLiveI]     = useState(0)   // mA
  const [isRunning, setIsRunning] = useState(true)

  // Sync state → refs
  lambdaR.current    = lambda
  intensityR.current = intensity
  metalIdxR.current  = metalIdx
  batteryR.current   = battery
  runningR.current   = isRunning

  const handleReset = () => {
    setLambda(400); setIntensity(50); setMetalIdx(0); setBattery(0)
    electrons.current = []
    photons.current   = []
    setLiveI(0)
    setIsRunning(true)
  }

  // ── Derived physics ─────────────────────────────────────────────────────────
  const metal   = METALS[metalIdx]
  const phi     = metal.phi
  const photonE = hc_eVnm / lambda
  const keMax   = Math.max(0, photonE - phi)
  const emitting = photonE > phi
  const threshLambda = Math.round(hc_eVnm / phi)
  const stoppingV = keMax.toFixed(2)
  const freq = (3e8 / (lambda * 1e-9)) / 1e14   // in units of 10¹⁴ Hz

  // Clear particles on metal/wavelength change
  useEffect(() => {
    electrons.current = []
    photons.current   = []
  }, [metalIdx, lambda])

  // ── Animation loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    function tick(now: number) {
      const canvas = canvasRef.current
      if (!canvas) { rafRef.current = requestAnimationFrame(tick); return }
      const ctx = canvas.getContext('2d')!

      const λ    = lambdaR.current
      const ints = intensityR.current / 100
      const mIdx = metalIdxR.current
      const bat  = batteryR.current
      const running = runningR.current
      const m    = METALS[mIdx]
      const pE   = hc_eVnm / λ
      const ke   = Math.max(0, pE - m.phi)
      const emit = running && pE > m.phi && bat <= ke

      if (running) frameRef.current++
      const frame = frameRef.current

      // ── Spawn photons ──
      const spawnInterval = 120 / Math.max(0.05, ints)
      if (running && now - lastSpawnRef.current > spawnInterval) {
        lastSpawnRef.current = now
        photons.current.push({ x: 72, y: 55, vx: 2.8, vy: 2.8, age: 0, maxAge: 32 })
      }

      // ── Spawn electrons ──
      if (emit && frame % Math.max(1, Math.round(8 / Math.max(0.1, ints))) === 0) {
        const speed = Math.sqrt(Math.max(0.1, ke)) * 55 + 25
        electrons.current.push({
          x: 165,
          y: 170 + (Math.random() - 0.5) * 110,
          vx: speed,
          vy: (Math.random() - 0.5) * 40,
          age: 0,
          maxAge: 110,
        })
      }

      // ── Advance particles ──
      const DT = 0.016
      if (running) {
        photons.current  = photons.current.filter(p => p.age < p.maxAge)
        photons.current.forEach(p => { p.x += p.vx; p.y += p.vy; p.age++ })
        electrons.current = electrons.current.filter(e => e.x < 490 && e.age < e.maxAge)
        electrons.current.forEach(e => { e.x += e.vx * DT; e.y += e.vy * DT; e.age++ })
      }

      // ── Live current ──
      const cur = emit ? ke * ints * 45 : 0
      if (frame % 6 === 0) setLiveI(cur)

      // ═══════════════════════════════════════════════════════════════════
      //  DRAW
      // ═══════════════════════════════════════════════════════════════════

      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, CH)
      bgGrad.addColorStop(0, '#f1f5f9')
      bgGrad.addColorStop(1, '#e2e8f0')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, CW, CH)

      // ── Vacuum tube ─────────────────────────────────────────────────────
      const TX = 145, TY = 75, TW = 360, TH = 190
      // glass fill
      ctx.fillStyle = 'rgba(186,230,253,0.12)'
      ctx.fillRect(TX, TY, TW, TH)
      // glass border
      ctx.strokeStyle = '#64748b'
      ctx.lineWidth = 2.5
      ctx.strokeRect(TX, TY, TW, TH)
      // "vacuum" label
      ctx.fillStyle = 'rgba(100,116,139,0.4)'
      ctx.font = 'italic 11px Cairo, system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('فراغ', TX + TW / 2, TY + 14)

      // ── Cathode (left plate) ─────────────────────────────────────────────
      const catX = TX, catW = 22, catH = TH - 20
      ctx.fillStyle = m.plateBg
      ctx.fillRect(catX, TY + 10, catW, catH)
      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 2
      ctx.strokeRect(catX, TY + 10, catW, catH)
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 12px Cairo, system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(m.symbol, catX + catW / 2, TY + TH / 2 - 6)
      ctx.font = '9px Cairo, system-ui'
      ctx.fillText('(−)', catX + catW / 2, TY + TH / 2 + 8)

      // ── Anode (right plate) ──────────────────────────────────────────────
      const anoX = TX + TW - 22
      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(anoX, TY + 10, 22, TH - 20)
      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 2
      ctx.strokeRect(anoX, TY + 10, 22, TH - 20)
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 12px Cairo, system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('(+)', anoX + 11, TY + TH / 2 + 4)

      // ── Light source (lamp) ──────────────────────────────────────────────
      ctx.save()
      ctx.translate(68, 48)
      // lamp glow halo
      const halo = ctx.createRadialGradient(0, 0, 3, 0, 0, 40)
      halo.addColorStop(0, λColor(λ, 0.7 * ints + 0.1))
      halo.addColorStop(1, λColor(λ, 0))
      ctx.fillStyle = halo
      ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.fill()
      // lamp body
      ctx.fillStyle = '#1e293b'
      ctx.beginPath(); ctx.roundRect(-20, -13, 40, 26, 6); ctx.fill()
      // lens circle
      ctx.fillStyle = λColor(λ, 0.9)
      ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill()
      ctx.restore()

      // ── Light beam ───────────────────────────────────────────────────────
      const beamAlpha = ints * 0.55 + 0.08
      ctx.save()
      const bGrad = ctx.createLinearGradient(68, 48, catX + catW / 2, TY + TH / 2)
      bGrad.addColorStop(0, λColor(λ, beamAlpha))
      bGrad.addColorStop(1, λColor(λ, 0.04))
      ctx.strokeStyle = bGrad
      ctx.lineWidth = 10 * ints + 4
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(68, 48)
      ctx.lineTo(catX + catW / 2, TY + TH / 2)
      ctx.stroke()
      ctx.restore()

      // ── Photon dots ───────────────────────────────────────────────────────
      photons.current.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
        ctx.fillStyle = λColor(λ, Math.max(0, 1 - p.age / p.maxAge))
        ctx.fill()
      })

      // ── Electrons ─────────────────────────────────────────────────────────
      electrons.current.forEach(e => {
        const alpha = Math.max(0, 1 - e.age / e.maxAge)
        ctx.beginPath(); ctx.arc(e.x, e.y, 4.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59,130,246,${alpha})`
        ctx.fill()
        ctx.strokeStyle = `rgba(30,86,214,${alpha})`; ctx.lineWidth = 1.5; ctx.stroke()
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'
        ctx.fillText('−', e.x, e.y + 3.5)
      })

      // ── No-emission notice ──────────────────────────────────────────────
      if (!emit && pE <= m.phi) {
        ctx.fillStyle = 'rgba(220,38,38,0.85)'
        ctx.font = 'bold 12px Cairo, system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('لا يوجد انبعاث — طاقة الفوتون أقل من دالة الشغل', TX + TW / 2, TY + TH + 16)
      }
      if (emit && bat > ke) {
        ctx.fillStyle = 'rgba(217,119,6,0.9)'
        ctx.font = 'bold 12px Cairo, system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('الجهد الإيقافي أوقف تدفق الإلكترونات', TX + TW / 2, TY + TH + 16)
      }

      // ── Circuit wires ──────────────────────────────────────────────────
      const wireY = TY + TH + 48
      ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2
      // left wire
      ctx.beginPath(); ctx.moveTo(catX + 11, TY + TH)
      ctx.lineTo(catX + 11, wireY)
      ctx.lineTo(catX + 90, wireY); ctx.stroke()
      // right wire
      ctx.beginPath(); ctx.moveTo(anoX + 11, TY + TH)
      ctx.lineTo(anoX + 11, wireY)
      ctx.lineTo(anoX - 70, wireY); ctx.stroke()

      // Ammeter
      const amX = (catX + anoX) / 2 + 20
      ctx.beginPath(); ctx.arc(amX, wireY, 22, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'; ctx.fill()
      ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2; ctx.stroke()
      ctx.fillStyle = '#1e293b'; ctx.font = 'bold 14px Cairo'
      ctx.textAlign = 'center'; ctx.fillText('A', amX, wireY + 5)
      // connect to ammeter
      ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(catX + 90, wireY); ctx.lineTo(amX - 22, wireY); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(amX + 22, wireY); ctx.lineTo(anoX - 70, wireY); ctx.stroke()
      // current label
      ctx.fillStyle = cur > 0.01 ? '#059669' : '#9ca3af'
      ctx.font = 'bold 12px Cairo'; ctx.textAlign = 'center'
      ctx.fillText(`${cur.toFixed(2)} mA`, amX, wireY + 38)

      // ── Energy info card (top right) ─────────────────────────────────────
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.beginPath(); ctx.roundRect(CW - 192, 6, 186, 76, 8); ctx.fill()
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1; ctx.stroke()
      ctx.textAlign = 'right'
      ctx.font = 'bold 11.5px Cairo, system-ui'
      ctx.fillStyle = '#7c3aed'
      ctx.fillText(`طاقة الفوتون : ${pE.toFixed(2)} eV`, CW - 10, 24)
      ctx.fillStyle = '#dc2626'
      ctx.fillText(`دالة الشغل (φ) : ${m.phi.toFixed(2)} eV`, CW - 10, 42)
      ctx.fillStyle = emit ? '#059669' : '#9ca3af'
      ctx.fillText(`طاقة الإلكترون : ${ke.toFixed(2)} eV`, CW - 10, 60)
      ctx.fillStyle = '#0369a1'
      ctx.fillText(`جهد الإيقاف : ${ke.toFixed(2)} V`, CW - 10, 76)

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Graph data: KE vs frequency for current metal ────────────────────────
  const graphData = (() => {
    const pts = []
    for (let nm = 150; nm <= 700; nm += 10) {
      const pE = hc_eVnm / nm
      const ke = pE - phi
      const f  = parseFloat(((3e8 / (nm * 1e-9)) / 1e14).toFixed(3))
      pts.push({ f, ke: parseFloat(ke.toFixed(3)) })
    }
    return pts
  })()
  const threshFreq = parseFloat(((3e8 / (threshLambda * 1e-9)) / 1e14).toFixed(2))

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div dir="rtl" className="font-cairo flex flex-col gap-4 select-none">

      {/* Tabs + controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          {(['sim', 'graph', 'info'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                tab === t ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {t === 'sim' ? 'المحاكاة' : t === 'graph' ? 'الرسم البياني' : 'التحليل'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsRunning(r => !r)}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold inline-flex items-center gap-1.5 transition-colors ${
              isRunning ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}>
            {isRunning ? <><Pause size={14} weight="fill"/> إيقاف</> : <><Play size={14} weight="fill"/> تشغيل</>}
          </button>
          <button onClick={handleReset}
            className="px-3 py-1.5 rounded-lg text-sm font-bold inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
            <ArrowClockwise size={14}/> إعادة ضبط
          </button>
        </div>
      </div>

      {/* ══ Simulation tab ══════════════════════════════════════════════════ */}
      {tab === 'sim' && (
        <div className="flex gap-4 flex-wrap">

          {/* Canvas */}
          <div className="flex-1 min-w-[320px] flex flex-col gap-3">
            <canvas ref={canvasRef} width={CW} height={CH}
              className="w-full rounded-xl border border-gray-200 shadow-md" />

            {/* Energy bars */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'طاقة الفوتون', val: photonE,  max: 7, color: 'bg-purple-500', unit: 'eV' },
                { label: 'دالة الشغل',   val: phi,       max: 7, color: 'bg-red-500',    unit: 'eV' },
                { label: 'طاقة الإلكترون', val: keMax,  max: 7, color: 'bg-emerald-500', unit: 'eV' },
              ].map(({ label, val, max, color, unit }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-gray-500 text-center">{label}</span>
                  <div className="w-full h-16 bg-gray-100 rounded-lg relative overflow-hidden flex flex-col justify-end">
                    <div className={`${color} transition-all duration-200 rounded-b-lg`}
                      style={{ height: `${Math.min(100, (val / max) * 100)}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{val.toFixed(2)} {unit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls panel */}
          <div className="w-56 shrink-0 flex flex-col gap-4">
            <h3 className="font-bold text-gray-700 border-b pb-1">الإعدادات</h3>

            {/* Wavelength */}
            <div>
              <p className="text-sm font-bold text-gray-600">طول الموجة: {lambda} nm</p>
              <div className="h-3 rounded-full mt-1 mb-1"
                style={{
                  background: 'linear-gradient(to right, #8b00ff, #4400ff, #0000ff, #00bfff, #00ff00, #ffff00, #ff8000, #ff0000)',
                }} />
              <input type="range" min={200} max={700} step={5} value={lambda}
                onChange={e => setLambda(+e.target.value)}
                className="w-full accent-blue-600" />
              <div className="mt-1 flex justify-center">
                <span className="inline-block w-5 h-5 rounded-full border border-gray-300"
                  style={{ background: λColor(lambda, 1) }} />
              </div>
            </div>

            {/* Intensity */}
            <div>
              <p className="text-sm font-bold text-gray-600">الشدة: {intensity}%</p>
              <input type="range" min={5} max={100} step={5} value={intensity}
                onChange={e => setIntensity(+e.target.value)}
                className="w-full accent-yellow-500 mt-1" />
            </div>

            {/* Metal */}
            <div>
              <p className="text-sm font-bold text-gray-600 mb-1">المعدن</p>
              <div className="flex flex-col gap-1">
                {METALS.map((m, i) => (
                  <button key={i} onClick={() => setMetalIdx(i)}
                    className={`text-xs py-1.5 px-2 rounded-lg font-bold text-right transition-colors ${
                      metalIdx === i ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {m.name} — φ = {m.phi} eV
                  </button>
                ))}
              </div>
            </div>

            {/* Stopping voltage */}
            <div>
              <p className="text-sm font-bold text-gray-600">جهد الإيقاف: {battery.toFixed(1)} V</p>
              <input type="range" min={0} max={6} step={0.1} value={battery}
                onChange={e => setBattery(+e.target.value)}
                className="w-full accent-red-500 mt-1" />
              <p className="text-xs text-gray-400 mt-0.5">الجهد اللازم لإيقاف الإلكترونات</p>
            </div>

            {/* Status box */}
            <div className={`rounded-xl p-3 text-center border ${
              emitting && battery <= keMax
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-red-50 border-red-300'
            }`}>
              <p className={`text-sm font-bold ${
                emitting && battery <= keMax ? 'text-emerald-700' : 'text-red-700'
              }`}>
                {emitting && battery <= keMax
                  ? `✓ انبعاث — I = ${liveI.toFixed(2)} mA`
                  : emitting
                    ? '⏹ محجوب بالجهد'
                    : `✗ لا انبعاث — λ_min = ${threshLambda} nm`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══ Graph tab ════════════════════════════════════════════════════════ */}
      {tab === 'graph' && (
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-gray-700">طاقة الإلكترون مقابل التردد — {metal.name}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData} margin={{ top: 5, right: 20, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="f"
                  label={{ value: 'التردد (×10¹⁴ Hz)', position: 'insideBottom', offset: -15 }}
                  type="number" domain={[3, 16]} tickCount={7} />
                <YAxis
                  label={{ value: 'KE (eV)', angle: -90, position: 'insideLeft' }}
                  domain={[-4, 5]} />
                <Tooltip formatter={(v: unknown) => `${Number(v).toFixed(2)} eV`}
                  labelFormatter={(l: unknown) => `f = ${Number(l).toFixed(2)} ×10¹⁴ Hz`} />
                <Legend verticalAlign="top" />
                <ReferenceLine y={0} stroke="#dc2626" strokeDasharray="4 4"
                  label={{ value: 'حد الانبعاث', position: 'right', fontSize: 11, fill: '#dc2626' }} />
                <ReferenceLine x={threshFreq} stroke="#f59e0b" strokeDasharray="4 4"
                  label={{ value: `f₀=${threshFreq}`, position: 'top', fontSize: 10, fill: '#f59e0b' }} />
                <ReferenceLine x={freq} stroke="#7c3aed" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="ke" stroke="#3b82f6" name="طاقة الإلكترون KE"
                  dot={false} strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
            <strong>الميل = ثابت بلانك h = {h_eVs.toExponential(3)} eV·s</strong>
            <br />التقاطع مع المحور الأفقي = التردد العتبي f₀ = {threshFreq} × 10¹⁴ Hz
            <br />المعادلة: <span className="font-mono">KE = hf − φ = hf − {phi} eV</span>
          </div>
        </div>
      )}

      {/* ══ Info tab ════════════════════════════════════════════════════════ */}
      {tab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <h4 className="font-bold text-purple-800 mb-2 text-base">معادلة أينشتاين</h4>
            <p className="font-mono text-purple-900 text-lg font-bold">KE_max = hf − φ</p>
            <ul className="mt-2 space-y-1 text-purple-700 list-disc list-inside">
              <li>h = 6.626 × 10⁻³⁴ J·s (ثابت بلانك)</li>
              <li>f = تردد الضوء (Hz)</li>
              <li>φ = دالة الشغل للمعدن (eV)</li>
              <li>KE_max = أقصى طاقة حركية للإلكترون</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-bold text-blue-800 mb-2 text-base">طاقة الفوتون</h4>
            <p className="font-mono text-blue-900 text-lg font-bold">E = hf = hc/λ</p>
            <p className="font-mono text-blue-900 mt-1">E(eV) = 1240 / λ(nm)</p>
            <p className="text-blue-700 mt-2">
              عند λ = {lambda} nm → E = <strong>{photonE.toFixed(2)} eV</strong>
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-bold text-amber-800 mb-2 text-base">التردد العتبي</h4>
            <p className="font-mono text-amber-900 font-bold">f₀ = φ / h</p>
            <p className="font-mono text-amber-900">λ_max = hc / φ</p>
            <p className="text-amber-700 mt-1">
              للـ {metal.name}: λ_max = <strong>{threshLambda} nm</strong>
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <h4 className="font-bold text-emerald-800 mb-2 text-base">دوال الشغل</h4>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-emerald-700 font-bold border-b border-emerald-200">
                  <td>المعدن</td><td className="text-center">φ (eV)</td><td className="text-center">λ_max (nm)</td>
                </tr>
              </thead>
              <tbody>
                {METALS.map(m => (
                  <tr key={m.symbol}
                    className={`border-b border-emerald-100 ${m.symbol === metal.symbol ? 'bg-emerald-100 font-bold' : ''}`}>
                    <td className="py-0.5">{m.name}</td>
                    <td className="text-center">{m.phi}</td>
                    <td className="text-center">{Math.round(hc_eVnm / m.phi)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:col-span-2">
            <h4 className="font-bold text-red-800 mb-2 text-base">مفاهيم أساسية</h4>
            <div className="grid grid-cols-2 gap-2 text-red-700">
              {[
                ['زيادة الشدة', 'يزيد عدد الإلكترونات (التيار) — لا يغير طاقتها'],
                ['زيادة التردد', 'يزيد طاقة كل إلكترون — لا يغير عددها'],
                ['أقل من f₀', 'لا انبعاث مهما كانت الشدة'],
                ['جهد الإيقاف', 'يوقف الإلكترونات: V₀ = KE_max / e'],
              ].map(([k, v]) => (
                <div key={k} className="bg-white rounded-lg p-2 border border-red-100">
                  <p className="font-bold">{k}</p>
                  <p className="text-xs mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
