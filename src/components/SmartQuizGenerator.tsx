import { useState } from 'react'
import { Experiment } from '@/data/experiments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkle, Download, Eye, Clipboard } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface SmartQuizGeneratorProps {
  experiment: Experiment
}

interface QuizQuestion {
  type: 'تحديد متغيرات' | 'جدول بيانات' | 'رسم بياني' | 'تحليل' | 'تقييم'
  question: string
  answer?: string
  skill: string
}

export function SmartQuizGenerator({ experiment }: SmartQuizGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [showQuiz, setShowQuiz] = useState(false)

  const generateQuiz = async () => {
    setIsGenerating(true)
    toast.loading('جاري إنشاء الاختبار...', { id: 'quiz-gen' })

    try {
      const prompt = spark.llmPrompt`
أنت معلم علوم خبير. أنشئ اختبار استقصاء علمي مطابق للتعميم الكويتي للصف 12.

التجربة: ${experiment.title}
المادة: ${experiment.subject}
المهارات: ${experiment.skills.join('، ')}
الأهداف: ${experiment.objectives?.join('، ') || 'لا يوجد'}

أنشئ 5 أسئلة تغطي جميع مهارات الاستقصاء:

1. سؤال عن تحديد المتغيرات (المستقل والتابع والثابت)
2. سؤال عن تصميم جدول بيانات مناسب
3. سؤال عن نوع الرسم البياني المناسب والمحاور
4. سؤال تحليلي عن النتائج المتوقعة
5. سؤال تقييمي عن تحسين التجربة أو مصادر الخطأ

قدّم الإجابة كـJSON بهذا الشكل:
{
  "questions": [
    {
      "type": "تحديد متغيرات",
      "question": "نص السؤال",
      "answer": "الإجابة النموذجية",
      "skill": "تخطيط"
    }
  ]
}

تأكد أن الأسئلة:
- واقعية ومناسبة لمستوى الصف 12
- تغطي جميع مهارات الاستقصاء
- مرتبطة بالتجربة المحددة
- باللغة العربية الفصحى
`

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const data = JSON.parse(response)
      setQuestions(data.questions)
      setShowQuiz(true)
      toast.success('تم إنشاء الاختبار بنجاح!', { id: 'quiz-gen' })
    } catch (error) {
      console.error('Quiz generation error:', error)
      toast.error('حدث خطأ في إنشاء الاختبار', { id: 'quiz-gen' })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    const text = questions.map((q, idx) => 
      `السؤال ${idx + 1} (${q.type}):\n${q.question}\n\nالإجابة النموذجية:\n${q.answer}\n\n`
    ).join('---\n\n')
    
    navigator.clipboard.writeText(text)
    toast.success('تم نسخ الاختبار!')
  }

  const downloadQuiz = () => {
    const text = `اختبار استقصاء: ${experiment.title}\n\n` +
      questions.map((q, idx) => 
        `السؤال ${idx + 1} - ${q.type} (المهارة: ${q.skill}):\n${q.question}\n\nالإجابة النموذجية:\n${q.answer}\n\n`
      ).join('━━━━━━━━━━━━━━━━━━\n\n')
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `اختبار_${experiment.experimentCode || experiment.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('تم تنزيل الاختبار!')
  }

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 font-cairo text-purple-700">
          <Sparkle size={24} weight="fill" />
          مولّد اختبار الاستقصاء الذكي
        </CardTitle>
        <p className="text-sm text-muted-foreground font-noto mt-2">
          اضغط الزر لتوليد اختبار جاهز يغطي جميع مهارات الاستقصاء العلمي (تحديد متغيرات، جدول بيانات، رسم بياني، تحليل، تقييم) - مطابق 100% للتعميم الكويتي
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {!showQuiz ? (
          <Button
            onClick={generateQuiz}
            disabled={isGenerating}
            className="w-full gap-2 font-cairo text-lg h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Sparkle size={20} weight="fill" />
            {isGenerating ? 'جاري الإنشاء...' : 'إنشاء اختبار تلقائي'}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuiz(false)}
                className="gap-1.5 font-cairo"
              >
                <Eye size={16} />
                إخفاء
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="gap-1.5 font-cairo"
              >
                <Clipboard size={16} />
                نسخ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadQuiz}
                className="gap-1.5 font-cairo"
              >
                <Download size={16} />
                تنزيل
              </Button>
              <Button
                size="sm"
                onClick={generateQuiz}
                disabled={isGenerating}
                className="gap-1.5 font-cairo"
              >
                <Sparkle size={16} weight="fill" />
                إعادة التوليد
              </Button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key="questions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {questions.map((q, idx) => (
                  <Card key={idx} className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-700 font-cairo">
                            السؤال {idx + 1}
                          </Badge>
                          <Badge variant="outline" className="font-cairo">
                            {q.type}
                          </Badge>
                        </div>
                        <Badge variant="secondary" className="font-cairo text-xs">
                          {q.skill}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="font-semibold text-foreground font-cairo mb-2">
                          السؤال:
                        </p>
                        <p className="text-sm font-noto bg-white p-3 rounded-lg border">
                          {q.question}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-green-700 font-cairo mb-2">
                          ✓ الإجابة النموذجية:
                        </p>
                        <p className="text-sm font-noto bg-green-50 p-3 rounded-lg border border-green-200 text-green-900">
                          {q.answer}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
