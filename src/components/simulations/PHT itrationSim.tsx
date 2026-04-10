import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, ArrowClockwise, Plus } from '@phosphor-icons/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export function PHTitrationSim() {
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<'learning' | 'experiment'>('learning')
  const [volumeAdded, setVolumeAdded] = useState(0)
  const [dropSpeed, setDropSpeed] = useState(2)
  const [data, setData] = useState<Array<{ volume: number; pH: number }>>([{ volume: 0, pH: 1.0 }])
  const [buretteLevel, setBuretteLevel] = useState(100)

  const calculatePH = useCallback((volume: number): number => {
    if (volume < 24) {
      return 1.0 + (volume / 24) * 2.5
    } else if (volume < 25) {
      return 3.5 + ((volume - 24) / 1) * 7
    } else if (volume < 26) {
      return 10.5 + ((volume - 25) / 1) * 2.5
    } else {
      return 13 - (1 / (1 + (volume - 26) * 0.1))
    }
  }, [])

  const getColor = (pH: number): string => {
    if (pH < 4) return '#ff4444'
    if (pH < 6) return '#ff8844'
    if (pH < 8) return '#44ff44'
    if (pH < 10) return '#4488ff'
    return '#8844ff'
  }

  const currentPH = data[data.length - 1]?.pH || 1.0

  const addDrop = useCallback(() => {
    setVolumeAdded(prev => {
      const newVolume = Math.min(prev + dropSpeed, 50)
      const newPH = calculatePH(newVolume)
      
      setData(current => {
        const latest = current[current.length - 1]
        if (!latest || newVolume - latest.volume >= 0.5) {
          return [...current, { volume: Number(newVolume.toFixed(1)), pH: Number(newPH.toFixed(2)) }]
        }
        return current
      })

      setBuretteLevel(prev => Math.max(0, prev - (dropSpeed / 50) * 100))

      return newVolume
    })
  }, [dropSpeed, calculatePH])

  const toggleRunning = () => {
    setIsRunning(!isRunning)
  }

  useState(() => {
    let interval: NodeJS.Timeout | undefined

    if (isRunning && volumeAdded < 50) {
      interval = setInterval(addDrop, 200)
    } else if (volumeAdded >= 50) {
      setIsRunning(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  })

  const reset = () => {
    setIsRunning(false)
    setVolumeAdded(0)
    setData([{ volume: 0, pH: 1.0 }])
    setBuretteLevel(100)
  }

  const equivalencePoint = data.find(d => d.pH >= 6.9 && d.pH <= 7.1)

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
              <div className="flex justify-center items-end gap-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg" style={{ height: '320px' }}>
                <div className="relative">
                  <div className="w-12 h-64 bg-gradient-to-b from-transparent to-gray-300 border-2 border-gray-400 rounded-b-lg relative overflow-hidden">
                    <div 
                      className="absolute bottom-0 w-full transition-all duration-300"
                      style={{ 
                        height: `${buretteLevel}%`,
                        backgroundColor: '#fbbf24'
                      }}
                    />
                  </div>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-6 bg-gray-400 rounded-full border-2 border-gray-500" />
                  <div className="text-xs font-cairo text-center mt-2 text-gray-700">سحاحة NaOH</div>
                </div>

                <div className="relative flex flex-col items-center">
                  {volumeAdded > 0 && volumeAdded < 50 && isRunning && (
                    <div className="absolute -top-12 w-1 h-12 bg-blue-400 animate-pulse" style={{ left: '50%', transform: 'translateX(-50%)' }} />
                  )}
                  
                  <div 
                    className="w-32 h-40 border-4 border-gray-400 rounded-b-full relative overflow-hidden transition-colors duration-500"
                    style={{ 
                      borderTopLeftRadius: '20%',
                      borderTopRightRadius: '20%'
                    }}
                  >
                    <div 
                      className="absolute bottom-0 w-full transition-all duration-300"
                      style={{ 
                        height: `${Math.min(100, (volumeAdded / 25) * 80)}%`,
                        backgroundColor: getColor(currentPH)
                      }}
                    />
                  </div>
                  <div className="text-xs font-cairo text-center mt-2 text-gray-700">دورق + HCl</div>
                  <div className="text-lg font-bold font-cairo mt-2" style={{ color: getColor(currentPH) }}>
                    pH = {currentPH.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 justify-center">
                <Button
                  onClick={toggleRunning}
                  disabled={volumeAdded >= 50}
                  className="gap-2 font-cairo"
                >
                  {isRunning ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
                  {isRunning ? 'إيقاف' : 'إضافة القاعدة'}
                </Button>
                <Button
                  onClick={addDrop}
                  disabled={isRunning || volumeAdded >= 50}
                  variant="outline"
                  className="gap-2 font-cairo"
                >
                  <Plus size={18} />
                  قطرة واحدة
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

          <Card>
            <CardHeader>
              <CardTitle className="font-cairo text-lg">منحنى المعايرة</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="volume" 
                    label={{ value: 'الحجم المضاف (mL)', position: 'insideBottom', offset: -5, style: { fontFamily: 'Cairo' } }}
                  />
                  <YAxis 
                    domain={[0, 14]}
                    label={{ value: 'pH', angle: -90, position: 'insideLeft', style: { fontFamily: 'Cairo' } }}
                  />
                  <Tooltip 
                    contentStyle={{ fontFamily: 'Cairo', direction: 'rtl' }}
                    formatter={(value: number) => [value.toFixed(2), 'pH']}
                    labelFormatter={(label) => `الحجم: ${label} mL`}
                  />
                  <ReferenceLine y={7} stroke="#888" strokeDasharray="3 3" label={{ value: 'pH = 7', style: { fontFamily: 'Cairo', fill: '#888' } }} />
                  <Line type="monotone" dataKey="pH" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
              {equivalencePoint && (
                <p className="text-xs text-center mt-2 font-cairo text-green-600">
                  ✓ نقطة التكافؤ عند الحجم: {equivalencePoint.volume} mL
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-cairo text-sm">لوحة التحكم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-cairo block mb-2">
                  سرعة الإضافة: {dropSpeed} mL
                </label>
                <Slider
                  value={[dropSpeed]}
                  onValueChange={(v) => !isRunning && setDropSpeed(v[0])}
                  min={1}
                  max={5}
                  step={1}
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
                <span className="text-sm font-cairo">الحجم المضاف</span>
                <Badge variant="secondary" className="font-cairo">{volumeAdded.toFixed(1)} mL</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-cairo">قيمة pH الحالية</span>
                <Badge className="font-cairo" style={{ backgroundColor: getColor(currentPH) }}>{currentPH.toFixed(2)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-cairo">عدد القراءات</span>
                <Badge variant="secondary" className="font-cairo">{data.length}</Badge>
              </div>
            </CardContent>
          </Card>

          {mode === 'learning' && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="font-cairo text-sm flex items-center gap-2">
                  <span>💡</span> ملاحظة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-cairo text-green-900">
                  عند إضافة قاعدة قوية لحمض قوي، يرتفع pH تدريجياً ثم يقفز بسرعة عند نقطة التكافؤ (pH = 7).
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
              <p>دراسة التغير في الرقم الهيدروجيني pH أثناء معايرة حمض قوي بقاعدة قوية وتحديد نقطة التكافؤ.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">👀 ماذا نلاحظ:</h4>
              <p>يتغير لون المحلول تدريجياً من الأحمر (حمضي) إلى الأخضر (متعادل) إلى الأرجواني (قاعدي). يحدث تغير سريع في pH عند نقطة التكافؤ.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🧪 المعادلة:</h4>
              <p className="font-mono text-xs">HCl + NaOH → NaCl + H₂O</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📊 المتغيرات:</h4>
              <ul className="list-disc list-inside space-y-1 mr-4">
                <li><strong>المستقل:</strong> حجم القاعدة المضافة (NaOH)</li>
                <li><strong>التابع:</strong> قيمة الرقم الهيدروجيني pH</li>
                <li><strong>الثابت:</strong> تركيز الحمض، تركيز القاعدة، درجة الحرارة</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
