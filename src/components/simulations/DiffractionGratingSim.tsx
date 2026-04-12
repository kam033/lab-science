import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowsOut, ArrowsIn } from '@phosphor-icons/react'

const PHET_URL =
  'https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_all.html'

export function DiffractionGratingSim() {
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <div className="space-y-3" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="font-cairo font-bold text-base">
            🔬 قياس طول موجة الليزر باستخدام محزوز الحيود
          </h3>
          <p className="text-xs text-muted-foreground font-cairo mt-0.5">
            محاكاة PhET — Wave Interference
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 font-cairo text-xs shrink-0"
          onClick={() => setFullscreen(f => !f)}
        >
          {fullscreen ? <ArrowsIn size={14} /> : <ArrowsOut size={14} />}
          {fullscreen ? 'تصغير' : 'تكبير'}
        </Button>
      </div>

      {/* Instruction banner */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 text-xs font-cairo text-blue-800 dark:text-blue-200">
        💡 اختر تبويب <strong>Interference</strong> في المحاكاة، ثم غيّر عدد الشقوق لترى نمط الحيود. قس المسافة بين الأهداب لحساب الطول الموجي.
      </div>

      {/* PhET iframe */}
      <div
        className={`w-full rounded-xl overflow-hidden transition-all duration-300 border border-border ${
          fullscreen ? 'h-[88vh]' : 'h-[600px]'
        }`}
      >
        <iframe
          src={PHET_URL}
          title="Wave Interference — PhET Interactive Simulations"
          className="w-full h-full border-0 block"
          allow="fullscreen"
          loading="lazy"
        />
      </div>

      {/* Formula card */}
      <div className="bg-muted/40 rounded-lg p-3 text-xs font-cairo space-y-1">
        <p className="font-semibold text-sm">العلاقة الرياضية:</p>
        <p className="font-mono text-base text-center py-1">
          d sin θ = m λ
        </p>
        <div className="grid grid-cols-2 gap-1 text-muted-foreground">
          <span><strong>d</strong> = المسافة بين الخطوط (mm)</span>
          <span><strong>θ</strong> = زاوية الانحراف</span>
          <span><strong>m</strong> = رتبة الهدب (1، 2، 3…)</span>
          <span><strong>λ</strong> = الطول الموجي (nm)</span>
        </div>
      </div>

    </div>
  )
}
