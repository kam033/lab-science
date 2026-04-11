export interface Project {
  id: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  category: 'educational' | 'scientific' | 'tools' | 'interactive'
  technologies: string[]
  features: string[]
  image?: string
  link?: string
  status: 'completed' | 'in-progress' | 'planned'
  year: number
  color: string
}

export const projects: Project[] = [
  {
    id: 'science-lab',
    title: 'مختبر التجارب العلمية التفاعلي',
    titleEn: 'Interactive Science Lab',
    description: 'منصة تفاعلية تحتوي على 50+ تجربة علمية في الفيزياء والكيمياء والأحياء للصف الثاني عشر مع محاكاة تفاعلية شبيهة بـ PhET Colorado',
    descriptionEn: 'Interactive platform with 50+ science experiments in Physics, Chemistry, and Biology for Grade 12 with PhET-style simulations',
    category: 'educational',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'D3.js', 'Three.js'],
    features: [
      'محاكاة تفاعلية لأكثر من 50 تجربة علمية',
      'رسوم بيانية ديناميكية تتحدث مباشرة',
      'أجهزة وأدوات قابلة للتحريك والضبط',
      'قياسات فورية ونتائج حية',
      'نظام مفضلة متقدم',
      'فلترة حسب المادة والمهارة'
    ],
    color: 'oklch(0.45 0.15 265)',
    status: 'completed',
    year: 2024,
    link: '/lab'
  },
  {
    id: 'quiz-generator',
    title: 'مولد الاختبارات الذكي',
    titleEn: 'Smart Quiz Generator',
    description: 'أداة ذكية تستخدم الذكاء الاصطناعي لإنشاء اختبارات تفاعلية بناءً على المحتوى التعليمي مع تحليل الأداء والتوصيات',
    descriptionEn: 'Smart tool using AI to generate interactive quizzes based on educational content with performance analysis',
    category: 'educational',
    technologies: ['React', 'TypeScript', 'OpenAI API', 'Spark SDK'],
    features: [
      'توليد أسئلة ذكية باستخدام AI',
      'تحليل أداء الطلاب',
      'اختبارات تكيفية حسب المستوى',
      'تقارير تفصيلية للأداء',
      'ربط الاختبارات بالدروس'
    ],
    color: 'oklch(0.60 0.18 150)',
    status: 'completed',
    year: 2024
  },
  {
    id: 'performance-tracker',
    title: 'متتبع أداء الطلاب',
    titleEn: 'Student Performance Tracker',
    description: 'نظام شامل لمتابعة وتحليل أداء الطلاب عبر الوقت مع رسوم بيانية تفاعلية وتوصيات مخصصة',
    descriptionEn: 'Comprehensive system for tracking and analyzing student performance over time with interactive charts',
    category: 'educational',
    technologies: ['React', 'TypeScript', 'Recharts', 'Spark KV'],
    features: [
      'تتبع الأداء عبر الزمن',
      'رسوم بيانية تفاعلية',
      'مقارنة بين الطلاب',
      'تحديد نقاط القوة والضعف',
      'توصيات مخصصة للتحسين'
    ],
    color: 'oklch(0.55 0.20 240)',
    status: 'completed',
    year: 2024
  },
  {
    id: 'lesson-exam-linker',
    title: 'رابط الدروس والاختبارات',
    titleEn: 'Lesson Exam Linker',
    description: 'أداة تربط بين الدروس والاختبارات تلقائياً مع تحديد الأهداف التعليمية وتوليد أسئلة ذات صلة',
    descriptionEn: 'Tool that automatically links lessons with exams, identifies learning objectives and generates relevant questions',
    category: 'educational',
    technologies: ['React', 'TypeScript', 'AI Integration', 'Spark SDK'],
    features: [
      'ربط تلقائي بين الدروس والاختبارات',
      'تحديد الأهداف التعليمية',
      'توليد أسئلة مرتبطة',
      'تنظيم المحتوى التعليمي',
      'تحليل التغطية'
    ],
    color: 'oklch(0.58 0.16 120)',
    status: 'completed',
    year: 2024
  },
  {
    id: 'error-detection',
    title: 'مساعد كشف الأخطاء',
    titleEn: 'Error Detection Assistant',
    description: 'مساعد ذكي يكتشف الأخطاء الشائعة في إجابات الطلاب ويقدم توضيحات وتصحيحات مفصلة',
    descriptionEn: 'Smart assistant that detects common errors in student answers and provides detailed explanations',
    category: 'educational',
    technologies: ['React', 'TypeScript', 'AI Analysis', 'Pattern Recognition'],
    features: [
      'كشف الأخطاء الشائعة',
      'توضيحات مفصلة',
      'اقتراحات للتحسين',
      'تحليل أنماط الأخطاء',
      'تغذية راجعة فورية'
    ],
    color: 'oklch(0.60 0.24 25)',
    status: 'completed',
    year: 2024
  },
  {
    id: 'dynamic-quiz',
    title: 'الاختبار الديناميكي المتكيف',
    titleEn: 'Dynamic Adaptive Quiz',
    description: 'نظام اختبارات يتكيف مع مستوى الطالب تلقائياً ويضبط صعوبة الأسئلة بناءً على الأداء',
    descriptionEn: 'Quiz system that adapts to student level automatically and adjusts question difficulty based on performance',
    category: 'educational',
    technologies: ['React', 'TypeScript', 'Adaptive Algorithms', 'AI'],
    features: [
      'تكيف تلقائي مع المستوى',
      'ضبط صعوبة الأسئلة',
      'تقييم فوري للأداء',
      'مسارات تعلم مخصصة',
      'تحليل ذكي للإجابات'
    ],
    color: 'oklch(0.65 0.22 50)',
    status: 'completed',
    year: 2024
  }
]

export const categories = {
  educational: {
    name: 'educational',
    nameAr: 'تعليمي',
    color: 'oklch(0.45 0.15 265)'
  },
  scientific: {
    name: 'scientific',
    nameAr: 'علمي',
    color: 'oklch(0.55 0.20 240)'
  },
  tools: {
    name: 'tools',
    nameAr: 'أدوات',
    color: 'oklch(0.60 0.18 150)'
  },
  interactive: {
    name: 'interactive',
    nameAr: 'تفاعلي',
    color: 'oklch(0.65 0.22 50)'
  }
}
