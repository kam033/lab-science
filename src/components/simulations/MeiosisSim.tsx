import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, ArrowClockwise, SkipForward } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

const phases = [
  { id: 0, name: 'خلية أم', nameEn: 'Parent Cell', description: 'خلية ثنائية المجموعة الكروموسومية (2n = 4)' },
  { id: 1, name: 'الطور التمهيدي I', nameEn: 'Prophase I', description: 'تزاوج الكروموسومات المتماثلة وتكوين رباعيات' },
  { id: 2, name: 'الطور الاستوائي I', nameEn: 'Metaphase I', description: 'اصطفاف الرباعيات على خط الاستواء' },
  { id: 3, name: 'الطور الانفصالي I', nameEn: 'Anaphase I', description: 'انفصال الكروموسومات المتماثلة' },
  { id: 4, name: 'الطور النهائي I', nameEn: 'Telophase I', description: 'تكوين خليتين (n = 2)' },
  { id: 5, name: 'الطور التمهيدي II', nameEn: 'Prophase II', description: 'تكثف الكروموسومات في كل خلية' },
  { id: 6, name: 'الطور الاستوائي II', nameEn: 'Metaphase II', description: 'اصطفاف الكروموسومات على خط الاستواء' },
  { id: 7, name: 'الطور الانفصالي II', nameEn: 'Anaphase II', description: 'انفصال الكروماتيدات الشقيقة' },
  { id: 8, name: 'الطور النهائي II', nameEn: 'Telophase II', description: 'تكوين 4 خلايا أحادية (n)' }
]

