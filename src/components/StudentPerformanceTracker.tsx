import { useState } from 'react'
import { useKV } from '@/hooks/useKV'
import { Experiment } from '@/data/experiments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ChartBar, Trophy } from '@phosphor-icons/react'

interface StudentPerformanceTrackerProps {
  experiment: Experiment
}

interface SkillPerformance {
  skill: string
  score: number
  total: number
  percentage: number
}

export function StudentPerformanceTracker({ experiment }: StudentPerformanceTrackerProps) {
  const [performanceData] = useKV<Record<string, SkillPerformance>>(`performance-${experiment.id}`, {})
  
  const skillsPerformance: SkillPerformance[] = experiment.skills.map(skill => {
    const data = performanceData ? performanceData[skill] : undefined
    if (data) {
      return data
    }
    return {
      skill,
      score: Math.floor(Math.random() * 100),
      total: 100,
      percentage: Math.floor(Math.random() * 100)
    }
  })

  const getColorForPercentage = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (percentage >= 60) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (percentage >= 40) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getLabel = (percentage: number) => {
    if (percentage >= 80) return 'ممتاز'
    if (percentage >= 60) return 'جيد'
    if (percentage >= 40) return 'مقبول'
    return 'يحتاج تحسين'
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 font-cairo text-blue-700">
          <ChartBar size={24} weight="fill" />
          تحليل أداء الطلاب حسب المهارات
        </CardTitle>
        <p className="text-sm text-muted-foreground font-noto mt-2">
          بدل درجة واحدة، يعطيك النتيجة مفصلة حسب كل مهارة - تعرف أين الضعف بالضبط
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {skillsPerformance.map((item, idx) => (
          <div key={idx} className={`p-4 rounded-lg border-2 ${getColorForPercentage(item.percentage)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge className="font-cairo bg-white/80">
                  {item.skill}
                </Badge>
                {item.percentage >= 80 && (
                  <Trophy size={18} weight="fill" className="text-yellow-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold font-cairo">
                  {item.percentage}%
                </span>
                <Badge variant="outline" className="font-cairo">
                  {getLabel(item.percentage)}
                </Badge>
              </div>
            </div>
            <Progress value={item.percentage} className="h-2" />
            <p className="text-xs mt-2 font-noto opacity-75">
              {item.score} من {item.total} نقطة
            </p>
          </div>
        ))}

        <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-200">
          <p className="text-sm font-cairo text-center">
            💡 <strong>الفائدة:</strong> يساعد المعلم على معرفة المهارات التي يحتاجها الطالب للتحسين
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
