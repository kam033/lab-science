import { useState } from 'react'
import { Experiment } from '@/data/experiments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WarningCircle, CheckCircle, Lightbulb } from '@phosphor-icons/react'

interface ErrorDetectionAssistantProps {
  experiment: Experiment
}

interface CommonError {
  type: string
  error: string
  suggestion: string
  icon: 'warning' | 'check' | 'tip'
}

export function ErrorDetectionAssistant({ experiment }: ErrorDetectionAssistantProps) {
  const [showErrors] = useState(true)

  const commonErrors: CommonError[] = [
    {
      type: 'المتغيرات',
      error: 'لم يذكر متغير ثابت',
      suggestion: 'تأكد من ذكر جميع المتغيرات الثابتة (مثل: درجة الحرارة، نوع المادة، الحجم)',
      icon: 'warning'
    },
    {
      type: 'الرسم البياني',
      error: 'رسم بياني بدون وحدات',
      suggestion: 'يجب كتابة وحدة القياس على كل محور (مثل: الزمن/ثانية، الكتلة/غرام)',
      icon: 'warning'
    },
    {
      type: 'جدول البيانات',
      error: 'جدول ناقص',
      suggestion: 'يجب أن يحتوي الجدول على: عنوان واضح، أسماء الأعمدة، الوحدات، القيم',
      icon: 'warning'
    },
    {
      type: 'السلامة',
      error: 'نسي إجراءات السلامة',
      suggestion: `للتجربة الحالية، تذكر: ${experiment.safety?.slice(0, 2).join(' • ') || 'إجراءات السلامة العامة'}`,
      icon: 'tip'
    }
  ]

  return (
    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 font-cairo text-amber-700">
          <WarningCircle size={24} weight="fill" />
          مساعد كشف الأخطاء الذكي
        </CardTitle>
        <p className="text-sm text-muted-foreground font-noto mt-2">
          يكتشف الأخطاء الشائعة تلقائياً ويعطي توجيهات فورية للطالب
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {showErrors && commonErrors.map((item, idx) => (
          <div 
            key={idx} 
            className={`p-4 rounded-lg border-2 ${
              item.icon === 'warning' ? 'bg-amber-50 border-amber-200' :
              item.icon === 'check' ? 'bg-green-50 border-green-200' :
              'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {item.icon === 'warning' && <WarningCircle size={20} weight="fill" className="text-amber-600" />}
                {item.icon === 'check' && <CheckCircle size={20} weight="fill" className="text-green-600" />}
                {item.icon === 'tip' && <Lightbulb size={20} weight="fill" className="text-blue-600" />}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-cairo text-xs">
                    {item.type}
                  </Badge>
                  <span className="text-sm font-semibold font-cairo text-red-700">
                    ❌ {item.error}
                  </span>
                </div>
                <p className="text-sm font-noto bg-white/60 p-2 rounded">
                  <strong className="text-green-700">✓ الحل:</strong> {item.suggestion}
                </p>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-200">
          <p className="text-sm font-cairo text-center">
            🎯 <strong>النظام يقول للطالب:</strong> "انتبه: لم تذكر الوحدات" - يتعلم بشكل فوري!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