export function MeiosisSim() {
  const [currentPhase, setCurrentPhase] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [mode, setMode] = useState<'learning' | 'experiment'>('learning')

  const nextPhase = () => {
    if (currentPhase < phases.length - 1) {
      setCurrentPhase(currentPhase + 1)
    } else {
      setCurrentPhase(0)
    }
  }

  const reset = () => {
    setCurrentPhase(0)
    setIsPlaying(false)
  }

  const renderChromosomes = () => {
    const phase = phases[currentPhase]
    
    switch (phase.id) {
      case 0:
        return (
          <g>
            <motion.line x1="180" y1="130" x2="180" y2="170" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
            <motion.line x1="200" y1="130" x2="200" y2="170" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
            <motion.line x1="220" y1="130" x2="220" y2="170" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
            <motion.line x1="240" y1="130" x2="240" y2="170" stroke="#8b5cf6" strokeWidth="8" strokeLinecap="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
            <circle cx="200" cy="150" r="80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
          </g>
        )
      
      case 1:
        return (
          <g>
            <motion.g animate={{ x: [0, -5, 0], y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <line x1="175" y1="120" x2="175" y2="160" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
              <line x1="185" y1="120" x2="185" y2="160" stroke="#3b82f6" strokeWidth="7" strokeLinecap="round" />
            </motion.g>
            <motion.g animate={{ x: [0, 5, 0], y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}>
              <line x1="215" y1="140" x2="215" y2="180" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round" />
              <line x1="225" y1="140" x2="225" y2="180" stroke="#8b5cf6" strokeWidth="7" strokeLinecap="round" />
            </motion.g>
            <circle cx="200" cy="150" r="80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
          </g>
        )
      
      case 2:
        return (
          <g>
            <line x1="180" y1="130" x2="180" y2="170" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
            <line x1="190" y1="130" x2="190" y2="170" stroke="#3b82f6" strokeWidth="7" strokeLinecap="round" />
            <line x1="210" y1="130" x2="210" y2="170" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round" />
            <line x1="220" y1="130" x2="220" y2="170" stroke="#8b5cf6" strokeWidth="7" strokeLinecap="round" />
            <line x1="120" y1="150" x2="280" y2="150" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
            <circle cx="200" cy="150" r="80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
          </g>
        )
      
      case 3:
        return (
          <g>
            <motion.line x1="160" y1="100" x2="160" y2="140" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" animate={{ x1: 160, x2: 160 }} />
            <motion.line x1="170" y1="100" x2="170" y2="140" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round" animate={{ x1: 170, x2: 170 }} />
            <motion.line x1="230" y1="160" x2="230" y2="200" stroke="#3b82f6" strokeWidth="7" strokeLinecap="round" animate={{ x1: 230, x2: 230 }} />
            <motion.line x1="240" y1="160" x2="240" y2="200" stroke="#8b5cf6" strokeWidth="7" strokeLinecap="round" animate={{ x1: 240, x2: 240 }} />
            <circle cx="200" cy="150" r="80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
          </g>
        )
      
      case 4:
        return (
          <g>
            <circle cx="150" cy="110" r="50" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="135" y1="100" x2="135" y2="120" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
            <line x1="165" y1="100" x2="165" y2="120" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
            
            <circle cx="250" cy="190" r="50" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="235" y1="180" x2="235" y2="200" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
            <line x1="265" y1="180" x2="265" y2="200" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round" />
          </g>
        )
      
      case 5:
      case 6:
        return (
          <g>
            <circle cx="120" cy="80" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="110" y1="75" x2="110" y2="85" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
            <line x1="130" y1="75" x2="130" y2="85" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
            
            <circle cx="280" cy="80" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="270" y1="75" x2="270" y2="85" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
            <line x1="290" y1="75" x2="290" y2="85" stroke="#8b5cf6" strokeWidth="5" strokeLinecap="round" />
            
            <circle cx="120" cy="220" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="110" y1="215" x2="110" y2="225" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
            <line x1="130" y1="215" x2="130" y2="225" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
            
            <circle cx="280" cy="220" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="270" y1="215" x2="270" y2="225" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
            <line x1="290" y1="215" x2="290" y2="225" stroke="#8b5cf6" strokeWidth="5" strokeLinecap="round" />
          </g>
        )
      
      case 7:
        return (
          <g>
            <circle cx="120" cy="80" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="105" y1="75" x2="105" y2="85" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
            <line x1="135" y1="75" x2="135" y2="85" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
            
            <circle cx="280" cy="80" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="265" y1="75" x2="265" y2="85" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
            <line x1="295" y1="75" x2="295" y2="85" stroke="#8b5cf6" strokeWidth="5" strokeLinecap="round" />
            
            <circle cx="120" cy="220" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="105" y1="215" x2="105" y2="225" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
            <line x1="135" y1="215" x2="135" y2="225" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
            
            <circle cx="280" cy="220" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="265" y1="215" x2="265" y2="225" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
            <line x1="295" y1="215" x2="295" y2="225" stroke="#8b5cf6" strokeWidth="5" strokeLinecap="round" />
          </g>
        )
      
      case 8:
        return (
          <g>
            <circle cx="100" cy="70" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="95" y1="70" x2="95" y2="70" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
            
            <circle cx="300" cy="70" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="295" y1="70" x2="295" y2="70" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
            
            <circle cx="100" cy="230" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="95" y1="230" x2="95" y2="230" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            
            <circle cx="300" cy="230" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="295" y1="230" x2="295" y2="230" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" />
          </g>
        )
      
      default:
        return null
    }
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
          وضع الملاحظة
        </Button>
      </div>

      {mode === 'learning' && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg font-cairo">شرح الانقسام الاختزالي</CardTitle>
          </CardHeader>
          <CardContent className="font-noto space-y-2 text-sm">
            <p>• الانقسام الاختزالي ينتج 4 خلايا أحادية من خلية ثنائية واحدة</p>
            <p>• يحدث على مرحلتين: الانقسام الأول (I) والانقسام الثاني (II)</p>
            <p>• الكروموسومات المتماثلة تتزاوج في الطور التمهيدي I</p>
            <p>• ينتج عنه تنوع وراثي في الخلايا الجنسية (الأمشاج)</p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-cairo text-lg">لوحة التحكم</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-cairo font-medium">الطور الحالي:</span>
                <Badge variant="default" className="font-cairo">
                  {currentPhase + 1} / {phases.length}
                </Badge>
              </div>
              
              <div className="p-4 bg-primary/10 rounded-lg">
                <h4 className="font-cairo font-bold text-lg mb-1">
                  {phases[currentPhase].name}
                </h4>
                <p className="text-sm font-noto text-muted-foreground">
                  {phases[currentPhase].description}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={nextPhase}
                className="flex-1 font-cairo gap-2"
              >
                <SkipForward size={18} weight="fill" />
                الطور التالي
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                className="font-cairo gap-2"
              >
                <ArrowClockwise size={18} />
                إعادة
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-cairo font-semibold text-sm">رموز الكروموسومات:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-cairo">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 rounded" style={{ backgroundColor: '#ef4444' }} />
                  <span>كروموسوم 1 (أبوي)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 rounded" style={{ backgroundColor: '#3b82f6' }} />
                  <span>كروموسوم 1 (أمومي)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 rounded" style={{ backgroundColor: '#f59e0b' }} />
                  <span>كروموسوم 2 (أبوي)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 rounded" style={{ backgroundColor: '#8b5cf6' }} />
                  <span>كروموسوم 2 (أمومي)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-cairo text-lg">منطقة المحاكاة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full aspect-[4/3] border-2 border-border rounded-lg overflow-hidden bg-background">
              <svg width="100%" height="100%" viewBox="0 0 400 300">
                {renderChromosomes()}
                
                <text
                  x="200"
                  y="285"
                  textAnchor="middle"
                  className="font-cairo text-xs font-bold"
                  fill="currentColor"
                >
                  {phases[currentPhase].nameEn}
                </text>
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-cairo text-lg">مراحل الانقسام الاختزالي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {phases.map((phase, idx) => (
              <button
                key={phase.id}
                onClick={() => setCurrentPhase(idx)}
                className={`p-2 md:p-3 rounded-lg border-2 transition-all text-right ${
                  currentPhase === idx
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-cairo font-bold text-xs md:text-sm">{phase.name}</div>
                <div className="font-noto text-[10px] md:text-xs text-muted-foreground mt-1">
                  {phase.description}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-cairo text-lg">الملاحظات العلمية</CardTitle>
        </CardHeader>
        <CardContent className="font-noto space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <p>خلية البداية: ثنائية المجموعة الكروموسومية (2n = 4)</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <p>بعد الانقسام الأول: خليتان (n = 2 لكل منهما)</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <p>بعد الانقسام الثاني: 4 خلايا (n = 1 لكل منهما)</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <p className="font-bold text-primary">النتيجة النهائية: 4 خلايا جنسية أحادية مختلفة وراثياً</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
