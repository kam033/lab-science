import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Experiment } from '@/data/experiments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkle, Download, Printer, Copy, CheckCircle, PushPin, PushPinSlash, ArrowsClockwise, Lightbulb } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface QuizQuestion {
  section: string
  question: string
  marks: number
  skill: string
  data?: {
    table?: string[][]
    values?: number[]
    graph?: {
      xLabel: string
      yLabel: string
      xUnit: string
      yUnit: string
    }
  }
}

interface GeneratedQuiz {
  id: string
  title: string
  totalMarks: number
  questions: QuizQuestion[]
  variant: number
}

interface DynamicQuizGeneratorProps {
  experiment: Experiment
}

export function DynamicQuizGenerator({ experiment }: DynamicQuizGeneratorProps) {
  const [currentQuiz, setCurrentQuiz] = useState<GeneratedQuiz | null>(null)
  const [pinnedQuiz, setPinnedQuiz] = useKV<GeneratedQuiz | null>(`pinned-quiz-${experiment.id}`, null)
  const [variantNumber, setVariantNumber] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const isPinned = pinnedQuiz?.id === currentQuiz?.id

  const generateRandomValues = () => {
    const offset = Math.floor(Math.random() * 5)
    const randomFactor = 0.7 + Math.random() * 0.6
    
    const baseDistances = [8, 12, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80]
    const baseIntensities = [120, 95, 45, 25, 18, 12, 8.5, 6.2, 4.8, 3.5, 2.8, 2.1]
    const baseTemperatures = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70]
    const baseConcentrations = [0.2, 0.5, 0.8, 1.0, 1.3, 1.5, 1.8, 2.0, 2.3, 2.5, 2.8, 3.0]
    const baseTimes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60]
    const baseVolumes = [0, 2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 30]
    const basePHValues = [1.2, 2.5, 3.8, 4.5, 7.0, 9.5, 11.2, 12.8, 13.5]
    
    const distances = baseDistances.slice(offset, offset + 6).map(v => +(v * randomFactor).toFixed(1))
    const intensities = baseIntensities.slice(offset, offset + 6).map(v => +(v * randomFactor).toFixed(2))
    const temperatures = baseTemperatures.slice(offset, offset + 6).map(v => +(v * randomFactor).toFixed(0))
    const concentrations = baseConcentrations.slice(offset, offset + 6).map(v => +(v * randomFactor).toFixed(2))
    const times = baseTimes.slice(offset, offset + 6).map(v => +(v * randomFactor).toFixed(0))
    const volumes = baseVolumes.slice(offset, offset + 6).map(v => +(v * randomFactor).toFixed(1))
    const phValues = basePHValues.slice(Math.floor(Math.random() * 3), 7).map(v => +(v * randomFactor).toFixed(1))
    
    return {
      distances,
      intensities,
      temperatures,
      concentrations,
      times,
      volumes,
      phValues
    }
  }

  const generateQuizTemplate = (): GeneratedQuiz => {
    const quizId = `${experiment.id}-v${variantNumber}-${Date.now()}`
    const values = generateRandomValues()
    
    const numReadings = 4 + Math.floor(Math.random() * 3)
    const selectedDistances = values.distances.slice(0, numReadings)
    const selectedIntensities = values.intensities.slice(0, numReadings)
    const selectedConcentrations = values.concentrations.slice(0, numReadings)
    const selectedTimes = values.times.slice(0, numReadings)
    const selectedTemperatures = values.temperatures.slice(0, numReadings)
    const selectedVolumes = values.volumes.slice(0, numReadings)
    
    const templates = {
      physics: {
        planning: `خطط لإجراء تجربة لدراسة ${experiment.title}:

أ) حدد المتغيرات:
   - المتغير المستقل: ${experiment.variables?.independent || 'المتغير الذي تقوم بتغييره'}
   - المتغير التابع: ${experiment.variables?.dependent || 'المتغير الذي تقوم بقياسه'}
   - المتغيرات الثابتة: ${experiment.variables?.controlled?.join(' • ') || 'المتغيرات التي يجب إبقاؤها ثابتة'}

ب) اكتب فرضية علمية قابلة للاختبار

ج) صف الطريقة باستخدام: ${experiment.apparatus.slice(0, 3).join(' • ')}

د) اذكر 3 إجراءات سلامة مهمة`,
        
        dataCollection: `صمم جدول بيانات مناسب للتجربة:

📊 القيم المقترحة:
${experiment.variables?.independent || 'المسافة'}: ${selectedDistances.join(' m, ')} m

أ) حدد عناوين الأعمدة مع الوحدات الصحيحة
ب) لماذا نحتاج ${numReadings} قراءات على الأقل؟
ج) ما نطاق القيم المتوقعة لـ ${experiment.variables?.dependent || 'القياس'}؟
د) كيف تحسن دقة القياس؟ (اقترح طريقتين)`,

        analysis: `بناءً على البيانات التجريبية التالية:

📈 جدول النتائج:
${selectedDistances.map((d, i) => `| ${experiment.variables?.independent || 'المسافة'} = ${d} m | ${experiment.variables?.dependent || 'القيمة'} = ${selectedIntensities[i]} |`).join('\n')}

أ) ارسم رسماً بيانياً كاملاً:
   - المحور الأفقي (x): ${experiment.variables?.independent || 'المسافة (m)'}
   - المحور الرأسي (y): ${experiment.variables?.dependent || 'الشدة'}
   - ضع عنواناً مناسباً وعلامات على المحاور
   
ب) صف نمط العلاقة بين المتغيرين (خطية طردية؟ عكسية؟ تربيعية؟)

ج) احسب قيمة فيزيائية من الرسم:
   - إذا كان خطياً: الميل = _______
   - إذا كان منحنياً: الثابت = _______

د) استنتج القانون الفيزيائي وقارنه بالنظرية`,

        evaluation: `قيّم دقة وموثوقية التجربة:

أ) حدد 3 مصادر خطأ محتملة:
   1. خطأ في قياس ${experiment.variables?.independent || 'المتغير المستقل'} (±_____ وحدة)
   2. خطأ في قياس ${experiment.variables?.dependent || 'المتغير التابع'} (±_____ وحدة)
   3. عامل خارجي يؤثر على النتائج: _______

ب) اقترح 3 تحسينات عملية لزيادة الدقة:
   1. _______
   2. _______
   3. _______

ج) احسب نسبة الخطأ إذا كانت القيمة النظرية معروفة

د) اقترح امتداداً للتجربة (دراسة متغير إضافي أو نطاق أوسع)`
      },
      
      chemistry: {
        planning: `خطط لتجربة ${experiment.title}:

أ) المتغيرات:
   - المستقل: ${experiment.variables?.independent || 'التركيز'}
   - التابع: ${experiment.variables?.dependent || 'معدل التفاعل'}
   - الثابتة: ${experiment.variables?.controlled?.join(' • ') || 'درجة الحرارة، الحجم'}

ب) فرضية قابلة للاختبار (إذا _____ يزيد، فإن _____ ...)

ج) الأدوات والمواد: ${experiment.apparatus.slice(0, 3).join(' • ')}

د) إجراءات السلامة (3 نقاط محددة مع التبرير)`,

        dataCollection: `صمم جدول شامل للبيانات:

📊 نطاق التجربة:
التراكيز المقترحة (mol/L): ${selectedConcentrations.join(', ')}
الأزمنة لكل تركيز (s): ${selectedTimes.join(', ')}

أ) صمم جدول بياني كامل يشمل:
   - عناوين الأعمدة بالعربية
   - الوحدات الصحيحة
   - أعمدة للقراءات المكررة
   
ب) لماذا نحتاج ${numReadings} تراكيز مختلفة على الأقل؟

ج) كيف تحسب معدل التفاعل من الزمن المقاس؟ (اكتب المعادلة)

د) ما دقة الأدوات المستخدمة وكيف تؤثر على النتائج؟`,

        analysis: `البيانات التجريبية المسجلة:

📈 جدول النتائج:
${selectedConcentrations.map((c, i) => `| التركيز = ${c} mol/L | الزمن = ${selectedTimes[i]} s | معدل التفاعل = ${(1/selectedTimes[i]).toFixed(4)} s⁻¹ |`).join('\n')}

أ) ارسم منحنى العلاقة البيانية:
   - المحور x: ${experiment.variables?.independent || 'التركيز (mol/L)'}
   - المحور y: ${experiment.variables?.dependent || 'معدل التفاعل (s⁻¹)'}
   - استخدم مقياس مناسب وعلامات واضحة

ب) احسب معدل التفاعل عند تركيز ${selectedConcentrations[2]} mol/L

ج) حدد رتبة التفاعل من الرسم البياني (صفر، أول، ثاني)

د) اربط النتائج بنظرية التصادم (التردد، الطاقة، التوجه)`,

        evaluation: `تقييم شامل للتجربة:

أ) مصادر الخطأ الكيميائية (3):
   1. خطأ في قياس الحجم: ±_____ mL
   2. خطأ في قياس الزمن: ±_____ s
   3. عوامل خارجية: _______

ب) تحسينات مقترحة (3):
   1. استخدام أجهزة أدق (مثل _______)
   2. _______
   3. _______

ج) قارن القيمة المحسوبة لمعدل التفاعل بالقيمة النظرية:
   - القيمة التجريبية: _______
   - القيمة النظرية: _______
   - نسبة الخطأ = _______٪

د) تطبيق عملي: كيف يمكن استخدام هذه النتائج في الصناعة أو الحياة اليومية؟`
      },

      biology: {
        planning: `التخطيط لاستقصاء ${experiment.title}:

أ) المتغيرات:
   - المستقل: ${experiment.variables?.independent || 'المتغير المؤثر'}
   - التابع: ${experiment.variables?.dependent || 'الاستجابة المقاسة'}
   - الثابتة: ${experiment.variables?.controlled?.join(' • ') || 'الظروف البيئية'}

ب) الفرضية الحيوية (العلاقة المتوقعة بين المتغيرات)

ج) المواد والأدوات الحيوية: ${experiment.apparatus.slice(0, 3).join(' • ')}

د) إجراءات السلامة الحيوية (3 نقاط مع التبرير):
   1. _______
   2. _______
   3. _______`,

        dataCollection: `تصميم جدول شامل للملاحظات الحيوية:

📊 بيانات الاستقصاء:
${experiment.title.includes('خميرة') || experiment.title.includes('تنفس') ? 
  `التراكيز (g/L): ${selectedConcentrations.join(', ')}\nأزمنة الاستجابة (min): ${selectedTimes.join(', ')}` :
  experiment.title.includes('ضوئي') || experiment.title.includes('نبات') ?
  `شدة الضوء (lux): ${selectedDistances.map(d => d * 100).join(', ')}\nمعدل الفقاعات (/min): ${selectedIntensities.map(i => Math.floor(i/10)).join(', ')}` :
  experiment.title.includes('انقسام') || experiment.title.includes('خلية') ?
  `عدد الخلايا المفحوصة: ${selectedDistances.map(d => Math.floor(d * 10)).join(', ')}\nالأطوار المرصودة: متعددة` :
  `القيم المقاسة: ${selectedConcentrations.join(', ')}`
}

أ) صمم جدول بياني كامل يشمل:
   - عناوين الأعمدة
   - الوحدات الحيوية المناسبة
   - أعمدة للتكرارات (${numReadings} عينات على الأقل)

ب) لماذا نحتاج عينات متعددة في الدراسات الحيوية؟

ج) كيفية القياس الدقيق للمتغير التابع؟

د) معايير الملاحظة والتسجيل (الوضوح، الدقة، التوقيت)`,

        analysis: `تحليل النتائج الحيوية:

📈 البيانات المسجلة:
${experiment.title.includes('انقسام') || experiment.title.includes('mitosis') || experiment.title.includes('meiosis') ? 
  `نسب الأطوار المرصودة:\n- الطور البيني: ${55 + Math.floor(Math.random() * 15)}%\n- الطور التمهيدي: ${20 + Math.floor(Math.random() * 10)}%\n- الطور الاستوائي: ${8 + Math.floor(Math.random() * 5)}%\n- الطور الانفصالي: ${5 + Math.floor(Math.random() * 3)}%\n- الطور النهائي: ${3 + Math.floor(Math.random() * 3)}%` :
  experiment.title.includes('خميرة') || experiment.title.includes('yeast') ?
  `${selectedConcentrations.slice(0, 4).map((c, i) => `تركيز ${c} g/L → زمن التغيير = ${selectedTimes[i]} دقيقة (معدل التنفس = ${(1/selectedTimes[i]).toFixed(3)} min⁻¹)`).join('\n')}` :
  experiment.title.includes('ضوئي') || experiment.title.includes('نبات') ?
  `${selectedDistances.slice(0, 4).map((d, i) => `شدة ضوء ${Math.floor(d * 100)} lux → ${Math.floor(selectedIntensities[i]/10)} فقاعة/دقيقة`).join('\n')}` :
  `${selectedConcentrations.slice(0, 4).map((c, i) => `${c} وحدة → ${selectedTimes[i]} دقيقة`).join('\n')}`
}

أ) ارسم تمثيلاً بيانياً مناسباً:
   - نوع الرسم (خطي، أعمدة، دائري) حسب طبيعة البيانات
   - المحاور والعناوين
   - مقياس مناسب

ب) احسب المعدل أو النسبة المئوية من البيانات

ج) صف العلاقة البيولوجية بين المتغيرات:
   ${experiment.title.includes('انقسام') ? '- ما الطور الأطول زمنياً ولماذا؟' : ''}
   ${experiment.title.includes('تنفس') || experiment.title.includes('ضوئي') ? '- هل العلاقة طردية أم عكسية؟' : ''}
   - ما التفسير البيولوجي؟

د) اربط النتائج بالعمليات الخلوية والجزيئية`,

        evaluation: `التقييم الشامل للاستقصاء الحيوي:

أ) مصادر الخطأ الحيوية المحتملة (3):
   1. التباين البيولوجي الطبيعي بين العينات
   2. خطأ في ${experiment.title.includes('مجهر') || experiment.title.includes('انقسام') ? 'العد أو التصنيف المجهري' : 'القياس أو التوقيت'}
   3. عوامل بيئية غير محكومة: _______

ب) تحسينات منهجية مقترحة (3):
   1. زيادة حجم العينة إلى _____ عينة
   2. ${experiment.title.includes('مجهر') ? 'استخدام مجهر رقمي مع برنامج تحليل صور' : 'استخدام أجهزة قياس أوتوماتيكية'}
   3. تحسين الضبط البيئي: _______

ج) تقييم موثوقية النتائج البيولوجية:
   - هل العينة ممثلة؟
   - هل النتائج قابلة للتكرار؟
   - حساب الانحراف المعياري أو نطاق القيم

د) التطبيقات العملية والحياتية:
   ${experiment.title.includes('انقسام') ? '- كيف تفيد هذه المعرفة في فهم السرطان أو الوراثة؟' : ''}
   ${experiment.title.includes('تنفس') ? '- ما التطبيقات الصناعية (خبز، كحول، إنتاج طاقة)؟' : ''}
   ${experiment.title.includes('ضوئي') ? '- كيف يمكن تحسين إنتاج المحاصيل أو الزراعة المحمية؟' : ''}
   - اقترح بحثاً إضافياً في هذا المجال`
      }
    }

    const subjectTemplates = templates[experiment.subject]
    
    return {
      id: quizId,
      title: `اختبار استقصاء: ${experiment.title} - النموذج ${variantNumber}`,
      totalMarks: 45,
      variant: variantNumber,
      questions: [
        {
          section: 'التخطيط',
          question: subjectTemplates.planning,
          marks: 10,
          skill: 'تخطيط التجارب والاستقصاءات'
        },
        {
          section: 'جمع البيانات والقياس',
          question: subjectTemplates.dataCollection,
          marks: 10,
          skill: 'جمع الملاحظات والقياسات وتسجيلها'
        },
        {
          section: 'التحليل والاستنتاج',
          question: subjectTemplates.analysis,
          marks: 13,
          skill: 'تحليل البيانات والوصول إلى استنتاجات'
        },
        {
          section: 'التقييم والتحسين',
          question: subjectTemplates.evaluation,
          marks: 12,
          skill: 'تقييم الأساليب واقتراح التحسينات'
        }
      ]
    }
  }

  const generateNewQuiz = () => {
    setIsGenerating(true)
    
    setTimeout(() => {
      const newQuiz = generateQuizTemplate()
      setCurrentQuiz(newQuiz)
      const nextVariant = variantNumber + 1
      setVariantNumber(nextVariant)
      setIsGenerating(false)
      toast.success(`✨ تم إنشاء نموذج جديد #${newQuiz.variant} بأرقام وبيانات مختلفة!`, {
        description: 'جميع القيم والجداول تم تحديثها',
        duration: 3000
      })
    }, 800)
  }

  const pinQuiz = () => {
    if (currentQuiz) {
      setPinnedQuiz((current) => current?.id === currentQuiz.id ? null : currentQuiz)
      toast.success(isPinned ? 'تم إلغاء التثبيت' : 'تم تثبيت الاختبار')
    }
  }

  const loadPinnedQuiz = () => {
    if (pinnedQuiz) {
      setCurrentQuiz(pinnedQuiz)
      toast.info('تم تحميل الاختبار المثبت')
    }
  }

  const copyToClipboard = () => {
    if (!currentQuiz) return
    
    let text = `${currentQuiz.title}\n`
    text += `المجموع الكلي: ${currentQuiz.totalMarks} درجة\n`
    text += `\n${'='.repeat(60)}\n\n`
    
    currentQuiz.questions.forEach((q, idx) => {
      text += `السؤال ${idx + 1}: ${q.section} (${q.marks} درجات)\n`
      text += `المهارة: ${q.skill}\n\n`
      text += `${q.question}\n`
      text += `\n${'-'.repeat(60)}\n\n`
    })
    
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('تم النسخ إلى الحافظة')
    setTimeout(() => setCopied(false), 2000)
  }

  const printQuiz = () => {
    if (!currentQuiz) return
    window.print()
  }

  const downloadQuiz = () => {
    if (!currentQuiz) return
    
    let text = `${currentQuiz.title}\n`
    text += `المجموع الكلي: ${currentQuiz.totalMarks} درجة\n`
    text += `\n${'='.repeat(60)}\n\n`
    
    currentQuiz.questions.forEach((q, idx) => {
      text += `السؤال ${idx + 1}: ${q.section} (${q.marks} درجات)\n`
      text += `المهارة: ${q.skill}\n\n`
      text += `${q.question}\n`
      text += `\n${'-'.repeat(60)}\n\n`
    })
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentQuiz.title}.txt`
    link.click()
    URL.revokeObjectURL(url)
    
    toast.success('تم تحميل الاختبار')
  }

  return (
    <div className="space-y-4">
      {!currentQuiz ? (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                <ArrowsClockwise size={32} weight="fill" className="text-white" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-cairo">مولّد الاختبارات المتعددة</h3>
                <p className="text-muted-foreground font-noto max-w-md mx-auto">
                  ينشئ نماذج متعددة للاختبار بنفس الهيكل لكن ببيانات وقيم مختلفة في كل مرة
                </p>
              </div>

              <div className="flex gap-3 justify-center flex-wrap">
                <Button 
                  onClick={generateNewQuiz}
                  disabled={isGenerating}
                  size="lg"
                  className="gap-2 font-cairo"
                >
                  {isGenerating ? (
                    <>
                      <ArrowsClockwise size={20} className="animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Sparkle size={20} weight="fill" />
                      إنشاء اختبار جديد
                    </>
                  )}
                </Button>

                {pinnedQuiz && (
                  <Button
                    onClick={loadPinnedQuiz}
                    variant="outline"
                    size="lg"
                    className="gap-2 font-cairo"
                  >
                    <PushPin size={20} weight="fill" />
                    تحميل الاختبار المثبت
                  </Button>
                )}
              </div>

              <Alert className="max-w-md mx-auto">
                <Lightbulb size={20} className="text-accent" />
                <AlertDescription className="text-sm font-cairo mr-2">
                  <strong>كيف يعمل؟</strong><br />
                  كل نموذج يحتوي على نفس بنية الأسئلة (التخطيط، جمع البيانات، التحليل، التقييم) لكن بأرقام وقيم وجداول مختلفة
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-cairo mb-2">
                    {currentQuiz.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="font-cairo">
                      المجموع الكلي: {currentQuiz.totalMarks} درجة
                    </Badge>
                    <Badge variant="secondary" className="font-cairo">
                      {currentQuiz.questions.length} أسئلة
                    </Badge>
                    <Badge 
                      variant={isPinned ? "default" : "outline"}
                      className="font-cairo"
                    >
                      <PushPin size={14} weight={isPinned ? "fill" : "regular"} className="ml-1" />
                      {isPinned ? "مثبت" : "غير مثبت"}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap justify-end">
                  <Button
                    variant={isPinned ? "default" : "outline"}
                    size="sm"
                    onClick={pinQuiz}
                    className="gap-2 font-cairo"
                  >
                    {isPinned ? (
                      <>
                        <PushPinSlash size={16} />
                        إلغاء التثبيت
                      </>
                    ) : (
                      <>
                        <PushPin size={16} weight="fill" />
                        تثبيت
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="gap-2 font-cairo"
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={16} weight="fill" className="text-green-500" />
                        تم النسخ
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        نسخ
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={printQuiz}
                    className="gap-2 font-cairo"
                  >
                    <Printer size={16} />
                    طباعة
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadQuiz}
                    className="gap-2 font-cairo"
                  >
                    <Download size={16} />
                    تحميل
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <ScrollArea className="h-[500px]">
            <div className="space-y-4 pr-4">
              {currentQuiz.questions.map((question, idx) => (
                <Card key={idx} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="font-cairo bg-green-600">
                            السؤال {idx + 1}
                          </Badge>
                          <Badge variant="outline" className="font-cairo">
                            {question.section}
                          </Badge>
                          <Badge variant="secondary" className="font-cairo">
                            {question.marks} درجات
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground font-cairo">
                          المهارة: {question.skill}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="prose prose-sm max-w-none font-noto whitespace-pre-wrap">
                      {question.question}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <Card className="bg-accent/10 border-accent/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <ArrowsClockwise size={24} weight="fill" className="text-accent" />
                <p className="text-sm font-noto flex-1">
                  {isPinned 
                    ? 'هذا الاختبار مثبت ولن يتغير. يمكنك إلغاء التثبيت أو إنشاء اختبار جديد بأرقام مختلفة'
                    : 'اضغط لإنشاء نموذج جديد بأرقام وبيانات مختلفة، أو ثبت هذا الاختبار إذا أعجبك'
                  }
                </p>
                <Button
                  onClick={generateNewQuiz}
                  disabled={isGenerating}
                  className="gap-2 font-cairo"
                >
                  <Sparkle size={18} weight="fill" />
                  إنشاء نموذج جديد
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
