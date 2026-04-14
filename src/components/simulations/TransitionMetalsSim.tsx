import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Atom } from '@phosphor-icons/react'

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Metal {
  symbol: string
  nameAr: string
  nameEn: string
  ions: Ion[]
}

interface Ion {
  formula: string
  nameAr: string
  color: string         // CSS color
  colorNameAr: string
  oxidationState: string
  observation: string
}

const METALS: Metal[] = [
  {
    symbol: 'Cu',
    nameAr: 'النحاس',
    nameEn: 'Copper',
    ions: [
      {
        formula: 'Cu²⁺ (CuSO₄)',
        nameAr: 'كبريتات النحاس II',
        color: '#2563eb',
        colorNameAr: 'أزرق',
        oxidationState: '+2',
        observation: 'محلول أزرق مميز — الأكثر شيوعاً في المختبر'
      },
      {
        formula: 'Cu⁺ (CuCl)',
        nameAr: 'كلوريد النحاس I',
        color: '#e2e8f0',
        colorNameAr: 'أبيض/عديم اللون',
        oxidationState: '+1',
        observation: 'عديم اللون تقريباً — حالة أقل استقراراً'
      }
    ]
  },
  {
    symbol: 'Fe',
    nameAr: 'الحديد',
    nameEn: 'Iron',
    ions: [
      {
        formula: 'Fe²⁺ (FeSO₄)',
        nameAr: 'كبريتات الحديدوز',
        color: '#4ade80',
        colorNameAr: 'أخضر فاتح',
        oxidationState: '+2',
        observation: 'محلول أخضر فاتح — يتأكسد تدريجياً في الهواء'
      },
      {
        formula: 'Fe³⁺ (FeCl₃)',
        nameAr: 'كلوريد الحديديك',
        color: '#c2410c',
        colorNameAr: 'بني برتقالي',
        oxidationState: '+3',
        observation: 'محلول بني برتقالي — يكوّن راسباً بنياً مع القلويات'
      }
    ]
  },
  {
    symbol: 'Co',
    nameAr: 'الكوبالت',
    nameEn: 'Cobalt',
    ions: [
      {
        formula: 'Co²⁺ (CoCl₂)',
        nameAr: 'كلوريد الكوبالت',
        color: '#ec4899',
        colorNameAr: 'وردي/أرجواني',
        oxidationState: '+2',
        observation: 'وردي في الماء → أزرق عند التسخين (كاشف رطوبة)'
      }
    ]
  },
  {
    symbol: 'Mn',
    nameAr: 'المنجنيز',
    nameEn: 'Manganese',
    ions: [
      {
        formula: 'MnO₄⁻ (KMnO₄)',
        nameAr: 'برمنجنات البوتاسيوم',
        color: '#7e22ce',
        colorNameAr: 'بنفسجي داكن',
        oxidationState: '+7',
        observation: 'بنفسجي داكن — عامل مؤكسد قوي جداً'
      },
      {
        formula: 'Mn²⁺',
        nameAr: 'أيون المنجنيز II',
        color: '#fda4af',
        colorNameAr: 'وردي فاتح جداً',
        oxidationState: '+2',
        observation: 'وردي فاتح جداً — ناتج اختزال البرمنجنات'
      }
    ]
  },
  {
    symbol: 'Cr',
    nameAr: 'الكروم',
    nameEn: 'Chromium',
    ions: [
      {
        formula: 'Cr³⁺ (Cr₂(SO₄)₃)',
        nameAr: 'كبريتات الكروم III',
        color: '#166534',
        colorNameAr: 'أخضر داكن',
        oxidationState: '+3',
        observation: 'أخضر داكن مميز للكروم ثلاثي التكافؤ'
      },
      {
        formula: 'CrO₄²⁻',
        nameAr: 'كرومات البوتاسيوم',
        color: '#ca8a04',
        colorNameAr: 'أصفر',
        oxidationState: '+6',
        observation: 'أصفر في وسط قلوي → برتقالي في وسط حمضي (Cr₂O₇²⁻)'
      }
    ]
  }
]

// ─── ReactionPanel ─────────────────────────────────────────────────────────────

interface ReactionPanelProps {
  ion: Ion
  metalSymbol: string
}

