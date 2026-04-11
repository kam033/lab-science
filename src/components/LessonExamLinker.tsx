import { Experiment } from '@/data/experiments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GitBranch, BookOpen, Flask, FileText } from '@phosphor-icons/react'

interface LessonExamLinkerProps {
  experiment: Experiment
}

export function LessonExamLinker({ experiment }: LessonExamLinkerProps) {
  return (
    <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 font-cairo text-indigo-700">
          <GitBranch size={24} weight="fill" />
          ربط (درس ↔ تجربة ↔ سؤال امتحان)
        </CardTitle>
        <p className="text-sm text-muted-foreground font-noto mt-2">
          يفهم الطالب كيف يأتي الدرس في الاختبار من خلال ربطه بالتجربة
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <BookOpen size={24} weight="fill" className="text-blue-600" />
          </div>
          <div className="flex-1">
            <Badge variant="outline" className="font-cairo mb-1">
              الدرس النظري
            </Badge>
            <p className="font-semibold font-cairo">
              {experiment.unitTitle || 'الوحدة الدراسية'}
            </p>
            <p className="text-sm text-muted-foreground font-noto">
              {experiment.objectives?.[0] || 'المفاهيم الأساسية'}
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-0.5 h-8 bg-gradient-to-b from-blue-400 to-green-400" />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Flask size={24} weight="fill" className="text-green-600" />
          </div>
          <div className="flex-1">
            <Badge variant="outline" className="font-cairo mb-1">
              التجربة العملية
            </Badge>
            <p className="font-semibold font-cairo">
              {experiment.title}
            </p>
            <p className="text-sm text-muted-foreground font-noto">
              رمز: {experiment.experimentCode || experiment.id}
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-0.5 h-8 bg-gradient-to-b from-green-400 to-purple-400" />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <FileText size={24} weight="fill" className="text-purple-600" />
          </div>
          <div className="flex-1">
            <Badge variant="outline" className="font-cairo mb-1">
              نمط السؤال في الامتحان
            </Badge>
            <p className="font-semibold font-cairo">
              سؤال استقصائي مفتوح
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {experiment.skills.map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="font-cairo text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg border-2 border-indigo-200">
          <p className="text-sm font-cairo text-center">
            💡 <strong>الطالب يفهم:</strong> "هذا الدرس كيف يأتي في الاختبار" - يدرس بهدف واضح!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
