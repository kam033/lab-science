import { useState, useRef, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Drop, Play, Pause, ArrowClockwise } from '@phosphor-icons/react'

// ─── Tab types ────────────────────────────────────────────────────────────────
type Tab = 'kidney' | 'osmosis' | 'adh'

// ─── Kidney Diagram SVG ────────────────────────────────────────────────────────

function KidneySVG({ highlighted, onSelect }: { highlighted: string | null, onSelect: (p: string) => void }) {
  const parts: { id: string; nameAr: string; color: string }[] = [
    { id: 'cortex',   nameAr: 'القشرة',     color: '#dc2626' },
    { id: 'medulla',  nameAr: 'اللب',        color: '#b45309' },
    { id: 'pelvis',   nameAr: 'الحوض الكلوي', color: '#f97316' },
    { id: 'ureter',   nameAr: 'الحالب',      color: '#eab308' },
    { id: 'nephron',  nameAr: 'النفرون',     color: '#16a34a' },
    { id: 'vessels',  nameAr: 'الأوعية الدموية', color: '#2563eb' },
  ]

  const opa = (id: string) => (!highlighted || highlighted === id) ? 1 : 0.3

  return (
    <svg viewBox="0 0 320 300" className="w-full max-w-xs mx-auto cursor-pointer">
      <rect width="320" height="300" rx="12" fill="#0f172a" />

      {/* Outer shape – kidney bean */}
      <path d="M160,20 C230,15 290,60 290,140 C290,220 240,285 160,285 C100,285 40,240 40,160 C40,90 80,30 140,22 C150,20 155,20 160,20 Z"
        fill="#1e293b" stroke="#374151" strokeWidth="2" />

      {/* Cortex – outer ring */}
      <path d="M160,35 C225,30 275,72 275,140 C275,210 228,270 160,270 C105,270 55,232 55,160 C55,97 90,42 145,36 Z"
        fill={`${parts[0].color}33`} stroke={parts[0].color} strokeWidth={highlighted === 'cortex' ? 3 : 1.5}
        opacity={opa('cortex')} onClick={() => onSelect('cortex')} />

      {/* Medulla – middle */}
      <path d="M160,70 C205,65 250,100 250,150 C250,200 215,245 160,245 C115,245 75,210 75,160 C75,112 108,72 150,68 Z"
        fill={`${parts[1].color}55`} stroke={parts[1].color} strokeWidth={highlighted === 'medulla' ? 3 : 1.5}
        opacity={opa('medulla')} onClick={() => onSelect('medulla')} />

      {/* Renal pelvis */}
      <ellipse cx="158" cy="165" rx="55" ry="55"
        fill={`${parts[2].color}44`} stroke={parts[2].color} strokeWidth={highlighted === 'pelvis' ? 3 : 1.5}
        opacity={opa('pelvis')} onClick={() => onSelect('pelvis')} />

      {/* Ureter */}
      <path d="M170,218 Q175,252 172,285"
        fill="none" stroke={parts[3].color} strokeWidth={highlighted === 'ureter' ? 5 : 3}
        strokeLinecap="round" opacity={opa('ureter')} onClick={() => onSelect('ureter')} />

      {/* Renal artery/vein */}
      <line x1="40" y1="148" x2="105" y2="150"
        stroke={parts[5].color} strokeWidth={highlighted === 'vessels' ? 5 : 3}
        strokeLinecap="round" opacity={opa('vessels')} onClick={() => onSelect('vessels')} />
      <line x1="40" y1="165" x2="105" y2="165"
        stroke="#be123c" strokeWidth={highlighted === 'vessels' ? 4 : 2}
        strokeLinecap="round" opacity={opa('vessels')} onClick={() => onSelect('vessels')} />

      {/* Nephron schematic */}
      <path d="M200,90 Q230,80 240,110 Q245,130 235,145 Q220,160 230,175 Q240,190 220,200"
        fill="none" stroke={parts[4].color} strokeWidth={highlighted === 'nephron' ? 4 : 2}
        strokeLinecap="round" opacity={opa('nephron')} onClick={() => onSelect('nephron')} />

      {/* Labels */}
      {[
        { id: 'cortex',  x: 250, y: 100, label: 'قشرة' },
        { id: 'medulla', x: 235, y: 145, label: 'لب' },
        { id: 'pelvis',  x: 158, y: 168, label: 'حوض' },
        { id: 'ureter',  x: 185, y: 270, label: 'حالب' },
        { id: 'vessels', x: 42,  y: 143, label: 'شريان' },
        { id: 'nephron', x: 238, y: 90,  label: 'نفرون' },
      ].map(({ id, x, y, label }) => (
        <text key={id} x={x} y={y} fontSize="8.5" fill="#e2e8f0" fontFamily="Cairo,sans-serif"
          textAnchor="middle" opacity={opa(id)}>
          {label}
        </text>
      ))}
    </svg>
  )
}

