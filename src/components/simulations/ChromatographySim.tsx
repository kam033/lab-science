import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, ArrowClockwise } from '@phosphor-icons/react'

// ─── Canvas dimensions ────────────────────────────────────────────────────────
const CW = 560
const CH = 420

// ─── Paper layout ─────────────────────────────────────────────────────────────
const PAPER_X   = 200   // left edge of chromatography paper
const PAPER_W   = 160   // paper width
const PAPER_TOP = 30    // paper top y
const PAPER_BOT = CH - 30 // paper bottom y
const PAPER_H   = PAPER_BOT - PAPER_TOP

// baseline where pigment spot is applied (20px from bottom)
const BASELINE_Y = PAPER_BOT - 25
// solvent level starts just below baseline
const SOLVENT_START_Y = PAPER_BOT - 10

// ─── Pigment data (Rf values and colours) ─────────────────────────────────────
const PIGMENTS = [
  { name: 'كاروتينات',   nameEn: 'Carotenoids',  Rf: 0.95, color: '#f59e0b', textColor: '#92400e' },
  { name: 'زانثوفيل',    nameEn: 'Xanthophylls', Rf: 0.71, color: '#facc15', textColor: '#713f12' },
  { name: 'كلوروفيل أ',  nameEn: 'Chl a',        Rf: 0.59, color: '#16a34a', textColor: '#14532d' },
  { name: 'كلوروفيل ب',  nameEn: 'Chl b',        Rf: 0.42, color: '#4ade80', textColor: '#14532d' },
]

// maximum travel distance of solvent (from baseline upwards)
const MAX_TRAVEL = BASELINE_Y - PAPER_TOP - 20

