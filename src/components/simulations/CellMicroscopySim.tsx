import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MagnifyingGlass } from '@phosphor-icons/react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Organelle {
  id: string
  nameAr: string
  nameEn: string
  functionAr: string
  presentIn: ('plant' | 'animal')[]
  color: string
}

// ─── Organelle data ────────────────────────────────────────────────────────────

const ORGANELLES: Organelle[] = [
  {
    id: 'nucleus',
    nameAr: 'النواة',
    nameEn: 'Nucleus',
    functionAr: 'تحتوي على الـ DNA وتتحكم في نشاط الخلية',
    presentIn: ['plant', 'animal'],
    color: '#7c3aed'
  },
  {
    id: 'mitochondria',
    nameAr: 'الميتوكندريا',
    nameEn: 'Mitochondria',
    functionAr: 'إنتاج الطاقة (ATP) عبر التنفس الخلوي',
    presentIn: ['plant', 'animal'],
    color: '#dc2626'
  },
  {
    id: 'chloroplast',
    nameAr: 'البلاستيدة الخضراء',
    nameEn: 'Chloroplast',
    functionAr: 'التمثيل الضوئي — تحويل الضوء إلى طاقة كيميائية',
    presentIn: ['plant'],
    color: '#16a34a'
  },
  {
    id: 'cell_wall',
    nameAr: 'الجدار الخلوي',
    nameEn: 'Cell Wall',
    functionAr: 'دعم ميكانيكي وحماية — مصنوع من السيليولوز',
    presentIn: ['plant'],
    color: '#92400e'
  },
  {
    id: 'vacuole',
    nameAr: 'الفجوة العصارية',
    nameEn: 'Large Vacuole',
    functionAr: 'تخزين الماء والمواد والحفاظ على الضغط التورمي',
    presentIn: ['plant'],
    color: '#0ea5e9'
  },
  {
    id: 'ribosome',
    nameAr: 'الريبوزوم',
    nameEn: 'Ribosome',
    functionAr: 'تخليق البروتينات',
    presentIn: ['plant', 'animal'],
    color: '#f59e0b'
  },
  {
    id: 'er',
    nameAr: 'الشبكة الإندوبلازمية',
    nameEn: 'ER',
    functionAr: 'نقل وتعديل البروتينات والدهون',
    presentIn: ['plant', 'animal'],
    color: '#06b6d4'
  },
  {
    id: 'golgi',
    nameAr: 'جهاز جولجي',
    nameEn: 'Golgi',
    functionAr: 'تعديل وتعبئة وإفراز البروتينات',
    presentIn: ['plant', 'animal'],
    color: '#f97316'
  },
  {
    id: 'lysosome',
    nameAr: 'الجسيم الحال',
    nameEn: 'Lysosome',
    functionAr: 'هضم العضيات التالفة والجزيئات',
    presentIn: ['animal'],
    color: '#be123c'
  },
  {
    id: 'centriole',
    nameAr: 'المركز (الجسم المركزي)',
    nameEn: 'Centriole',
    functionAr: 'تنظيم الانقسام الخلوي',
    presentIn: ['animal'],
    color: '#78716c'
  }
]

// ─── Plant Cell SVG ────────────────────────────────────────────────────────────

