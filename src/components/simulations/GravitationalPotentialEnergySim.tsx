'use client'

import { useEffect, useRef, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

// ── Track geometry ──────────────────────────────────────────────────────────
const PPM   = 50            // pixels per metre
const Rc    = 2             // radius of curvature at bowl bottom (m)
const K     = 2 * Rc * PPM // parabola constant: Δy_px = Δx_px² / K  (K = 200)

const CW     = 660
const CH     = 360
const CX     = CW / 2      // 330 — horizontal centre of bowl
const Y_GND  = 338          // ground y in screen coords (y↓)
const BALL_R = 13
const TRACK_L = CX - 290
const TRACK_R = CX + 290

// Screen y for a given screen x (parabolic bowl)
const trackY   = (xPx: number) => Y_GND - (xPx - CX) ** 2 / K
// Physical height above bowl bottom (m) from screen x
const hM       = (xPx: number) => (xPx - CX) ** 2 / (K * PPM)
// Screen x from physical height and lateral sign
const xFromH   = (h: number, side: -1 | 1) => CX + side * Math.sqrt(h * K * PPM)

// ── Gravity presets ─────────────────────────────────────────────────────────
const GRAVITY = [
  { label: 'الأرض',   g: 9.8  },
  { label: 'القمر',   g: 1.6  },
  { label: 'المريخ',  g: 3.7  },
  { label: 'المشتري', g: 24.8 },
]

// ── Slider helper ───────────────────────────────────────────────────────────
function SliderRow({ label, min, max, step, value, onChange }: {
  label: string; min: number; max: number; step: number; value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <p className="text-sm font-bold text-gray-600">{label}</p>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full mt-1 accent-blue-600" />
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
export function GravitationalPotentialEnergySim() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef(0)

  // Mutable simulation state (no re-render triggers)
  const sim = useRef({
    xPx:    CX - 174,   // initial x ≈ h=3 m left side
    dir:    1 as 1 | -1,
    eTot:   0,           // current mechanical energy (J)
    thermal: 0,          // accumulated thermal energy (J)
    time:   0,
  })

  // Param refs — always current, safe to read from RAF loop
  const massR     = useRef(60)
  const gR        = useRef(9.8)
  const frictionR = useRef(0)
  const releaseHR = useRef(3)
  const runningR  = useRef(false)

  // React state (UI)
  const [mass,     setMass]     = useState(60)
  const [releaseH, setReleaseH] = useState(3)
  const [friction, setFriction] = useState(0)
  const [gravIdx,  setGravIdx]  = useState(0)
  const [running,  setRunning]  = useState(false)
  const [tab,      setTab]      = useState<'sim' | 'graph' | 'info'>('sim')
  const [liveE,    setLiveE]    = useState({ ke: 0, pe: 0, th: 0, tot: 0 })
  const [chart,    setChart]    = useState<{ t: number; ke: number; pe: number }[]>([])

  // Sync state → refs on every render
  massR.current     = mass
  gR.current        = GRAVITY[gravIdx].g
  frictionR.current = friction
  releaseHR.current = releaseH

  // ── Reset ────────────────────────────────────────────────────────────────
  function reset(
    m = massR.current,
    h = releaseHR.current,
    g = gR.current,
  ) {
    runningR.current = false
    setRunning(false)
    setChart([])
    const eTot = m * g * h
    sim.current = { xPx: xFromH(h, -1), dir: 1, eTot, thermal: 0, time: 0 }
    setLiveE({ ke: 0, pe: eTot, th: 0, tot: eTot })
  }

  // ── Draw ─────────────────────────────────────────────────────────────────
  function drawScene() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const s   = sim.current
    const m   = massR.current
    const g   = gR.current

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, Y_GND)
    sky.addColorStop(0, '#60a5fa')
    sky.addColorStop(1, '#dbeafe')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, CW, Y_GND)

    // Ground
    ctx.fillStyle = '#92400e'
    ctx.fillRect(0, Y_GND, CW, CH - Y_GND)
    ctx.fillStyle = '#a16207'
    ctx.fillRect(0, Y_GND, CW, 5)

    // Bowl fill
    ctx.beginPath()
    ctx.moveTo(TRACK_L, Y_GND)
    for (let x = TRACK_L; x <= TRACK_R; x++) ctx.lineTo(x, trackY(x))
    ctx.lineTo(TRACK_R, Y_GND)
    ctx.closePath()
    ctx.fillStyle = '#d1d5db'
    ctx.fill()

    // Bowl surface line
    ctx.beginPath()
    for (let x = TRACK_L; x <= TRACK_R; x++) {
      const y = trackY(x)
      x === TRACK_L ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.strokeStyle = '#6b7280'
    ctx.lineWidth = 3
    ctx.stroke()

    // Dashed height line
    const h    = hM(s.xPx)
    const ballY = trackY(s.xPx)
    if (h > 0.08) {
      ctx.save()
      ctx.setLineDash([5, 4])
      ctx.strokeStyle = '#2563eb'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(s.xPx, ballY)
      ctx.lineTo(s.xPx, Y_GND)
      ctx.stroke()
      ctx.restore()
      ctx.fillStyle = '#1d4ed8'
      ctx.font = 'bold 12px Cairo, system-ui'
      ctx.textAlign = 'left'
      ctx.fillText(`h = ${h.toFixed(2)} m`, s.xPx + 6, (ballY + Y_GND) / 2 + 4)
    }

    // Ball
    const ballGrad = ctx.createRadialGradient(s.xPx - 4, ballY - 4, 2, s.xPx, ballY, BALL_R)
    ballGrad.addColorStop(0, '#fef9c3')
    ballGrad.addColorStop(1, '#f59e0b')
    ctx.beginPath()
    ctx.arc(s.xPx, ballY, BALL_R, 0, Math.PI * 2)
    ctx.fillStyle = ballGrad
    ctx.fill()
    ctx.strokeStyle = '#b45309'
    ctx.lineWidth = 2
    ctx.stroke()

    // Energy readout (top-left card)
    const pe = m * g * h
    const ke = Math.max(0, s.eTot - pe)
    ctx.fillStyle = 'rgba(255,255,255,0.82)'
    ctx.beginPath()
    ctx.roundRect(8, 8, 160, 80, 8)
    ctx.fill()
    ctx.font = 'bold 12px Cairo, system-ui'
    ctx.textAlign = 'left'
    const rows: [string, string, string][] = [
      ['طاقة حركية',  `${ke.toFixed(0)} J`,        '#059669'],
      ['طاقة وضع',    `${pe.toFixed(0)} J`,        '#2563eb'],
      ['طاقة حرارية', `${s.thermal.toFixed(0)} J`, '#dc2626'],
      ['الإجمالي',    `${(s.eTot + s.thermal).toFixed(0)} J`, '#7c3aed'],
    ]
    rows.forEach(([label, val, color], i) => {
      ctx.fillStyle = color
      ctx.fillText(`${label}: ${val}`, 14, 26 + i * 17)
    })
  }

  // ── Animation loop (runs once, reads from refs) ───────────────────────────
  useEffect(() => {
    reset()

    let frame = 0
    let prevT = performance.now()

    function tick(now: number) {
      const dt = Math.min((now - prevT) / 1000, 0.04)
      prevT = now
      frame++

      const s  = sim.current
      const m  = massR.current
      const g  = gR.current
      const fr = frictionR.current

      if (runningR.current && m > 0 && g > 0 && s.eTot > 0.01) {
        const h   = hM(s.xPx)
        const pe  = m * g * h
        const ke  = Math.max(0, s.eTot - pe)
        const v   = Math.sqrt(2 * ke / m)
        const xM  = (s.xPx - CX) / PPM
        const slope = xM / Rc
        // dx/dt along x axis, accounting for track slope
        const dxMdt = s.dir * v / Math.sqrt(1 + slope * slope)
        s.xPx += dxMdt * PPM * dt

        // Clamp to current amplitude
        const amp = Math.sqrt(Math.max(0, s.eTot / (m * g)) * K * PPM)
        if (s.xPx <= CX - amp) { s.xPx = CX - amp; s.dir =  1 }
        if (s.xPx >= CX + amp) { s.xPx = CX + amp; s.dir = -1 }

        // Friction energy dissipation
        const loss = fr * m * g * v * dt
        s.eTot    = Math.max(0, s.eTot - loss)
        s.thermal += loss
        s.time    += dt

        // UI update every ~4 frames
        if (frame % 4 === 0) {
          const newH  = hM(s.xPx)
          const newPE = m * g * newH
          const newKE = Math.max(0, s.eTot - newPE)
          setLiveE({ ke: newKE, pe: newPE, th: s.thermal, tot: s.eTot + s.thermal })

          if (frame % 12 === 0) {
            setChart(prev => [
              ...prev.slice(-200),
              {
                t:  parseFloat(s.time.toFixed(2)),
                ke: parseFloat(newKE.toFixed(1)),
                pe: parseFloat(newPE.toFixed(1)),
              },
            ])
          }
        }
      }

      drawScene()
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived ───────────────────────────────────────────────────────────────
  const maxE = mass * GRAVITY[gravIdx].g * releaseH

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div dir="rtl" className="font-cairo flex flex-col gap-4 select-none">

      {/* Tabs */}
      <div className="flex gap-2">
        {(['sim', 'graph', 'info'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
              tab === t
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {t === 'sim' ? 'المحاكاة' : t === 'graph' ? 'الرسم البياني' : 'التحليل'}
          </button>
        ))}
      </div>

      {/* ── Simulation tab ── */}
      {tab === 'sim' && (
        <div className="flex gap-4 flex-wrap">

          {/* Canvas + bars */}
          <div className="flex-1 min-w-[300px] flex flex-col gap-3">
            <canvas ref={canvasRef} width={CW} height={CH}
              className="w-full rounded-xl border border-gray-200 shadow-md" />

            {/* Energy bars */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'KE حركية', val: liveE.ke,  color: 'bg-emerald-500' },
                { label: 'PE وضع',   val: liveE.pe,  color: 'bg-blue-500'    },
                { label: 'حرارية',   val: liveE.th,  color: 'bg-red-500'     },
                { label: 'الإجمالي', val: liveE.tot || maxE, color: 'bg-purple-500' },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-gray-500">{label}</span>
                  <div className="w-full h-20 bg-gray-100 rounded-lg relative overflow-hidden flex flex-col justify-end">
                    <div
                      className={`${color} transition-all duration-75 rounded-b-lg`}
                      style={{ height: `${Math.min(100, maxE > 0 ? (val / maxE) * 100 : 0)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{val.toFixed(0)} J</span>
                </div>
              ))}
            </div>

            {/* Play / Reset */}
            <div className="flex gap-2 justify-center mt-1">
              <button
                onClick={() => {
                  runningR.current = !running
                  setRunning(!running)
                }}
                className={`px-8 py-2 rounded-xl font-bold text-white shadow transition-colors ${
                  running
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}>
                {running ? 'إيقاف ⏸' : 'تشغيل ▶'}
              </button>
              <button
                onClick={() => reset(mass, releaseH, GRAVITY[gravIdx].g)}
                className="px-8 py-2 rounded-xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 shadow">
                إعادة ↺
              </button>
            </div>
          </div>

          {/* Sliders panel */}
          <div className="w-52 shrink-0 flex flex-col gap-4">
            <h3 className="font-bold text-gray-700 border-b pb-1">الإعدادات</h3>

            <SliderRow
              label={`الكتلة: ${mass} kg`}
              min={10} max={100} step={1} value={mass}
              onChange={v => { setMass(v); reset(v, releaseH, GRAVITY[gravIdx].g) }}
            />

            <SliderRow
              label={`ارتفاع الإفلات: ${releaseH.toFixed(1)} m`}
              min={0.5} max={5} step={0.1} value={releaseH}
              onChange={v => { setReleaseH(v); reset(mass, v, GRAVITY[gravIdx].g) }}
            />

            <SliderRow
              label={`الاحتكاك: ${
                friction === 0 ? 'لا يوجد'
                : friction < 0.15 ? 'قليل'
                : friction < 0.35 ? 'متوسط'
                : 'كثير'
              }`}
              min={0} max={0.5} step={0.05} value={friction}
              onChange={v => { setFriction(v) }}
            />

            {/* Gravity */}
            <div>
              <p className="text-sm font-bold text-gray-600 mb-1">الجاذبية (m/s²)</p>
              <div className="grid grid-cols-2 gap-1">
                {GRAVITY.map((opt, i) => (
                  <button key={i}
                    onClick={() => {
                      setGravIdx(i)
                      gR.current = opt.g
                      reset(mass, releaseH, opt.g)
                    }}
                    className={`text-xs py-1.5 px-1 rounded-lg font-bold transition-colors ${
                      gravIdx === i
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {opt.label}<br />
                    <span className="font-normal">{opt.g}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Formula box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-blue-800">PE = m × g × h</p>
              <p className="text-xs text-blue-600 mt-1">
                = {mass} × {GRAVITY[gravIdx].g} × {releaseH.toFixed(1)}
              </p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {maxE.toFixed(0)} <span className="text-sm font-normal">J</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Graph tab ── */}
      {tab === 'graph' && (
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-gray-700">تحولات الطاقة بالنسبة للزمن</h3>

          {chart.length < 5 ? (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border text-gray-400 text-sm">
              شغّل المحاكاة لتظهر البيانات في الرسم البياني
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="t"
                    label={{ value: 'الزمن (s)', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis
                    label={{ value: 'طاقة (J)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip formatter={(v: unknown) => `${Number(v).toFixed(0)} J`} />
                  <Legend verticalAlign="top" />
                  <Line type="monotone" dataKey="ke" stroke="#10b981" name="طاقة حركية KE" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="pe" stroke="#3b82f6" name="طاقة وضع PE"   dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-sm text-amber-800">
            <strong>الملاحظة:</strong> عندما تكون طاقة الوضع PE في أعلى مستواها، تكون طاقة الحركة KE = 0
            (نقطة التوقف)، وعند القاع تنعكس العلاقة. مجموعهما يبقى ثابتاً بدون احتكاك.
          </div>
        </div>
      )}

      {/* ── Info tab ── */}
      {tab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-2 text-base">طاقة الوضع الجذبية</h4>
            <p className="font-mono text-blue-900 text-base font-bold">PE = mgh</p>
            <ul className="mt-2 space-y-1 text-blue-700 list-disc list-inside">
              <li>m = الكتلة (kg)</li>
              <li>g = تسارع الجاذبية (m/s²)</li>
              <li>h = الارتفاع عن المرجع (m)</li>
            </ul>
          </div>

          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <h4 className="font-bold text-emerald-800 mb-2 text-base">حفظ الطاقة الميكانيكية</h4>
            <p className="font-mono text-emerald-900 font-bold">PE + KE = ثابت</p>
            <p className="text-emerald-700 mt-2">بدون احتكاك، مجموع الطاقتين لا يتغير.</p>
            <p className="text-emerald-700 mt-1">مع الاحتكاك:</p>
            <p className="font-mono text-emerald-900">PE + KE + Q = ثابت</p>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 md:col-span-2">
            <h4 className="font-bold text-amber-800 mb-3 text-base">أثر تغيير المتغيرات</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { var: 'الكتلة (m) ↑',     effect: 'PE تزداد — علاقة طردية'  },
                { var: 'الارتفاع (h) ↑',   effect: 'PE تزداد — علاقة طردية'  },
                { var: 'الجاذبية (g) ↑',   effect: 'PE تزداد — كوكب أثقل'    },
                { var: 'الاحتكاك ↑',       effect: 'تتحول طاقة إلى حرارة'     },
                { var: 'h = 0',             effect: 'PE = 0 ، KE أقصاها'      },
                { var: 'v = 0 (عند القمة)', effect: 'KE = 0 ، PE أقصاها'      },
              ].map(({ var: v, effect }) => (
                <div key={v} className="bg-white rounded-lg p-2 border border-amber-100">
                  <p className="font-bold text-amber-700">{v}</p>
                  <p className="text-amber-600 mt-0.5">{effect}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
