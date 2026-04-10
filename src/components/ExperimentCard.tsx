import { Experiment, subjects } from '@/data/experiments'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flask, Atom, Leaf, Star, Cpu } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface ExperimentCardProps {
  experiment: Experiment
  onClick: () => void
  isFavorite: boolean
  onToggleFavorite: (e: React.MouseEvent) => void
}

export function ExperimentCard({ experiment, onClick, isFavorite, onToggleFavorite }: ExperimentCardProps) {
  const subjectInfo = subjects[experiment.subject]
  const hasSimulation = ['bio-membrane', 'chem-1-1', 'phys-1-6'].includes(experiment.id)

  const SubjectIcon = 
    experiment.subject === 'chemistry' ? Flask :
    experiment.subject === 'physics' ? Atom :
    Leaf

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="cursor-pointer h-full hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/30 relative overflow-hidden"
        onClick={onClick}
      >
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: subjectInfo.color }}
        />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge 
              variant="secondary"
              className="gap-1.5 font-cairo font-medium"
              style={{ 
                backgroundColor: `${subjectInfo.color}20`,
                color: subjectInfo.color,
                borderColor: `${subjectInfo.color}40`
              }}
            >
              <SubjectIcon size={16} weight="fill" />
              {subjectInfo.nameAr}
            </Badge>
            
            <button
              onClick={onToggleFavorite}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star 
                size={20} 
                weight={isFavorite ? 'fill' : 'regular'}
                className={isFavorite ? 'text-accent' : 'text-muted-foreground'}
              />
            </button>
          </div>

          {experiment.experimentCode && (
            <div className="text-xs text-muted-foreground font-cairo mb-1">
              {experiment.experimentCode} {experiment.unit && `• الوحدة ${experiment.unit}`}
            </div>
          )}

          <CardTitle className="text-lg leading-tight font-cairo font-semibold">
            {experiment.title}
          </CardTitle>

          {experiment.unitTitle && (
            <CardDescription className="text-sm font-cairo">
              {experiment.unitTitle}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {hasSimulation && (
            <Badge className="gap-1.5 font-cairo bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Cpu size={14} weight="fill" />
              مختبر تفاعلي
            </Badge>
          )}
          
          {experiment.type && (
            <div className="text-xs text-muted-foreground font-cairo">
              {experiment.type}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {experiment.skills.slice(0, 3).map((skill) => (
              <Badge 
                key={skill} 
                variant="outline" 
                className="text-xs font-cairo"
              >
                {skill}
              </Badge>
            ))}
            {experiment.skills.length > 3 && (
              <Badge variant="outline" className="text-xs font-cairo">
                +{experiment.skills.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