function ReactionPanel({ ion, metalSymbol }: ReactionPanelProps) {
  const [addNaOH, setAddNaOH] = useState(false)
  const [addNH3, setAddNH3] = useState(false)

  const precipitateColor: Record<string, string> = {
    'Cu': 'أزرق فاتح Cu(OH)₂',
    'Fe': 'بني صدئي Fe(OH)₃',
    'Co': 'زرقاء/وردية Co(OH)₂',
    'Mn': 'بيضاء Mn(OH)₂',
    'Cr': 'رمادية خضراء Cr(OH)₃'
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3 items-center">
        {/* Tube */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-12 h-28 rounded-b-full border-2 border-slate-600 flex items-end justify-center pb-2 relative overflow-hidden"
            style={{ backgroundColor: addNaOH ? '#94a3b8' : ion.color + '88' }}
          >
            {/* Liquid body */}
            <div
              className="absolute bottom-0 left-0 right-0 rounded-b-full transition-all duration-700"
              style={{
                height: addNaOH ? '60%' : '75%',
                backgroundColor: addNaOH ? '#94a3b8' : ion.color
              }}
            />
            {/* Precipitate */}
            {addNaOH && (
              <div
                className="absolute bottom-0 left-0 right-0 h-5 rounded-b-full"
                style={{ backgroundColor: ion.color }}
              />
            )}
          </div>
          <span className="text-xs text-center text-muted-foreground max-w-14 leading-tight">{ion.formula}</span>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge style={{ backgroundColor: ion.color + '33', color: ion.color, border: `1px solid ${ion.color}55` }}>
              {ion.colorNameAr}
            </Badge>
            <Badge variant="outline">{ion.oxidationState}</Badge>
          </div>
          <p className="text-xs text-muted-foreground font-cairo leading-relaxed">{ion.observation}</p>

          {/* Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => { setAddNaOH(!addNaOH); setAddNH3(false) }}
              className={`text-xs px-2 py-1 rounded border transition-colors font-cairo ${addNaOH ? 'bg-slate-500 text-white border-slate-500' : 'border-slate-600 hover:bg-slate-700'}`}
            >
              {addNaOH ? '✓ أضفت NaOH' : '+ إضافة NaOH'}
            </button>
            <button
              onClick={() => { setAddNH3(!addNH3); setAddNaOH(false) }}
              className={`text-xs px-2 py-1 rounded border transition-colors font-cairo ${addNH3 ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-600 hover:bg-slate-700'}`}
            >
              {addNH3 ? '✓ أضفت NH₃' : '+ إضافة NH₃'}
            </button>
          </div>

          {addNaOH && (
            <p className="text-xs text-amber-400 font-cairo">
              ⬇ راسب: {precipitateColor[metalSymbol] ?? 'ملوّن'}
            </p>
          )}
          {addNH3 && (
            <p className="text-xs text-blue-400 font-cairo">
              ⬇ راسب أولاً → يذوب مع زيادة NH₃ (مركب معقد)
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function TransitionMetalsSim() {
  const [selectedMetal, setSelectedMetal] = useState<Metal>(METALS[0])

  return (
    <div className="space-y-4 font-cairo" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Atom size={20} weight="fill" className="text-purple-400" />
        <h3 className="font-bold text-lg">ألوان العناصر الانتقالية</h3>
      </div>

      {/* Metal selector */}
      <div className="flex gap-2 flex-wrap">
        {METALS.map(m => (
          <button
            key={m.symbol}
            onClick={() => setSelectedMetal(m)}
            className={`px-3 py-1.5 rounded-lg border text-sm font-bold transition-all ${selectedMetal.symbol === m.symbol
              ? 'bg-purple-600 border-purple-500 text-white shadow-md'
              : 'border-slate-600 hover:bg-slate-700 text-slate-300'
              }`}
          >
            {m.symbol} — {m.nameAr}
          </button>
        ))}
      </div>

      {/* Ions grid */}
      <div className="space-y-3">
        {selectedMetal.ions.map((ion, i) => (
          <Card key={i} className="border-slate-700">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-cairo">{ion.nameAr}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ReactionPanel ion={ion} metalSymbol={selectedMetal.symbol} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary table */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-cairo">جدول ملخص الألوان</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2">
            {METALS.flatMap(m => m.ions.map(ion => (
              <div key={ion.formula} className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full border border-slate-600 flex-shrink-0"
                  style={{ backgroundColor: ion.color }}
                />
                <span className="text-xs font-mono text-slate-400 w-32 flex-shrink-0">{ion.formula}</span>
                <span className="text-xs text-slate-300">{ion.colorNameAr}</span>
              </div>
            )))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
