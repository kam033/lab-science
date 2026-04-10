import { useState, useMemo } from 'react'
import { projects, categories, Project } from '@/data/projects'
import { ProjectCard } from '@/components/ProjectCard'
import { ProjectDetails } from '@/components/ProjectDetails'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Briefcase, 
  MagnifyingGlass, 
  FunnelSimple, 
  Sparkle,
  GraduationCap,
  Flask,
  Wrench,
  Lightning,
  ArrowRight
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'

interface ProjectsPortfolioProps {
  onBackToLab?: () => void
}

function ProjectsPortfolio({ onBackToLab }: ProjectsPortfolioProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (searchQuery && 
          !project.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !project.titleEn.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      if (selectedCategory && project.category !== selectedCategory) {
        return false
      }
      
      if (selectedStatus && project.status !== selectedStatus) {
        return false
      }
      
      return true
    })
  }, [searchQuery, selectedCategory, selectedStatus])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory(null)
    setSelectedStatus(null)
  }

  const hasActiveFilters = searchQuery || selectedCategory || selectedStatus

  const stats = {
    total: projects.length,
    completed: projects.filter(p => p.status === 'completed').length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    planned: projects.filter(p => p.status === 'planned').length
  }

  const categoryIcons = {
    educational: GraduationCap,
    scientific: Flask,
    tools: Wrench,
    interactive: Lightning
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Toaster position="top-center" dir="rtl" />
      
      <div 
        className="relative overflow-hidden border-b"
        style={{
          background: 'linear-gradient(135deg, oklch(0.45 0.15 265) 0%, oklch(0.60 0.18 240) 50%, oklch(0.55 0.20 220) 100%)'
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px),
              repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)
            `
          }} />
        </div>
        
        <div className="relative container mx-auto px-4 py-16">
          {onBackToLab && (
            <div className="absolute top-4 left-4">
              <Button
                variant="secondary"
                onClick={onBackToLab}
                className="gap-2 font-cairo bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <ArrowRight size={18} />
                العودة للمختبر
              </Button>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkle size={48} weight="fill" className="text-white/90" />
            <h1 className="text-4xl md:text-5xl font-bold text-white font-cairo">
              معرض المشاريع التعليمية
            </h1>
          </div>
          <p className="text-center text-white/90 text-lg font-noto mb-4">
            مجموعة متنوعة من المشاريع التعليمية والتفاعلية المبتكرة
          </p>
          
          <div className="flex justify-center gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white font-cairo">{stats.total}</div>
              <div className="text-sm text-white/70 font-cairo">مشروع</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white font-cairo">{stats.completed}</div>
              <div className="text-sm text-white/70 font-cairo">مكتمل</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white font-cairo">{stats.inProgress}</div>
              <div className="text-sm text-white/70 font-cairo">قيد التطوير</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6 mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlass 
                size={20} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
              />
              <Input
                placeholder="ابحث عن مشروع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 font-cairo"
              />
            </div>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="gap-2 font-cairo"
              >
                إزالة الفلاتر
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <FunnelSimple size={18} className="text-muted-foreground" />
              <span className="text-sm font-semibold font-cairo">الفئة:</span>
              <div className="flex flex-wrap gap-2">
                {Object.values(categories).map((category) => {
                  const CategoryIcon = categoryIcons[category.name as keyof typeof categoryIcons]
                  
                  return (
                    <Button
                      key={category.name}
                      variant={selectedCategory === category.name ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(
                        selectedCategory === category.name ? null : category.name
                      )}
                      className="gap-1.5 font-cairo"
                      style={selectedCategory === category.name ? {
                        backgroundColor: category.color,
                        borderColor: category.color
                      } : {}}
                    >
                      <CategoryIcon size={16} weight="fill" />
                      {category.nameAr}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FunnelSimple size={18} className="text-muted-foreground mt-1" />
              <span className="text-sm font-semibold font-cairo mt-0.5">الحالة:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'completed', label: 'مكتمل', color: 'oklch(0.60 0.18 150)' },
                  { value: 'in-progress', label: 'قيد التطوير', color: 'oklch(0.55 0.20 240)' },
                  { value: 'planned', label: 'مخطط', color: 'oklch(0.50 0.05 265)' }
                ].map((status) => (
                  <Badge
                    key={status.value}
                    variant={selectedStatus === status.value ? 'default' : 'outline'}
                    className="cursor-pointer font-cairo transition-all hover:scale-105"
                    onClick={() => setSelectedStatus(selectedStatus === status.value ? null : status.value)}
                    style={selectedStatus === status.value ? {
                      backgroundColor: status.color,
                      borderColor: status.color
                    } : {}}
                  >
                    {status.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-cairo">
            عرض {filteredProjects.length} من {projects.length} مشروع
          </p>
        </div>

        <AnimatePresence mode="wait">
          {filteredProjects.length > 0 ? (
            <motion.div
              key="projects-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => setSelectedProject(project)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <div className="max-w-md mx-auto space-y-4">
                <Briefcase size={80} className="mx-auto text-muted-foreground" weight="light" />
                <h3 className="text-xl font-semibold font-cairo">لا توجد مشاريع مطابقة</h3>
                <p className="text-muted-foreground font-noto">
                  جرب تغيير معايير البحث أو الفلاتر للعثور على مشاريع أخرى
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} className="font-cairo">
                    إزالة جميع الفلاتر
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ProjectDetails
        project={selectedProject}
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <footer className="border-t mt-16 py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground font-cairo">
            معرض المشاريع التعليمية - {new Date().getFullYear()}
          </p>
          <p className="text-xs text-muted-foreground mt-2 font-noto">
            مجموعة من المشاريع المبتكرة في مجال التعليم التفاعلي
          </p>
        </div>
      </footer>
    </div>
  )
}

export default ProjectsPortfolio
