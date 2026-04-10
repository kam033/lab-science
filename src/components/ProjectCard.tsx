import { Project, categories } from '@/data/projects'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface ProjectCardProps {
  project: Project
  onClick?: () => void
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const category = categories[project.category]
  
  const statusColors = {
    completed: 'bg-green-500/10 text-green-700 border-green-500/20',
    'in-progress': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    planned: 'bg-muted text-muted-foreground border-border'
  }
  
  const statusLabels = {
    completed: 'مكتمل',
    'in-progress': 'قيد التطوير',
    planned: 'مخطط'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="h-full cursor-pointer hover:shadow-lg transition-all duration-300 border-2 overflow-hidden group"
        onClick={onClick}
        style={{ borderColor: project.status === 'completed' ? project.color : undefined }}
      >
        <div 
          className="h-2 w-full"
          style={{ backgroundColor: project.color }}
        />
        
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge 
              variant="outline" 
              className={statusColors[project.status]}
            >
              {project.status === 'completed' && <Check size={14} className="ml-1" weight="bold" />}
              {statusLabels[project.status]}
            </Badge>
            <span className="text-xs text-muted-foreground">{project.year}</span>
          </div>
          
          <CardTitle className="text-xl font-cairo font-bold group-hover:text-primary transition-colors">
            {project.title}
          </CardTitle>
          <CardDescription className="text-sm font-noto">
            {project.titleEn}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-foreground/80 font-noto leading-relaxed">
            {project.description}
          </p>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 font-cairo">
              التقنيات المستخدمة:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map((tech) => (
                <Badge 
                  key={tech} 
                  variant="secondary" 
                  className="text-xs font-mono"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 font-cairo">
              الميزات الرئيسية:
            </h4>
            <ul className="space-y-1.5">
              {project.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="text-xs text-foreground/70 flex items-start gap-2 font-noto">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{feature}</span>
                </li>
              ))}
              {project.features.length > 3 && (
                <li className="text-xs text-muted-foreground font-cairo">
                  + {project.features.length - 3} ميزات أخرى
                </li>
              )}
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <Badge 
            style={{ 
              backgroundColor: `${category.color}20`,
              color: category.color,
              borderColor: `${category.color}40`
            }}
            className="font-cairo"
          >
            {category.nameAr}
          </Badge>
          
          {project.link && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1.5 font-cairo"
            >
              عرض المشروع
              <ArrowRight size={16} />
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
