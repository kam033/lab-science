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
    const baseValues = {
      distances: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      intensities: [100, 25, 11.1, 6.25, 4, 2.78, 2.04, 1.56, 1.23, 1],
      temperatures: [20, 30, 40, 50, 60],
      concentrations: [0.5, 1.0, 1.5, 2.0, 2.5],
      times: [0, 10, 20, 30, 40, 50],
      volumes: [0, 5, 10, 15, 20, 25],
      phValues: [1, 2, 3, 7, 11, 12, 13]
    }

    const randomFactor = 0.8 + Math.random() * 0.4
    
    return {
      distances: baseValues.distances.map(v => +(v * randomFactor).toFixed(1)),
      intensities: baseValues.intensities.map(v => +(v * randomFactor).toFixed(2)),
      temperatures: baseValues.temperatures.map(v => +(v * randomFactor).toFixed(0)),
      concentrations: baseValues.concentrations.map(v => +(v * randomFactor).toFixed(2)),
      times: baseValues.times.map(v => +(v * randomFactor).toFixed(0)),
      volumes: baseValues.volumes.map(v => +(v * randomFactor).toFixed(1)),
      phValues: baseValues.phValues.map(v => +(v * randomFactor).toFixed(1))
    }
  }

  const generateQuizTemplate = (): GeneratedQuiz => {
    const quizId = `${experiment.id}-v${variantNumber}-${Date.now()}`
    const values = generateRandomValues()
    
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

المسافات المقترحة (m): ${values.distances.slice(0, 5).join(', ')}

أ) حدد عناوين الأعمدة مع الوحدات
ب) كم عدد القراءات المناسب؟ ولماذا؟
ج) ما نطاق القيم المتوقعة؟
د) كيف تحسن دقة القياس؟`,

        analysis: `بناءً على البيانات التالية:

${values.distances.slice(0, 5).map((d, i) => `عند ${d} m: القيمة = ${values.intensities[i]}`).join('\n')}

أ) ارسم رسماً بيانياً:
   - المحور الأفقي: ${experiment.variables?.independent || 'المسافة'}
   - المحور الرأسي: ${experiment.variables?.dependent || 'الشدة'}
   
ب) صف العلاقة (طردية/عكسية/أسية)

ج) احسب قيمة فيزيائية من الرسم (الميل أو الثابت)

د) استنتج القانون الفيزيائي`,

        evaluation: `قيّم التجربة:

أ) حدد 3 مصادر خطأ:
   1. خطأ في القياس (±___ وحدة)
   2. ...
   3. ...

ب) اقترح 3 تحسينات عملية

ج) هل النتائج دقيقة؟ احسب نسبة الخطأ

د) اقترح امتداداً للتجربة`
      },
      
      chemistry: {
        planning: `خطط لتجربة ${experiment.title}:

أ) المتغيرات:
   - المستقل: ${experiment.variables?.independent || 'التركيز'}
   - التابع: ${experiment.variables?.dependent || 'معدل التفاعل'}
   - الثابتة: ${experiment.variables?.controlled?.join(' • ') || 'درجة الحرارة، الحجم'}

ب) فرضية قابلة للاختبار

ج) الأدوات: ${experiment.apparatus.slice(0, 3).join(' • ')}

د) إجراءات السلامة (3 نقاط محددة)`,

        dataCollection: `صمم جدول للبيانات:

التراكيز المقترحة (mol/L): ${values.concentrations.join(', ')}
الأزمنة (s): ${values.times.slice(0, 6).join(', ')}

أ) عناوين الأعمدة والوحدات
ب) عدد التكرارات المناسب
ج) كيف تحسب المعدل؟
د) ما دقة القياس المطلوبة؟`,

        analysis: `البيانات المسجلة:

${values.concentrations.map((c, i) => `تركيز ${c} mol/L: الزمن = ${values.times[i]} s`).join('\n')}

أ) ارسم منحنى العلاقة:
   - المحور x: التركيز (mol/L)
   - المحور y: ${experiment.variables?.dependent || 'معدل التفاعل'}

ب) احسب معدل التفاعل عند تركيز محدد

ج) ما رتبة التفاعل؟

د) اربط النتائج بنظرية التصادم`,

        evaluation: `تقييم وتحسين:

أ) مصادر الخطأ (3):
   - خطأ في قياس الحجم
   - ...

ب) تحسينات مقترحة (3)

ج) قارن النتائج بالقيم النظرية

د) تطبيق عملي للنتائج`
      },

      biology: {
        planning: `التخطيط لاستقصاء ${experiment.title}:

أ) المتغيرات:
   - المستقل: ${experiment.variables?.independent || 'المتغير المؤثر'}
   - التابع: ${experiment.variables?.dependent || 'الاستجابة المقاسة'}
   - الثابتة: ${experiment.variables?.controlled?.join(' • ') || 'الظروف البيئية'}

ب) الفرضية الحيوية

ج) المواد والأدوات: ${experiment.apparatus.slice(0, 3).join(' • ')}

د) السلامة الحيوية (3 إجراءات)`,

        dataCollection: `تصميم جدول الملاحظات:

${experiment.title.includes('خميرة') ? 
  `التراكيز (g/L): ${values.concentrations.join(', ')}\nالأزمنة (min): ${values.times.slice(0, 6).join(', ')}` :
  experiment.title.includes('ضوئي') ?
  `الأطوال الموجية (nm): 400, 500, 600, 700\nمعدل الفقاعات (/min): ${[5, 12, 8, 3].join(', ')}` :
  `القيم المقاسة: ${values.distances.slice(0, 5).join(', ')}`
}

أ) تصميم الجدول الكامل
ب) عدد العينات والتكرارات
ج) كيفية القياس الدقيق
د) معايير الملاحظة`,

        analysis: `تحليل النتائج الحيوية:

البيانات:
${experiment.title.includes('انقسام') ? 
  `الطور البيني: 60%, الطور التمهيدي: 25%, الطور الاستوائي: 10%, الطور الانفصالي: 5%` :
  `${values.concentrations.slice(0, 4).map((c, i) => `${c} g/L → ${values.times[i]} دقيقة`).join('\n')}`
}

أ) ارسم تمثيلاً بيانياً مناسباً

ب) احسب المعدل أو النسبة

ج) ما العلاقة البيولوجية؟

د) اربط بالعمليات الخلوية`,

        evaluation: `التقييم البيولوجي:

أ) مصادر الخطأ الحيوية (3):
   - تباين العينات البيولوجية
   - ...

ب) تحسينات التجربة (3)

ج) موثوقية النتائج البيولوجية

د) تطبيقات حياتية`
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
      setVariantNumber(prev => prev + 1)
      setIsGenerating(false)
      toast.success(`تم إنشاء النموذج ${newQuiz.variant}`)
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
