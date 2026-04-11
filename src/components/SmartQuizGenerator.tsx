import { useState } from 'react'
import { Experiment } from '@/data/experiments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkle, Download, Printer, Copy, CheckCircle, Eye, Warning, Bug } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Question {
  type: string
  question: string
  marks: number
  skill: string
  rubric?: string[]
}

interface QuizData {
  title: string
  totalMarks: number
  questions: Question[]
}

interface SmartQuizGeneratorProps {
  experiment: Experiment
}

const DEBUG_MODE = true

export function SmartQuizGenerator({ experiment }: SmartQuizGeneratorProps) {
  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [previewQuiz, setPreviewQuiz] = useState<QuizData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [errorDetails, setErrorDetails] = useState<string>('')
  const [debugInfo, setDebugInfo] = useState<string>('')

  const safeGet = (value: any, fallback: string = 'غير محدد'): string => {
    if (!value) return fallback
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(' • ') : fallback
    }
    return String(value)
  }

  const createFallbackQuiz = (): QuizData => {
    const fallbackTitle = experiment.title || 'تجربة علمية'
    
    return {
      title: `اختبار استقصاء: ${fallbackTitle}`,
      totalMarks: 45,
      questions: [
        {
          type: 'التخطيط',
          question: `خطط لإجراء تجربة ${fallbackTitle}:\n\n` +
            `أ) حدد المتغيرات:\n` +
            `   - المتغير المستقل: ${safeGet(experiment.variables?.independent, 'المتغير الذي تغيره')}\n` +
            `   - المتغير التابع: ${safeGet(experiment.variables?.dependent, 'المتغير الذي تقيسه')}\n` +
            `   - المتغيرات الثابتة: ${safeGet(experiment.variables?.controlled, 'المتغيرات التي تبقيها ثابتة')}\n\n` +
            `ب) اكتب فرضية علمية قابلة للاختبار\n\n` +
            `ج) صف طريقة التنفيذ باستخدام: ${safeGet(experiment.apparatus)}\n\n` +
            `د) اذكر 3 إجراءات سلامة مهمة`,
          marks: 10,
          skill: 'تخطيط التجارب والاستقصاءات',
          rubric: [
            'تحديد المتغيرات الثلاثة بدقة (3 درجات)',
            'فرضية واضحة وقابلة للاختبار (2 درجة)',
            'طريقة منطقية ومنظمة (3 درجات)',
            'إجراءات سلامة مناسبة (2 درجة)'
          ]
        },
        {
          type: 'جمع البيانات والقياس',
          question: `صمم جدول بيانات لتسجيل نتائج تجربة ${fallbackTitle}:\n\n` +
            `أ) حدد الأعمدة المطلوبة مع الوحدات\n` +
            `ب) اقترح عدد القراءات المناسب ولماذا\n` +
            `ج) حدد نطاق القيم المتوقعة\n` +
            `د) كيف ستحسن دقة القياسات؟`,
          marks: 10,
          skill: 'جمع الملاحظات والقياسات وتسجيلها',
          rubric: [
            'جدول منظم مع عناوين واضحة (2 درجة)',
            'وحدات قياسية صحيحة (2 درجة)',
            'عدد قراءات مناسب مع تبرير (3 درجات)',
            'نطاق واقعي ودقة محسنة (3 درجات)'
          ]
        },
        {
          type: 'التحليل والاستنتاج',
          question: `بناءً على البيانات المتوقعة من ${fallbackTitle}:\n\n` +
            `أ) ارسم رسماً بيانياً:\n` +
            `   - المحور الأفقي (x): ${safeGet(experiment.variables?.independent, 'المتغير المستقل')}\n` +
            `   - المحور الرأسي (y): ${safeGet(experiment.variables?.dependent, 'المتغير التابع')}\n` +
            `   - ضع عنواناً مناسباً ووحدات على المحاور\n\n` +
            `ب) صف العلاقة المتوقعة (طردية/عكسية/ثابتة)\n\n` +
            `ج) احسب قيمة فيزيائية من الرسم (ميل، قيمة ثابت، معدل)\n\n` +
            `د) اكتب استنتاجاً علمياً واربطه بالنظرية`,
          marks: 13,
          skill: 'تحليل البيانات والوصول إلى استنتاجات',
          rubric: [
            'رسم بياني صحيح مع عنوان ووحدات (5 درجات)',
            'وصف دقيق للعلاقة (3 درجات)',
            'حساب صحيح من الرسم (3 درجات)',
            'استنتاج علمي مرتبط بالنظرية (2 درجة)'
          ]
        },
        {
          type: 'التقييم والتحسين',
          question: `قيّم تجربة ${fallbackTitle}:\n\n` +
            `أ) حدد 3 مصادر خطأ محتملة وكيف تؤثر على النتائج\n\n` +
            `ب) اقترح 3 تحسينات عملية لزيادة الدقة والموثوقية\n\n` +
            `ج) هل النتائج المتوقعة دقيقة وموثوقية؟ فسر إجابتك\n\n` +
            `د) اقترح امتداداً للتجربة لدراسة متغير إضافي`,
          marks: 12,
          skill: 'تقييم الأساليب واقتراح التحسينات',
          rubric: [
            'تحديد 3 مصادر خطأ واقعية (3 درجات)',
            'اقتراح 3 تحسينات عملية (3 درجات)',
            'تقييم الدقة مع تبرير (3 درجات)',
            'امتداد مناسب ومبتكر (3 درجات)'
          ]
        }
      ]
    }
  }

  const generatePreview = async () => {
    setIsGenerating(true)
    setErrorDetails('')
    setDebugInfo('')
    
    try {
      if (DEBUG_MODE) {
        const info = `معلومات التجربة:\n` +
          `العنوان: ${experiment.title}\n` +
          `المادة: ${experiment.subject}\n` +
          `الوحدة: ${experiment.unitTitle || 'غير محدد'}\n` +
          `الأهداف: ${safeGet(experiment.objectives)}\n` +
          `المكونات: ${safeGet(experiment.components)}\n` +
          `الأجهزة: ${safeGet(experiment.apparatus)}\n` +
          `المهارات: ${safeGet(experiment.skills)}\n` +
          `المتغيرات: ${JSON.stringify(experiment.variables || {})}`
        
        setDebugInfo(info)
        console.log('🔍 Debug Info:', info)
      }

      const promptText = `أنت خبير في تقييم الاستقصاء العلمي للصف الثاني عشر حسب التعميم السعودي.

أنشئ اختبار استقصاء علمي كامل ومفصل للتجربة التالية:

**عنوان التجربة:** ${experiment.title || 'تجربة علمية'}
**المادة:** ${experiment.subject || 'علوم'}
**الوحدة:** ${experiment.unitTitle || 'غير محدد'}
**الأهداف:** ${safeGet(experiment.objectives)}
**المكونات:** ${safeGet(experiment.components)}
**الأجهزة:** ${safeGet(experiment.apparatus)}
**المهارات:** ${safeGet(experiment.skills)}
**نوع التجربة:** ${experiment.type || 'استقصاء عملي'}
**المتغيرات:**
- المستقل: ${safeGet(experiment.variables?.independent)}
- التابع: ${safeGet(experiment.variables?.dependent)}
- الثابتة: ${safeGet(experiment.variables?.controlled)}

يجب أن يشمل الاختبار 4 أقسام رئيسية:

**القسم الأول: التخطيط (10 درجات)**
- تحديد المتغير المستقل والتابع والثابت بدقة
- كتابة فرضية علمية قابلة للاختبار
- اقتراح طريقة منهجية لتنفيذ التجربة
- ذكر إجراءات السلامة المناسبة

**القسم الثاني: جمع البيانات والقياس (10 درجات)**
- تصميم جدول بيانات شامل مع الأعمدة والوحدات
- تحديد الأدوات القياسية المناسبة
- اقتراح عدد القراءات وتكرارها
- تحديد نطاق ودقة القياسات

**القسم الثالث: التحليل والاستنتاج (13 درجة)**
- رسم بياني كامل (محاور، عنوان، وحدات، منحنى)
- وصف النمط والعلاقة في البيانات
- حسابات (ميل، معدل، قيمة فيزيائية)
- استنتاج علمي مرتبط بالنظرية

**القسم الرابع: التقييم والتحسين (12 درجة)**
- تحديد 3 مصادر خطأ وتأثيرها
- اقتراح 3 تحسينات عملية
- تقييم دقة وموثوقية النتائج
- اقتراح امتداد للتجربة

**المجموع الكلي: 45 درجة**

**ملاحظات خاصة بهذه التجربة:**
${experiment.title.includes('انقسام') || experiment.title.includes('مجهر') ? 
  '- استخدم أسئلة تتعلق بالمجهر، تحديد الأطوار، الملاحظات المجهرية، والرسم العلمي' : 
  experiment.title.includes('pH') || experiment.title.includes('معايرة') ?
  '- ركز على قراءات pH، حجوم المحاليل، منحنى المعايرة، ونقطة التكافؤ' :
  experiment.title.includes('ضوء') || experiment.title.includes('ليزر') ?
  '- اهتم بقياسات المسافات، الزوايا، الأطوال الموجية، والنمط الضوئي' :
  '- اجعل الأسئلة مرتبطة مباشرة بطبيعة التجربة ومكوناتها'}

أعطني النتيجة كـ JSON object فقط مع البنية التالية:
{
  "title": "اختبار استقصاء: [اسم التجربة]",
  "totalMarks": 45,
  "questions": [
    {
      "type": "التخطيط",
      "question": "نص السؤال المفصل والمحدد بالعربية",
      "marks": 10,
      "skill": "تخطيط التجارب والاستقصاءات",
      "rubric": ["معيار 1", "معيار 2", "معيار 3"]
    }
  ]
}

**مهم جداً:**
- اجعل الأسئلة مفصلة ومحددة لهذه التجربة بالذات
- استخدم قيم وأرقام واقعية من سياق التجربة
- اكتب بلغة علمية واضحة ومباشرة
- كل سؤال يجب أن يكون قابل للتطبيق الفوري`

      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      
      if (DEBUG_MODE) {
        console.log('📥 Response:', response)
      }
      
      const quizData = JSON.parse(response) as QuizData
      
      if (!quizData || !quizData.questions || quizData.questions.length === 0) {
        throw new Error('البيانات المستلمة غير صالحة')
      }
      
      setPreviewQuiz(quizData)
      toast.success('تم إنشاء معاينة الاختبار!')
      
    } catch (error) {
      console.error('❌ Error generating quiz preview:', error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      setErrorDetails(`تفاصيل الخطأ: ${errorMessage}`)
      
      if (DEBUG_MODE) {
        toast.error(`فشل إنشاء الاختبار الذكي. السبب: ${errorMessage}`, { duration: 5000 })
      }
      
      const fallback = createFallbackQuiz()
      setPreviewQuiz(fallback)
      toast.info('تم إنشاء اختبار افتراضي بسبب عدم توفر البيانات الكاملة', { duration: 4000 })
      
    } finally {
      setIsGenerating(false)
    }
  }

  const confirmQuiz = () => {
    if (previewQuiz) {
      setQuiz(previewQuiz)
      setPreviewQuiz(null)
      toast.success('تم تأكيد الاختبار!')
    }
  }

  const copyToClipboard = () => {
    if (!quiz) return
    
    let text = `${quiz.title}\n`
    text += `المجموع الكلي: ${quiz.totalMarks} درجة\n`
    text += `\n${'='.repeat(60)}\n\n`
    
    quiz.questions.forEach((q, idx) => {
      text += `السؤال ${idx + 1}: ${q.type} (${q.marks} درجات)\n`
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
    if (!quiz) return
    window.print()
  }

  const downloadQuiz = () => {
    if (!quiz) return
    
    let text = `${quiz.title}\n`
    text += `المجموع الكلي: ${quiz.totalMarks} درجة\n`
    text += `\n${'='.repeat(60)}\n\n`
    
    quiz.questions.forEach((q, idx) => {
      text += `السؤال ${idx + 1}: ${q.type} (${q.marks} درجات)\n`
      text += `المهارة: ${q.skill}\n\n`
      text += `${q.question}\n`
      text += `\n${'-'.repeat(60)}\n\n`
    })
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `اختبار-${experiment.title}.txt`
    link.click()
    URL.revokeObjectURL(url)
    
    toast.success('تم تحميل الاختبار')
  }

  return (
    <div className="space-y-4">
      {DEBUG_MODE && debugInfo && (
        <Alert className="bg-muted border-l-4 border-l-blue-500">
          <Bug size={20} className="text-blue-500" />
          <AlertDescription className="text-xs font-mono whitespace-pre-wrap ml-2">
            {debugInfo}
          </AlertDescription>
        </Alert>
      )}

      {errorDetails && (
        <Alert className="bg-destructive/10 border-l-4 border-l-destructive">
          <Warning size={20} className="text-destructive" />
          <AlertDescription className="text-sm font-cairo ml-2 text-destructive">
            {errorDetails}
          </AlertDescription>
        </Alert>
      )}

      {!quiz && !previewQuiz ? (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkle size={32} weight="fill" className="text-white" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-cairo">مولّد الاختبار الذكي</h3>
                <p className="text-muted-foreground font-noto max-w-md mx-auto">
                  اضغط لإنشاء اختبار استقصاء شامل مطابق للتعميم السعودي - يتضمن 4 أقسام: التخطيط، جمع البيانات، التحليل والاستنتاج، والتقييم والتحسين
                </p>
              </div>

              <Button 
                onClick={generatePreview}
                disabled={isGenerating}
                size="lg"
                className="gap-2 font-cairo"
              >
                {isGenerating ? (
                  <>
                    <Sparkle size={20} className="animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <Eye size={20} weight="fill" />
                    معاينة الاختبار
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground font-cairo">
                يستغرق حوالي 10-15 ثانية
              </div>
            </div>
          </CardContent>
        </Card>
      ) : previewQuiz && !quiz ? (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-cairo mb-2">
                    <Eye size={24} className="inline ml-2" />
                    معاينة: {previewQuiz.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="font-cairo">
                      المجموع الكلي: {previewQuiz.totalMarks} درجة
                    </Badge>
                    <Badge variant="secondary" className="font-cairo">
                      {previewQuiz.questions.length} أسئلة
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {previewQuiz.questions.map((question, idx) => (
                <Card key={idx} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="font-cairo bg-primary">
                            السؤال {idx + 1}
                          </Badge>
                          <Badge variant="outline" className="font-cairo">
                            {question.type}
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
                    
                    {question.rubric && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <div className="text-xs font-semibold text-muted-foreground mb-2 font-cairo">
                          معايير التقييم:
                        </div>
                        <ul className="text-sm space-y-1 font-noto">
                          {question.rubric.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-3">
            <Button
              onClick={confirmQuiz}
              size="lg"
              className="flex-1 gap-2 font-cairo"
            >
              <CheckCircle size={20} weight="fill" />
              تأكيد واستخدام هذا الاختبار
            </Button>
            <Button
              onClick={() => setPreviewQuiz(null)}
              variant="outline"
              size="lg"
              className="font-cairo"
            >
              إلغاء
            </Button>
          </div>
        </div>
      ) : quiz ? (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-cairo mb-2">
                    {quiz.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="font-cairo">
                      المجموع الكلي: {quiz.totalMarks} درجة
                    </Badge>
                    <Badge variant="secondary" className="font-cairo">
                      {quiz.questions.length} أسئلة
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
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
              {quiz.questions.map((question, idx) => (
                <Card key={idx} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="font-cairo bg-primary">
                            السؤال {idx + 1}
                          </Badge>
                          <Badge variant="outline" className="font-cairo">
                            {question.type}
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
                    
                    {question.rubric && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <div className="text-xs font-semibold text-muted-foreground mb-2 font-cairo">
                          معايير التقييم:
                        </div>
                        <ul className="text-sm space-y-1 font-noto">
                          {question.rubric.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <Card className="bg-accent/10 border-accent/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Sparkle size={24} weight="fill" className="text-accent" />
                <p className="text-sm font-noto flex-1">
                  يمكنك تعديل الأسئلة حسب احتياجاتك أو إنشاء اختبار جديد بضغطة زر
                </p>
                <Button
                  variant="outline"
                  onClick={() => setQuiz(null)}
                  className="font-cairo"
                >
                  إنشاء اختبار جديد
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
