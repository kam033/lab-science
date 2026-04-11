import { useState, useEffect } from 'react'
import { Play, Pause, ArrowCounterClockwise, Plus, Minus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function TitrationCurveSim() {
  const [isRunning, setIsRunning] = useState(false)
  const [volumeAdded, setVolumeAdded] = useState(0)
  const [baseConcentration, setBaseConcentration] = useState(0.1)
  const [dataPoints, setDataPoints] = useState<{volume: number, pH: number}[]>([])
  
  const calculatePH = (volume: number) => {
    const Ka = 1.8e-5
    const Ca = 0.1
    const Cb = baseConcentration
    const Va = 25
    const Vb = volume
    
    if (volume === 0) return -Math.log10(Math.sqrt(Ka * Ca))
    
    const equivalencePoint = (Ca * Va) / Cb
    
    if (volume < equivalencePoint) {
      const nAcid = Ca * Va - Cb * Vb
      const nSalt = Cb * Vb
      const totalVolume = Va + Vb
      return -Math.log10(Ka) + Math.log10(nSalt / nAcid)
    } else if (volume === equivalencePoint) {
      const Csalt = (Cb * Vb) / (Va + Vb)
      return 7 + 0.5 * Math.log10(Csalt / Ka)
    } else {
      const excessBase = (Cb * Vb - Ca * Va) / (Va + Vb)
      return 14 + Math.log10(excessBase)
    }
  }

  const addDrop = () => {
    if (volumeAdded < 50) {
      const newVolume = volumeAdded + 0.5
      setVolumeAdded(newVolume)
      const pH = calculatePH(newVolume)
      setDataPoints(prev => [...prev, { volume: newVolume, pH }])
    }
  }

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(addDrop, 200)
      return () => clearInterval(interval)
    }
  }, [isRunning, volumeAdded])

  const reset = () => {
    setIsRunning(false)
    setVolumeAdded(0)
    setDataPoints([])
  }

  const currentPH = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].pH : 3.0
  const equivalencePoint = (0.1 * 25) / baseConcentration

  const getColorFromPH = (pH: number) => {
    if (pH < 3) return 'oklch(0.60 0.20 10)'
    if (pH < 5) return 'oklch(0.70 0.15 40)'
    if (pH < 7) return 'oklch(0.75 0.10 60)'
    if (pH < 9) return 'oklch(0.75 0.05 180)'
    if (pH < 11) return 'oklch(0.70 0.15 240)'
    return 'oklch(0.60 0.20 280)'
  }

  const maxPH = Math.max(...dataPoints.map(p => p.pH), 14)
  const minPH = Math.min(...dataPoints.map(p => p.pH), 0)

  return (
    <div className="w-full space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-bold font-cairo">منحنى المعايرة</h3>
          
          <div className="relative h-80 bg-muted rounded-lg p-4">
            <svg className="w-full h-full" viewBox="0 0 400 300">
              <defs>
                <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="oklch(0.60 0.20 280)" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="oklch(0.60 0.20 10)" stopOpacity="0.3"/>
                </linearGradient>
              </defs>
              
              <line x1="40" y1="260" x2="40" y2="20" stroke="oklch(0.40 0 0)" strokeWidth="2"/>
              <line x1="40" y1="260" x2="380" y2="260" stroke="oklch(0.40 0 0)" strokeWidth="2"/>
              
              {[0, 2, 4, 6, 8, 10, 12, 14].map(pH => {
                const y = 260 - ((pH / 14) * 240)
                return (
                  <g key={pH}>
                    <line x1="35" y1={y} x2="40" y2={y} stroke="oklch(0.40 0 0)" strokeWidth="1"/>
                    <text x="25" y={y + 4} fontSize="10" fill="oklch(0.40 0 0)" textAnchor="end">{pH}</text>
                  </g>
                )
              })}
              
              {[0, 10, 20, 30, 40, 50].map(vol => {
                const x = 40 + ((vol / 50) * 340)
                return (
                  <g key={vol}>
                    <line x1={x} y1="260" x2={x} y2="265" stroke="oklch(0.40 0 0)" strokeWidth="1"/>
                    <text x={x} y="280" fontSize="10" fill="oklch(0.40 0 0)" textAnchor="middle">{vol}</text>
                  </g>
                )
              })}
              
              <text x="210" y="295" fontSize="12" fill="oklch(0.40 0 0)" textAnchor="middle" fontWeight="bold">
                حجم القاعدة المضافة (mL)
              </text>
              <text x="15" y="140" fontSize="12" fill="oklch(0.40 0 0)" textAnchor="middle" fontWeight="bold" transform="rotate(-90 15 140)">
                pH
              </text>
              
              <path
                d={dataPoints.length > 0 ? dataPoints.map((point, i) => {
                  const x = 40 + ((point.volume / 50) * 340)
                  const y = 260 - ((point.pH / 14) * 240)
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                }).join(' ') : ''}
                fill="none"
                stroke="oklch(0.55 0.20 265)"
                strokeWidth="3"
              />
              
              {dataPoints.map((point, i) => {
                const x = 40 + ((point.volume / 50) * 340)
                const y = 260 - ((point.pH / 14) * 240)
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="oklch(0.65 0.22 50)"
                  />
                )
              })}
              
              {equivalencePoint <= 50 && (
                <line
                  x1={40 + ((equivalencePoint / 50) * 340)}
                  y1="20"
                  x2={40 + ((equivalencePoint / 50) * 340)}
                  y2="260"
                  stroke="oklch(0.65 0.22 50)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              )}
            </svg>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="font-cairo">
              نقطة التكافؤ: {equivalencePoint.toFixed(1)} mL
            </Badge>
            <Badge variant="outline" className="font-cairo">
              pH عند التكافؤ: ~8.7
            </Badge>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-bold font-cairo">جهاز المعايرة</h3>
          
          <div className="relative h-80 flex items-center justify-center bg-gradient-to-b from-muted/30 to-muted rounded-lg">
            <div className="relative">
              <div className="w-32 h-48 border-4 border-foreground/20 rounded-b-full relative overflow-hidden">
                <div
                  className="absolute bottom-0 w-full transition-all duration-300"
                  style={{
                    height: `${(volumeAdded / 50) * 100}%`,
                    background: 'linear-gradient(to top, oklch(0.60 0.15 280), oklch(0.70 0.10 260))'
                  }}
                />
                
                {[10, 20, 30, 40, 50].map(mark => (
                  <div
                    key={mark}
                    className="absolute right-0 left-0 flex items-center justify-between px-2"
                    style={{ bottom: `${(mark / 50) * 100}%` }}
                  >
                    <div className="h-px w-3 bg-foreground/40" />
                    <span className="text-xs text-foreground/60">{mark}</span>
                  </div>
                ))}
              </div>
              
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-foreground/20 overflow-hidden">
                    <div
                      className="w-full h-full transition-colors duration-500"
                      style={{ backgroundColor: getColorFromPH(currentPH) }}
                    />
                  </div>
                  
                  {isRunning && volumeAdded < 50 && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="w-1 h-8 bg-primary/60 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 pt-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-cairo">pH الحالي:</span>
              <Badge 
                className="text-lg px-4 font-mono"
                style={{ 
                  backgroundColor: getColorFromPH(currentPH),
                  color: currentPH > 4 && currentPH < 10 ? 'oklch(0.20 0 0)' : 'white'
                }}
              >
                {currentPH.toFixed(2)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-cairo">الحجم المضاف:</span>
              <Badge variant="outline" className="font-mono">
                {volumeAdded.toFixed(1)} mL
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-bold font-cairo">لوحة التحكم</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-cairo">تركيز القاعدة (M)</label>
              <span className="text-sm font-mono">{baseConcentration.toFixed(2)} M</span>
            </div>
            <Slider
              value={[baseConcentration]}
              onValueChange={(val) => {
                setBaseConcentration(val[0])
                reset()
              }}
              min={0.05}
              max={0.5}
              step={0.05}
              disabled={isRunning}
              className="w-full"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              disabled={volumeAdded >= 50}
              className="gap-2 font-cairo"
            >
              {isRunning ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
              {isRunning ? 'إيقاف' : 'تشغيل'}
            </Button>
            
            <Button
              onClick={addDrop}
              disabled={isRunning || volumeAdded >= 50}
              variant="outline"
              className="gap-2 font-cairo"
            >
              <Plus size={18} />
              إضافة قطرة
            </Button>
            
            <Button
              onClick={reset}
              variant="outline"
              className="gap-2 font-cairo"
            >
              <ArrowCounterClockwise size={18} />
              إعادة ضبط
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-3 bg-accent/20">
        <h3 className="text-lg font-bold font-cairo">الملاحظات العلمية</h3>
        <div className="space-y-2 text-sm font-noto">
          <p>• منحنى المعايرة يوضح التغير في pH مع إضافة القاعدة</p>
          <p>• نقطة التكافؤ هي النقطة التي يكون فيها عدد مولات الحمض = عدد مولات القاعدة</p>
          <p>• في معايرة حمض ضعيف مع قاعدة قوية، pH عند نقطة التكافؤ {'>'} 7</p>
          <p>• المنطقة شبه المستوية في المنحنى تسمى منطقة المحلول المنظم (Buffer)</p>
          <p>• الارتفاع الحاد في المنحنى يحدث عند نقطة التكافؤ</p>
        </div>
      </Card>
    </div>
  )
}
