import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Atom, Play, Pause, ArrowClockwise } from '@phosphor-icons/react'

// ─── Benzene ring SVG ─────────────────────────────────────────────────────────

function BenzeneRingSVG({ resonance }: { resonance: 1 | 2 | 'circle' }) {
  const cx = 200
  const cy = 150
  const R = 80   // ring radius
  const r = 46   // inner circle radius

  // 6 carbon positions
  const angles = Array.from({ length: 6 }, (_, i) => (i * 60 - 90) * (Math.PI / 180))
  const vertices = angles.map(a => ({ x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }))

  // Double bond edges for resonance structure 1: edges 0-1, 2-3, 4-5
  const doubleBonds1 = [0, 2, 4]  // between vertex i and i+1
  // Double bond edges for resonance structure 2: edges 1-2, 3-4, 5-0
  const doubleBonds2 = [1, 3, 5]

  const activeBonds = resonance === 1 ? doubleBonds1 : resonance === 2 ? doubleBonds2 : []

  return (
    <svg viewBox="0 0 400 300" className="w-full max-w-sm mx-auto">
      {/* Background */}
      <rect width="400" height="300" rx="12" fill="#0f172a" />

      {/* Ring bonds */}
      {vertices.map((v, i) => {
        const next = vertices[(i + 1) % 6]
        const isDouble = activeBonds.includes(i)
        // Offset for double bond parallel line
        const dx = next.x - v.x
        const dy = next.y - v.y
        const len = Math.sqrt(dx * dx + dy * dy)
        const nx = -dy / len * 5
        const ny = dx / len * 5
        return (
          <g key={i}>
            <line
              x1={v.x} y1={v.y} x2={next.x} y2={next.y}
              stroke="#60a5fa" strokeWidth="3" strokeLinecap="round"
            />
            {isDouble && (
              <line
                x1={v.x + nx} y1={v.y + ny}
                x2={next.x + nx} y2={next.y + ny}
                stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round"
              />
            )}
          </g>
        )
      })}

      {/* Delocalised circle (Kekulé vs circle representation) */}
      {resonance === 'circle' && (
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke="#a78bfa" strokeWidth="3"
          strokeDasharray="8 4"
        />
      )}

      {/* Carbon atoms & labels */}
      {vertices.map((v, i) => (
        <g key={i}>
          <circle cx={v.x} cy={v.y} r={10} fill="#1e293b" stroke="#60a5fa" strokeWidth="2" />
          <text x={v.x} y={v.y + 4.5} textAnchor="middle" fontSize="11" fill="#93c5fd" fontFamily="monospace" fontWeight="bold">C</text>
        </g>
      ))}

      {/* H atoms */}
      {vertices.map((v, i) => {
        const angle = angles[i]
        const hx = cx + (R + 30) * Math.cos(angle)
        const hy = cy + (R + 30) * Math.sin(angle)
        return (
          <g key={i}>
            <line x1={v.x} y1={v.y} x2={hx} y2={hy} stroke="#475569" strokeWidth="2" />
            <text x={hx} y={hy + 4.5} textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="monospace">H</text>
          </g>
        )
      })}

      {/* Central label */}
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="13" fill="#e2e8f0" fontFamily="monospace" fontWeight="bold">
        {resonance === 'circle' ? 'C₆H₆' : resonance === 1 ? 'بنية I' : 'بنية II'}
      </text>
    </svg>
  )
}

// ─── Nitration SVG ────────────────────────────────────────────────────────────

