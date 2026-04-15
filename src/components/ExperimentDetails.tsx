import { Experiment, subjects, skillColors } from '@/data/experiments'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Flask, Atom, Leaf, Target, Flask as ComponentsIcon, Gear, ListChecks, WarningCircle, Lightbulb, Cpu, ClipboardText, ArrowSquareOut } from '@phosphor-icons/react'

// ─── PhET simulation links mapped by subject/id ───────────────────────────────
const PHET_LINKS: Record<string, { url: string; name: string }> = {
  // Physics
  'phys-1-6': { url: 'https://phet.colorado.edu/sims/html/sound-waves/latest/sound-waves_all.html', name: 'Sound Waves' },
  'inverse':  { url: 'https://phet.colorado.edu/sims/html/sound-waves/latest/sound-waves_all.html', name: 'Sound Waves' },
  'acceleration': { url: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html', name: 'Forces & Motion' },
  'kinetic':  { url: 'https://phet.colorado.edu/sims/html/energy-skate-park/latest/energy-skate-park_all.html', name: 'Energy Skate Park' },
  // Chemistry
  'ph':       { url: 'https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_all.html', name: 'pH Scale' },
  'titration':{ url: 'https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_all.html', name: 'Acid-Base Solutions' },
  'chem-1-6': { url: 'https://phet.colorado.edu/sims/html/reactions-and-rates/latest/reactions-and-rates_all.html', name: 'Reactions & Rates' },
  'reaction': { url: 'https://phet.colorado.edu/sims/html/reactions-and-rates/latest/reactions-and-rates_all.html', name: 'Reactions & Rates' },
  // Biology
  'membrane': { url: 'https://phet.colorado.edu/sims/html/membrane-channels/latest/membrane-channels_all.html', name: 'Membrane Channels' },
  'meiosis':  { url: 'https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_all.html', name: 'Natural Selection' },
  'photosynth':{ url: 'https://phet.colorado.edu/sims/html/greenhouse-effect/latest/greenhouse-effect_all.html', name: 'Greenhouse Effect' },
  'yeast':    { url: 'https://phet.colorado.edu/sims/html/sugar-and-salt-solutions/latest/sugar-and-salt-solutions_all.html', name: 'Sugar & Salt' },
  // New Physics
  'phys-1-7': { url: 'https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_all.html', name: 'Wave Interference' },
  'phys-2-7': { url: 'https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_all.html', name: 'Wave on a String' },
  'phys-1-8': { url: 'https://phet.colorado.edu/sims/html/blackbody-spectrum/latest/blackbody-spectrum_all.html', name: 'Blackbody Spectrum' },
  'phys-1-9': { url: 'https://phet.colorado.edu/sims/html/radioactive-dating-game/latest/radioactive-dating-game_en.html', name: 'Radioactive Dating' },
}

function getPhETLink(id: string, subject: string): { url: string; name: string } | null {
  for (const [key, val] of Object.entries(PHET_LINKS)) {
    if (id.includes(key) || id === key) return val
  }
  // Fallback by subject
  if (subject === 'physics') return { url: 'https://phet.colorado.edu/en/simulations/filter?subjects=physics', name: 'Physics Sims' }
  if (subject === 'chemistry') return { url: 'https://phet.colorado.edu/en/simulations/filter?subjects=chemistry', name: 'Chemistry Sims' }
  if (subject === 'biology') return { url: 'https://phet.colorado.edu/en/simulations/filter?subjects=biology', name: 'Biology Sims' }
  return null
}
import { MembraneTransportSim } from '@/components/simulations/MembraneTransportSim'
import { PHTitrationSim } from '@/components/simulations/PHTitrationSim'
import { InverseSquareLawSim } from '@/components/simulations/InverseSquareLawSim'
import { YeastRespirationSim } from '@/components/simulations/YeastRespirationSim'
import { MeiosisSim } from '@/components/simulations/MeiosisSim'
import { PhotosynthesisSim } from '@/components/simulations/PhotosynthesisSim'
import { AccelerationSim } from '@/components/simulations/AccelerationSim'
import { KineticEnergySim } from '@/components/simulations/KineticEnergySim'
import { TitrationCurveSim } from '@/components/simulations/TitrationCurveSim'
import { ReactionRateSim } from '@/components/simulations/ReactionRateSim'
import { DiffractionGratingSim } from '@/components/simulations/DiffractionGratingSim'
import { StandingWavesSim } from '@/components/simulations/StandingWavesSim'
import { PlancksConstantSim } from '@/components/simulations/PlancksConstantSim'
import { RadioactiveDecaySim } from '@/components/simulations/RadioactiveDecaySim'
import { ElectrochemicalCellSim } from '@/components/simulations/ElectrochemicalCellSim'
import { FaradayConstantSim } from '@/components/simulations/FaradayConstantSim'
import { LigandSubstitutionSim } from '@/components/simulations/LigandSubstitutionSim'
import { WaveFrequencySim } from '@/components/simulations/WaveFrequencySim'
import { TransitionMetalsSim } from '@/components/simulations/TransitionMetalsSim'
import { BenzeneSim } from '@/components/simulations/BenzeneSim'
import { CellMicroscopySim } from '@/components/simulations/CellMicroscopySim'
import { KidneyOsmosisSim } from '@/components/simulations/KidneyOsmosisSim'
import { PhototrophismSim } from '@/components/simulations/PhototrophismSim'
import { CO2PhotosynthesisSim } from '@/components/simulations/CO2PhotosynthesisSim'
import { GravitationalPotentialEnergySim } from '@/components/simulations/GravitationalPotentialEnergySim'
import { SmartQuizGenerator } from '@/components/SmartQuizGenerator'
import { DynamicQuizGenerator } from '@/components/DynamicQuizGenerator'

interface ExperimentDetailsProps {
  experiment: Experiment | null
  open: boolean
  onClose: () => void
}

export function ExperimentDetails({ experiment, open, onClose }: ExperimentDetailsProps) {
  if (!experiment) return null

  const subjectInfo = subjects[experiment.subject]
  const SubjectIcon = 
    experiment.subject === 'chemistry' ? Flask :
    experiment.subject === 'physics' ? Atom :
    Leaf

  const hasSimulation = true

  const getSimulationComponent = () => {
    const id = experiment.id
    
    if (id.includes('membrane') || id.includes('transport')) {
      return <MembraneTransportSim />
    }
    
    if (id === 'chem-1-6' || id.includes('reaction-rate') || id.includes('تركيز') || id.includes('kinetics')) {
      return <ReactionRateSim />
    }

    if (id.includes('inverse') || id === 'phys-1-6') {
      return <InverseSquareLawSim />
    }

    if (id.includes('ph-') || id.includes('-ph') || id === 'chem-1-1' || id === 'chem-1-1-ph-intro' || (id.includes('ph') && !id.includes('phys'))) {
      return <PHTitrationSim />
    }

    if (id.includes('titration') || id.includes('معايرة')) {
      return <TitrationCurveSim />
    }
    
    if (id.includes('yeast') || id.includes('respiration') || id.includes('خميرة') || id === 'bio-1-6' || id === 'bio-6-2-fermentation') {
      return <YeastRespirationSim />
    }
    
    if (id.includes('meiosis') || id.includes('mitosis') || id.includes('انقسام') || id === 'bio-1-1' || id === 'bio-2-2-mitosis') {
      return <MeiosisSim />
    }
    
    // ── CO₂ effect on photosynthesis (specific experiment) ────────────────
    if (id === 'bio-5-7' || id.includes('co2') || id.includes('CO2') || id.includes('ثاني-أكسيد') || id.includes('carbon-dioxide')) {
      return <CO2PhotosynthesisSim />
    }

    // ── Gas exchange / general photosynthesis ─────────────────────────────
    if (id.includes('photosynth') || id.includes('ضوئي') || id === 'bio-3-7' || id === 'bio-7-3-pigments') {
      return <PhotosynthesisSim />
    }
    
    if (id.includes('acceleration') || id.includes('displacement') || id.includes('حركة') || id.includes('تسارع') || id === 'phys-1-1-acceleration' || id === 'phys-1-1-displacement') {
      return <AccelerationSim />
    }
    
    if (id === 'phys-2-2-potential' || id.includes('gravitational') || id.includes('الوضع الجذبية')) {
      return <GravitationalPotentialEnergySim />
    }

    if (id.includes('kinetic') || id.includes('potential') || id.includes('energy') || id.includes('طاقة') || id === 'phys-2-1-kinetic' || id === 'phys-2-3-conservation') {
      return <KineticEnergySim />
    }

    if (id === 'phys-1-7' || id.includes('diffraction') || id.includes('حيود') || id.includes('grating') || id.includes('laser')) {
      return <DiffractionGratingSim />
    }

    if (id === 'phys-2-7' || id.includes('standing') || id.includes('مستقرة') || id.includes('slinky') || id.includes('string')) {
      return <StandingWavesSim />
    }

    if (id === 'phys-1-8' || id.includes('planck') || id.includes('بلانك') || id.includes('led') || id.includes('photoelectric')) {
      return <PlancksConstantSim />
    }

    if (id === 'phys-1-9' || id.includes('radioactive') || id.includes('decay') || id.includes('إشعاعي') || id.includes('nuclear') || id.includes('نووي')) {
      return <RadioactiveDecaySim />
    }

    if (id === 'chem-1-2' || id.includes('electrochemical') || id.includes('فولتية') || id.includes('galvanic') || id.includes('voltaic') || id.includes('جلفاني')) {
      return <ElectrochemicalCellSim />
    }

    if (id === 'chem-2-2' || id.includes('faraday') || id.includes('فارادي') || id.includes('electrolysis') || id.includes('تحليل-كهربائي')) {
      return <FaradayConstantSim />
    }

    if (id === 'chem-1-5' || id.includes('ligand') || id.includes('ليجند') || id.includes('معقد') || id.includes('complex')) {
      return <LigandSubstitutionSim />
    }

    // ── Reaction rate factors & collision theory ───────────────────────────
    if (id === 'chem-6-2-factors' || id === 'chem-6-4-collision' || id.includes('collision') || id.includes('factors') || id.includes('تصادم') || id.includes('عوامل')) {
      return <ReactionRateSim />
    }

    // ── Wave frequency / wavelength measurement ────────────────────────────
    if (id === 'phys-6-3-wavelength' || id.includes('wavelength') || id.includes('frequency') || id.includes('تردد') || id.includes('طول-موجي')) {
      return <WaveFrequencySim />
    }

    // ── Transition metals ──────────────────────────────────────────────────
    if (id === 'chem-5-1-transition' || id.includes('transition') || id.includes('انتقالية')) {
      return <TransitionMetalsSim />
    }

    // ── Benzene / organic chemistry ────────────────────────────────────────
    if (id === 'chem-1-8' || id === 'chem-8-1-benzene' || id.includes('benzene') || id.includes('بنزين') || id.includes('nitration') || id.includes('نترتة')) {
      return <BenzeneSim />
    }

    // ── Cell microscopy ────────────────────────────────────────────────────
    if (id === 'bio-1-1-cell' || id.includes('cell-structure') || id.includes('microscop') || id.includes('خلية')) {
      return <CellMicroscopySim />
    }

    // ── Kidney anatomy & osmosis / water regulation ────────────────────────
    if (id === 'bio-4-1-kidney' || id === 'bio-4-3-water' || id.includes('kidney') || id.includes('كلية') || id.includes('osmosis') || id.includes('أسموزي') || id.includes('water-reg') || id.includes('adh')) {
      return <KidneyOsmosisSim />
    }

    // ── Phototropism ───────────────────────────────────────────────────────
    if (id === 'bio-2-5' || id.includes('phototropism') || id.includes('انتحاء') || id.includes('tropism')) {
      return <PhototrophismSim />
    }

    return <div className="text-center p-8 space-y-4">
      <Cpu size={64} className="mx-auto text-muted-foreground" weight="duotone" />
      <h3 className="text-xl font-bold font-cairo">مختبر تفاعلي قريباً</h3>
      <p className="text-muted-foreground font-noto">
        المحاكاة التفاعلية لهذه التجربة قيد التطوير حالياً
      </p>
      <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-3 rounded inline-block">
        ID: {id}
      </div>
    </div>
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start gap-4">
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${subjectInfo.color}20` }}
            >
              <SubjectIcon size={32} weight="fill" style={{ color: subjectInfo.color }} />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge 
                  variant="secondary"
                  style={{ 
                    backgroundColor: `${subjectInfo.color}20`,
                    color: subjectInfo.color 
                  }}
                  className="font-cairo"
                >
                  {subjectInfo.nameAr}
                </Badge>
                {experiment.experimentCode && (
                  <span className="text-sm text-muted-foreground font-cairo">
                    رمز التجربة: {experiment.experimentCode}
                  </span>
                )}
              </div>
              
              <DialogTitle className="text-2xl font-cairo font-bold leading-tight">
                {experiment.title}
              </DialogTitle>

              {experiment.unitTitle && (
                <p className="text-sm text-muted-foreground font-cairo">
                  الوحدة {experiment.unit}: {experiment.unitTitle}
                </p>
              )}

              {experiment.type && (
                <Badge variant="outline" className="font-cairo w-fit">
                  {experiment.type}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            <Tabs defaultValue={hasSimulation ? "simulation" : "overview"} dir="rtl">
              <TabsList className={`grid w-full font-cairo ${hasSimulation ? 'grid-cols-8' : 'grid-cols-7'}`}>
                {hasSimulation && <TabsTrigger value="simulation"><Cpu size={16} className="ml-1 inline" />المختبر</TabsTrigger>}
                <TabsTrigger value="dynamic-quiz"><ClipboardText size={16} className="ml-1 inline" />نماذج متعددة</TabsTrigger>
                <TabsTrigger value="quiz"><ClipboardText size={16} className="ml-1 inline" />ذكي</TabsTrigger>
                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                <TabsTrigger value="components">المكونات</TabsTrigger>
                <TabsTrigger value="apparatus">الأجهزة</TabsTrigger>
                <TabsTrigger value="steps">الخطوات</TabsTrigger>
                <TabsTrigger value="safety">السلامة</TabsTrigger>
              </TabsList>

              {hasSimulation && (
                <TabsContent value="simulation" className="mt-4 space-y-3">
                  {(() => {
                    const phet = getPhETLink(experiment.id, experiment.subject)
                    return phet ? (
                      <div className="flex justify-end">
                        <button
                          onClick={() => window.open(phet.url, '_blank')}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700 text-sm font-cairo transition-colors"
                        >
                          <ArrowSquareOut size={15} />
                          تشغيل محاكاة PhET — {phet.name}
                        </button>
                      </div>
                    ) : null
                  })()}
                  {getSimulationComponent()}
                </TabsContent>
              )}

              <TabsContent value="dynamic-quiz" className="mt-4">
                <DynamicQuizGenerator experiment={experiment} />
              </TabsContent>

              <TabsContent value="quiz" className="mt-4">
                <SmartQuizGenerator experiment={experiment} />
              </TabsContent>

              <TabsContent value="overview" className="space-y-4 mt-4">
                {experiment.objectives && experiment.objectives.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 font-cairo">
                        <Target size={20} weight="duotone" />
                        الأهداف التعليمية
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 font-noto">
                        {experiment.objectives.map((obj, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {experiment.reaction && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 font-cairo">
                        <Lightbulb size={20} weight="duotone" />
                        المعادلة الكيميائية
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-lg font-cairo text-center">
                        {experiment.reaction}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 font-cairo">
                      <Lightbulb size={20} weight="duotone" />
                      المهارات العملية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {experiment.skills.map((skill) => (
                        <Badge 
                          key={skill}
                          variant="secondary"
                          className="font-cairo text-sm"
                          style={{
                            backgroundColor: skillColors[skill as keyof typeof skillColors] 
                              ? `${skillColors[skill as keyof typeof skillColors]}20`
                              : 'var(--secondary)',
                            color: skillColors[skill as keyof typeof skillColors] || 'var(--secondary-foreground)',
                            borderColor: skillColors[skill as keyof typeof skillColors]
                              ? `${skillColors[skill as keyof typeof skillColors]}40`
                              : 'transparent'
                          }}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {experiment.variables && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-cairo">المتغيرات</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 font-noto">
                      {experiment.variables.independent && (
                        <div>
                          <span className="font-semibold text-primary">المتغير المستقل: </span>
                          {experiment.variables.independent}
                        </div>
                      )}
                      {experiment.variables.dependent && (
                        <div>
                          <span className="font-semibold text-primary">المتغير التابع: </span>
                          {experiment.variables.dependent}
                        </div>
                      )}
                      {experiment.variables.controlled && experiment.variables.controlled.length > 0 && (
                        <div>
                          <span className="font-semibold text-primary">المتغيرات الثابتة: </span>
                          {experiment.variables.controlled.join(' • ')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {experiment.notes && (
                  <Card className="border-accent/30 bg-accent/5">
                    <CardContent className="pt-6">
                      <p className="text-sm font-noto">{experiment.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="components" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 font-cairo">
                      <ComponentsIcon size={20} weight="duotone" />
                      المكونات العلمية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {experiment.components.length > 0 ? (
                      <ul className="space-y-2 font-noto">
                        {experiment.components.map((component, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-1">▪</span>
                            <span>{component}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-sm font-noto">لا توجد معلومات متاحة</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="apparatus" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 font-cairo">
                      <Gear size={20} weight="duotone" />
                      الأجهزة والأدوات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {experiment.apparatus.length > 0 ? (
                      <ul className="space-y-2 font-noto">
                        {experiment.apparatus.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-1">▪</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-sm font-noto">لا توجد معلومات متاحة</p>
                    )}
                  </CardContent>
                </Card>

                {experiment.materials && experiment.materials.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-cairo">المواد المستهلكة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 font-noto">
                        {experiment.materials.map((material, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-1">▪</span>
                            <span>{material}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="steps" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 font-cairo">
                      <ListChecks size={20} weight="duotone" />
                      خطوات التنفيذ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {experiment.stepsSummary && experiment.stepsSummary.length > 0 ? (
                      <ol className="space-y-3 font-noto">
                        {experiment.stepsSummary.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                              {idx + 1}
                            </span>
                            <span className="flex-1 pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    ) : experiment.steps && experiment.steps.length > 0 ? (
                      <ol className="space-y-3 font-noto">
                        {experiment.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                              {idx + 1}
                            </span>
                            <span className="flex-1 pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-muted-foreground text-sm font-noto">
                        يُرجى الرجوع إلى كتاب التجارب العملية للحصول على خطوات التنفيذ التفصيلية
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="safety" className="mt-4">
                <Card className="border-destructive/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 font-cairo text-destructive">
                      <WarningCircle size={20} weight="duotone" />
                      إرشادات السلامة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {experiment.safety && experiment.safety.length > 0 ? (
                      <ul className="space-y-2 font-noto">
                        {experiment.safety.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <WarningCircle size={18} weight="fill" className="text-destructive mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-sm font-noto">
                        يُرجى اتباع جميع احتياطات السلامة المعتادة في المختبر وقراءة إرشادات السلامة قبل البدء بالتجربة.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {experiment.sourceBook && (
                  <Card className="mt-4">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground font-cairo">
                        <span className="font-semibold">المصدر: </span>
                        {experiment.sourceBook}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
