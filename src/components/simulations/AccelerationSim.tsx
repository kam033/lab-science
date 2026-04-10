import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { Play, Pause, ArrowCounterClockwise } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function AccelerationSim() {
  const [isRunning, setIsRunning] = useState(false)
  const [angle, setAngle] = useState(30)
  const [position, setPosition] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const [time, setTime] = useState(0)
  const [data, setData] = useState<{ t: number; s: number; v: number }[]>([])
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  const g = 9.8
  const acceleration = g * Math.sin((angle * Math.PI) / 180)

  useEffect(() => {
    if (isRunning && position < 500) {
      const animate = (currentTime: number) => {
        if (lastTimeRef.current === 0) {
          lastTimeRef.current = currentTime
        }
        
        const deltaTime = (currentTime - lastTimeRef.current) / 1000
        lastTimeRef.current = currentTime

        setTime((t) => {
          const newTime = t + deltaTime
          return newTime
        })
        
        setVelocity((v) => {
          const newVelocity = v + acceleration * deltaTime * 50
          return newVelocity
        })
        
        setPosition((p) => {
          const currentVel = velocity + acceleration * deltaTime * 50
          const newPosition = Math.min(p + currentVel * deltaTime, 500)
          return newPosition
        })
        
        if (time % 0.5 < deltaTime && time > 0) {
          setData((d) => [
            ...d,
            { t: time, s: position, v: velocity / 50 }
          ])
        }

        if (position < 500) {
          animationRef.current = requestAnimationFrame(animate)
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      lastTimeRef.current = 0
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning, position, acceleration])

  const reset = () => {
    setIsRunning(false)
    setPosition(0)
    setVelocity(0)
    setTime(0)
    setData([])
    lastTimeRef.current = 0
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="relative h-[400px] bg-white/80 rounded-lg border-2 border-primary/20 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="gray" strokeWidth="0.5" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            <line
              x1="50"
              y1="350"
              x2={50 + 500 * Math.cos((angle * Math.PI) / 180)}
              y2={350 - 500 * Math.sin((angle * Math.PI) / 180)}
              stroke="oklch(0.45 0.15 265)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            
            <g transform={`translate(${50 + position * Math.cos((angle * Math.PI) / 180)}, ${350 - position * Math.sin((angle * Math.PI) / 180)})`}>
              <motion.rect
                x="-20"
                y="-15"
                width="40"
                height="30"
                fill="oklch(0.65 0.22 50)"
                stroke="oklch(0.45 0.15 265)"
                strokeWidth="2"
                rx="4"
                animate={{
                  scale: isRunning ? [1, 1.05, 1] : 1
                }}
                transition={{
                  duration: 0.5,
                  repeat: isRunning ? Infinity : 0
                }}
              />
              <circle cx="0" cy="0" r="3" fill="white" />
            </g>
            
            <text x="60" y="370" fontSize="14" fill="oklch(0.45 0.15 265)" fontWeight="600">
              {angle.toFixed(0)}°
            </text>
          </svg>
          
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-lg p-4 shadow-lg border">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">الزمن:</span>
                <span className="font-bold font-mono">{time.toFixed(2)} s</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">الإزاحة:</span>
                <span className="font-bold font-mono">{(position / 10).toFixed(2)} m</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">السرعة:</span>
                <span className="font-bold font-mono">{(velocity / 50).toFixed(2)} m/s</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">التسارع:</span>
                <span className="font-bold font-mono">{acceleration.toFixed(2)} m/s²</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold">زاوية الميل: {angle}°</label>
            </div>
            <Slider
              value={[angle]}
              onValueChange={(v) => !isRunning && setAngle(v[0])}
              min={10}
              max={80}
              step={5}
              disabled={isRunning}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              disabled={position >= 500}
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

      {data.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">البيانات المسجلة</h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="font-bold text-center p-2 bg-primary/10 rounded">الزمن (s)</div>
            <div className="font-bold text-center p-2 bg-primary/10 rounded">الإزاحة (m)</div>
            <div className="font-bold text-center p-2 bg-primary/10 rounded">السرعة (m/s)</div>
            {data.slice(-8).map((d, i) => (
              <>
                <div key={`t-${i}`} className="text-center p-2 border-b font-mono">{d.t.toFixed(2)}</div>
                <div key={`s-${i}`} className="text-center p-2 border-b font-mono">{(d.s / 10).toFixed(2)}</div>
                <div key={`v-${i}`} className="text-center p-2 border-b font-mono">{d.v.toFixed(2)}</div>
              </>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 bg-primary/5">
        <h3 className="text-lg font-bold mb-2">الشرح العلمي</h3>
        <div className="space-y-2 text-sm">
          <p><strong>التسارع:</strong> يتسارع الجسم على المستوى المائل بتسارع يساوي a = g sin(θ)</p>
          <p><strong>المتغير المستقل:</strong> زاوية ميل المستوى</p>
          <p><strong>المتغير التابع:</strong> التسارع والسرعة والإزاحة</p>
          <p><strong>المتغيرات الثابتة:</strong> كتلة الجسم، عجلة الجاذبية، سطح المستوى</p>
        </div>
      </Card>
    </div>
  )
}
