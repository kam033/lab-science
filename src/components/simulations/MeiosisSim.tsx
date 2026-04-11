import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowsOut, Info } from '@phosphor-icons/react'

// ─── PhET simulation URL ──────────────────────────────────────────────────────
const PHET_URL =
  'https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_all.html'

// ─── Phase reference data ─────────────────────────────────────────────────────
const PHASES = [
  { id: 0, name: 'خلية أم (2n=4)',     desc: 'خلية ثنائية تحتوي على 4 كروموسومات قبل الانقسام' },
  { id: 1, name: 'الطور التمهيدي I',   desc: 'تتكثف الكروموسومات وتتزاوج الأزواج المتماثلة (رباعيات)' },
  { id: 2, name: 'الطور الاستوائي I',  desc: 'تصطف الرباعيات على خط الاستواء' },
  { id: 3, name: 'الطور الانفصالي I',  desc: 'تنفصل الكروموسومات المتماثلة نحو القطبين' },
  { id: 4, name: 'الطور النهائي I',    desc: 'تتكون خليتان أحادية المجموعة (n=2)' },
  { id: 5, name: 'الطور التمهيدي II',  desc: 'تتكثف الكروموسومات من جديد في كل خلية' },
  { id: 6, name: 'الطور الاستوائي II', desc: 'تصطف الكروموسومات في كل خلية على خط الاستواء' },
  { id: 7, name: 'الطور الانفصالي II', desc: 'تنفصل الكروماتيدات الشقيقة في كل خلية' },
  { id: 8, name: 'الطور النهائي II',   desc: '4 خلايا جنسية أحادية (n=1) مختلفة وراثياً' },
]

// ─── Component ────────────────────────────────────────────────────────────────
export function MeiosisSim() {
  const [mode, setMode]       = useState<'learning' | 'experiment'>('learning')
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <div className="space-y-4" dir="rtl">

      {/* Mode buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        <Button
          variant={mode === 'learning' ? 'default' : 'outline'}
          onClick={() => setMode('learning')}
          className="font-cairo"
        >
          💡 التعلم
        </Button>
        <Button
          variant={mode === 'experiment' ? 'default' : 'outline'}
          onClick={() => setMode('experiment')}
          className="font-cairo"
        >
          🔬 الملاحظة
        </Button>
      </div>

      {/* ── PhET simulation embed ─────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="font-cairo text-base">
            🔬 محاكاة الانقسام الاختزالي — PhET Interactive
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 font-cairo text-xs"
            onClick={() => setFullscreen(f => !f)}
          >
            <ArrowsOut size={14} />
            {fullscreen ? 'تصغير' : 'تكبير'}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div
            className={`w-full transition-all duration-300 ${
              fullscreen ? 'h-[85vh]' : 'h-[520px]'
            }`}
          >
            <iframe
              src={PHET_URL}
              title="Natural Selection — PhET Interactive Simulations"
              className="w-full h-full border-0"
              allow="fullscreen"
              loading="lazy"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Learning mode panels ─────────────────────────────────────────── */}
      {mode === 'learning' && (
        <>
          {/* Phases quick reference */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm flex items-center gap-2">
                <Info size={16} />
                مراحل الانقسام الاختزالي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {PHASES.map(ph => (
                  <div
                    key={ph.id}
                    className="p-2.5 rounded-lg border border-border bg-muted/30 text-right"
                  >
                    <div className="font-cairo font-bold text-xs flex items-center gap-1.5 justify-end">
                      <span>{ph.name}</span>
                      <Badge variant="secondary" className="text-[10px] font-cairo">
                        {ph.id + 1}
                      </Badge>
                    </div>
                    <p className="text-[11px] font-noto text-muted-foreground mt-1">
                      {ph.desc}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Science panels */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="font-cairo text-sm text-purple-700">
                  🧬 المبدأ العلمي
                </CardTitle>
              </CardHeader>
              <CardContent className="font-cairo text-xs text-purple-900 dark:text-purple-200 space-y-2">
                <div className="bg-white dark:bg-purple-950 rounded p-2 border border-purple-200 text-center font-bold">
                  خلية أم (2n) → انقسامان → 4 خلايا جنسية (n)
                </div>
                <ul className="space-y-1 mt-1">
                  <li>• الانقسام I: يفصل الكروموسومات المتماثلة</li>
                  <li>• الانقسام II: يفصل الكروماتيدات الشقيقة</li>
                  <li>• العبور (Crossing-over) في الطور التمهيدي I</li>
                  <li>• الناتج: تنوع وراثي في الأمشاج</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-rose-200 bg-rose-50 dark:bg-rose-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="font-cairo text-sm text-rose-700">
                  ❓ أسئلة تحليلية
                </CardTitle>
              </CardHeader>
              <CardContent className="font-cairo text-xs text-rose-900 dark:text-rose-200 space-y-1.5">
                <div>١. كم عدد الكروموسومات في كل خلية ناتجة؟</div>
                <div>٢. متى تنفصل الكروماتيدات الشقيقة؟</div>
                <div>٣. ما أهمية العبور في الطور التمهيدي I؟</div>
                <div>٤. كيف تختلف الخلايا الأربع الناتجة وراثياً؟</div>
                <div className="mt-2 p-2 bg-rose-100 dark:bg-rose-900/30 rounded font-semibold">
                  الاستنتاج: الانقسام الاختزالي ينتج تنوعاً وراثياً عبر عمليتَي انقسام متتاليتَين.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key facts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm">📊 حقائق رئيسية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'الخلية الأم', value: '2n = 4', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
                  { label: 'بعد الانقسام I', value: '2 خلايا (n=2)', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200' },
                  { label: 'بعد الانقسام II', value: '4 خلايا (n=1)', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200' },
                  { label: 'النتيجة النهائية', value: '4 أمشاج مختلفة', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`rounded-lg p-3 text-center ${color}`}>
                    <div className="font-cairo text-xs font-medium">{label}</div>
                    <div className="font-cairo font-bold text-sm mt-1">{value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