function NitrationSVG({ step }: { step: number }) {
  return (
    <svg viewBox="0 0 440 120" className="w-full max-w-lg mx-auto">
      <rect width="440" height="120" rx="8" fill="#0f172a" />

      {/* Benzene */}
      <text x={60} y={52} textAnchor="middle" fontSize="28" fill="#60a5fa" fontFamily="monospace">⬡</text>
      <text x={60} y={72} textAnchor="middle" fontSize="10" fill="#93c5fd" fontFamily="monospace">C₆H₆</text>

      {/* Arrow */}
      {step >= 1 && (
        <g>
          <line x1={90} y1={55} x2={170} y2={55} stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <text x={130} y={45} textAnchor="middle" fontSize="9" fill="#fbbf24" fontFamily="monospace">HNO₃/H₂SO₄</text>
          <text x={130} y={70} textAnchor="middle" fontSize="9" fill="#fbbf24" fontFamily="monospace">55°C</text>
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" />
            </marker>
          </defs>
        </g>
      )}

      {/* Nitrobenzene */}
      {step >= 2 && (
        <g>
          <text x={230} y={52} textAnchor="middle" fontSize="28" fill="#a78bfa" fontFamily="monospace">⬡</text>
          <text x={262} y={45} textAnchor="middle" fontSize="10" fill="#fca5a5" fontFamily="monospace">NO₂</text>
          <text x={230} y={72} textAnchor="middle" fontSize="10" fill="#c4b5fd" fontFamily="monospace">C₆H₅NO₂</text>
        </g>
      )}

      {/* + H₂O */}
      {step >= 2 && (
        <g>
          <text x={320} y={58} textAnchor="middle" fontSize="12" fill="#94a3b8" fontFamily="monospace">+ H₂O</text>
        </g>
      )}

      {/* Electrophilic substitution label */}
      {step >= 3 && (
        <text x={220} y={100} textAnchor="middle" fontSize="9" fill="#34d399" fontFamily="monospace">
          إحلال إلكتروفيلي (SE)
        </text>
      )}
    </svg>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Tab = 'structure' | 'nitration' | 'comparison'

export function BenzeneSim() {
  const [tab, setTab] = useState<Tab>('structure')
  const [resonance, setResonance] = useState<1 | 2 | 'circle'>(1)
  const [nitrationStep, setNitrationStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-cycle: alternate resonance structures (structure tab) or step through nitration
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
      return
    }
    intervalRef.current = setInterval(() => {
      if (tab === 'structure') {
        setResonance(r => r === 1 ? 2 : r === 2 ? 'circle' : 1)
      } else if (tab === 'nitration') {
        setNitrationStep(s => (s + 1) % 4)
      } else {
        setIsRunning(false)
      }
    }, 1200)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, tab])

  const handleReset = () => {
    setIsRunning(false)
    setTab('structure')
    setResonance(1)
    setNitrationStep(0)
  }

  return (
    <div className="space-y-4 font-cairo" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Atom size={20} weight="fill" className="text-purple-400" />
          <h3 className="font-bold text-lg">البنزين وتفاعلاته</h3>
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
        {(['structure', 'nitration', 'comparison'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg border text-sm transition-all font-cairo ${tab === t
              ? 'bg-purple-600 border-purple-500 text-white'
              : 'border-slate-600 hover:bg-slate-700 text-slate-300'}`}
          >
            {{ structure: 'التركيب', nitration: 'نترتة البنزين', comparison: 'مقارنة' }[t]}
          </button>
        ))}
      </div>

      {/* ── Structure tab ── */}
      {tab === 'structure' && (
        <div className="space-y-4">
          <div className="flex gap-2 justify-center flex-wrap">
            {([1, 2, 'circle'] as const).map(r => (
              <button
                key={String(r)}
                onClick={() => setResonance(r)}
                className={`px-3 py-1 rounded border text-sm font-cairo transition-all ${resonance === r
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'border-slate-600 hover:bg-slate-700 text-slate-300'}`}
              >
                {r === 'circle' ? 'التمثيل الدائري' : `بنية رنين ${r}`}
              </button>
            ))}
          </div>

          <BenzeneRingSVG resonance={resonance} />

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-4 space-y-2">
              <p className="text-sm text-slate-300 font-cairo leading-relaxed">
                {resonance !== 'circle'
                  ? 'بنيتا الرنين للبنزين — الروابط المزدوجة متبادلة. في الواقع جميع الروابط متساوية الطول (1.40 Å) بسبب إلغاء تمركز الإلكترونات π.'
                  : 'التمثيل الدائري (بنية كيكولي المحسّنة): الدائرة المنقطة تمثّل الإلكترونات 6π غير المتمركزة فوق وتحت مستوى الحلقة.'}
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-800 rounded p-2">
                  <p className="text-slate-400">الصيغة</p>
                  <p className="font-mono text-blue-400 font-bold">C₆H₆</p>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <p className="text-slate-400">طول الرابطة C-C</p>
                  <p className="font-mono text-amber-400 font-bold">1.40 Å</p>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <p className="text-slate-400">شكل الجزيء</p>
                  <p className="font-mono text-green-400 font-bold">مسطح</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Nitration tab ── */}
      {tab === 'nitration' && (
        <div className="space-y-4">
          <Card className="bg-red-950/30 border-red-800/40">
            <CardContent className="p-3">
              <p className="text-xs text-red-400 font-cairo font-bold">⚠ تحذير — استقصاء نظري فقط</p>
              <p className="text-xs text-slate-400 font-cairo">البنزين مادة مسرطنة والأحماض المركزة خطرة جداً. لا يُنفَّذ عملياً في المدرسة.</p>
            </CardContent>
          </Card>

          <NitrationSVG step={nitrationStep} />

          <div className="flex gap-2 justify-center flex-wrap">
            {[
              { step: 0, label: 'البداية' },
              { step: 1, label: 'إضافة الكواشف' },
              { step: 2, label: 'الناتج' },
              { step: 3, label: 'نوع التفاعل' }
            ].map(({ step, label }) => (
              <button
                key={step}
                onClick={() => setNitrationStep(step)}
                className={`px-3 py-1 rounded border text-sm transition-all font-cairo ${nitrationStep >= step
                  ? 'bg-amber-700 border-amber-600 text-amber-100'
                  : 'border-slate-600 hover:bg-slate-700 text-slate-300'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-4 space-y-2 text-sm font-cairo">
              <p className="font-bold text-amber-400">خطوات التفاعل:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 text-xs">
                <li>تحضير مزيج النترتة: HNO₃ مركز + H₂SO₄ مركز</li>
                <li>إنتاج الإلكتروفيل: NO₂⁺ (أيون النيتروزونيوم)</li>
                <li>مهاجمة حلقة البنزين بواسطة NO₂⁺</li>
                <li>إزالة H⁺ لاستعادة الاستقرارية الرنينية</li>
                <li>الناتج: النيتروبنزين (C₆H₅NO₂) + ماء</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Comparison tab ── */}
      {tab === 'comparison' && (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-cairo border-collapse">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-right p-2 text-slate-400">الخاصية</th>
                  <th className="text-center p-2 text-blue-400">البنزين</th>
                  <th className="text-center p-2 text-green-400">الألكانات</th>
                  <th className="text-center p-2 text-amber-400">الألكينات</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-300">
                {[
                  ['التفاعل المميز', 'إحلال إلكتروفيلي', 'إحلال جذري', 'إضافة'],
                  ['الاحتراق', 'لهب مائل مدخّن', 'نظيف', 'مائل'],
                  ['مع Br₂/CCl₄', 'بدون تأثير (يحتاج حفاز)', 'بدون تأثير', 'يُبيّض'],
                  ['مع KMnO₄', 'بدون تأثير', 'بدون تأثير', 'يُبيّض'],
                  ['الاستقرارية', 'عالية جداً (رنين)', 'متوسطة', 'أقل استقراراً']
                ].map(([prop, benz, alk, alke], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-slate-900/30' : ''}>
                    <td className="p-2 font-bold">{prop}</td>
                    <td className="p-2 text-center">{benz}</td>
                    <td className="p-2 text-center">{alk}</td>
                    <td className="p-2 text-center">{alke}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Card className="bg-purple-950/30 border-purple-800/40">
            <CardContent className="p-3">
              <p className="text-xs text-purple-300 font-cairo leading-relaxed">
                <strong>الاستقرارية بالرنين:</strong> طاقة الرنين للبنزين ≈ 150 kJ/mol — وهذا ما يجعله يُفضّل الإحلال على الإضافة للحفاظ على ثبات الحلقة.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
