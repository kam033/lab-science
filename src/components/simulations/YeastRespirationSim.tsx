import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, ArrowClockwise, Flask } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

export function YeastRespirationSim() {
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<'learning' | 'experiment'>('learning')
  const [glucoseConc, setGlucoseConc] = useState(1)
  const [time, setTime] = useState(0)
  const [colorIntensity, setColorIntensity] = useState(100)
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number }>>([])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setTime(t => t + 1)
        
        const rate = glucoseConc * 2
        const newIntensity = Math.max(0, colorIntensity - rate)
        setColorIntensity(newIntensity)
        
        if (Math.random() < glucoseConc / 3) {
          setBubbles(prev => [...prev, {
            id: Date.now() + Math.random(),
            x: 150 + (Math.random() - 0.5) * 60,
            y: 400
          }].slice(-8))
        }
      }, 500)
    }
    return () => clearInterval(interval)
  }, [isRunning, glucoseConc, colorIntensity])

  useEffect(() => {
    const timer = setInterval(() => {
      setBubbles(prev => prev.filter(b => b.y > 50))
    }, 100)
    return () => clearInterval(timer)
  }, [])

  const reset = () => {
    setIsRunning(false)
    setTime(0)
    setColorIntensity(100)
    setBubbles([])
  }

  const decolorTime = colorIntensity === 0 ? time : null

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          variant={mode === 'learning' ? 'default' : 'outline'}
          onClick={() => setMode('learning')}
          className="font-cairo flex-1"
        >
          وضع التعلم
        </Button>
        <Button
          variant={mode === 'experiment' ? 'default' : 'outline'}
          onClick={() => setMode('experiment')}
          className="font-cairo flex-1"
        >
          وضع التجربة
        </Button>
      </div>

      {mode === 'learning' && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg font-cairo flex items-center gap-2">
              <Flask size={20} weight="fill" />
              شرح التجربة
            </CardTitle>
          </CardHeader>
          <CardContent className="font-noto space-y-2 text-sm">
            <p>• تتنفس خلايا الخميرة هوائياً في وجود الأكسجين</p>
            <p>• أزرق الميثيلين يتحول من الأزرق إلى عديم اللون عند استهلاك الأكسجين</p>
            <p>• كلما زاد تركيز الجلوكوز، زاد معدل التنفس</p>
            <p>• الزمن اللازم لتلاشي اللون = مؤشر على معدل التنفس</p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-cairo text-lg">لوحة التحكم</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-cairo text-sm font-medium">
                  تركيز الجلوكوز
                </label>
                <Badge variant="secondary" className="font-cairo">
                  {glucoseConc}%
                </Badge>
              </div>
              <Slider
                value={[glucoseConc]}
                onValueChange={(v) => {
                  if (!isRunning) setGlucoseConc(v[0])
                }}
                min={0.5}
                max={3}
                step={0.5}
                disabled={isRunning}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-cairo">
                <span>0.5%</span>
                <span>1.5%</span>
                <span>3%</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                className="flex-1 font-cairo gap-2"
                disabled={colorIntensity === 0}
              >
                {isRunning ? (
                  <>
                    <Pause size={18} weight="fill" />
                    إيقاف
                  </>
                ) : (
                  <>
                    <Play size={18} weight="fill" />
                    تشغيل
                  </>
                )}
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                className="font-cairo gap-2"
              >
                <ArrowClockwise size={18} />
                إعادة ضبط
              </Button>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between font-cairo">
                <span className="text-sm">الزمن المنقضي:</span>
                <Badge>{time} ثانية</Badge>
              </div>
              <div className="flex justify-between font-cairo">
                <span className="text-sm">شدة اللون الأزرق:</span>
                <Badge variant={colorIntensity === 0 ? 'destructive' : 'default'}>
                  {colorIntensity}%
                </Badge>
              </div>
              {decolorTime !== null && (
                <div className="flex justify-between font-cairo">
                  <span className="text-sm font-semibold">زمن التلاشي:</span>
                  <Badge variant="default" className="bg-green-600">
                    {decolorTime} ثانية
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-cairo text-lg">منطقة المحاكاة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full aspect-[3/4] border-2 border-border rounded-lg overflow-hidden">
              <svg width="100%" height="100%" viewBox="0 0 300 450">
                <rect
                  x="50"
                  y="50"
                  width="200"
                  height="350"
                  rx="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                
                <rect
                  x="55"
                  y="150"
                  width="190"
                  height="240"
                  rx="5"
                  fill={`rgb(${255 - colorIntensity * 1.8}, ${255 - colorIntensity * 1.5}, ${255})`}
                  opacity="0.9"
                />
                
                <text
                  x="150"
                  y="130"
                  textAnchor="middle"
                  className="font-cairo text-xs"
                  fill="currentColor"
                >
                  أزرق الميثيلين + خميرة
                </text>

                <text
                  x="150"
                  y="30"
                  textAnchor="middle"
                  className="font-cairo text-sm font-bold"
                  fill="currentColor"
                >
                  أنبوب الاختبار
                </text>

                <AnimatePresence>
                  {bubbles.map((bubble) => (
                    <motion.circle
                      key={bubble.id}
                      cx={bubble.x}
                      cy={bubble.y}
                      r="4"
                      fill="white"
                      opacity="0.7"
                      initial={{ y: 400, opacity: 0.7 }}
                      animate={{ y: 100, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2, ease: 'easeOut' }}
                    />
                  ))}
                </AnimatePresence>

                {colorIntensity === 0 && (
                  <text
                    x="150"
                    y="420"
                    textAnchor="middle"
                    className="font-cairo text-xs font-bold"
                    fill="#22c55e"
                  >
                    ✓ اكتمل التلاشي
                  </text>
                )}
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-cairo text-lg">الملاحظات والاستنتاجات</CardTitle>
        </CardHeader>
        <CardContent className="font-noto space-y-3 text-sm">
          <div className="grid gap-2">
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <p>المتغير المستقل: تركيز الجلوكوز ({glucoseConc}%)</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <p>المتغير التابع: معدل التنفس (يُقاس بزمن تلاشي اللون الأزرق)</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <p>المتغيرات الثابتة: حجم المحلول، كمية الخميرة، درجة الحرارة، كمية أزرق الميثيلين</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <p className="font-bold text-primary">
                النتيجة: كلما زاد تركيز الجلوكوز، قلّ الزمن اللازم لتلاشي اللون (زاد معدل التنفس)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
