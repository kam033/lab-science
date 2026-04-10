import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, ArrowClockwise } from '@phosphor-icons/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export function InverseSquareLawSim() {
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<'learning' | 'experiment'>('learning')
  const [distance, setDistance] = useState(10)
  const [sourcePower, setSourcePower] = useState(100)
  const [measurements, setMeasurements] = useState<Array<{ distance: number; intensity: number; theoretical: number }>>([])

  const calculateIntensity = (dist: number, power: number): number => {
    return power / (dist * dist)
  }

  const currentIntensity = calculateIntensity(distance, sourcePower)
  const theoretical = calculateIntensity(distance, sourcePower)

  const addMeasurement = () => {
    const newMeasurement = {
      distance,
      intensity: currentIntensity * (0.95 + Math.random() * 0.1),
      theoretical
    }

    setMeasurements(prev => {
      const exists = prev.find(m => m.distance === distance)
      if (exists) {
        return prev.map(m => m.distance === distance ? newMeasurement : m).sort((a, b) => a.distance - b.distance)
      }
      return [...prev, newMeasurement].sort((a, b) => a.distance - b.distance)
    })
  }

  const reset = () => {
    setIsRunning(false)
    setDistance(10)
    setMeasurements([])
  }

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined

    if (isRunning) {
      interval = setInterval(() => {
        setDistance(prev => {
          const newDist = prev + 2
          if (newDist > 50) {
            setIsRunning(false)
            return prev
          }

          const intensity = calculateIntensity(newDist, sourcePower)
          setMeasurements(current => [
            ...current,
            {
              distance: newDist,
              intensity: intensity * (0.95 + Math.random() * 0.1),
              theoretical: intensity
            }
          ])

          return newDist
        })
      }, 500)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, sourcePower])

  const waveRadius = (distance / 50) * 120

  return (
    <div className="space-y-6">
      <div className="flex gap-2 justify-center">
        <Button
          variant={mode === 'learning' ? 'default' : 'outline'}
          onClick={() => setMode('learning')}
          className="font-cairo"
        >
          وضع التعلم
        </Button>
        <Button
          variant={mode === 'experiment' ? 'default' : 'outline'}
          onClick={() => setMode('experiment')}
          className="font-cairo"
        >
          وضع التجربة
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-cairo text-lg">منطقة المحاكاة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-lg p-6" style={{ height: '320px' }}>
                <svg width="100%" height="100%" viewBox="0 0 400 300" className="mx-auto">
                  <defs>
                    <radialGradient id="lightGradient">
                      <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#d97706" stopOpacity="0.1" />
                    </radialGradient>
                  </defs>

                  {[1, 2, 3].map(i => (
                    <circle
                      key={i}
                      cx="50"
                      cy="150"
                      r={waveRadius * i * 0.4}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1"
                      opacity={0.3 / i}
                      className="animate-pulse"
                      style={{ animationDuration: `${2 * i}s` }}
                    />
                  ))}

                  <circle cx="50" cy="150" r="15" fill="url(#lightGradient)" />
                  <text x="50" y="155" textAnchor="middle" className="text-xs font-cairo fill-white font-bold">💡</text>

                  <line x1="50" y1="150" x2={50 + distance * 5} y2="150" stroke="#64748b" strokeWidth="2" strokeDasharray="5,5" />

                  <rect
                    x={50 + distance * 5 - 10}
                    y="130"
                    width="20"
                    height="40"
                    fill="#3b82f6"
                    stroke="#1e40af"
                    strokeWidth="2"
                    rx="4"
                  />
                  <text x={50 + distance * 5} y="115" textAnchor="middle" className="text-xs font-cairo fill-blue-600">مستشعر</text>

                  <text x={50 + distance * 2.5} y="180" textAnchor="middle" className="text-sm font-cairo fill-gray-700 font-bold">
                    {distance} cm
                  </text>

                  <g transform={`translate(${50 + distance * 5}, 150)`}>
                    {Array.from({ length: Math.min(10, Math.floor(currentIntensity / 2)) }).map((_, i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={-15 + i * 3}
                        x2="30"
                        y2={-15 + i * 3}
                        stroke="#fbbf24"
                        strokeWidth="1"
                        opacity="0.6"
                      />
                    ))}
                  </g>
                </svg>

                <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded-lg shadow text-xs font-cairo">
                  <div className="font-semibold text-amber-600">شدة الضوء: {currentIntensity.toFixed(2)} W/m²</div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 justify-center">
                <Button
                  onClick={() => setIsRunning(!isRunning)}
                  disabled={distance >= 50}
                  className="gap-2 font-cairo"
                >
                  {isRunning ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
                  {isRunning ? 'إيقاف' : 'تشغيل تلقائي'}
                </Button>
                <Button
                  onClick={addMeasurement}
                  disabled={isRunning}
                  variant="outline"
                  className="gap-2 font-cairo"
                >
                  تسجيل قياس
                </Button>
                <Button
                  onClick={reset}
                  variant="outline"
                  className="gap-2 font-cairo"
                >
                  <ArrowClockwise size={18} />
                  إعادة ضبط
                </Button>
              </div>
            </CardContent>
          </Card>

          {measurements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-cairo text-lg">الرسم البياني</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={measurements}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="distance" 
                      label={{ value: 'المسافة (cm)', position: 'insideBottom', offset: -5, style: { fontFamily: 'Cairo' } }}
                    />
                    <YAxis 
                      label={{ value: 'الشدة (W/m²)', angle: -90, position: 'insideLeft', style: { fontFamily: 'Cairo' } }}
                    />
                    <Tooltip 
                      contentStyle={{ fontFamily: 'Cairo', direction: 'rtl' }}
                      formatter={(value: number) => value.toFixed(2)}
                    />
                    <Legend wrapperStyle={{ fontFamily: 'Cairo' }} />
                    <Line type="monotone" dataKey="theoretical" stroke="#8b5cf6" strokeWidth={2} name="القيمة النظرية" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="intensity" stroke="#3b82f6" strokeWidth={2} name="القراءة المُقاسة" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-cairo text-sm">لوحة التحكم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-cairo block mb-2">
                  المسافة: {distance} cm
                </label>
                <Slider
                  value={[distance]}
                  onValueChange={(v) => !isRunning && setDistance(v[0])}
                  min={5}
                  max={50}
                  step={1}
                  disabled={isRunning}
                />
              </div>

              <div>
                <label className="text-sm font-cairo block mb-2">
                  قوة المصدر: {sourcePower} W
                </label>
                <Slider
                  value={[sourcePower]}
                  onValueChange={(v) => !isRunning && setSourcePower(v[0])}
                  min={50}
                  max={200}
                  step={10}
                  disabled={isRunning}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-cairo text-sm">القياسات المباشرة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-cairo">المسافة الحالية</span>
                <Badge variant="secondary" className="font-cairo">{distance} cm</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-cairo">الشدة المُقاسة</span>
                <Badge className="font-cairo bg-amber-500">{currentIntensity.toFixed(2)} W/m²</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-cairo">عدد القراءات</span>
                <Badge variant="secondary" className="font-cairo">{measurements.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-cairo">النسبة (I ∝ 1/d²)</span>
                <Badge className="font-cairo bg-purple-500">
                  1/{(distance * distance / sourcePower).toFixed(0)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {mode === 'learning' && (
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="font-cairo text-sm flex items-center gap-2">
                  <span>💡</span> ملاحظة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-cairo text-amber-900">
                  شدة الضوء تتناسب عكسياً مع مربع المسافة من المصدر. عند مضاعفة المسافة، تصبح الشدة ربع القيمة الأصلية.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {mode === 'learning' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-cairo">الشرح العلمي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-cairo text-sm">
            <div>
              <h4 className="font-semibold mb-2">🎯 الهدف:</h4>
              <p>دراسة العلاقة بين شدة الموجة الضوئية والمسافة من مصدر نقطي، والتحقق من قانون التربيع العكسي.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">👀 ماذا نلاحظ:</h4>
              <p>كلما ابتعد المستشعر عن المصدر، تقل شدة الضوء بشكل كبير. الانخفاض ليس خطياً بل يتبع علاقة تربيعية عكسية.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🔬 القانون:</h4>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                I = P / (4πd²)
                <br />
                <br />
                حيث:
                <br />
                I = الشدة (W/m²)
                <br />
                P = قدرة المصدر (W)
                <br />
                d = المسافة من المصدر (m)
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📊 المتغيرات:</h4>
              <ul className="list-disc list-inside space-y-1 mr-4">
                <li><strong>المستقل:</strong> المسافة من مصدر الضوء (d)</li>
                <li><strong>التابع:</strong> شدة الضوء المُقاسة (I)</li>
                <li><strong>الثابت:</strong> قدرة مصدر الضوء، الوسط (الهواء)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">💡 التفسير:</h4>
              <p>
                الموجات تنتشر من المصدر في جميع الاتجاهات على شكل كروي. مع زيادة المسافة، تتوزع الطاقة نفسها على مساحة سطح كروي أكبر (مساحة = 4πd²)، لذلك تقل الشدة بتربيع المسافة.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
