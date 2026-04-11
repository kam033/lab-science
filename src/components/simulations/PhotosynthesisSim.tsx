import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, ArrowClockwise, Sun, Drop } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface Bubble {
  id: number
  x: number
  y: number
}

export function PhotosynthesisSim() {
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<'learning' | 'experiment'>('learning')
  const [lightIntensity, setLightIntensity] = useState(50)
  const [co2Concentration, setCo2Concentration] = useState(2)
  const [time, setTime] = useState(0)
  const [oxygenProduced, setOxygenProduced] = useState(0)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [rate, setRate] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setTime(t => t + 1)
        
        const productionRate = (lightIntensity / 100) * co2Concentration * 0.5
        setRate(productionRate)
        
        setOxygenProduced(prev => prev + productionRate)
        
        if (Math.random() < productionRate) {
          setBubbles(prev => [...prev, {
            id: Date.now() + Math.random(),
            x: 200 + (Math.random() - 0.5) * 100,
            y: 280
          }].slice(-15))
        }
      }, 500)
    }
    return () => clearInterval(interval)
  }, [isRunning, lightIntensity, co2Concentration])

  useEffect(() => {
    const timer = setInterval(() => {
      setBubbles(prev => prev.filter(() => Math.random() > 0.1))
    }, 100)
    return () => clearInterval(timer)
  }, [])

  const reset = () => {
    setIsRunning(false)
    setTime(0)
    setOxygenProduced(0)
    setBubbles([])
    setRate(0)
  }

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
              <Sun size={20} weight="fill" />
              شرح التجربة
            </CardTitle>
          </CardHeader>
          <CardContent className="font-noto space-y-2 text-sm">
            <p>• النبات المائي يمتص CO₂ من الماء ويستخدم الضوء</p>
            <p>• ينتج الأكسجين الذي يظهر على شكل فقاعات</p>
            <p>• زيادة شدة الضوء أو تركيز CO₂ يزيد معدل التمثيل الضوئي</p>
            <p>• المعادلة: 6CO₂ + 6H₂O + ضوء → C₆H₁₂O₆ + 6O₂</p>
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
                <label className="font-cairo text-sm font-medium flex items-center gap-2">
                  <Sun size={16} />
                  شدة الضوء
                </label>
                <Badge variant="secondary" className="font-cairo">
                  {lightIntensity}%
                </Badge>
              </div>
              <Slider
                value={[lightIntensity]}
                onValueChange={(v) => {
                  if (!isRunning) setLightIntensity(v[0])
                }}
                min={0}
                max={100}
                step={10}
                disabled={isRunning}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-cairo">
                <span>مظلم</span>
                <span>متوسط</span>
                <span>ساطع</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-cairo text-sm font-medium flex items-center gap-2">
                  <Drop size={16} />
                  تركيز CO₂
                </label>
                <Badge variant="secondary" className="font-cairo">
                  {co2Concentration}%
                </Badge>
              </div>
              <Slider
                value={[co2Concentration]}
                onValueChange={(v) => {
                  if (!isRunning) setCo2Concentration(v[0])
                }}
                min={0.5}
                max={5}
                step={0.5}
                disabled={isRunning}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-cairo">
                <span>0.5%</span>
                <span>2.75%</span>
                <span>5%</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                className="flex-1 font-cairo gap-2"
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
                <span className="text-sm">معدل الإنتاج:</span>
                <Badge variant="default">
                  {rate.toFixed(2)} فقاعة/ثانية
                </Badge>
              </div>
              <div className="flex justify-between font-cairo">
                <span className="text-sm">الأكسجين المنتج:</span>
                <Badge variant="default" className="bg-green-600">
                  {oxygenProduced.toFixed(1)} وحدة
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-cairo text-lg">منطقة المحاكاة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full aspect-[3/4] border-2 border-border rounded-lg overflow-hidden bg-gradient-to-b from-blue-100/50 to-blue-200/50">
              <svg width="100%" height="100%" viewBox="0 0 400 500">
                <defs>
                  <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#bfdbfe', stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: '#93c5fd', stopOpacity: 0.5 }} />
                  </linearGradient>
                </defs>

                <rect
                  x="0"
                  y="0"
                  width="400"
                  height="500"
                  fill="url(#waterGradient)"
                />

                <ellipse
                  cx="200"
                  cy="500"
                  rx="60"
                  ry="20"
                  fill="#65a30d"
                />
                
                <motion.g
                  animate={{
                    y: [0, -5, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <path
                    d="M 150 450 Q 180 350, 200 280 T 250 120"
                    fill="none"
                    stroke="#84cc16"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  
                  <ellipse cx="160" cy="400" rx="15" ry="25" fill="#65a30d" opacity="0.8" />
                  <ellipse cx="190" cy="330" rx="18" ry="30" fill="#65a30d" opacity="0.8" />
                  <ellipse cx="210" cy="250" rx="20" ry="35" fill="#84cc16" opacity="0.9" />
                  <ellipse cx="230" cy="180" rx="18" ry="30" fill="#84cc16" opacity="0.9" />
                  <ellipse cx="245" cy="130" rx="15" ry="25" fill="#a3e635" opacity="0.9" />
                </motion.g>

                {lightIntensity > 0 && (
                  <>
                    <motion.line
                      x1={100 + Math.random() * 20}
                      y1="-10"
                      x2={150 + Math.random() * 20}
                      y2="100"
                      stroke="#fbbf24"
                      strokeWidth="2"
                      opacity={lightIntensity / 200}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <motion.line
                      x1={200 + Math.random() * 20}
                      y1="-10"
                      x2={200 + Math.random() * 20}
                      y2="120"
                      stroke="#fbbf24"
                      strokeWidth="2"
                      opacity={lightIntensity / 200}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                    />
                    <motion.line
                      x1={280 + Math.random() * 20}
                      y1="-10"
                      x2={250 + Math.random() * 20}
                      y2="100"
                      stroke="#fbbf24"
                      strokeWidth="2"
                      opacity={lightIntensity / 200}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                    />
                  </>
                )}

                <AnimatePresence>
                  {bubbles.map((bubble) => (
                    <motion.circle
                      key={bubble.id}
                      cx={bubble.x}
                      cy={bubble.y}
                      r="6"
                      fill="white"
                      stroke="#3b82f6"
                      strokeWidth="1"
                      opacity="0.8"
                      initial={{ y: 280, opacity: 0.8, scale: 0.5 }}
                      animate={{ y: -20, opacity: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 3, ease: 'linear' }}
                    />
                  ))}
                </AnimatePresence>

                <text
                  x="200"
                  y="30"
                  textAnchor="middle"
                  className="font-cairo text-sm font-bold"
                  fill="currentColor"
                >
                  O₂ ↑
                </text>

                <text
                  x="200"
                  y="480"
                  textAnchor="middle"
                  className="font-cairo text-xs"
                  fill="currentColor"
                >
                  نبات مائي (إيلوديا)
                </text>
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
              <p>المتغير المستقل: شدة الضوء ({lightIntensity}%) أو تركيز CO₂ ({co2Concentration}%)</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <p>المتغير التابع: معدل إنتاج الأكسجين (عدد الفقاعات/الزمن)</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <p>المتغيرات الثابتة: نوع النبات، درجة الحرارة، حجم الماء</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <p className="font-bold text-primary">
                النتيجة: زيادة شدة الضوء أو تركيز CO₂ يزيد معدل التمثيل الضوئي (إنتاج الأكسجين)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
