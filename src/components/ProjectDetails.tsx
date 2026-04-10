import { Project, categories } from '@/data/projects'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowRight, Check, X } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface ProjectDetailsProps {
  project: Project | null
  open: boolean
  onClose: () => void
}

export function ProjectDetails({ project, open, onClose }: ProjectDetailsProps) {
  if (!project) return null

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden" dir="rtl">
        <div 
          className="h-3 w-full"
          style={{ backgroundColor: project.color }}
        />
        
        <div className="p-6">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge 
                    variant="outline" 
                    className={statusColors[project.status]}
                  >
                    {project.status === 'completed' && <Check size={14} className="ml-1" weight="bold" />}
                    {statusLabels[project.status]}
                  </Badge>
                  
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
                  
                  <span className="text-xs text-muted-foreground mr-auto">{project.year}</span>
                </div>
                
                <DialogTitle className="text-2xl font-cairo font-bold mb-2">
                  {project.title}
                </DialogTitle>
                <DialogDescription className="text-base font-noto">
                  {project.titleEn}
                </DialogDescription>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="shrink-0"
              >
                <X size={20} />
              </Button>
            </div>
          </DialogHeader>
          
          <ScrollArea className="h-[calc(90vh-250px)] pr-4">
            <Tabs defaultValue="overview" dir="rtl">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="overview" className="flex-1 font-cairo">
                  نظرة عامة
                </TabsTrigger>
                <TabsTrigger value="features" className="flex-1 font-cairo">
                  الميزات
                </TabsTrigger>
                <TabsTrigger value="tech" className="flex-1 font-cairo">
                  التقنيات
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold font-cairo">الوصف</h3>
                    <p className="text-foreground/80 leading-relaxed font-noto">
                      {project.description}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed font-noto">
                      {project.descriptionEn}
                    </p>
                  </div>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="features" className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold font-cairo mb-4">
                    الميزات الرئيسية
                  </h3>
                  <div className="space-y-3">
                    {project.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div 
                          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5"
                          style={{ backgroundColor: project.color }}
                        >
                          {index + 1}
                        </div>
                        <p className="text-sm text-foreground/80 font-noto leading-relaxed">
                          {feature}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="tech" className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold font-cairo mb-4">
                    التقنيات المستخدمة
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <motion.div
                        key={tech}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Badge 
                          variant="secondary" 
                          className="text-sm px-4 py-2 font-mono"
                        >
                          {tech}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </ScrollArea>
          
          {project.link && (
            <div className="mt-6 pt-6 border-t">
              <Button 
                className="w-full gap-2 font-cairo"
                size="lg"
                style={{ backgroundColor: project.color }}
                onClick={() => {
                  if (project.link) {
                    window.location.href = project.link
                  }
                }}
              >
                عرض المشروع
                <ArrowRight size={18} />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
