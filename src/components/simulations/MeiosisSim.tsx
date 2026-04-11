import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, ArrowClockwise, SkipForward } from '@phosphor-icons/react'

// ─── Canvas ───────────────────────────────────────────────────────────────────
const CW = 560, CH = 400

// ─── Phase data ───────────────────────────────────────────────────────────────
const PHASES = [
  { id: 0, name: 'خلية أم (2n=4)',    nameEn: 'Parent Cell',    desc: 'خلية ثنائية المجموعة تحتوي على 4 كروموسومات' },
  { id: 1, name: 'الطور التمهيدي I',  nameEn: 'Prophase I',     desc: 'تتكثف الكروموسومات وتتزاوج الأزواج المتماثلة (رباعيات)' },
  { id: 2, name: 'الطور الاستوائي I', nameEn: 'Metaphase I',    desc: 'تصطف الرباعيات على خط الاستواء' },
  { id: 3, name: 'الطور الانفصالي I', nameEn: 'Anaphase I',     desc: 'تنفصل الكروموسومات المتماثلة نحو القطبين' },
  { id: 4, name: 'الطور النهائي I',   nameEn: 'Telophase I',    desc: 'تتكون خليتان كل منهما أحادية (n=2)' },
  { id: 5, name: 'الطور التمهيدي II', nameEn: 'Prophase II',    desc: 'تتكثف الكروموسومات في كل خلية من الخليتين' },
  { id: 6, name: 'الطور الاستوائي II',nameEn: 'Metaphase II',   desc: 'تصطف الكروموسومات على خط الاستواء في كل خلية' },
  { id: 7, name: 'الطور الانفصالي II',nameEn: 'Anaphase II',    desc: 'تنفصل الكروماتيدات الشقيقة في كل خلية' },
  { id: 8, name: 'الطور النهائي II',  nameEn: 'Telophase II',   desc: 'تنتج 4 خلايا جنسية أحادية (n=1) مختلفة وراثياً' },
]

// Chromosome colors  (paternal pair: red/orange,  maternal pair: blue/purple)
const C1P = '#ef4444'  // Chr1 paternal
const C1M = '#3b82f6'  // Chr1 maternal
const C2P = '#f59e0b'  // Chr2 paternal
const C2M = '#8b5cf6'  // Chr2 maternal

