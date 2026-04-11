import { useState, useMemo } from 'react'
import { useKV } from '@/hooks/useKV'
import { experiments, subjects, Experiment } from '@/data/experiments'
import { ExperimentCard } from '@/components/ExperimentCard'
import { ExperimentDetails } from '@/components/ExperimentDetails'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Flask, Atom, Leaf, Star, MagnifyingGlass, FunnelSimple, Sparkle, Briefcase } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import ProjectsPortfolio from '@/ProjectsPortfolio'

function App() {
  const [showProjects, setShowProjects] = useState(false)
  const [favorites, setFavorites] = useKV<string[]>('experiment-favorites', [])
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  if (showProjects) {
    return <ProjectsPortfolio onBackToLab={() => setShowProjects(false)} />
  }

  const allSkills = useMemo(() => {
    const skillSet = new Set<string>()
    experiments.forEach(exp => exp.skills.forEach(skill => skillSet.add(skill)))
    return Array.from(skillSet).sort()
  }, [])

  const filteredExperiments = useMemo(() => {
    return experiments.filter(exp => {
      if (searchQuery && !exp.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !exp.unitTitle?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      if (selectedSubject && exp.subject !== selectedSubject) {
        return false
      }
      
      if (selectedSkill && !exp.skills.includes(selectedSkill)) {
        return false
      }
      
      if (showFavoritesOnly && !(favorites || []).includes(exp.id)) {
        return false
      }
      
      return true
    })
  }, [searchQuery, selectedSubject, selectedSkill, showFavoritesOnly, favorites])

  const toggleFavorite = (experimentId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((currentFavorites) => {
      const favs = currentFavorites || []
      if (favs.includes(experimentId)) {
        toast.success('تم الإزالة من المفضلة')
        return favs.filter(id => id !== experimentId)
      } else {
        toast.success('تم الإضافة إلى المفضلة')
        return [...favs, experimentId]
      }
    })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedSubject(null)
    setSelectedSkill(null)
    setShowFavoritesOnly(false)
  }

  const hasActiveFilters = searchQuery || selectedSubject || selectedSkill || showFavoritesOnly

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Toaster position="top-center" dir="rtl" />
      
      <div 
        className="relative overflow-hidden border-b"
        style={{
          background: 'linear-gradient(135deg, oklch(0.45 0.15 265) 0%, oklch(0.55 0.18 250) 100%)'
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)'
          }} />
        </div>
        
        <div className="relative container mx-auto px-4 py-12">
          <div className="absolute top-4 left-4">
            <Button
              variant="secondary"
              onClick={() => setShowProjects(true)}
              className="gap-2 font-cairo bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Briefcase size={18} />
              المشاريع
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkle size={40} weight="fill" className="text-white/90" />
            <h1 className="text-4xl md:text-5xl font-bold text-white font-cairo">
              مختبر التجارب العلمية
            </h1>
          </div>
          <p className="text-center text-white/90 text-lg font-cairo mb-2">
            الصف الثاني عشر • الفيزياء • الكيمياء • الأحياء
          </p>
          <p className="text-center text-white/70 font-noto">
            {experiments.length} تجربة عملية واستقصاء علمي
          </p>
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
                placeholder="ابحث عن تجربة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 font-cairo"
              />
            </div>
            
            <Button
              variant={showFavoritesOnly ? 'default' : 'outline'}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="gap-2 font-cairo"
            >
              <Star size={18} weight={showFavoritesOnly ? 'fill' : 'regular'} />
              المفضلة {(favorites && favorites.length > 0) && `(${favorites.length})`}
            </Button>

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
              <span className="text-sm font-semibold font-cairo">المادة:</span>
              <div className="flex flex-wrap gap-2">
                {Object.values(subjects).map((subject) => {
                  const SubjectIcon = 
                    subject.name === 'chemistry' ? Flask :
                    subject.name === 'physics' ? Atom :
                    Leaf
                  
                  return (
                    <Button
                      key={subject.name}
                      variant={selectedSubject === subject.name ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSubject(
                        selectedSubject === subject.name ? null : subject.name
                      )}
                      className="gap-1.5 font-cairo"
                      style={selectedSubject === subject.name ? {
                        backgroundColor: subject.color,
                        borderColor: subject.color
                      } : {}}
                    >
                      <SubjectIcon size={16} weight="fill" />
                      {subject.nameAr}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FunnelSimple size={18} className="text-muted-foreground mt-1" />
              <span className="text-sm font-semibold font-cairo mt-0.5">المهارة:</span>
              <div className="flex flex-wrap gap-2">
                {allSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant={selectedSkill === skill ? 'default' : 'outline'}
                    className="cursor-pointer font-cairo transition-all hover:scale-105"
                    onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-cairo">
            عرض {filteredExperiments.length} من {experiments.length} تجربة
          </p>
        </div>

        <AnimatePresence mode="wait">
          {filteredExperiments.length > 0 ? (
            <motion.div
              key="experiments-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredExperiments.map((experiment) => (
                <ExperimentCard
                  key={experiment.id}
                  experiment={experiment}
                  onClick={() => setSelectedExperiment(experiment)}
                  isFavorite={(favorites || []).includes(experiment.id)}
                  onToggleFavorite={(e) => toggleFavorite(experiment.id, e)}
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
                <div className="text-6xl">🔬</div>
                <h3 className="text-xl font-semibold font-cairo">لا توجد تجارب مطابقة</h3>
                <p className="text-muted-foreground font-noto">
                  جرب تغيير معايير البحث أو الفلاتر للعثور على تجارب أخرى
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

      <ExperimentDetails
        experiment={selectedExperiment}
        open={!!selectedExperiment}
        onClose={() => setSelectedExperiment(null)}
      />

      <footer className="border-t mt-16 py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground font-cairo">
            مختبر التجارب العلمية - الصف الثاني عشر
          </p>
          <p className="text-xs text-muted-foreground mt-2 font-noto">
            جميع التجارب مستمدة من كتاب التجارب العملية والأنشطة
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App