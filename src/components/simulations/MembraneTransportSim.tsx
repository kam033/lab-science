import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, ArrowClockwise } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  inside: boolean
}

export function MembraneTransportSim() {
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<'learning' | 'experiment'>('learning')
  const [insideConcentration, setInsideConcentration] = useState(30)
  const [outsideConcentration, setOutsideConcentration] = useState(70)
  const [particles, setParticles] = useState<Particle[]>([])
  const [transportRate, setTransportRate] = useState(0)
  const animationRef = useRef<number>()

  const initializeParticles = useCallback(() => {
    const newParticles: Particle[] = []
    let id = 0

    for (let i = 0; i < insideConcentration; i++) {
      newParticles.push({
        id: id++,
        x: Math.random() * 180 + 10,
        y: Math.random() * 280 + 10,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        inside: true
      })
    }

    for (let i = 0; i < outsideConcentration; i++) {
      newParticles.push({
        id: id++,
        x: Math.random() * 180 + 210,
        y: Math.random() * 280 + 10,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        inside: false
      })
    }

    setParticles(newParticles)
  }, [insideConcentration, outsideConcentration])

  useEffect(() => {
    initializeParticles()
  }, [initializeParticles])

  const updateParticles = useCallback(() => {
    setParticles(prev => {
      const updated = prev.map(p => {
        let newX = p.x + p.vx
        let newY = p.y + p.vy
        let newVx = p.vx
        let newVy = p.vy
        let newInside = p.inside

        if (newY <= 10 || newY >= 290) {
          newVy = -newVy
          newY = Math.max(10, Math.min(290, newY))
        }

        if (p.inside) {
          if (newX <= 10) {
            newVx = -newVx
            newX = 10
          } else if (newX >= 190) {
            if (Math.random() < 0.05) {
              newInside = false
              newX = 210
            } else {
              newVx = -newVx
              newX = 190
            }
          }
        } else {
          if (newX >= 390) {
            newVx = -newVx
            newX = 390
          } else if (newX <= 210) {
            if (Math.random() < 0.03) {
              newInside = true
              newX = 190
            } else {
              newVx = -newVx
              newX = 210
            }
          }
        }

        return {
          ...p,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          inside: newInside
        }
      })

      return updated
    })
  }, [])

  useEffect(() => {
    const insideCount = particles.filter(p => p.inside).length
    const outsideCount = particles.filter(p => !p.inside).length
    const total = insideCount + outsideCount
    if (total > 0) {
      setTransportRate(Math.abs(insideCount / total - 0.5) * 100)
    }
  }, [particles])

  useEffect(() => {
    if (isRunning) {
      const animate = () => {
        updateParticles()
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning])

  const reset = () => {
    setIsRunning(false)
    initializeParticles()
    setTransportRate(0)
  }

  const insideCount = particles.filter(p => p.inside).length
  const outsideCount = particles.filter(p => !p.inside).length

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
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-cairo text-lg">منطقة المحاكاة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4" style={{ height: '320px' }}>
                <svg width="400" height="300" className="mx-auto">
                  <rect x="10" y="10" width="180" height="280" fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" strokeWidth="2" rx="8" />
                  <rect x="210" y="10" width="180" height="280" fill="rgba(168, 85, 247, 0.1)" stroke="#a855f7" strokeWidth="2" rx="8" />
                  
                  <line x1="200" y1="10" x2="200" y2="290" stroke="#64748b" strokeWidth="4" strokeDasharray="5,5" />
                  
                  <text x="100" y="305" textAnchor="middle" className="text-xs font-cairo fill-blue-600">داخل الخلية</text>
                  <text x="300" y="305" textAnchor="middle" className="text-xs font-cairo fill-purple-600">خارج الخلية</text>

                  {particles.map(particle => (
                    <circle
                      key={particle.id}
                      cx={particle.x}
                      cy={particle.y}
                      r="4"
                      fill={particle.inside ? '#3b82f6' : '#a855f7'}
                      opacity="0.8"
                    />
                  ))}
                </svg>
              </div>

              <div className="flex gap-2 mt-4 justify-center">
                <Button
                  onClick={() => setIsRunning(!isRunning)}
                  className="gap-2 font-cairo"
                >
                  {isRunning ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
                  {isRunning ? 'إيقاف' : 'تشغيل'}
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
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-cairo text-sm">لوحة التحكم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-cairo block mb-2">
                  تركيز داخلي: {insideCount}
                </label>
                <Slider
                  value={[insideConcentration]}
                  onValueChange={(v) => !isRunning && setInsideConcentration(v[0])}
                  min={10}
                  max={100}
                  step={5}
                  disabled={isRunning}
                />
              </div>

              <div>
                <label className="text-sm font-cairo block mb-2">
                  تركيز خارجي: {outsideCount}
                </label>
                <Slider
                  value={[outsideConcentration]}
                  onValueChange={(v) => !isRunning && setOutsideConcentration(v[0])}
                  min={10}
                  max={100}
                  step={5}
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
                <span className="text-sm font-cairo">عدد الجزيئات الداخلية</span>
                <Badge variant="secondary" className="font-cairo">{insideCount}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-cairo">عدد الجزيئات الخارجية</span>
                <Badge variant="secondary" className="font-cairo">{outsideCount}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-cairo">معدل النقل</span>
                <Badge className="font-cairo">{transportRate.toFixed(1)}%</Badge>
              </div>
            </CardContent>
          </Card>

          {mode === 'learning' && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="font-cairo text-sm flex items-center gap-2">
                  <span>💡</span> ملاحظة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-cairo text-blue-900">
                  الجزيئات تتحرك من منطقة التركيز العالي إلى منطقة التركيز المنخفض عبر الغشاء حتى الوصول للاتزان.
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
              <p>دراسة حركة الجزيئات عبر الغشاء الخلوي وفهم عملية الانتشار والنقل السلبي.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">👀 ماذا نلاحظ:</h4>
              <p>الجزيئات تتحرك باستمرار وتعبر الغشاء من المنطقة الأعلى تركيزاً إلى الأقل تركيزاً.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📊 المتغيرات:</h4>
              <ul className="list-disc list-inside space-y-1 mr-4">
                <li><strong>المستقل:</strong> التركيز الابتدائي داخل وخارج الخلية</li>
                <li><strong>التابع:</strong> معدل انتقال الجزيئات عبر الغشاء</li>
                <li><strong>الثابت:</strong> نفاذية الغشاء، حجم الجزيئات، درجة الحرارة</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
