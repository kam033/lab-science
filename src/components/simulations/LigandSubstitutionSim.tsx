import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, ArrowLeft, ArrowClockwise, Drop, Play, Pause } from '@phosphor-icons/react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LigGroup { symbol: string; color: string; count: number }
type Geom = 'oct' | 'tet' | 'sq' | 'ppt'

interface Step {
  label: string
  reagent: string | null
  formula: string
  nameAr: string
  solColor: string     // solution/tube fill
  textColor?: string   // text on solution badge
  geom: Geom
  ligands: LigGroup[]
  equation: string
  delta?: number       // Δ crystal-field splitting (cm⁻¹)
  desc: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const METALS: Record<string, { nameAr: string; symbol: string; mc: string; steps: Step[] }> = {
  cu: {
    nameAr: 'نحاس (II)', symbol: 'Cu²⁺', mc: '#b87333',
    steps: [
      {
        label: 'الحالة الابتدائية', reagent: null,
        formula: '[Cu(H₂O)₆]²⁺', nameAr: 'سداسي أكوا نحاس(II)',
        solColor: '#88d4f0', textColor: '#1e3a5f', geom: 'oct',
        ligands: [{ symbol: 'H₂O', color: '#ef4444', count: 6 }],
        equation: 'Cu²⁺(aq) + 6H₂O ⇌ [Cu(H₂O)₆]²⁺',
        delta: 12600,
        desc: 'المحلول أزرق فاتح — ستة جزيئات ماء ترتبط حول أيون النحاس في هندسة ثمانية الوجوه.',
      },
      {
        label: '+ NH₃ (قليل)', reagent: 'محلول NH₃ بكمية صغيرة',
        formula: 'Cu(OH)₂ ↓', nameAr: 'هيدروكسيد النحاس (II) — راسب',
        solColor: '#c8e4f4', textColor: '#1e3a5f', geom: 'ppt',
        ligands: [{ symbol: 'OH⁻', color: '#94a3b8', count: 2 }],
        equation: '[Cu(H₂O)₆]²⁺ + 2NH₃ → Cu(OH)₂↓ + 2NH₄⁺ + 4H₂O',
        desc: 'يتكوّن راسب أزرق شاحب من هيدروكسيد النحاس (II) عند إضافة كمية صغيرة من الأمونيا.',
      },
      {
        label: '+ NH₃ (زائد)', reagent: 'محلول NH₃ بزيادة',
        formula: '[Cu(NH₃)₄(H₂O)₂]²⁺', nameAr: 'رباعي أمين ثنائي أكوا نحاس(II)',
        solColor: '#1a237e', textColor: '#ffffff', geom: 'sq',
        ligands: [
          { symbol: 'NH₃', color: '#3b82f6', count: 4 },
          { symbol: 'H₂O', color: '#ef4444', count: 2 },
        ],
        equation: 'Cu(OH)₂ + 4NH₃ + 2H₂O → [Cu(NH₃)₄(H₂O)₂]²⁺ + 2OH⁻',
        delta: 15100,
        desc: 'يذوب الراسب ويتحوّل إلى أزرق بنفسجي داكن عميق — الأمونيا مجال أقوى من الماء في السلسلة الطيفية.',
      },
      {
        label: '+ HCl (مركّز)', reagent: 'HCl مركّز',
        formula: '[CuCl₄]²⁻', nameAr: 'رباعي كلورو نحاسات(II)',
        solColor: '#c8a820', textColor: '#ffffff', geom: 'tet',
        ligands: [{ symbol: 'Cl⁻', color: '#16a34a', count: 4 }],
        equation: '[Cu(H₂O)₆]²⁺ + 4Cl⁻ ⇌ [CuCl₄]²⁻ + 6H₂O',
        delta: 5200,
        desc: 'تستبدل أيونات Cl⁻ الكبيرة الماءَ — تتغيّر الهندسة إلى رباعي الأوجه واللون إلى أخضر-أصفر.',
      },
    ],
  },
  fe: {
    nameAr: 'حديد (III)', symbol: 'Fe³⁺', mc: '#8b4513',
    steps: [
      {
        label: 'الحالة الابتدائية', reagent: null,
        formula: '[Fe(H₂O)₆]³⁺', nameAr: 'سداسي أكوا حديد(III)',
        solColor: '#d4a050', textColor: '#ffffff', geom: 'oct',
        ligands: [{ symbol: 'H₂O', color: '#ef4444', count: 6 }],
        equation: 'Fe³⁺(aq) + 6H₂O ⇌ [Fe(H₂O)₆]³⁺',
        delta: 13700,
        desc: 'المحلول أصفر-بني فاتح — ستة جزيئات ماء حول أيون الحديد(III) في هندسة ثمانية الوجوه.',
      },
      {
        label: '+ NaOH', reagent: 'NaOH (محلول)',
        formula: 'Fe(OH)₃ ↓', nameAr: 'هيدروكسيد الحديد (III) — راسب',
        solColor: '#8b4513', textColor: '#ffffff', geom: 'ppt',
        ligands: [{ symbol: 'OH⁻', color: '#94a3b8', count: 3 }],
        equation: '[Fe(H₂O)₆]³⁺ + 3OH⁻ → Fe(OH)₃↓ + 6H₂O',
        desc: 'راسب بني-برتقالي صدئ مميز من هيدروكسيد الحديد (III).',
      },
      {
        label: '+ SCN⁻', reagent: 'KSCN (محلول)',
        formula: '[Fe(SCN)(H₂O)₅]²⁺', nameAr: 'ثيوسيانات أكوا حديد(III)',
        solColor: '#cc0000', textColor: '#ffffff', geom: 'oct',
        ligands: [
          { symbol: 'SCN⁻', color: '#dc2626', count: 1 },
          { symbol: 'H₂O', color: '#ef4444', count: 5 },
        ],
        equation: '[Fe(H₂O)₆]³⁺ + SCN⁻ ⇌ [Fe(SCN)(H₂O)₅]²⁺ + H₂O',
        delta: 14000,
        desc: 'لون أحمر دموي مميّز جداً — اختبار تحليلي حساس للكشف عن أيونات الحديد(III).',
      },
      {
        label: '+ F⁻', reagent: 'NaF (محلول)',
        formula: '[FeF₆]³⁻', nameAr: 'سداسي فلورو حديد(III)',
        solColor: '#f0f4f8', textColor: '#334155', geom: 'oct',
        ligands: [{ symbol: 'F⁻', color: '#f59e0b', count: 6 }],
        equation: '[Fe(H₂O)₆]³⁺ + 6F⁻ ⇌ [FeF₆]³⁻ + 6H₂O',
        delta: 16200,
        desc: 'يصبح عديم اللون تقريباً — F⁻ مجال أقوى من H₂O فيزيد Δ ويزاح الامتصاص نحو الأشعة فوق البنفسجية.',
      },
    ],
  },
  co: {
    nameAr: 'كوبالت (II)', symbol: 'Co²⁺', mc: '#7c3aed',
    steps: [
      {
        label: 'الحالة الابتدائية', reagent: null,
        formula: '[Co(H₂O)₆]²⁺', nameAr: 'سداسي أكوا كوبالت(II)',
        solColor: '#f9a8a8', textColor: '#7f1d1d', geom: 'oct',
        ligands: [{ symbol: 'H₂O', color: '#ef4444', count: 6 }],
        equation: 'Co²⁺(aq) + 6H₂O ⇌ [Co(H₂O)₆]²⁺',
        delta: 9300,
        desc: 'المحلول وردي جميل — ستة جزيئات ماء حول الكوبالت(II) في هندسة ثمانية الوجوه.',
      },
      {
        label: '+ HCl (مركّز)', reagent: 'HCl مركّز',
        formula: '[CoCl₄]²⁻', nameAr: 'رباعي كلورو كوبالتات(II)',
        solColor: '#2563eb', textColor: '#ffffff', geom: 'tet',
        ligands: [{ symbol: 'Cl⁻', color: '#16a34a', count: 4 }],
        equation: '[Co(H₂O)₆]²⁺ + 4Cl⁻ ⇌ [CoCl₄]²⁻ + 6H₂O',
        delta: 3600,
        desc: 'تحوّل وردي → أزرق مع تغيّر الهندسة من ثمانية الأوجه إلى رباعي الأوجه.',
      },
      {
        label: '+ NH₃ (زائد)', reagent: 'محلول NH₃ بزيادة',
        formula: '[Co(NH₃)₆]²⁺', nameAr: 'سداسي أمين كوبالت(II)',
        solColor: '#ca8a04', textColor: '#ffffff', geom: 'oct',
        ligands: [{ symbol: 'NH₃', color: '#3b82f6', count: 6 }],
        equation: '[Co(H₂O)₆]²⁺ + 6NH₃ ⇌ [Co(NH₃)₆]²⁺ + 6H₂O',
        delta: 10200,
        desc: 'اللون بني-أصفر — الأمونيا تحلّ محلّ جميع جزيئات الماء الستة.',
      },
    ],
  },
  ni: {
    nameAr: 'نيكل (II)', symbol: 'Ni²⁺', mc: '#166534',
    steps: [
      {
        label: 'الحالة الابتدائية', reagent: null,
        formula: '[Ni(H₂O)₆]²⁺', nameAr: 'سداسي أكوا نيكل(II)',
        solColor: '#86efac', textColor: '#14532d', geom: 'oct',
        ligands: [{ symbol: 'H₂O', color: '#ef4444', count: 6 }],
        equation: 'Ni²⁺(aq) + 6H₂O ⇌ [Ni(H₂O)₆]²⁺',
        delta: 8500,
        desc: 'المحلول أخضر فاتح — ستة جزيئات ماء حول النيكل(II) في هندسة ثمانية الوجوه.',
      },
      {
        label: '+ NH₃ (زائد)', reagent: 'محلول NH₃ بزيادة',
        formula: '[Ni(NH₃)₆]²⁺', nameAr: 'سداسي أمين نيكل(II)',
        solColor: '#4f46e5', textColor: '#ffffff', geom: 'oct',
        ligands: [{ symbol: 'NH₃', color: '#3b82f6', count: 6 }],
        equation: '[Ni(H₂O)₆]²⁺ + 6NH₃ ⇌ [Ni(NH₃)₆]²⁺ + 6H₂O',
        delta: 10800,
        desc: 'يتحوّل أخضر → بنفسجي-أزرق — الأمونيا (مجال أقوى) تزيد Δ وتزيح اللون المُمتَص.',
      },
      {
        label: '+ EDTA', reagent: 'EDTA⁴⁻',
        formula: '[NiEDTA]²⁻', nameAr: 'معقد EDTA نيكل(II)',
        solColor: '#1d4ed8', textColor: '#ffffff', geom: 'oct',
        ligands: [{ symbol: 'EDTA', color: '#f59e0b', count: 1 }],
        equation: '[Ni(H₂O)₆]²⁺ + EDTA⁴⁻ ⇌ [NiEDTA]²⁻ + 6H₂O',
        delta: 11500,
        desc: 'EDTA سداسي الأسنان يُشكّل معقداً مستقراً جداً (خمسة حلقات مخلبية).',
      },
    ],
  },
}

// ─── Fixed precipitate dot positions ─────────────────────────────────────────

const PPT_DOTS = [
  [72,105],[88,118],[65,135],[95,128],[80,148],
  [70,162],[90,142],[82,115],[75,150],[85,130],
  [68,122],[92,158],[76,138],[88,105],[73,168],
]

// ─── Molecular diagram positions (center 130,115) ─────────────────────────────

const CX = 130, CY = 115
const OCT_EQ: [number,number][] = [[195,115],[65,115],[130,50],[130,180]]
const OCT_AX: [number,number][] = [[177,167],[83,63]]
const TET:    [number,number][] = [[190,72],[70,72],[190,158],[70,158]]

function MolDiagram({ step, mc, sym }: { step: Step; mc: string; sym: string }) {
  type LigPos = { pos: [number,number]; lig: LigGroup; r: number; dashed?: boolean }
  const items: LigPos[] = []

  if (step.geom === 'ppt') {
    return (
      <svg viewBox="0 0 260 200" className="w-full" style={{ maxHeight: 200 }}>
        <text x="130" y="30" textAnchor="middle" fill="#64748b" fontFamily="Cairo,sans-serif" fontSize="13">
          راسب
        </text>
        {PPT_DOTS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={5 + (i % 3)} fill={step.ligands[0].color} opacity={0.7} />
        ))}
        <text x="130" y="195" textAnchor="middle" fill="#334155" fontFamily="sans-serif" fontSize="12" fontStyle="italic">
          {step.formula}
        </text>
      </svg>
    )
  }

  if (step.geom === 'oct') {
    const l = step.ligands
    if (l.length === 1) {
      OCT_EQ.forEach(p => items.push({ pos: p, lig: l[0], r: 20 }))
      items.push({ pos: OCT_AX[0], lig: l[0], r: 20 })
      items.push({ pos: OCT_AX[1], lig: l[0], r: 16, dashed: true })
    } else {
      OCT_EQ.forEach(p => items.push({ pos: p, lig: l[0], r: 20 }))
      items.push({ pos: OCT_AX[0], lig: l[1], r: 17 })
      items.push({ pos: OCT_AX[1], lig: l[1], r: 13, dashed: true })
    }
  } else if (step.geom === 'tet') {
    TET.forEach(p => items.push({ pos: p, lig: step.ligands[0], r: 21 }))
  } else if (step.geom === 'sq') {
    const l = step.ligands
    OCT_EQ.forEach(p => items.push({ pos: p, lig: l[0], r: 20 }))
    if (l.length > 1) {
      items.push({ pos: OCT_AX[0], lig: l[1], r: 14 })
      items.push({ pos: OCT_AX[1], lig: l[1], r: 11, dashed: true })
    }
  }

  return (
    <svg viewBox="0 0 260 205" className="w-full" style={{ maxHeight: 205 }}>
      {/* Bonds */}
      {items.map(({ pos, dashed }, i) => (
        <line
          key={`b${i}`}
          x1={CX} y1={CY} x2={pos[0]} y2={pos[1]}
          stroke="#555" strokeWidth={dashed ? 1.5 : 2.5}
          strokeDasharray={dashed ? '5 3' : undefined}
        />
      ))}
      {/* Central atom */}
      <circle cx={CX} cy={CY} r={24} fill={mc} stroke="#333" strokeWidth={1.5} />
      <text x={CX} y={CY - 3} textAnchor="middle" fill="white" fontFamily="sans-serif" fontSize="11" fontWeight="bold">{sym}</text>
      <text x={CX} y={CY + 10} textAnchor="middle" fill="white" fontFamily="sans-serif" fontSize="9" opacity={0.8}>
        {step.geom === 'oct' ? '8-وجوه' : step.geom === 'tet' ? '4-أوجه' : 'مستوي²'}
      </text>
      {/* Ligands */}
      {items.map(({ pos, lig, r, dashed }, i) => (
        <g key={`l${i}`} style={{ transition: 'all 0.6s ease' }}>
          <circle cx={pos[0]} cy={pos[1]} r={r} fill={lig.color} stroke="white" strokeWidth={1.5} opacity={dashed ? 0.65 : 1} />
          <text
            x={pos[0]} y={pos[1] + (lig.symbol.length > 3 ? 3 : 4)}
            textAnchor="middle" fill="white"
            fontSize={r > 17 ? (lig.symbol.length > 3 ? 7 : 9) : 7}
            fontWeight="bold"
          >{lig.symbol}</text>
        </g>
      ))}
      {/* Formula */}
      <text x="130" y="200" textAnchor="middle" fill="#334155" fontFamily="sans-serif" fontSize="11" fontStyle="italic">
        {step.formula}
      </text>
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LigandSubstitutionSim() {
  const [metalId, setMetalId]   = useState('cu')
  const [stepIdx, setStepIdx]   = useState(0)
  const [pouring, setPouring]   = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const metal = METALS[metalId]
  const step  = metal.steps[stepIdx]
  const isFirst = stepIdx === 0
  const isLast  = stepIdx === metal.steps.length - 1

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= metal.steps.length) return
    setPouring(true)
    setTimeout(() => { setStepIdx(idx); setPouring(false) }, 400)
  }

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
      return
    }
    intervalRef.current = setInterval(() => {
      setStepIdx(prev => {
        const next = prev + 1
        if (next >= metal.steps.length) { setIsRunning(false); return prev }
        return next
      })
    }, 1500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, metal.steps.length])

  const changeMetal = (id: string) => { setMetalId(id); setStepIdx(0); setPouring(false); setIsRunning(false) }
  const handleReset = () => { setIsRunning(false); setStepIdx(0); setPouring(false) }

  // Bar chart data: steps with delta values
  const chartData = metal.steps
    .filter(s => s.delta)
    .map(s => ({
      name: s.label.replace('الحالة الابتدائية', 'ابتدائي').replace('+ ', ''),
      delta: +(s.delta! / 1000).toFixed(1),
      color: s.solColor,
    }))

  const METAL_TABS = [
    { id: 'cu', label: 'Cu²⁺', bg: '#b87333' },
    { id: 'fe', label: 'Fe³⁺', bg: '#8b4513' },
    { id: 'co', label: 'Co²⁺', bg: '#7c3aed' },
    { id: 'ni', label: 'Ni²⁺', bg: '#166534' },
  ]

  return (
    <div className="space-y-4 p-2" dir="rtl">

      {/* ── Metal selector tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {METAL_TABS.map(({ id, label, bg }) => (
          <button
            key={id}
            onClick={() => changeMetal(id)}
            className="px-4 py-2 rounded-lg text-sm font-bold font-cairo transition-all"
            style={{
              backgroundColor: metalId === id ? bg : '#e2e8f0',
              color: metalId === id ? 'white' : '#334155',
              boxShadow: metalId === id ? `0 2px 8px ${bg}66` : 'none',
              transform: metalId === id ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {label} — {METALS[id].nameAr}
          </button>
        ))}
      </div>

      {/* ── Main simulation area ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Left: test tube + steps */}
        <div className="flex flex-col items-center gap-3">
          {/* Test tube SVG */}
          <div className="relative">
            <svg viewBox="0 0 140 230" className="w-28 mx-auto" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }}>
              {/* Tube glass */}
              <path d="M 35,10 L 35,155 Q 35,205 70,205 Q 105,205 105,155 L 105,10"
                    fill="rgba(200,230,255,0.18)" stroke="#94a3b8" strokeWidth="3.5" />
              {/* Clip path for solution */}
              <defs>
                <clipPath id="tube-clip">
                  <path d="M 38,10 L 38,155 Q 38,202 70,202 Q 102,202 102,155 L 102,10" />
                </clipPath>
              </defs>
              {/* Solution fill */}
              <rect
                x="38" y="70" width="64" height="135"
                fill={step.solColor}
                clipPath="url(#tube-clip)"
                style={{ transition: 'fill 0.7s ease' }}
              />
              {/* Precipitate dots */}
              {step.geom === 'ppt' && PPT_DOTS.slice(0, 10).map(([x, y], i) => (
                <circle key={i} cx={x + 8} cy={y + 20} r={4 + (i % 3)} fill="white" opacity={0.55}
                  clipPath="url(#tube-clip)" />
              ))}
              {/* Tube rim */}
              <rect x="30" y="5" width="80" height="12" rx="4" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
              {/* Pouring drop */}
              {pouring && step.reagent && (
                <circle cx="70" cy="8" r="6" fill="#22c55e" opacity={0.85}>
                  <animate attributeName="cy" from="8" to="75" dur="0.35s" fill="freeze" />
                  <animate attributeName="opacity" from="0.85" to="0" dur="0.35s" fill="freeze" />
                </circle>
              )}
              {/* Formula badge */}
              <rect x="10" y="210" width="120" height="16" rx="4" fill={step.solColor} opacity={0.9} />
              <text x="70" y="222" textAnchor="middle" fill={step.textColor || '#1e293b'} fontFamily="sans-serif" fontSize="9" fontWeight="bold">
                {step.formula}
              </text>
            </svg>
          </div>

          {/* Step controls */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => goTo(stepIdx - 1)} disabled={isFirst} className="font-cairo gap-1">
              <ArrowRight size={14} /> السابق
            </Button>
            <span className="text-xs font-cairo text-muted-foreground px-2">
              {stepIdx + 1} / {metal.steps.length}
            </span>
            <Button size="sm" onClick={() => goTo(stepIdx + 1)} disabled={isLast || !step.reagent} className="font-cairo gap-1">
              <Drop size={14} weight="fill" />
              {isLast ? 'النهاية' : `أضف ${metal.steps[stepIdx + 1]?.reagent}`}
              <ArrowLeft size={14} />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant={isRunning ? 'secondary' : 'default'}
              onClick={() => setIsRunning(r => !r)} className="font-cairo gap-1 text-xs">
              {isRunning ? <><Pause size={12} weight="fill" /> إيقاف</> : <><Play size={12} weight="fill" /> تشغيل</>}
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset} className="font-cairo gap-1 text-xs">
              <ArrowClockwise size={12} /> إعادة ضبط
            </Button>
          </div>

          {/* Step pills */}
          <div className="flex flex-wrap justify-center gap-1.5 max-w-xs">
            {metal.steps.map((s, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="px-2.5 py-1 rounded-full text-xs font-cairo border transition-all"
                style={{
                  backgroundColor: i === stepIdx ? s.solColor : 'transparent',
                  color: i === stepIdx ? (s.textColor || '#1e293b') : '#64748b',
                  borderColor: i === stepIdx ? s.solColor : '#cbd5e1',
                  fontWeight: i === stepIdx ? 700 : 400,
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: molecular diagram */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-cairo text-center text-muted-foreground font-semibold">
            التركيب الجزيئي للمعقد
          </p>
          <div className="border rounded-xl bg-slate-50 p-2">
            <MolDiagram step={step} mc={metal.mc} sym={metal.symbol} />
          </div>
          {/* Geometry legend */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {step.ligands.map((l, i) => (
              <Badge key={i} className="font-mono text-xs" style={{ backgroundColor: l.color, color: 'white', border: 'none' }}>
                {l.count}× {l.symbol}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* ── Step info ── */}
      <div className="border rounded-xl p-4 space-y-2" style={{ borderColor: `${step.solColor}88`, backgroundColor: `${step.solColor}15` }}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge style={{ backgroundColor: step.solColor, color: step.textColor || '#1e293b' }} className="font-cairo text-sm px-3">
            {step.nameAr}
          </Badge>
          {step.delta && (
            <Badge variant="outline" className="font-mono text-xs">
              Δ = {step.delta.toLocaleString()} cm⁻¹
            </Badge>
          )}
        </div>
        <p className="font-mono text-sm text-slate-700 bg-white/60 rounded-lg px-3 py-2 border border-dashed" dir="ltr">
          {step.equation}
        </p>
        <p className="text-sm font-cairo text-slate-600">{step.desc}</p>
      </div>

      {/* ── Bar chart: Crystal field splitting ── */}
      {chartData.length > 1 && (
        <div className="border rounded-xl p-4 bg-white">
          <p className="text-sm font-cairo font-bold text-center mb-1 text-slate-700">
            📊 طاقة التشقق الحقلي البلوري (Δ) — تأثير نوع الليجند
          </p>
          <p className="text-xs text-center font-cairo text-muted-foreground mb-3">
            الليجندات الأقوى (مجالاً) تزيد Δ وتُزيح اللون المُمتَص نحو الطاقة الأعلى
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 25, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis
                dataKey="name"
                tick={{ fontFamily: 'Cairo,sans-serif', fontSize: 11 }}
                label={{ value: 'نوع المعقد / الليجند', position: 'insideBottom', offset: -12, fontFamily: 'Cairo,sans-serif', fontSize: 12 }}
              />
              <YAxis
                label={{ value: 'Δ (10³ cm⁻¹)', angle: -90, position: 'insideLeft', offset: 18, fontFamily: 'sans-serif', fontSize: 12 }}
                tick={{ fontFamily: 'sans-serif', fontSize: 11 }}
              />
              <Tooltip
                formatter={(v: number) => [`${v} × 10³ cm⁻¹`, 'طاقة التشقق Δ']}
                labelStyle={{ fontFamily: 'Cairo,sans-serif' }}
              />
              <ReferenceLine y={10} stroke="#94a3b8" strokeDasharray="4 3" label={{ value: 'H₂O Δ≈10', position: 'right', fontSize: 10 }} />
              <Bar dataKey="delta" radius={[6, 6, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.color} stroke="#334155" strokeWidth={stepIdx === metal.steps.findIndex(s => s.delta && +(s.delta/1000).toFixed(1) === d.delta) ? 2.5 : 0.5} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Spectrochemical series reference ── */}
      <details className="border rounded-xl overflow-hidden">
        <summary className="p-3 cursor-pointer font-cairo text-sm font-semibold bg-muted/30 select-none">
          🔗 السلسلة الطيفية (ترتيب قوة المجال)
        </summary>
        <div className="p-3 overflow-x-auto">
          <div className="flex items-center gap-1 text-xs font-mono flex-wrap">
            {['I⁻', 'Br⁻', 'Cl⁻', 'F⁻', 'OH⁻', 'H₂O', 'NH₃', 'en', 'CN⁻'].map((lig, i, arr) => (
              <span key={lig} className="flex items-center gap-1">
                <span className={`px-2 py-0.5 rounded ${
                  ['NH₃','en','CN⁻'].includes(lig) ? 'bg-blue-100 text-blue-800 font-bold' :
                  lig === 'H₂O' ? 'bg-gray-200 text-gray-700' :
                  'bg-red-50 text-red-700'
                }`}>{lig}</span>
                {i < arr.length - 1 && <span className="text-muted-foreground">{'<'}</span>}
              </span>
            ))}
          </div>
          <p className="text-xs font-cairo text-muted-foreground mt-2">
            من اليمين إلى اليسار: مجال ضعيف ← مجال قوي. كلما زاد المجال زادت Δ.
          </p>
        </div>
      </details>
    </div>
  )
}