function PlantCellSVG({ highlighted, onSelect }: { highlighted: string | null, onSelect: (id: string) => void }) {
  const opacity = (id: string) => highlighted === null || highlighted === id ? 1 : 0.25
  const stroke = (id: string) => highlighted === id ? '#ffffff' : 'none'

  return (
    <svg viewBox="0 0 320 280" className="w-full max-w-xs mx-auto cursor-pointer">
      {/* Cell wall */}
      <rect x="10" y="10" width="300" height="260" rx="20" fill="#92400e22" stroke="#92400e" strokeWidth="5"
        opacity={opacity('cell_wall')} onClick={() => onSelect('cell_wall')} />

      {/* Cell membrane */}
      <rect x="18" y="18" width="284" height="244" rx="16" fill="none" stroke="#16a34a55" strokeWidth="2" />

      {/* Large vacuole */}
      <ellipse cx="200" cy="145" rx="90" ry="95" fill="#0ea5e933" stroke="#0ea5e9" strokeWidth="2"
        opacity={opacity('vacuole')} onClick={() => onSelect('vacuole')} />

      {/* Chloroplasts */}
      {[[50, 60], [80, 220], [110, 50]].map(([cx, cy], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="22" ry="12" fill="#16a34a88" stroke="#16a34a" strokeWidth="1.5"
          opacity={opacity('chloroplast')} onClick={() => onSelect('chloroplast')} />
      ))}

      {/* Nucleus */}
      <ellipse cx="100" cy="140" rx="40" ry="35" fill="#7c3aed44" stroke={highlighted === 'nucleus' ? '#fff' : '#7c3aed'}
        strokeWidth="2.5" opacity={opacity('nucleus')} onClick={() => onSelect('nucleus')} />
      <ellipse cx="100" cy="140" rx="14" ry="12" fill="#7c3aed88" />

      {/* ER */}
      <path d="M55,170 Q70,160 75,175 Q80,185 95,180 Q110,175 115,190"
        fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round"
        opacity={opacity('er')} onClick={() => onSelect('er')} />

      {/* Golgi */}
      {[0, 5, 10].map((offset, i) => (
        <path key={i} d={`M55,${200 + offset} Q80,${195 + offset} 90,${200 + offset}`}
          fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"
          opacity={opacity('golgi')} onClick={() => onSelect('golgi')} />
      ))}

      {/* Mitochondria */}
      {[[130, 200], [60, 100]].map(([cx, cy], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="16" ry="10" fill="#dc262644" stroke="#dc2626" strokeWidth="1.5"
          opacity={opacity('mitochondria')} onClick={() => onSelect('mitochondria')} />
      ))}

      {/* Ribosomes (dots) */}
      {[[90, 170], [110, 165], [120, 200], [75, 145]].map(([rx, ry], i) => (
        <circle key={i} cx={rx} cy={ry} r={3} fill="#f59e0b"
          opacity={opacity('ribosome')} onClick={() => onSelect('ribosome')} />
      ))}

      {/* Labels */}
      <text x="160" y="98" fontSize="8" fill="#0ea5e9" fontFamily="Cairo,sans-serif" textAnchor="middle"
        opacity={opacity('vacuole')}>فجوة عصارية</text>
      <text x="100" y="138" fontSize="8" fill="#c4b5fd" fontFamily="Cairo,sans-serif" textAnchor="middle"
        opacity={opacity('nucleus')}>نواة</text>
      <text x="50" y="56" fontSize="7" fill="#4ade80" fontFamily="Cairo,sans-serif" textAnchor="middle"
        opacity={opacity('chloroplast')}>بلاستيدة</text>
    </svg>
  )
}

// ─── Animal Cell SVG ──────────────────────────────────────────────────────────

