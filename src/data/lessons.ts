export interface Lesson {
  id: string
  subject: 'physics' | 'chemistry' | 'biology'
  grade: string
  term: string
  unit: string
  unitTitle: string
  lessonNumber: string
  lessonTitle: string
  description?: string
}

export const lessons: Lesson[] = [
  // ===== الفيزياء =====
  // الوحدة 1: الحركة
  {
    id: 'phys-1-1-1',
    subject: 'physics',
    grade: '12',
    term: '1',
    unit: '1',
    unitTitle: 'الحركة',
    lessonNumber: '1-1',
    lessonTitle: 'الإزاحة والسرعة',
    description: 'دراسة الحركة في خط مستقيم، الإزاحة، السرعة المتوسطة والسرعة اللحظية'
  },
  {
    id: 'phys-1-1-2',
    subject: 'physics',
    grade: '12',
    term: '1',
    unit: '1',
    unitTitle: 'الحركة',
    lessonNumber: '1-2',
    lessonTitle: 'التسارع',
    description: 'مفهوم التسارع والحركة بتسارع منتظم'
  },
  
  // الوحدة 2: الطاقة
  {
    id: 'phys-1-2-1',
    subject: 'physics',
    grade: '12',
    term: '1',
    unit: '2',
    unitTitle: 'الطاقة',
    lessonNumber: '2-1',
    lessonTitle: 'الطاقة الحركية',
    description: 'دراسة الطاقة الحركية وعلاقتها بالكتلة والسرعة'
  },
  {
    id: 'phys-1-2-2',
    subject: 'physics',
    grade: '12',
    term: '1',
    unit: '2',
    unitTitle: 'الطاقة',
    lessonNumber: '2-2',
    lessonTitle: 'طاقة الوضع',
    description: 'طاقة الوضع الجذبية وعلاقتها بالارتفاع'
  },
  {
    id: 'phys-1-2-3',
    subject: 'physics',
    grade: '12',
    term: '1',
    unit: '2',
    unitTitle: 'الطاقة',
    lessonNumber: '2-3',
    lessonTitle: 'حفظ الطاقة',
    description: 'قانون حفظ الطاقة الميكانيكية وتحولات الطاقة'
  },
  
  // الوحدة 6: الموجات
  {
    id: 'phys-2-6-5',
    subject: 'physics',
    grade: '12',
    term: '2',
    unit: '6',
    unitTitle: 'الموجات',
    lessonNumber: '6-5',
    lessonTitle: 'شدة الموجة وقانون التربيع العكسي',
    description: 'العلاقة بين شدة الموجة والمسافة من المصدر'
  },
  
  // الوحدة 7: تراكب الموجات
  {
    id: 'phys-2-7-2',
    subject: 'physics',
    grade: '12',
    term: '2',
    unit: '7',
    unitTitle: 'تراكب الموجات',
    lessonNumber: '7-2',
    lessonTitle: 'الحيود وقياس الطول الموجي',
    description: 'ظاهرة الحيود واستخدام محزوز الحيود في قياس الطول الموجي'
  },
  
  // ===== الكيمياء =====
  // الوحدة 1: الأحماض والقواعد
  {
    id: 'chem-1-1-1',
    subject: 'chemistry',
    grade: '12',
    term: '1',
    unit: '1',
    unitTitle: 'الأحماض والقواعد',
    lessonNumber: '1-1',
    lessonTitle: 'الرقم الهيدروجيني pH',
    description: 'مفهوم pH وقياس حموضة وقاعدية المحاليل'
  },
  {
    id: 'chem-1-1-2',
    subject: 'chemistry',
    grade: '12',
    term: '1',
    unit: '1',
    unitTitle: 'الأحماض والقواعد',
    lessonNumber: '1-2',
    lessonTitle: 'معايرة حمض-قاعدة',
    description: 'عملية المعايرة وتحديد نقطة التكافؤ'
  },
  
  // الوحدة 2: الكيمياء الكهربائية
  {
    id: 'chem-1-2-1',
    subject: 'chemistry',
    grade: '12',
    term: '1',
    unit: '2',
    unitTitle: 'الكيمياء الكهربائية',
    lessonNumber: '2-1',
    lessonTitle: 'الخلايا الكهروكيميائية',
    description: 'الخلايا الجلفانية وقياس فرق الجهد'
  },
  {
    id: 'chem-1-2-3',
    subject: 'chemistry',
    grade: '12',
    term: '1',
    unit: '2',
    unitTitle: 'الكيمياء الكهربائية',
    lessonNumber: '2-3',
    lessonTitle: 'التحليل الكهربائي',
    description: 'عملية التحليل الكهربائي وقوانين فارادي'
  },
  
  // الوحدة 6: سرعة التفاعل
  {
    id: 'chem-2-6-3',
    subject: 'chemistry',
    grade: '12',
    term: '2',
    unit: '6',
    unitTitle: 'سرعة التفاعل',
    lessonNumber: '6-3',
    lessonTitle: 'تأثير التركيز على سرعة التفاعل',
    description: 'العوامل المؤثرة على معدل سرعة التفاعل الكيميائي'
  },
  
  // ===== الأحياء =====
  // الوحدة 1: الخلية
  {
    id: 'bio-1-1-3',
    subject: 'biology',
    grade: '12',
    term: '1',
    unit: '1',
    unitTitle: 'الخلية',
    lessonNumber: '1-3',
    lessonTitle: 'النقل عبر الغشاء الخلوي',
    description: 'آليات النقل السلبي والنشط عبر الأغشية'
  },
  
  // الوحدة 2: الوراثة
  {
    id: 'bio-1-2-3',
    subject: 'biology',
    grade: '12',
    term: '1',
    unit: '2',
    unitTitle: 'الوراثة',
    lessonNumber: '2-3',
    lessonTitle: 'الانقسام الاختزالي',
    description: 'أطوار الانقسام الاختزالي وتكوين الأمشاج'
  },
  
  // الوحدة 6: التنفس
  {
    id: 'bio-2-6-1',
    subject: 'biology',
    grade: '12',
    term: '2',
    unit: '6',
    unitTitle: 'التنفس',
    lessonNumber: '6-1',
    lessonTitle: 'التنفس الخلوي',
    description: 'عملية التنفس الخلوي وإنتاج الطاقة'
  },
  
  // الوحدة 7: التمثيل الضوئي
  {
    id: 'bio-2-7-2',
    subject: 'biology',
    grade: '12',
    term: '2',
    unit: '7',
    unitTitle: 'التمثيل الضوئي',
    lessonNumber: '7-2',
    lessonTitle: 'العوامل المؤثرة على التمثيل الضوئي',
    description: 'تأثير الضوء وثاني أكسيد الكربون على معدل التمثيل الضوئي'
  }
]

export function getLessonById(lessonId: string): Lesson | undefined {
  return lessons.find(l => l.id === lessonId)
}

export function getLessonsBySubject(subject: string): Lesson[] {
  return lessons.filter(l => l.subject === subject)
}

export function getLessonsByUnit(subject: string, unit: string): Lesson[] {
  return lessons.filter(l => l.subject === subject && l.unit === unit)
}