// ─── Osmosis animation canvas ─────────────────────────────────────────────────

const CW = 420
const CH = 220

function OsmosisCellCanvas({ soluteConc, isRunning }: { soluteConc: number; isRunning: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef(0)
  const tRef = useRef(0)
  const runningR = useRef(isRunning)
  runningR.current = isRunning

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    // Cell width grows/shrinks based on solute conc compared to isotonic (150)
    const isotonicConc = 150
    const diff = soluteConc - isotonicConc  // positive → hypertonic (cell shrinks)
    const cellW = Math.max(40, Math.min(180, 120 - diff * 0.4))

    const draw = () => {
      ctx.clearRect(0, 0, CW, CH)
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, CW, CH)

      const t = tRef.current

      // ── Left side: extracellular ──
      ctx.fillStyle = '#1e3a5f'
      ctx.fillRect(0, 0, CW / 2, CH)

      // ── Right side: intracellular ──
      ctx.fillStyle = '#1a3322'
      ctx.fillRect(CW / 2, 0, CW / 2, CH)

      // ── Membrane ──
      ctx.fillStyle = '#f59e0b'
      ctx.fillRect(CW / 2 - 3, 0, 6, CH)

      // ── Solute particles outside ──
      const outsideCount = Math.min(30, Math.round(soluteConc / 15))
      for (let i = 0; i < outsideCount; i++) {
        const seed = i * 7.4
        const px = 15 + ((seed * 37 + t * 0.3) % (CW / 2 - 30))
        const py = 20 + ((seed * 13 + t * 0.2) % (CH - 40))
        ctx.beginPath()
        ctx.arc(px, py, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#60a5fa88'
        ctx.fill()
      }

      // ── Solute particles inside ──
      const insideConc = 150  // isotonic inside
      const insideCount = Math.min(20, Math.round(insideConc / 15))
      for (let i = 0; i < insideCount; i++) {
        const seed = i * 9.1 + 100
        const px = CW / 2 + 15 + ((seed * 41 + t * 0.25) % (CW / 2 - 30))
        const py = 20 + ((seed * 17 + t * 0.18) % (CH - 40))
        ctx.beginPath()
        ctx.arc(px, py, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#4ade8088'
        ctx.fill()
      }

      // ── Water arrows (osmosis direction) ──
      const arrowCount = 4
      for (let i = 0; i < arrowCount; i++) {
        const phase = (t * 0.04 + i / arrowCount) % 1
        const py = 30 + (i * (CH - 60)) / (arrowCount - 1)
        const arrowLen = 30
        let ax: number, dir: number
        if (diff > 10) {
          // Hypertonic outside → water leaves cell → arrows go right to left
          ax = CW / 2 + phase * arrowLen
          dir = -1
          ctx.strokeStyle = '#38bdf8'
        } else if (diff < -10) {
          // Hypotonic outside → water enters cell → arrows left to right
          ax = CW / 2 - arrowLen + phase * arrowLen
          dir = 1
          ctx.strokeStyle = '#38bdf8'
        } else {
          // Isotonic
          ax = CW / 2 - 5
          dir = 0
          ctx.strokeStyle = '#64748b'
        }
        if (dir !== 0) {
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(ax, py)
          ctx.lineTo(ax + dir * 12, py)
          ctx.stroke()
          // arrowhead
          ctx.beginPath()
          ctx.moveTo(ax + dir * 12, py)
          ctx.lineTo(ax + dir * 6, py - 4)
          ctx.moveTo(ax + dir * 12, py)
          ctx.lineTo(ax + dir * 6, py + 4)
          ctx.stroke()
        }
      }

      // ── Cell schematic on right ──
      const cellX = CW * 0.75
      const cellY = CH / 2
      ctx.beginPath()
      ctx.ellipse(cellX, cellY, cellW, 60, 0, 0, Math.PI * 2)
      ctx.strokeStyle = '#4ade80'
      ctx.lineWidth = 2.5
      ctx.stroke()
      ctx.fillStyle = '#0f2a1c88'
      ctx.fill()

      // Label state
      ctx.fillStyle = '#e2e8f0'
      ctx.font = 'bold 11px Cairo, sans-serif'
      ctx.textAlign = 'center'
      const state = diff > 10 ? 'مفرط التوتر — خلية تجفف' : diff < -10 ? 'ناقص التوتر — خلية تنتفخ' : 'متساوي التوتر ✓'
      ctx.fillText(state, cellX, cellY + 80)

      if (runningR.current) tRef.current += 1
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [soluteConc])

  return <canvas ref={canvasRef} width={CW} height={CH} className="w-full rounded-lg border border-slate-700" />
}

// ─── ADH diagram ──────────────────────────────────────────────────────────────

function ADHDiagram({ adhLevel }: { adhLevel: number }) {
  const collecting = Math.round(adhLevel * 80)  // % water reabsorbed
  const urineConc = Math.round(100 + adhLevel * 1100)  // mOsm/L
  const urineVolume = Math.round(2.5 - adhLevel * 2)    // L/day

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <Card className="bg-blue-950/30 border-blue-800/40">
          <CardContent className="p-3">
            <p className="text-xs text-blue-400 font-cairo">إعادة امتصاص الماء</p>
            <p className="text-2xl font-bold text-blue-300">{collecting}%</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-950/30 border-amber-800/40">
          <CardContent className="p-3">
            <p className="text-xs text-amber-400 font-cairo">تركيز البول</p>
            <p className="text-2xl font-bold text-amber-300">{urineConc}</p>
            <p className="text-xs text-amber-400">mOsm/L</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-950/30 border-purple-800/40">
          <CardContent className="p-3">
            <p className="text-xs text-purple-400 font-cairo">حجم البول</p>
            <p className="text-2xl font-bold text-purple-300">{urineVolume}</p>
            <p className="text-xs text-purple-400">L/يوم</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${adhLevel * 100}%` }}
            />
          </div>
          <Badge variant="secondary" className="text-xs font-mono whitespace-nowrap">
            ADH: {adhLevel < 0.3 ? 'منخفض' : adhLevel < 0.7 ? 'متوسط' : 'مرتفع'}
          </Badge>
        </div>
        <p className="text-xs text-slate-400 font-cairo mt-2 leading-relaxed">
          {adhLevel < 0.3
            ? 'ADH منخفض → قنوات الماء aquaporins تُغلق → بول مخفف كثير'
            : adhLevel < 0.7
            ? 'ADH متوسط → إعادة امتصاص جزئية → بول معتدل'
            : 'ADH مرتفع → فتح قنوات الماء بالكامل → بول مركّز قليل'}
        </p>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function KidneyOsmosisSim() {
  const [tab, setTab] = useState<Tab>('kidney')
  const [highlighted, setHighlighted] = useState<string | null>(null)
  const [soluteConc, setSoluteConc] = useState(150)
  const [adhLevel, setAdhLevel] = useState(0.5)
  const [isRunning, setIsRunning] = useState(true)

  const handleReset = () => {
    setTab('kidney')
    setHighlighted(null)
    setSoluteConc(150)
    setAdhLevel(0.5)
    setIsRunning(true)
  }

  const kidneyParts: Record<string, { fn: string; detail: string }> = {
    cortex:  { fn: 'القشرة الكلوية',   detail: 'تحتوي على كبسولات بومان والأنابيب الملتوية — تصفية أولية للدم' },
    medulla: { fn: 'النقي (اللب)',      detail: 'تحتوي على أنابيب هنلي والأنابيب الجامعة — تركيز البول' },
    pelvis:  { fn: 'الحوض الكلوي',     detail: 'يجمع البول من الأنابيب ويصبّه في الحالب' },
    ureter:  { fn: 'الحالب',           detail: 'ينقل البول من الكلية إلى المثانة' },
    nephron: { fn: 'النفرون',           detail: 'الوحدة الوظيفية للكلية — التصفية، إعادة الامتصاص، الإفراز' },
    vessels: { fn: 'الأوعية الدموية',   detail: 'الشريان الكلوي (أزرق) يُغذّي الكلية، الوريد (أحمر) يعود بالدم المنقّى' }
  }

  return (
    <div className="space-y-4 font-cairo" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Drop size={20} weight="fill" className="text-blue-400" />
          <h3 className="font-bold text-lg">الكلية والتنظيم الأسموزي</h3>
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

      {/* Tab nav */}
      <div className="flex gap-2 flex-wrap">
        {(['kidney', 'osmosis', 'adh'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg border text-sm font-cairo transition-all ${tab === t
              ? 'bg-blue-700 border-blue-600 text-white'
              : 'border-slate-600 hover:bg-slate-700 text-slate-300'}`}>
            {{ kidney: '🫘 تشريح الكلية', osmosis: '💧 الأسموزية', adh: '🧬 هرمون ADH' }[t]}
          </button>
        ))}
      </div>

      {/* ── Kidney anatomy ── */}
      {tab === 'kidney' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
            <p className="text-xs text-slate-400 mb-2">انقر على أجزاء الكلية</p>
            <KidneySVG highlighted={highlighted} onSelect={id => setHighlighted(highlighted === id ? null : id)} />
          </div>
          <div className="space-y-2">
            {highlighted && kidneyParts[highlighted] ? (
              <Card className="border-slate-700">
                <CardContent className="p-4 space-y-2">
                  <h4 className="font-bold font-cairo">{kidneyParts[highlighted].fn}</h4>
                  <p className="text-sm text-slate-300 font-cairo leading-relaxed">{kidneyParts[highlighted].detail}</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-700">
                <CardContent className="p-4 text-center text-muted-foreground text-sm font-cairo">
                  انقر على جزء من الكلية
                </CardContent>
              </Card>
            )}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-3 text-xs font-cairo space-y-1 text-slate-300">
                <p className="font-bold text-slate-200">وظائف الكلية:</p>
                <p>• تصفية ≈ 180 لتر دم/يوم</p>
                <p>• إنتاج 1-2 لتر بول/يوم</p>
                <p>• تنظيم الضغط الأسموزي</p>
                <p>• إفراز الفضلات النيتروجينية</p>
                <p>• تنظيم ضغط الدم (هرمون رينين)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── Osmosis ── */}
      {tab === 'osmosis' && (
        <div className="space-y-4">
          <OsmosisCellCanvas soluteConc={soluteConc} isRunning={isRunning} />
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-cairo">
                تركيز المحلول الخارجي: <span className="text-blue-400">{soluteConc} mOsm/L</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <Slider min={50} max={350} step={10}
                value={[soluteConc]} onValueChange={([v]) => setSoluteConc(v)} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>50 — ناقص التوتر</span>
                <span className="text-green-400">150 — متساوي</span>
                <span>350 — مفرط التوتر</span>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-3 gap-2 text-xs text-center font-cairo">
            {[
              { label: 'ناقص التوتر', conc: '< 150', effect: 'الخلية تنتفخ وتنفجر', color: 'text-blue-400' },
              { label: 'متساوي التوتر', conc: '= 150', effect: 'الخلية طبيعية ✓', color: 'text-green-400' },
              { label: 'مفرط التوتر', conc: '> 150', effect: 'الخلية تجفف وتتقلص', color: 'text-red-400' }
            ].map(({ label, conc, effect, color }, i) => (
              <div key={i} className="bg-slate-900/50 rounded-lg p-2 border border-slate-700">
                <p className={`font-bold ${color}`}>{label}</p>
                <p className="text-slate-400">{conc} mOsm/L</p>
                <p className="text-slate-300 mt-1">{effect}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ADH ── */}
      {tab === 'adh' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-cairo">مستوى هرمون ADH (الهرمون المضاد للإدرار)</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <Slider min={0} max={1} step={0.05}
                value={[adhLevel]} onValueChange={([v]) => setAdhLevel(v)} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>منخفض</span>
                <span>مرتفع</span>
              </div>
            </CardContent>
          </Card>
          <ADHDiagram adhLevel={adhLevel} />
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-4 text-xs font-cairo space-y-2 text-slate-300">
              <p className="font-bold text-slate-200">دورة التغذية الراجعة السلبية:</p>
              <div className="flex items-center gap-2 flex-wrap">
                {['جفاف / زيادة تركيز الدم', '→', 'المستقبلات الأسموزية بالوطاء', '→', 'إفراز ADH', '→', 'إعادة امتصاص الماء', '→', 'انخفاض التركيز'].map((step, i) => (
                  <span key={i} className={step === '→' ? 'text-slate-500' : 'bg-slate-800 px-2 py-0.5 rounded'}>{step}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
