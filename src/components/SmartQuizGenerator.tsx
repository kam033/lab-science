import { useState } from 'react'
import { Experiment } from '@/data/experiments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sparkle, Download, Printer, Copy, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Question {
  type: string
  question: string
  marks: number
  skill: string
}

interface QuizData {
  title: string
  totalMarks: number
  questions: Question[]
}

interface SmartQuizGeneratorProps {
  experiment: Experiment
}

export function SmartQuizGenerator({ experiment }: SmartQuizGeneratorProps) {
  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateQuiz = async () => {
    setIsGenerating(true)
    
    try {
      const promptText = `أنت خبير في تقييم الاستقصاء العلمي للصف الثاني عشر حسب التعميم السعودي.

أنشئ اختبار استقصاء علمي كامل ومفصل للتجربة التالية:

**عنوان التجربة:** ${experiment.title}
**المادة:** ${experiment.subject}
**الوحدة:** ${experiment.unitTitle || 'غير محدد'}
**الأهداف:** ${experiment.objectives?.join(' • ') || 'غير محدد'}
**المكونات:** ${experiment.components.join(' • ')}
**الأجهزة:** ${experiment.apparatus.join(' • ')}
**المهارات:** ${experiment.skills.join(' • ')}
**المتغيرات:**
- المستقل: ${experiment.variables?.independent || 'غير محدد'}
- التابع: ${experiment.variables?.dependent || 'غير محدد'}
- الثابتة: ${experiment.variables?.controlled?.join(' • ') || 'غير محدد'}

يجب أن يشمل الاختبار الأسئلة التالية بالتحديد:

1. **سؤال التخطيط (10 درجات):**
   - تحديد المتغير المستقل والتابع والثابت
   - كتابة فرضية علمية
   - اقتراح طريقة لتنفيذ التجربة
   - ذكر إجراءات السلامة

2. **سؤال جمع البيانات (8 درجات):**
   - تصميم جدول بيانات مناسب مع الأعمدة المطلوبة
   - تحديد الوحدات القياسية
   - اقتراح عدد القراءات المناسب
   - تحديد نطاق القياسات

3. **سؤال الرسم البياني (10 درجات):**
   - تحديد المحور السيني والصادي
   - رسم منحنى أو خط مناسب
   - وضع عنوان للرسم
   - كتابة وحدات المحاور
   - تحديد العلاقة (طردية/عكسية/ثابتة)

4. **سؤال التحليل (8 درجات):**
   - وصف النمط في البيانات
   - حساب معدل أو ميل أو قيمة من الرسم
   - كتابة استنتاج علمي
   - ربط النتائج بالنظرية العلمية

5. **سؤال التقييم (9 درجات):**
   - تحديد مصادر الخطأ (3)
   - اقتراح تحسينات (3)
   - تقييم دقة النتائج
   - اقتراح امتدادات للتجربة

**المجموع الكلي: 45 درجة**

أعطني النتيجة كـ JSON object مع بنية:
{
  "title": "اختبار استقصاء: [اسم التجربة]",
  "totalMarks": 45,
  "questions": [
    {
      "type": "التخطيط",
      "question": "نص السؤال المفصل بالعربية",
      "marks": 10,
      "skill": "تخطيط التجارب",
      "rubric": ["معيار 1", "معيار 2", ...]
    }
  ]
}

**مهم جداً:**
- اجعل الأسئلة مفصلة ومحددة لهذه التجربة بالذات
- استخدم أرقام وقيم واقعية مناسبة للتجربة
- اكتب بلغة علمية واضحة
- كل سؤال يجب أن يكون قابل للتطبيق المباشر`

      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      const quizData = JSON.parse(response) as QuizData
      
      setQuiz(quizData)
      toast.success('تم إنشاء الاختبار بنجاح!')
    } catch (error) {
      console.error('Error generating quiz:', error)
      toast.error('حدث خطأ في إنشاء الاختبار')
    } finally {
      setIsGenerating(false)
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
      {!quiz ? (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkle size={32} weight="fill" className="text-white" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-cairo">مولّد الاختبار الذكي</h3>
                <p className="text-muted-foreground font-noto max-w-md mx-auto">
                  اضغط لإنشاء اختبار استقصاء شامل مطابق للتعميم السعودي - يتضمن التخطيط، جمع البيانات، الرسم البياني، التحليل، والتقييم
                </p>
              </div>

              <Button 
                onClick={generateQuiz}
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
                    <Sparkle size={20} weight="fill" />
                    إنشاء اختبار استقصاء
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground font-cairo">
                يستغرق حوالي 10-15 ثانية
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
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
                    
                    {'rubric' in question && (question as any).rubric && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <div className="text-xs font-semibold text-muted-foreground mb-2 font-cairo">
                          معايير التقييم:
                        </div>
                        <ul className="text-sm space-y-1 font-noto">
                          {(question as any).rubric.map((item: string, i: number) => (
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
      )}
    </div>
  )
}