// ─── Component ────────────────────────────────────────────────────────────────
export function ChromatographySim() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>()

  // progress: 0 → 1  (fraction of solvent travel)
  const progressRef = useRef(0)
  const isRunningRef = useRef(false)

  const [progress, setProgress]     = useState(0)
  const [isRunning, setIsRunning]   = useState(false)
  const [mode, setMode]             = useState<'learning' | 'experiment'>('learning')
  const [showRf, setShowRf]         = useState(false)
  const [speed, setSpeed]           = useState(1)
  const speedRef = useRef(1)

  // ── Draw ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Advance progress
    if (isRunningRef.current && progressRef.current < 1) {
      progressRef.current = Math.min(1, progressRef.current + 0.0015 * speedRef.current)
      setProgress(progressRef.current)
      if (progressRef.current >= 1) {
        isRunningRef.current = false
        setIsRunning(false)
        setShowRf(true)
      }
    }

    const p = progressRef.current

    // ── Background ──────────────────────────────────────────────────────────
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, CW, CH)

    // ── Test tube (container) ────────────────────────────────────────────────
    // Draw a rounded test tube outline on the left side of canvas
    const tubeX = 70
    const tubeW = 90
    const tubeTop = PAPER_TOP - 10
    const tubeBot = PAPER_BOT + 5

    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(tubeX, tubeTop)
    ctx.lineTo(tubeX, tubeBot - 20)
    ctx.arc(tubeX + tubeW / 2, tubeBot - 20, tubeW / 2, Math.PI, 0)
    ctx.lineTo(tubeX + tubeW, tubeTop)
    ctx.stroke()

    // Solvent inside tube (petroleum ether) - a pale yellow tint
    const solventFillBot = tubeBot - 20
    const solventFillTop = SOLVENT_START_Y
    ctx.fillStyle = 'rgba(254, 240, 138, 0.35)'
    ctx.beginPath()
    ctx.rect(tubeX + 2, solventFillTop, tubeW - 4, solventFillBot - solventFillTop)
    ctx.fill()

    // Solvent label
    ctx.fillStyle = '#713f12'
    ctx.font = '10px Cairo, Arial'
    ctx.textAlign = 'center'
    ctx.fillText('مذيب', tubeX + tubeW / 2, tubeBot + 18)
    ctx.fillText('(بترول أثير)', tubeX + tubeW / 2, tubeBot + 30)

    // ── Chromatography paper ─────────────────────────────────────────────────
    // Paper background
    ctx.fillStyle = '#fffbeb'
    ctx.fillRect(PAPER_X, PAPER_TOP, PAPER_W, PAPER_H)
    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 1.5
    ctx.strokeRect(PAPER_X, PAPER_TOP, PAPER_W, PAPER_H)

    // Paper texture lines (horizontal light lines)
    ctx.strokeStyle = 'rgba(209,213,219,0.4)'
    ctx.lineWidth = 0.5
    for (let y = PAPER_TOP + 15; y < PAPER_BOT; y += 15) {
      ctx.beginPath()
      ctx.moveTo(PAPER_X, y)
      ctx.lineTo(PAPER_X + PAPER_W, y)
      ctx.stroke()
    }

    // ── Solvent front on paper ────────────────────────────────────────────────
    const solventY = BASELINE_Y - p * MAX_TRAVEL
    if (p > 0) {
      // Wet area (slightly tinted)
      ctx.fillStyle = 'rgba(254, 240, 138, 0.18)'
      ctx.fillRect(PAPER_X, solventY, PAPER_W, BASELINE_Y - solventY)

      // Solvent front line
      ctx.strokeStyle = '#d97706'
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 3])
      ctx.beginPath()
      ctx.moveTo(PAPER_X, solventY)
      ctx.lineTo(PAPER_X + PAPER_W, solventY)
      ctx.stroke()
      ctx.setLineDash([])

      // Solvent front label (right side)
      ctx.fillStyle = '#92400e'
      ctx.font = '9px Cairo, Arial'
      ctx.textAlign = 'left'
      ctx.fillText('جبهة المذيب', PAPER_X + PAPER_W + 6, solventY + 3)
    }

    // ── Baseline ─────────────────────────────────────────────────────────────
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(PAPER_X, BASELINE_Y)
    ctx.lineTo(PAPER_X + PAPER_W, BASELINE_Y)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = '#64748b'
    ctx.font = '9px Cairo, Arial'
    ctx.textAlign = 'left'
    ctx.fillText('خط البداية', PAPER_X + PAPER_W + 6, BASELINE_Y + 3)

    // ── Pigment bands ─────────────────────────────────────────────────────────
    for (const pig of PIGMENTS) {
      // pigment band y = baseline - Rf * solvent_distance_so_far
      const bandY = BASELINE_Y - pig.Rf * p * MAX_TRAVEL
      if (bandY > PAPER_TOP && bandY < BASELINE_Y) {
        const bandH = 10
        // Band gradient
        const grd = ctx.createLinearGradient(PAPER_X, bandY - bandH / 2, PAPER_X, bandY + bandH / 2)
        grd.addColorStop(0, pig.color + 'aa')
        grd.addColorStop(0.5, pig.color)
        grd.addColorStop(1, pig.color + 'aa')
        ctx.fillStyle = grd
        ctx.fillRect(PAPER_X + 8, bandY - bandH / 2, PAPER_W - 16, bandH)

        // Band border
        ctx.strokeStyle = pig.color
        ctx.lineWidth = 1
        ctx.strokeRect(PAPER_X + 8, bandY - bandH / 2, PAPER_W - 16, bandH)

        // Band name (left of paper)
        ctx.fillStyle = pig.textColor
        ctx.font = 'bold 9px Cairo, Arial'
        ctx.textAlign = 'right'
        ctx.fillText(pig.name, PAPER_X - 6, bandY + 3)
      }
    }

    // ── Original spot (before separation) ─────────────────────────────────────
    if (p < 0.05) {
      // Show green dot at baseline
      ctx.fillStyle = '#16a34a'
      ctx.beginPath()
      ctx.arc(PAPER_X + PAPER_W / 2, BASELINE_Y, 5, 0, Math.PI * 2)
      ctx.fill()
    }

    // ── Rf annotations (show when done) ──────────────────────────────────────
    if (p >= 1 && showRf) {
      const solventDist = MAX_TRAVEL
      for (const pig of PIGMENTS) {
        const bandY = BASELINE_Y - pig.Rf * solventDist
        const pigDist = pig.Rf * solventDist

        // Dashed line from band to right of paper
        ctx.strokeStyle = pig.color
        ctx.lineWidth = 0.8
        ctx.setLineDash([2, 2])
        ctx.beginPath()
        ctx.moveTo(PAPER_X + PAPER_W, bandY)
        ctx.lineTo(PAPER_X + PAPER_W + 4, bandY)
        ctx.stroke()
        ctx.setLineDash([])

        // Rf value label
        ctx.fillStyle = pig.textColor
        ctx.font = 'bold 9px Cairo, Arial'
        ctx.textAlign = 'left'
        ctx.fillText(
          `Rf=${pig.Rf.toFixed(2)}  (${Math.round(pigDist)}/${Math.round(solventDist)}mm)`,
          PAPER_X + PAPER_W + 8,
          bandY + 3
        )
      }
    }

    // ── Labels ────────────────────────────────────────────────────────────────
    ctx.fillStyle = '#1e293b'
    ctx.font = 'bold 11px Cairo, Arial'
    ctx.textAlign = 'center'
    ctx.fillText('ورق كروماتوغرافيا', PAPER_X + PAPER_W / 2, PAPER_TOP - 10)

    // Progress indicator
    if (p > 0 && p < 1) {
      ctx.fillStyle = 'rgba(15,23,42,0.7)'
      ctx.beginPath()
      ctx.roundRect(CW - 145, 8, 135, 28, 5)
      ctx.fill()
      ctx.fillStyle = '#fde047'
      ctx.font = 'bold 11px Cairo, Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`التقدم: ${Math.round(p * 100)}%`, CW - 77, 27)
    }
    if (p >= 1) {
      ctx.fillStyle = 'rgba(22,163,74,0.85)'
      ctx.beginPath()
      ctx.roundRect(CW - 145, 8, 135, 28, 5)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 11px Cairo, Arial'
      ctx.textAlign = 'center'
      ctx.fillText('اكتملت التجربة ✓', CW - 77, 27)
    }

    rafRef.current = requestAnimationFrame(draw)
  }, [showRf])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [draw])

  useEffect(() => { isRunningRef.current = isRunning }, [isRunning])
  useEffect(() => { speedRef.current = speed }, [speed])

  const reset = () => {
    progressRef.current = 0
    isRunningRef.current = false
    setProgress(0)
    setIsRunning(false)
    setShowRf(false)
  }

  const solventFrontDist = Math.round(progress * MAX_TRAVEL)

  // ── JSX ───────────────────────────────────────────────────────────────────
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
          🔬 التجربة
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">

        {/* Canvas */}
        <div className="lg:col-span-2 space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-base">
                🌿 فصل صبغات التمثيل الضوئي بالكروماتوغرافيا الورقية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl overflow-hidden border-2 border-green-200">
                <canvas ref={canvasRef} width={CW} height={CH} className="w-full block" />
              </div>
              <div className="flex gap-2 mt-3 justify-center flex-wrap">
                <Button
                  onClick={() => setIsRunning(r => !r)}
                  disabled={progress >= 1}
                  className="gap-2 font-cairo"
                >
                  {isRunning
                    ? <><Pause size={16} weight="fill" />إيقاف</>
                    : <><Play size={16} weight="fill" />تشغيل</>
                  }
                </Button>
                <Button onClick={reset} variant="outline" className="gap-2 font-cairo">
                  <ArrowClockwise size={16} />إعادة ضبط
                </Button>
                {progress >= 1 && (
                  <Button
                    variant="secondary"
                    onClick={() => setShowRf(v => !v)}
                    className="font-cairo"
                  >
                    {showRf ? 'إخفاء Rf' : 'إظهار قيم Rf'}
                  </Button>
                )}
              </div>

              {/* Speed control */}
              <div className="mt-3 flex items-center gap-3 justify-center">
                <span className="text-xs font-cairo text-muted-foreground">سرعة التجربة:</span>
                {[1, 2, 4].map(s => (
                  <Button
                    key={s}
                    size="sm"
                    variant={speed === s ? 'default' : 'outline'}
                    onClick={() => setSpeed(s)}
                    className="font-cairo text-xs h-7 px-3"
                  >
                    ×{s}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls & Measurements */}
        <div className="space-y-3">

          {/* Measurements */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm">📏 القياسات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-cairo text-muted-foreground">جبهة المذيب</span>
                <Badge variant="outline" className="font-cairo text-xs">{solventFrontDist} مم</Badge>
              </div>
              {PIGMENTS.map(pig => {
                const dist = Math.round(pig.Rf * solventFrontDist)
                const visible = progress * MAX_TRAVEL * pig.Rf > 5
                return (
                  <div key={pig.name} className="flex justify-between items-center">
                    <span className="text-xs font-cairo text-muted-foreground flex items-center gap-1">
                      <span
                        className="inline-block w-3 h-3 rounded-sm"
                        style={{ background: pig.color }}
                      />
                      {pig.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="font-cairo text-xs"
                      style={{ borderColor: pig.color }}
                    >
                      {visible ? `${dist} مم` : '—'}
                    </Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Rf Table */}
          {progress >= 0.5 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-cairo text-sm">🔢 قيم Rf</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs font-cairo text-muted-foreground mb-2">
                  Rf = مسافة الصبغة ÷ مسافة المذيب
                </div>
                <div className="space-y-1.5">
                  {PIGMENTS.map(pig => (
                    <div key={pig.name} className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span
                          className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ background: pig.color }}
                        />
                        <span className="text-xs font-cairo">{pig.name}</span>
                      </div>
                      <Badge
                        className="font-cairo text-xs font-bold"
                        style={{ background: pig.color, color: pig.textColor }}
                      >
                        {pig.Rf.toFixed(2)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Steps */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm">🎯 خطوات التجربة</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-xs font-cairo space-y-1.5 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold shrink-0">١</span>
                  اطحن أوراق السبانخ مع الأسيتون والرمل
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold shrink-0">٢</span>
                  ارسم خط البداية بالقلم الرصاص
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold shrink-0">٣</span>
                  ضع نقطة المستخلص على الخط
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold shrink-0">٤</span>
                  ضع الورقة في بترول الأثير (دون غمر النقطة)
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold shrink-0">٥</span>
                  انتظر صعود المذيب وفصل الصبغات
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold shrink-0">٦</span>
                  احسب Rf = مسافة الصبغة ÷ مسافة المذيب
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Learning section */}
      {mode === 'learning' && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm text-green-700">
                🌱 صبغات التمثيل الضوئي
              </CardTitle>
            </CardHeader>
            <CardContent className="font-cairo text-xs text-green-900 dark:text-green-200 space-y-1.5">
              {PIGMENTS.map(pig => (
                <div key={pig.name} className="flex items-start gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-sm mt-0.5 flex-shrink-0"
                    style={{ background: pig.color }}
                  />
                  <div>
                    <span className="font-bold">{pig.name}</span>
                    {' — '}
                    <span className="text-muted-foreground">{pig.nameEn} — Rf ≈ {pig.Rf.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded">
                الصبغات الأقل ذوبانية (كلوروفيل ب) تتحرك أبطأ → Rf أصغر
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm text-amber-700">❓ أسئلة تحليلية</CardTitle>
            </CardHeader>
            <CardContent className="font-cairo text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
              <div>١. لماذا تتحرك الكاروتينات أعلى الجميع؟</div>
              <div>٢. ما العلاقة بين قيمة Rf وذوبانية الصبغة في المذيب؟</div>
              <div>٣. لماذا يُستخدم بترول الأثير وليس الماء؟</div>
              <div>٤. لماذا يجب ألا يغمر المذيب النقطة الأولية؟</div>
              <div>٥. ما سبب رسم خط البداية بالقلم الرصاص لا الحبر؟</div>
              <div className="mt-2 p-2 bg-amber-100 dark:bg-amber-900/30 rounded font-semibold">
                الاستنتاج: Rf ثابت لكل صبغة في مذيب معين → يُستخدم للتعرف عليها.
              </div>
            </CardContent>
          </Card>

          {/* Rf formula card */}
          <Card className="md:col-span-2 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="font-cairo text-sm text-blue-700">🔢 حساب معامل التأخر Rf</CardTitle>
            </CardHeader>
            <CardContent className="font-cairo text-xs text-blue-900 dark:text-blue-200">
              <div className="bg-white dark:bg-blue-950 rounded p-3 border border-blue-200 font-mono text-center text-sm font-bold mb-3">
                Rf = مسافة تحرك الصبغة (من خط البداية) ÷ مسافة تحرك جبهة المذيب
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {PIGMENTS.map(pig => (
                  <div
                    key={pig.name}
                    className="rounded p-2 text-center"
                    style={{ background: pig.color + '33', borderColor: pig.color, border: '1px solid' }}
                  >
                    <div className="font-bold" style={{ color: pig.textColor }}>{pig.name}</div>
                    <div className="text-lg font-mono font-bold" style={{ color: pig.textColor }}>
                      {pig.Rf.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
