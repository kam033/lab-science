import { useState, useCallback, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { ArrowClockwise, Play, Pause } from '@phosphor-icons/react'

// ─── Solutions data ──────────────────────────────────────────────────────────
const SOLUTIONS = [
  { id: 'battery',  name: 'حمض البطارية',  ph: 1.0,  color: '#ff2200' },
  { id: 'lemon',    name: 'عصير الليمون',  ph: 2.5,  color: '#ffcc00' },
  { id: 'vinegar',  name: 'خل',             ph: 3.0,  color: '#ffe066' },
  { id: 'coffee',   name: 'قهوة',           ph: 5.0,  color: '#b5651d' },
  { id: 'milk',     name: 'حليب',           ph: 6.5,  color: '#f0f0e8' },
  { id: 'water',    name: 'ماء',            ph: 7.0,  color: '#a8d8ea' },
  { id: 'blood',    name: 'دم',             ph: 7.4,  color: '#cc0000' },
  { id: 'seawater', name: 'ماء البحر',      ph: 8.0,  color: '#5ba4cf' },
  { id: 'soap',     name: 'صابون اليد',     ph: 10.0, color: '#a8e6cf' },
  { id: 'bleach',   name: 'مبيّض',          ph: 13.0, color: '#d4efdf' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function phToH3O(ph: number) { return Math.pow(10, -ph) }
function phToOH(ph: number)  { return Math.pow(10, -(14 - ph)) }
function sciStr(v: number) {
  if (v === 0) return '0'
  const exp = Math.floor(Math.log10(v))
  const coef = v / Math.pow(10, exp)
  return `${coef.toFixed(1)} × 10${supScript(exp)}`
}
function supScript(n: number) {
  const map: Record<string, string> = { '-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹' }
  return String(n).split('').map(c => map[c] ?? c).join('')
}

// pH → background colour of solution (blue-green-yellow-red)
function phColor(ph: number) {
  if (ph <= 2)  return '#ff2a00'
  if (ph <= 4)  return '#ff8c00'
  if (ph <= 6)  return '#ffe066'
  if (ph <= 7)  return '#a8d8ea'
  if (ph <= 9)  return '#90ee90'
  if (ph <= 12) return '#5ba4cf'
  return '#4040cc'
}

// ─── pH Scale bar ─────────────────────────────────────────────────────────────
function PHScaleBar({ ph }: { ph: number }) {
  const pct = ((14 - ph) / 14) * 100
  return (
    <div className="flex gap-2 items-stretch h-64 select-none">
      {/* labels */}
      <div className="flex flex-col justify-between text-xs text-muted-foreground w-5 text-left" style={{direction:'ltr'}}>
        {[14,12,10,8,6,4,2,0].map(v => (
          <span key={v} className="leading-none">{v}</span>
        ))}
      </div>
      {/* gradient bar */}
      <div className="relative w-10 rounded-lg overflow-hidden border border-border/30"
        style={{background:'linear-gradient(to bottom, #4040cc 0%, #5ba4cf 20%, #90ee90 43%, #a8d8ea 50%, #ffe066 60%, #ff8c00 75%, #ff2a00 100%)'}}>
        {/* indicator */}
        <div className="absolute left-0 right-0 flex items-center" style={{top:`${pct}%`, transform:'translateY(-50%)'}}>
          <div className="w-full h-0.5 bg-white/80"/>
          <div className="absolute -right-1 w-3 h-3 bg-white border-2 border-gray-500 rounded-full"/>
        </div>
      </div>
      {/* side labels */}
      <div className="flex flex-col justify-between text-xs font-bold w-10">
        <span className="text-blue-400">قاعدة</span>
        <span className="text-gray-400 text-center">7</span>
        <span className="text-red-400">حمض</span>
      </div>
    </div>
  )
}

// ─── Beaker component ─────────────────────────────────────────────────────────
function Beaker({ ph, volume }: { ph: number; volume: number }) {
  const fillPct = Math.min(volume / 1.2, 1) * 75
  const color = phColor(ph)
  return (
    <div className="relative w-32 h-44 mx-auto">
      {/* beaker outline */}
      <svg viewBox="0 0 100 140" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* liquid fill */}
        <clipPath id="beakerClip">
          <rect x="10" y="20" width="80" height="110" rx="2"/>
        </clipPath>
        <rect
          x="10" y={140 - fillPct * 1.1} width="80" height={fillPct * 1.1}
          fill={color} opacity="0.75" clipPath="url(#beakerClip)"
        />
        {/* beaker glass */}
        <path d="M10 20 L10 130 Q10 140 20 140 L80 140 Q90 140 90 130 L90 20 Z"
          fill="none" stroke="rgba(150,150,200,0.6)" strokeWidth="3"/>
        <line x1="10" y1="20" x2="90" y2="20" stroke="rgba(150,150,200,0.6)" strokeWidth="3"/>
        {/* tick marks */}
        {[0.5, 1].map((v, i) => {
          const y = 130 - v / 1.2 * 82
          return (
            <g key={i}>
              <line x1="80" y1={y} x2="88" y2={y} stroke="rgba(150,150,200,0.8)" strokeWidth="1.5"/>
              <text x="92" y={y+4} fontSize="8" fill="rgba(150,150,200,0.8)">{v === 0.5 ? '½L' : '1L'}</text>
            </g>
          )
        })}
        {/* neutral label */}
        {Math.abs(ph - 7) < 0.1 && (
          <text x="50" y="105" textAnchor="middle" fontSize="9" fill="rgba(100,150,200,0.9)" fontWeight="bold">محايد</text>
        )}
      </svg>
      {/* volume indicator */}
      <div className="absolute -right-12 text-xs font-bold text-foreground" style={{top:`${100 - fillPct * 0.75}%`, transform:'translateY(-50%)'}}>
        ◄ {volume.toFixed(2)} L
      </div>
    </div>
  )
}

// ─── Concentration scale ──────────────────────────────────────────────────────
function ConcentrationScale({ ph }: { ph: number }) {
  const h3o = phToH3O(ph)
  const oh  = phToOH(ph)
  const logScale = [-16, -14, -12, -10, -8, -6, -4, -2, 0, 2]
  const toY = (logVal: number) => ((2 - logVal) / 18) * 100

  const h3oLog = Math.log10(h3o)
  const ohLog  = Math.log10(oh)

  return (
    <div className="relative h-64 w-48 bg-card/30 rounded-xl border border-border/20 p-2">
      <div className="text-xs text-center text-muted-foreground mb-1">التركيز (mol/L)</div>
      {/* scale axis */}
      <div className="absolute left-16 top-8 bottom-4 w-6 bg-gray-700/40 rounded" style={{direction:'ltr'}}>
        {logScale.map(exp => (
          <div key={exp} className="absolute text-xs text-muted-foreground"
            style={{top:`${toY(exp)}%`, right:'110%', transform:'translateY(-50%)', whiteSpace:'nowrap'}}>
            10{supScript(exp)}
          </div>
        ))}
        {/* H3O+ marker */}
        <div className="absolute left-full ml-1 flex items-center gap-1"
          style={{top:`${toY(h3oLog)}%`, transform:'translateY(-50%)'}}>
          <div className="bg-red-500/80 text-white text-xs px-1.5 py-0.5 rounded-lg whitespace-nowrap">
            {sciStr(h3o)}<br/><span className="text-[9px]">H₃O⁺</span>
          </div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
        </div>
        {/* OH- marker */}
        <div className="absolute right-full mr-1 flex items-center gap-1 flex-row-reverse"
          style={{top:`${toY(ohLog)}%`, transform:'translateY(-50%)'}}>
          <div className="bg-blue-500/80 text-white text-xs px-1.5 py-0.5 rounded-lg whitespace-nowrap">
            {sciStr(oh)}<br/><span className="text-[9px]">OH⁻</span>
          </div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"/>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function PHTitrationSim() {
  const [mode, setMode] = useState<'simple' | 'micro' | 'custom'>('simple')
  const [selectedSolution, setSelectedSolution] = useState(SOLUTIONS.find(s => s.id === 'water')!)
  const [customPH, setCustomPH] = useState(7.0)
  const [volume, setVolume] = useState(0.50)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const activePH = mode === 'custom' ? customPH : selectedSolution.ph
  const h3o = phToH3O(activePH)
  const oh  = phToOH(activePH)

  const reset = useCallback(() => {
    setIsRunning(false)
    setSelectedSolution(SOLUTIONS.find(s => s.id === 'water')!)
    setCustomPH(7.0)
    setVolume(0.50)
    setMode('simple')
  }, [])

  // Auto-titration: in custom mode sweep pH; otherwise cycle through solutions
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
      return
    }
    intervalRef.current = setInterval(() => {
      if (mode === 'custom') {
        setCustomPH(p => {
          const next = +(p + 0.5).toFixed(2)
          if (next > 14) { setIsRunning(false); return 14 }
          return next
        })
      } else {
        setSelectedSolution(prev => {
          const idx = SOLUTIONS.findIndex(s => s.id === prev.id)
          return SOLUTIONS[(idx + 1) % SOLUTIONS.length]
        })
      }
    }, 900)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, mode])

  const addWater = () => setVolume(v => Math.min(v + 0.1, 1.2))
  const drainSome = () => setVolume(v => Math.max(v - 0.1, 0))

  return (
    <div className="space-y-4 font-cairo" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-base text-foreground">🧪 مقياس الرقم الهيدروجيني pH</h3>
          <p className="text-xs text-muted-foreground mt-0.5">الوحدة 1 — الكيمياء التحليلية</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={isRunning ? 'secondary' : 'default'}
            className="gap-1.5 text-xs" onClick={() => setIsRunning(r => !r)}>
            {isRunning ? <><Pause size={13} weight="fill"/> إيقاف</> : <><Play size={13} weight="fill"/> تشغيل</>}
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={reset}>
            <ArrowClockwise size={13}/> إعادة ضبط
          </Button>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 bg-muted/30 p-1 rounded-xl">
        {[['simple','بسيط'],['micro','مجهري'],['custom','مخصص']].map(([k,lbl])=>(
          <button key={k}
            className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all
              ${mode===k ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={()=>setMode(k as 'simple'|'micro'|'custom')}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Main simulation area */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">

        {/* pH Scale bar */}
        <div className="flex justify-center">
          <PHScaleBar ph={activePH}/>
        </div>

        {/* Beaker + controls */}
        <div className="space-y-3">
          {/* Solution selector (not in custom mode) */}
          {mode !== 'custom' && (
            <div className="bg-card/40 border border-border/30 rounded-xl p-2">
              <p className="text-xs text-muted-foreground mb-1.5">اختر المحلول:</p>
              <div className="flex flex-wrap gap-1">
                {SOLUTIONS.map(s => (
                  <button key={s.id}
                    onClick={() => setSelectedSolution(s)}
                    className={`text-xs px-2 py-1 rounded-lg border transition-all
                      ${selectedSolution.id === s.id
                        ? 'border-primary bg-primary/20 text-primary font-bold'
                        : 'border-border/30 text-muted-foreground hover:border-primary/50'}`}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom pH slider */}
          {mode === 'custom' && (
            <div className="bg-card/40 border border-border/30 rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-primary">الرقم الهيدروجيني</span>
                <Badge variant="secondary">pH = {customPH.toFixed(2)}</Badge>
              </div>
              <Slider value={[customPH]} onValueChange={([v]) => setCustomPH(v)}
                min={0} max={14} step={0.01}/>
              <p className="text-xs text-muted-foreground text-center">
                {customPH < 6.9 ? '🔴 حمضي' : customPH > 7.1 ? '🔵 قاعدي' : '⚪ محايد'}
              </p>
            </div>
          )}

          {/* Beaker */}
          <div className="relative">
            <Beaker ph={activePH} volume={volume}/>
          </div>

          {/* Water tap buttons */}
          <div className="flex gap-2 justify-center">
            <Button size="sm" variant="outline" className="text-xs gap-1" onClick={addWater}>
              🚰 إضافة ماء
            </Button>
            <Button size="sm" variant="outline" className="text-xs gap-1" onClick={drainSome}>
              🔽 تفريغ
            </Button>
          </div>
        </div>

        {/* Right panel: pH meter + concentration */}
        <div className="space-y-3">

          {/* pH Display */}
          <div className="bg-gray-800/80 border border-gray-600 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">pH</p>
            <p className="text-4xl font-bold font-mono"
              style={{color: activePH < 7 ? '#ff6b6b' : activePH > 7 ? '#74b9ff' : '#a8d8ea'}}>
              {activePH.toFixed(2)}
            </p>
            <Badge
              className="mt-2"
              style={{background: activePH < 6.5 ? '#ff4444' : activePH > 7.5 ? '#4444ff' : '#44aa88'}}>
              {activePH < 6.5 ? 'حمضي' : activePH > 7.5 ? 'قاعدي' : 'محايد'}
            </Badge>
          </div>

          {/* Concentrations (micro/custom mode) */}
          {mode !== 'simple' && (
            <div className="space-y-2">
              <ConcentrationScale ph={activePH}/>
            </div>
          )}

          {/* Concentration values */}
          <div className="space-y-2 text-xs">
            <div className="bg-red-950/40 border border-red-500/20 rounded-xl p-2.5 flex justify-between items-center">
              <span className="text-red-300 font-bold">[H₃O⁺]</span>
              <span className="font-mono text-red-200">{sciStr(h3o)} mol/L</span>
            </div>
            <div className="bg-blue-950/40 border border-blue-500/20 rounded-xl p-2.5 flex justify-between items-center">
              <span className="text-blue-300 font-bold">[OH⁻]</span>
              <span className="font-mono text-blue-200">{sciStr(oh)} mol/L</span>
            </div>
            <div className="bg-card/40 border border-border/20 rounded-xl p-2.5 flex justify-between items-center">
              <span className="text-muted-foreground">Kw</span>
              <span className="font-mono text-xs">1.0 × 10⁻¹⁴</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formula */}
      <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-4">
        <p className="text-sm font-bold text-indigo-300 mb-3">📐 العلاقات الرياضية</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="bg-indigo-900/30 rounded-lg p-2">
            <div className="font-mono text-indigo-200 text-sm">pH = −log[H₃O⁺]</div>
          </div>
          <div className="bg-indigo-900/30 rounded-lg p-2">
            <div className="font-mono text-indigo-200 text-sm">pH + pOH = 14</div>
          </div>
          <div className="bg-indigo-900/30 rounded-lg p-2">
            <div className="font-mono text-indigo-200 text-sm">Kw = [H₃O⁺][OH⁻] = 10⁻¹⁴</div>
          </div>
        </div>
      </div>

      {/* pH scale reference */}
      <div className="bg-card/30 border border-border/20 rounded-xl p-3">
        <p className="text-xs font-bold text-muted-foreground mb-2">مرجع: pH لمواد شائعة</p>
        <div className="flex gap-1 flex-wrap">
          {SOLUTIONS.map(s => (
            <div key={s.id} className="text-xs flex items-center gap-1 bg-card/50 px-2 py-1 rounded-lg">
              <div className="w-3 h-3 rounded-full border border-border/30" style={{background: s.color}}/>
              <span className="text-muted-foreground">{s.name}</span>
              <span className="font-bold text-foreground">{s.ph}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
