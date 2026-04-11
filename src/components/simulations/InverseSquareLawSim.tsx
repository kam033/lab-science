import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowsOut, ArrowsIn } from '@phosphor-icons/react'

const PHET_URL =
  'https://phet.colorado.edu/sims/html/sound-waves/latest/sound-waves_all.html'

export function InverseSquareLawSim() {
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <div className="space-y-3" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="font-cairo font-bold text-base">
            🌊 قانون التربيع العكسي للموجات من مصدر نقطي
          </h3>
          <p className="text-xs text-muted-foreground font-cairo mt-0.5">
            محاكاة PhET — Sound Waves
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

      {/* PhET iframe */}
      <div
        className={`w-full rounded-xl overflow-hidden transition-all duration-300 ${
          fullscreen ? 'h-[88vh]' : 'h-[600px]'
        }`}
      >
        <iframe
          src={PHET_URL}
          title="Sound Waves — PhET Interactive Simulations"
          className="w-full h-full border-0 block"
          allow="fullscreen"
          loading="lazy"
        />
      </div>

    </div>
  )
}