// ─── Canvas helpers ───────────────────────────────────────────────────────────
function cell(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, opacity = 1) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(219,234,254,${opacity * 0.4})`; ctx.fill()
  ctx.strokeStyle = `rgba(100,116,139,${opacity})`; ctx.lineWidth = 2.5; ctx.stroke()
}

function nucleus(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, opacity = 0.7) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.strokeStyle = `rgba(100,116,139,${opacity})`; ctx.lineWidth = 1.5
  ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([])
}

function chrom(ctx: CanvasRenderingContext2D,
               x1: number, y1: number, x2: number, y2: number,
               color: string, w = 9, opacity = 1) {
  ctx.save(); ctx.globalAlpha = opacity
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  // centromere
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(mx, my, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function equator(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.strokeStyle = 'rgba(100,116,139,0.6)'; ctx.lineWidth = 1.5
  ctx.setLineDash([4, 3])
  ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke()
  ctx.setLineDash([])
}

function spindle(ctx: CanvasRenderingContext2D,
                 cx: number, topY: number, botY: number, r: number) {
  const pts = [-r * 0.6, -r * 0.25, 0, r * 0.25, r * 0.6]
  ctx.strokeStyle = 'rgba(148,163,184,0.45)'; ctx.lineWidth = 1; ctx.setLineDash([3, 4])
  for (const dx of pts) {
    ctx.beginPath(); ctx.moveTo(cx + dx, topY); ctx.lineTo(cx, (topY + botY) / 2)
    ctx.lineTo(cx + dx, botY); ctx.stroke()
  }
  ctx.setLineDash([])
}

// ─── Per-phase draw functions ─────────────────────────────────────────────────
function phase0(ctx: CanvasRenderingContext2D, t: number) {
  // Single cell, 4 chromosomes scattered
  const w = Math.sin(t * 1.4) * 2.5
  cell(ctx, 280, 200, 140)
  nucleus(ctx, 280, 200, 100)
  chrom(ctx, 248, 158+w,   248, 202+w,   C1P)
  chrom(ctx, 266, 160+w*.8, 266, 204+w*.8, C1M)
  chrom(ctx, 292, 156+w*1.2, 292, 200+w*1.2, C2P)
  chrom(ctx, 310, 159+w,   310, 203+w,   C2M)
}

function phase1(ctx: CanvasRenderingContext2D, t: number) {
  // Prophase I: homologs pairing (bivalents), nucleus dissolving
  const w = Math.sin(t * 1.8) * 3
  cell(ctx, 280, 200, 140)
  nucleus(ctx, 280, 200, 100, 0.25)  // dissolving
  // Pair 1 (red+blue together — bivalent)
  chrom(ctx, 250, 155+w,   250, 200+w,   C1P)
  chrom(ctx, 262, 158+w*.7, 262, 203+w*.7, C1M)
  // Pair 2 (orange+purple together)
  chrom(ctx, 295, 157+w*1.3, 295, 202+w*1.3, C2P)
  chrom(ctx, 307, 155+w*.9, 307, 200+w*.9, C2M)
  // crossing-over hint (thin dashed X between pair 1)
  ctx.strokeStyle = 'rgba(100,116,139,0.4)'; ctx.lineWidth = 1; ctx.setLineDash([2, 3])
  ctx.beginPath(); ctx.moveTo(250, 172); ctx.lineTo(262, 182); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(262, 172); ctx.lineTo(250, 182); ctx.stroke()
  ctx.setLineDash([])
}

function phase2(ctx: CanvasRenderingContext2D, t: number) {
  // Metaphase I: bivalents on equatorial plate
  const w = Math.sin(t * 2) * 2
  cell(ctx, 280, 200, 140)
  equator(ctx, 280, 200, 130)
  spindle(ctx, 280, 75, 325, 130)
  chrom(ctx, 236, 162+w, 236, 207+w, C1P)
  chrom(ctx, 249, 160+w, 249, 205+w, C1M)
  chrom(ctx, 311, 162+w, 311, 207+w, C2P)
  chrom(ctx, 324, 160+w, 324, 205+w, C2M)
}

function phase3(ctx: CanvasRenderingContext2D, t: number) {
  // Anaphase I: homologs moving to poles
  const shift = 45 + Math.sin(t * 0.5) * 2  // more static — just show split
  // Elongated cell
  ctx.beginPath(); ctx.ellipse(280, 200, 135, 160, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(219,234,254,0.35)'; ctx.fill()
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2.5; ctx.stroke()
  spindle(ctx, 280, 55, 345, 135)
  // Pair 1 moving up
  const uY = 200 - shift
  chrom(ctx, 255, uY - 22, 255, uY + 22, C1P, 9)
  chrom(ctx, 270, uY - 22, 270, uY + 22, C1M, 9)
  // Pair 2 moving down
  const dY = 200 + shift
  chrom(ctx, 290, dY - 22, 290, dY + 22, C2P, 9)
  chrom(ctx, 305, dY - 22, 305, dY + 22, C2M, 9)
}

function phase4(ctx: CanvasRenderingContext2D, t: number) {
  // Telophase I: two daughter cells
  const w = Math.sin(t * 1.5) * 2
  cell(ctx, 280, 125, 90)
  cell(ctx, 280, 275, 90)
  // Cell 1 (top): Chr1P + Chr1M
  nucleus(ctx, 280, 125, 65, 0.5)
  chrom(ctx, 262, 102+w, 262, 148+w, C1P, 8)
  chrom(ctx, 278, 100+w, 278, 146+w, C1M, 8)
  // Cell 2 (bottom): Chr2P + Chr2M
  nucleus(ctx, 280, 275, 65, 0.5)
  chrom(ctx, 283, 252+w, 283, 298+w, C2P, 8)
  chrom(ctx, 299, 252+w, 299, 298+w, C2M, 8)
  // Division label
  ctx.fillStyle = '#64748b'; ctx.font = '11px Cairo, Arial'; ctx.textAlign = 'center'
  ctx.fillText('n = 2', 280, 205)
}

function phase5or6(ctx: CanvasRenderingContext2D, t: number, metaphase: boolean) {
  // Two cells side by side (Meiosis II begins)
  const w = Math.sin(t * 1.6) * 2
  cell(ctx, 140, 200, 105)
  cell(ctx, 420, 200, 105)
  if (!metaphase) {
    nucleus(ctx, 140, 200, 72, 0.3)
    nucleus(ctx, 420, 200, 72, 0.3)
  } else {
    equator(ctx, 140, 200, 95)
    equator(ctx, 420, 200, 95)
    spindle(ctx, 140, 100, 300, 95)
    spindle(ctx, 420, 100, 300, 95)
  }
  // Left cell: Chr1P (sister chromatids drawn as two close lines)
  chrom(ctx, 125, 175+w, 125, 225+w, C1P, 8)
  chrom(ctx, 137, 175+w, 137, 225+w, C1P, 5, 0.7)  // sister chromatid
  // Left cell: Chr1M
  chrom(ctx, 152, 174+w, 152, 224+w, C1M, 8)
  chrom(ctx, 164, 174+w, 164, 224+w, C1M, 5, 0.7)
  // Right cell: Chr2P
  chrom(ctx, 405, 175+w, 405, 225+w, C2P, 8)
  chrom(ctx, 417, 175+w, 417, 225+w, C2P, 5, 0.7)
  // Right cell: Chr2M
  chrom(ctx, 432, 174+w, 432, 224+w, C2M, 8)
  chrom(ctx, 444, 174+w, 444, 224+w, C2M, 5, 0.7)
}

function phase7(ctx: CanvasRenderingContext2D, _t: number) {
  // Anaphase II: sister chromatids separating
  const gap = 35
  // Left cell (elongated)
  ctx.beginPath(); ctx.ellipse(140, 200, 100, 125, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(219,234,254,0.35)'; ctx.fill()
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2.5; ctx.stroke()
  spindle(ctx, 140, 80, 320, 100)
  chrom(ctx, 133, 200 - gap - 20, 133, 200 - gap + 20, C1P, 8)
  chrom(ctx, 147, 200 + gap - 20, 147, 200 + gap + 20, C1M, 8)
  // Right cell (elongated)
  ctx.beginPath(); ctx.ellipse(420, 200, 100, 125, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(219,234,254,0.35)'; ctx.fill()
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2.5; ctx.stroke()
  spindle(ctx, 420, 80, 320, 100)
  chrom(ctx, 413, 200 - gap - 20, 413, 200 - gap + 20, C2P, 8)
  chrom(ctx, 427, 200 + gap - 20, 427, 200 + gap + 20, C2M, 8)
}

function phase8(ctx: CanvasRenderingContext2D, t: number) {
  // Four daughter cells
  const w = Math.sin(t * 1.3) * 1.5
  const positions = [[140, 130], [420, 130], [140, 270], [420, 270]] as [number, number][]
  const colors = [C1P, C2P, C1M, C2M]
  positions.forEach(([cx, cy], i) => {
    cell(ctx, cx, cy, 75)
    nucleus(ctx, cx, cy, 50, 0.45)
    chrom(ctx, cx - 8, cy - 20 + w, cx - 8, cy + 20 + w, colors[i], 7)
    ctx.fillStyle = '#1e293b'; ctx.font = '10px Cairo, Arial'; ctx.textAlign = 'center'
    ctx.fillText('n = 1', cx, cy + 58)
  })
  ctx.fillStyle = '#16a34a'; ctx.font = 'bold 13px Cairo, Arial'; ctx.textAlign = 'center'
  ctx.fillText('✓ 4 خلايا جنسية أحادية', 280, CH - 10)
}

// ─── Phase dispatcher ─────────────────────────────────────────────────────────
function drawPhase(ctx: CanvasRenderingContext2D, phase: number, t: number) {
  switch (phase) {
    case 0: return phase0(ctx, t)
    case 1: return phase1(ctx, t)
    case 2: return phase2(ctx, t)
    case 3: return phase3(ctx, t)
    case 4: return phase4(ctx, t)
    case 5: return phase5or6(ctx, t, false)
    case 6: return phase5or6(ctx, t, true)
    case 7: return phase7(ctx, t)
    case 8: return phase8(ctx, t)
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export function MeiosisSim() {
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const rafRef        = useRef<number>()
  const timeRef       = useRef(0)
  const phaseRef      = useRef(0)
  const autoTimerRef  = useRef<NodeJS.Timeout>()

  const [mode, setMode]             = useState<'learning' | 'experiment'>('learning')
  const [currentPhase, setCurrentPhase] = useState(0)
  const [isAuto, setIsAuto]         = useState(false)

  // ── Draw loop ───────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    timeRef.current += 1 / 60
    const t     = timeRef.current
    const phase = phaseRef.current

    // Background
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, CW, CH)

    // Subtle grid
    ctx.strokeStyle = 'rgba(226,232,240,0.6)'; ctx.lineWidth = 1
    for (let x = 0; x <= CW; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke()
    }
    for (let y = 0; y <= CH; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke()
    }

    // Draw current phase
    drawPhase(ctx, phase, t)

    // Phase label (bottom bar)
    ctx.fillStyle = 'rgba(15,23,42,0.8)'
    ctx.fillRect(0, CH - 38, CW, 38)
    ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 14px Cairo, Arial, sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(PHASES[phase].name, 280, CH - 20)
    ctx.fillStyle = '#94a3b8'; ctx.font = '10px Arial'; ctx.textAlign = 'right'
    ctx.fillText(PHASES[phase].nameEn, CW - 10, CH - 6)

    // Phase counter
    ctx.fillStyle = 'rgba(15,23,42,0.75)'
    ctx.beginPath(); ctx.roundRect(8, 8, 70, 28, 5); ctx.fill()
    ctx.fillStyle = '#e2e8f0'; ctx.font = '12px Cairo, Arial'; ctx.textAlign = 'center'
    ctx.fillText(`${phase + 1} / ${PHASES.length}`, 43, 27)

    rafRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [draw])

  // Sync phaseRef with state
  useEffect(() => { phaseRef.current = currentPhase }, [currentPhase])

  // Auto-play timer
  useEffect(() => {
    if (isAuto) {
      autoTimerRef.current = setInterval(() => {
        setCurrentPhase(p => (p < PHASES.length - 1 ? p + 1 : 0))
      }, 3000)
    } else {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current)
    }
    return () => { if (autoTimerRef.current) clearInterval(autoTimerRef.current) }
  }, [isAuto])

  const reset = () => {
    setCurrentPhase(0)
    setIsAuto(false)
    timeRef.current = 0
  }

  const nextPhase = () => {
    setCurrentPhase(p => (p < PHASES.length - 1 ? p + 1 : p))
  }

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4" dir="rtl">

      <div className="flex gap-2 justify-center flex-wrap">
        <Button variant={mode === 'learning' ? 'default' : 'outline'} onClick={() => setMode('learning')} className="font-cairo">💡 التعلم</Button>
        <Button variant={mode === 'experiment' ? 'default' : 'outline'} onClick={() => setMode('experiment')} className="font-cairo">🔬 الملاحظة</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">

        {/* Canvas */}
        <div className="lg:col-span-2 space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-base">🔬 الانقسام الاختزالي — {PHASES[currentPhase].name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl overflow-hidden border-2 border-purple-200">
                <canvas ref={canvasRef} width={CW} height={CH} className="w-full block" />
              </div>
              <div className="flex gap-2 mt-3 justify-center flex-wrap">
                <Button
                  onClick={() => setIsAuto(a => !a)}
                  className="gap-2 font-cairo"
                  variant={isAuto ? 'default' : 'outline'}
                >
                  {isAuto ? <><Pause size={16} weight="fill" />إيقاف التشغيل التلقائي</> : <><Play size={16} weight="fill" />تشغيل تلقائي</>}
                </Button>
                <Button onClick={nextPhase} disabled={currentPhase >= PHASES.length - 1 || isAuto}
                  className="gap-2 font-cairo">
                  <SkipForward size={16} weight="fill" />الطور التالي
                </Button>
                <Button onClick={reset} variant="outline" className="gap-2 font-cairo">
                  <ArrowClockwise size={16} />إعادة
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Phase progress strip */}
          <Card>
            <CardContent className="pt-3">
              <div className="grid grid-cols-5 gap-1.5">
                {PHASES.slice(0, 5).map((ph, i) => (
                  <button key={ph.id} onClick={() => { setCurrentPhase(i); setIsAuto(false) }}
                    className={`p-2 rounded-lg border-2 text-right transition-all text-xs font-cairo ${currentPhase === i ? 'border-primary bg-primary/10 font-bold' : 'border-border hover:border-primary/40'}`}>
                    {ph.name.replace('الطور ', '')}
                  </button>
                ))}
                {PHASES.slice(5).map((ph, i) => (
                  <button key={ph.id} onClick={() => { setCurrentPhase(i + 5); setIsAuto(false) }}
                    className={`p-2 rounded-lg border-2 text-right transition-all text-xs font-cairo ${currentPhase === i + 5 ? 'border-primary bg-primary/10 font-bold' : 'border-border hover:border-primary/40'}`}>
                    {ph.name.replace('الطور ', '')}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info panel */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="font-cairo text-sm">📌 الطور الحالي</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-cairo font-medium text-sm">المرحلة:</span>
                <Badge className="font-cairo">{currentPhase + 1} / {PHASES.length}</Badge>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <h4 className="font-cairo font-bold">{PHASES[currentPhase].name}</h4>
                <p className="text-xs font-noto text-muted-foreground mt-1">{PHASES[currentPhase].desc}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="font-cairo text-sm">🎨 رموز الكروموسومات</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { color: C1P, label: 'Chr1 — أبوي (paternal)' },
                { color: C1M, label: 'Chr1 — أمومي (maternal)' },
                { color: C2P, label: 'Chr2 — أبوي (paternal)' },
                { color: C2M, label: 'Chr2 — أمومي (maternal)' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs font-cairo">
                  <div className="w-7 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span>{label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="font-cairo text-sm">📊 إحصاءات</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-xs font-cairo">
              {[
                { label: 'الخلية الأم', value: '2n = 4' },
                { label: 'بعد الانقسام I', value: 'خليتان (n=2)' },
                { label: 'بعد الانقسام II', value: '4 خلايا (n=1)' },
                { label: 'النتيجة', value: '4 أمشاج مختلفة' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{label}</span>
                  <Badge variant="outline" className="font-cairo text-xs">{value}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {mode === 'learning' && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm text-purple-700">🧬 مبدأ الانقسام الاختزالي</CardTitle>
            </CardHeader>
            <CardContent className="font-cairo text-xs text-purple-900 dark:text-purple-200 space-y-1.5">
              <div className="bg-white dark:bg-purple-950 rounded p-2 border border-purple-200 text-center font-bold">
                خلية أم (2n) → 4 خلايا جنسية (n)
              </div>
              <ul className="space-y-1 mt-2">
                <li>• الانقسام I: يفصل الكروموسومات المتماثلة</li>
                <li>• الانقسام II: يفصل الكروماتيدات الشقيقة</li>
                <li>• العبور (crossing-over) في الطور التمهيدي I</li>
                <li>• الناتج: تنوع وراثي في الأمشاج</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-rose-200 bg-rose-50 dark:bg-rose-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm text-rose-700">❓ أسئلة تحليلية</CardTitle>
            </CardHeader>
            <CardContent className="font-cairo text-xs text-rose-900 dark:text-rose-200 space-y-1.5">
              <div>١. كم عدد الكروموسومات في كل خلية ناتجة؟</div>
              <div>٢. متى تنفصل الكروماتيدات الشقيقة؟</div>
              <div>٣. ما أهمية العبور في الطور التمهيدي I؟</div>
              <div>٤. كيف تختلف الخلايا الأربع الناتجة وراثياً؟</div>
              <div className="mt-2 p-2 bg-rose-100 dark:bg-rose-900/30 rounded font-semibold">
                الاستنتاج: الانقسام الاختزالي ينتج تنوعاً وراثياً في خلايا (n) عبر عمليتَي انقسام.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
