import { useState, useMemo, useEffect, useRef } from 'react'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, ArrowClockwise } from '@phosphor-icons/react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Line, LineChart,
} from 'recharts'

// Electron charge (C)
const e = 1.602e-19
// Actual Planck constant
const H_ACTUAL = 6.626e-34

interface LED {
  color: string
  colorAr: string
  wavelength: number  // nm
  hexColor: string
  defaultVoltage: number  // threshold voltage (V)
}

const LEDS: LED[] = [
  { color: 'Red',    colorAr: 'أحمر',    wavelength: 700, hexColor: '#ef4444', defaultVoltage: 1.77 },
  { color: 'Yellow', colorAr: 'أصفر',    wavelength: 590, hexColor: '#eab308', defaultVoltage: 2.10 },
  { color: 'Green',  colorAr: 'أخضر',    wavelength: 530, hexColor: '#22c55e', defaultVoltage: 2.34 },
  { color: 'Blue',   colorAr: 'أزرق',    wavelength: 470, hexColor: '#3b82f6', defaultVoltage: 2.64 },
]

// Speed of light (nm/s × 10^9 = m/s)
const C = 3e8

export function PlancksConstantSim() {
  const [voltages, setVoltages] = useState<number[]>(LEDS.map(l => l.defaultVoltage))
  const [activeLed, setActiveLed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
      return
    }
    intervalRef.current = setInterval(() => {
      setActiveLed(i => (i + 1) % LEDS.length)
    }, 1500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning])

  const handleReset = () => {
    setIsRunning(false)
    setVoltages(LEDS.map(l => l.defaultVoltage))
    setActiveLed(0)
  }

  // For each LED: frequency (Hz) and energy (J)
  const ledData = useMemo(() =>
    LEDS.map((led, i) => {
      const freq = (C / (led.wavelength * 1e-9))         // Hz
      const energy = voltages[i] * e                       // J = eV
      return { ...led, freq, energy, voltage: voltages[i] }
    }), [voltages])

  // Calculate h from slope of E vs f graph
  // h = ΔE / Δf via linear regression through origin
  const freqs = ledData.map(d => d.freq)
  const energies = ledData.map(d => d.energy)
  const sumF2 = freqs.reduce((s, f) => s + f * f, 0)
  const sumFE = freqs.reduce((s, f, i) => s + f * energies[i], 0)
  const hCalc = sumFE / sumF2   // slope = h

  const percentError = Math.abs((hCalc - H_ACTUAL) / H_ACTUAL) * 100

  // Plot data (freq in 10^14 Hz, energy in eV for readability)
  const plotData = ledData.map(d => ({
    freq: d.freq / 1e14,
    energy: d.voltage,   // eV = V for electron
    color: d.hexColor,
    label: d.colorAr,
  }))

  const trendLine = [
    { freq: 3.5, energy: (hCalc / e) * 3.5e14 },
    { freq: 8.0, energy: (hCalc / e) * 8.0e14 },
  ]

  return (
    <div className="space-y-5" dir="rtl">

      {/* Header */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <h3 className="font-cairo font-bold text-base">💡 تجربة تحديد ثابت بلانك باستخدام LEDs</h3>
          <p className="text-xs text-muted-foreground font-cairo mt-0.5">
            اضبط جهد العتبة لكل لمبة LED، ثم ارسم العلاقة بين الطاقة والتردد لإيجاد ثابت بلانك
          </p>
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

      {/* LED selector + slider */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {LEDS.map((led, i) => (
          <button
            key={led.color}
            onClick={() => setActiveLed(i)}
            className={`rounded-xl border-2 p-3 text-center transition-all cursor-pointer ${
              activeLed === i
                ? 'border-primary shadow-md scale-105'
                : 'border-border hover:border-primary/50'
            }`}
          >
            {/* LED bulb visual */}
            <div
              className="w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center text-2xl"
              style={{
                background: led.hexColor,
                boxShadow: activeLed === i ? `0 0 18px 6px ${led.hexColor}88` : 'none',
              }}
            >
              💡
            </div>
            <p className="text-xs font-cairo font-semibold">{led.colorAr}</p>
            <p className="text-xs text-muted-foreground font-mono">{led.wavelength} nm</p>
            <p className="text-xs font-mono text-primary mt-1">{voltages[i].toFixed(2)} V</p>
          </button>
        ))}
      </div>

      {/* Active LED voltage slider */}
      <div className="bg-muted/40 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-cairo text-sm font-semibold">
            جهد العتبة — {LEDS[activeLed].colorAr} ({LEDS[activeLed].wavelength} nm)
          </span>
          <Badge variant="outline" className="font-mono text-sm px-3">
            {voltages[activeLed].toFixed(2)} V
          </Badge>
        </div>
        <Slider
          min={0.5} max={4.0} step={0.01}
          value={[voltages[activeLed]]}
          onValueChange={([v]) => {
            const next = [...voltages]; next[activeLed] = v; setVoltages(next)
          }}
        />
        <p className="text-xs text-muted-foreground font-cairo">
          التردد: {(ledData[activeLed].freq / 1e14).toFixed(3)} × 10¹⁴ Hz
        </p>
      </div>

      {/* Graph: Energy (eV) vs Frequency */}
      <div className="space-y-1">
        <p className="font-cairo text-sm font-semibold">العلاقة بين الطاقة (eV) والتردد (×10¹⁴ Hz)</p>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-border p-2" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendLine} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="freq"
                type="number"
                domain={[3.5, 8.0]}
                label={{ value: 'ت (×10¹⁴ Hz)', position: 'insideBottomRight', offset: -5, fontSize: 11 }}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                domain={[0, 4]}
                label={{ value: 'eV', angle: -90, position: 'insideLeft', fontSize: 11 }}
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                formatter={(v: number) => [`${Number(v).toFixed(3)} eV`, 'الطاقة']}
                labelFormatter={(l: number) => `ت = ${Number(l).toFixed(2)} × 10¹⁴ Hz`}
              />
              {/* Trend line */}
              <Line
                data={trendLine}
                dataKey="energy"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                name="خط الاتجاه"
              />
              {/* Measured points */}
              {plotData.map((pt, i) => (
                <ReferenceLine
                  key={i}
                  x={pt.freq}
                  stroke={pt.color}
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  label={{ value: pt.label, position: 'top', fill: pt.color, fontSize: 10 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Results table */}
      <div className="overflow-x-auto rounded-xl border border-border text-xs font-cairo">
        <table className="w-full text-center">
          <thead className="bg-muted/60">
            <tr>
              <th className="py-2 px-3">اللون</th>
              <th className="py-2 px-3">λ (nm)</th>
              <th className="py-2 px-3">ت (×10¹⁴ Hz)</th>
              <th className="py-2 px-3">V<sub>threshold</sub> (V)</th>
              <th className="py-2 px-3">E = eV (×10⁻¹⁹ J)</th>
            </tr>
          </thead>
          <tbody>
            {ledData.map(d => (
              <tr key={d.color} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="py-2 px-3">
                  <span
                    className="inline-block w-3 h-3 rounded-full mr-1"
                    style={{ background: d.hexColor }}
                  />
                  {d.colorAr}
                </td>
                <td className="py-2 px-3 font-mono">{d.wavelength}</td>
                <td className="py-2 px-3 font-mono">{(d.freq / 1e14).toFixed(3)}</td>
                <td className="py-2 px-3 font-mono">{d.voltage.toFixed(2)}</td>
                <td className="py-2 px-3 font-mono">{(d.energy / 1e-19).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Result cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-primary/30">
          <CardContent className="p-3 text-center space-y-1">
            <p className="text-xs text-muted-foreground font-cairo">h المحسوب (×10⁻³⁴)</p>
            <p className="text-xl font-bold font-mono text-primary">
              {(hCalc / 1e-34).toFixed(3)}
            </p>
            <p className="text-xs text-muted-foreground font-cairo">J·s</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/30">
          <CardContent className="p-3 text-center space-y-1">
            <p className="text-xs text-muted-foreground font-cairo">h الحقيقي (×10⁻³⁴)</p>
            <p className="text-xl font-bold font-mono text-green-600">6.626</p>
            <p className="text-xs text-muted-foreground font-cairo">J·s</p>
          </CardContent>
        </Card>
        <Card className={`border-${percentError < 5 ? 'green' : percentError < 15 ? 'yellow' : 'red'}-500/30`}>
          <CardContent className="p-3 text-center space-y-1">
            <p className="text-xs text-muted-foreground font-cairo">نسبة الخطأ</p>
            <p className={`text-xl font-bold font-mono ${
              percentError < 5 ? 'text-green-600' : percentError < 15 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {percentError.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground font-cairo">
              {percentError < 5 ? 'ممتاز!' : percentError < 15 ? 'جيد' : 'حاول تعديل القيم'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Formula */}
      <div className="bg-muted/40 rounded-lg p-3 text-xs font-cairo">
        <p className="font-semibold text-sm mb-1">العلاقة الرياضية:</p>
        <p className="font-mono text-base text-center py-1">E = h × f = e × V</p>
        <p className="text-muted-foreground text-center">
          الميل في رسم E مقابل f يساوي ثابت بلانك h
        </p>
      </div>
    </div>
  )
}
