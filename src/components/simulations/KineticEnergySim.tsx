import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { Play, Pause, ArrowCounterClockwise } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function KineticEnergySim() {
  const [isRunning, setIsRunning] = useState(false)
  const [mass, setMass] = useState(1)
  const [velocity, setVelocity] = useState(5)
  const [position, setPosition] = useState(0)
  const [springCompression, setSpringCompression] = useState(0)

  const kineticEnergy = 0.5 * mass * velocity * velocity
  const maxCompression = Math.sqrt(kineticEnergy / 100)

  useEffect(() => {
    if (isRunning && position < 450) {
      const timer = setInterval(() => {
        setPosition((p) => {
          const newPos = p + velocity * 0.5
          if (newPos >= 450) {
            const compression = Math.min((newPos - 450) / 30, maxCompression)
            setSpringCompression(compression)
            if (compression >= maxCompression * 0.95) {
              setIsRunning(false)
            }
          }
          return Math.min(newPos, 480)
        })
      }, 50)
      return () => clearInterval(timer)
    }
  }, [isRunning, position, velocity, maxCompression])

  const reset = () => {
    setIsRunning(false)
    setPosition(0)
    setSpringCompression(0)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="relative h-[300px] bg-white/80 rounded-lg border-2 border-primary/20 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="spring" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="oklch(0.65 0.22 50)" />
                <stop offset="100%" stopColor="oklch(0.75 0.18 40)" />
              </linearGradient>
            </defs>

            <line x1="20" y1="150" x2="600" y2="150" stroke="oklch(0.7 0 0)" strokeWidth="2" strokeDasharray="5,5" />

            <motion.g animate={{ x: position }}>
              <rect
                x="50"
                y="115"
                width={60 + mass * 10}
                height={60 + mass * 10}
                fill="oklch(0.55 0.20 240)"
                stroke="oklch(0.45 0.15 265)"
                strokeWidth="3"
                rx="8"
              />
              <text
                x={80 + mass * 5}
                y={155 + mass * 5}
                textAnchor="middle"
                fill="white"
                fontSize="20"
                fontWeight="bold"
              >
                {mass} kg
              </text>
            </motion.g>

            {position >= 450 && (
              <g transform={`translate(${530}, 150)`}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <line
                    key={i}
                    x1={-i * (5 + springCompression * 3)}
                    y1={-30 + i * 6}
                    x2={-i * (5 + springCompression * 3) - 5}
                    y2={-24 + i * 6}
                    stroke="url(#spring)"
                    strokeWidth="4"
                  />
                ))}
              </g>
            )}

            <rect x="530" y="100" width="15" height="100" fill="oklch(0.3 0 0)" rx="2" />
          </svg>

          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-lg p-4 shadow-lg border">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">الكتلة:</span>
                <span className="font-bold font-mono">{mass.toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">السرعة:</span>
                <span className="font-bold font-mono">{velocity.toFixed(1)} m/s</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">الطاقة الحركية:</span>
                <span className="font-bold font-mono text-primary">{kineticEnergy.toFixed(1)} J</span>
              </div>
              {springCompression > 0 && (
                <div className="flex justify-between gap-8">
                  <span className="text-muted-foreground">انضغاط الزنبرك:</span>
                  <span className="font-bold font-mono">{(springCompression * 10).toFixed(1)} cm</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold">الكتلة: {mass.toFixed(1)} kg</label>
            </div>
            <Slider
              value={[mass]}
              onValueChange={(v) => !isRunning && setMass(v[0])}
              min={0.5}
              max={5}
              step={0.5}
              disabled={isRunning}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold">السرعة: {velocity.toFixed(1)} m/s</label>
            </div>
            <Slider
              value={[velocity]}
              onValueChange={(v) => !isRunning && setVelocity(v[0])}
              min={1}
              max={15}
              step={0.5}
              disabled={isRunning}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              disabled={position >= 480}
              className="flex-1 gap-2"
            >
              {isRunning ? <Pause size={20} weight="fill" /> : <Play size={20} weight="fill" />}
              {isRunning ? 'إيقاف' : 'تشغيل'}
            </Button>
            <Button onClick={reset} variant="outline" className="gap-2">
              <ArrowCounterClockwise size={20} />
              إعادة ضبط
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-primary/5">
        <h3 className="text-lg font-bold mb-2">الشرح العلمي</h3>
        <div className="space-y-2 text-sm">
          <p><strong>الطاقة الحركية:</strong> KE = ½mv²</p>
          <p><strong>الملاحظة:</strong> عند اصطدام الجسم بالزنبرك، تتحول الطاقة الحركية إلى طاقة وضع مرونية</p>
          <p><strong>المتغير المستقل:</strong> الكتلة والسرعة</p>
          <p><strong>المتغير التابع:</strong> الطاقة الحركية وانضغاط الزنبرك</p>
        </div>
      </Card>
    </div>
  )
}