function AnimalCellSVG({ highlighted, onSelect }: { highlighted: string | null, onSelect: (id: string) => void }) {
  const opacity = (id: string) => highlighted === null || highlighted === id ? 1 : 0.25

  return (
    <svg viewBox="0 0 320 280" className="w-full max-w-xs mx-auto cursor-pointer">
      {/* Irregular membrane */}
      <ellipse cx="160" cy="140" rx="140" ry="120" fill="#1e293b" stroke="#f97316" strokeWidth="2.5"
        opacity={opacity('er')} />

      {/* Nucleus */}
      <ellipse cx="155" cy="130" rx="45" ry="40" fill="#7c3aed44" stroke="#7c3aed" strokeWidth="2.5"
        opacity={opacity('nucleus')} onClick={() => onSelect('nucleus')} />
      <ellipse cx="155" cy="130" rx="15" ry="13" fill="#7c3aed88" />

      {/* Centrioles */}
      <rect x="78" y="115" width="16" height="6" rx="3" fill="#78716c" stroke="#a8a29e" strokeWidth="1"
        opacity={opacity('centriole')} onClick={() => onSelect('centriole')} />
      <rect x="78" y="124" width="16" height="6" rx="3" fill="#78716c" stroke="#a8a29e" strokeWidth="1"
        opacity={opacity('centriole')} onClick={() => onSelect('centriole')} />

      {/* Mitochondria */}
      {[[220, 100], [210, 165], [95, 185]].map(([cx, cy], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="18" ry="11" fill="#dc262644" stroke="#dc2626" strokeWidth="1.5"
          opacity={opacity('mitochondria')} onClick={() => onSelect('mitochondria')} />
      ))}

      {/* Golgi */}
      {[0, 6, 12].map((offset, i) => (
        <path key={i} d={`M115,${200 + offset} Q140,${195 + offset} 155,${200 + offset}`}
          fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"
          opacity={opacity('golgi')} onClick={() => onSelect('golgi')} />
      ))}

      {/* ER */}
      <path d="M165,180 Q185,170 190,185 Q195,195 210,190"
        fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round"
        opacity={opacity('er')} onClick={() => onSelect('er')} />

      {/* Lysosomes */}
      {[[100, 90], [245, 145]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={9} fill="#be123c55" stroke="#be123c" strokeWidth="1.5"
          opacity={opacity('lysosome')} onClick={() => onSelect('lysosome')} />
      ))}

      {/* Ribosomes */}
      {[[145, 170], [170, 165], [185, 185], [130, 155]].map(([rx, ry], i) => (
        <circle key={i} cx={rx} cy={ry} r={3} fill="#f59e0b"
          opacity={opacity('ribosome')} onClick={() => onSelect('ribosome')} />
      ))}

      {/* Labels */}
      <text x="155" y="128" fontSize="8" fill="#c4b5fd" fontFamily="Cairo,sans-serif" textAnchor="middle"
        opacity={opacity('nucleus')}>نواة</text>
      <text x="100" y="85" fontSize="7" fill="#fda4af" fontFamily="Cairo,sans-serif" textAnchor="middle"
        opacity={opacity('lysosome')}>جسيم حال</text>
    </svg>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function CellMicroscopySim() {
  const [cellType, setCellType] = useState<'plant' | 'animal'>('plant')
  const [highlighted, setHighlighted] = useState<string | null>(null)
  const [zoom, setZoom] = useState<number>(400)  // magnification

  const selected = highlighted ? ORGANELLES.find(o => o.id === highlighted) : null
  const visibleOrganelles = ORGANELLES.filter(o => o.presentIn.includes(cellType))

  return (
    <div className="space-y-4 font-cairo" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MagnifyingGlass size={20} weight="fill" className="text-green-400" />
        <h3 className="font-bold text-lg">محاكاة المجهر — تركيب الخلية</h3>
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex gap-2">
          {(['plant', 'animal'] as const).map(t => (
            <button key={t} onClick={() => { setCellType(t); setHighlighted(null) }}
              className={`px-3 py-1.5 rounded-lg border text-sm font-cairo transition-all ${cellType === t
                ? 'bg-green-700 border-green-600 text-white'
                : 'border-slate-600 hover:bg-slate-700 text-slate-300'}`}>
              {t === 'plant' ? '🌿 خلية نباتية' : '🐾 خلية حيوانية'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-slate-400">تكبير:</span>
          {[100, 400, 1000].map(z => (
            <button key={z} onClick={() => setZoom(z)}
              className={`px-2 py-1 rounded border text-xs transition-all ${zoom === z
                ? 'bg-slate-600 border-slate-500 text-white'
                : 'border-slate-700 hover:bg-slate-700 text-slate-400'}`}>
              ×{z}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cell diagram */}
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-cairo">انقر على العضيات لمعرفة وظيفتها</span>
            <Badge variant="outline" className="text-xs">×{zoom}</Badge>
          </div>
          {cellType === 'plant'
            ? <PlantCellSVG highlighted={highlighted} onSelect={setHighlighted} />
            : <AnimalCellSVG highlighted={highlighted} onSelect={setHighlighted} />}
        </div>

        {/* Info panel */}
        <div className="space-y-3">
          {selected ? (
            <Card className="border-slate-700 bg-slate-900/50">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selected.color }} />
                  <h4 className="font-bold font-cairo">{selected.nameAr}</h4>
                  <Badge variant="outline" className="text-xs font-mono">{selected.nameEn}</Badge>
                </div>
                <p className="text-sm text-slate-300 font-cairo leading-relaxed">{selected.functionAr}</p>
                <div className="flex gap-1 flex-wrap">
                  {selected.presentIn.map(t => (
                    <Badge key={t} variant="secondary" className="text-xs font-cairo">
                      {t === 'plant' ? '🌿 نباتية' : '🐾 حيوانية'}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-700 bg-slate-900/50">
              <CardContent className="p-4 text-center text-muted-foreground text-sm font-cairo">
                انقر على أي عضية لعرض معلوماتها
              </CardContent>
            </Card>
          )}

          {/* Organelle list */}
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {visibleOrganelles.map(o => (
              <button key={o.id}
                onClick={() => setHighlighted(highlighted === o.id ? null : o.id)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg border text-right text-sm transition-all font-cairo ${highlighted === o.id
                  ? 'bg-slate-700 border-slate-500'
                  : 'border-transparent hover:bg-slate-800'}`}>
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: o.color }} />
                <span className="flex-1 text-right">{o.nameAr}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-4">
          <h4 className="font-bold text-sm font-cairo mb-3">الفروق بين الخلية النباتية والحيوانية</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-cairo">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-right p-1.5 text-slate-400">العضية</th>
                  <th className="text-center p-1.5 text-green-400">🌿 نباتية</th>
                  <th className="text-center p-1.5 text-orange-400">🐾 حيوانية</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {[
                  ['الجدار الخلوي', '✓ موجود', '✗ غائب'],
                  ['البلاستيدة الخضراء', '✓ موجودة', '✗ غائبة'],
                  ['الفجوة العصارية الكبيرة', '✓ موجودة', '✗ صغيرة جداً'],
                  ['الجسيمات الحالة', 'نادرة', '✓ موجودة'],
                  ['الجسم المركزي', '✗ غائب', '✓ موجود'],
                  ['النواة والميتوكندريا', '✓ موجودة', '✓ موجودة']
                ].map(([org, plant, animal], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-slate-900/30' : ''}>
                    <td className="p-1.5 font-bold">{org}</td>
                    <td className="p-1.5 text-center">{plant}</td>
                    <td className="p-1.5 text-center">{animal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
