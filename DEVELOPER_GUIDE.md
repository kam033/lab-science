# 🔧 دليل المطور السريع

## 🚀 البدء السريع

```bash
# تثبيت الحزم
npm install

# تشغيل المشروع
npm run dev

# بناء النسخة النهائية
npm run build

# معاينة البناء
npm run preview
```

## 📂 هيكل الملفات الرئيسية

```
src/
├── App.tsx                      # المكون الرئيسي - قائمة التجارب والفلاتر
├── components/
│   ├── ExperimentCard.tsx       # بطاقة عرض التجربة
│   ├── ExperimentDetails.tsx    # صفحة تفاصيل التجربة + المختبر
│   ├── SmartQuizGenerator.tsx   # مولد الاختبارات الذكي
│   ├── DynamicQuizGenerator.tsx # مولد اختبارات ديناميكية
│   ├── simulations/             # المختبرات التفاعلية
│   │   ├── MembranTransportSim.tsx
│   │   ├── PHMeasurementSim.tsx
│   │   ├── InverseSquareLawSim.tsx
│   │   └── ...42 تجربة أخرى
│   └── ui/                      # مكونات shadcn
├── data/
│   └── experiments.ts           # قاعدة بيانات التجارب (42 تجربة)
└── hooks/
    └── use-mobile.ts            # hook للكشف عن الأجهزة المحمولة
```

## 🧪 إضافة تجربة جديدة

### 1. إضافة البيانات

في `src/data/experiments.ts`:

```typescript
{
  id: "phys-new-exp",
  subject: "physics",
  title: "اسم التجربة",
  unitTitle: "الوحدة",
  lesson: "الدرس",
  objectives: ["الهدف 1", "الهدف 2"],
  components: ["مكون 1", "مكون 2"],
  apparatus: ["جهاز 1", "جهاز 2"],
  skills: ["تخطيط", "قياس", "تحليل"],
  experimentType: "virtual",
  hasInteractiveLab: true,
  safety: ["إرشاد 1", "إرشاد 2"]
}
```

### 2. إنشاء المختبر التفاعلي

أنشئ ملف جديد: `src/components/simulations/NewExperimentSim.tsx`

```typescript
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

export function NewExperimentSimulation() {
  const [isRunning, setIsRunning] = useState(false)
  const [value, setValue] = useState(50)
  
  return (
    <div className="space-y-6">
      {/* منطقة المحاكاة */}
      <div className="bg-card border rounded-lg p-8 min-h-[400px]">
        {/* رسم التجربة هنا */}
      </div>
      
      {/* لوحة التحكم */}
      <div className="space-y-4">
        <div>
          <label>المتغير: {value}</label>
          <Slider
            value={[value]}
            onValueChange={(v) => setValue(v[0])}
            min={0}
            max={100}
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? 'إيقاف' : 'تشغيل'}
          </Button>
          <Button variant="outline" onClick={() => setValue(50)}>
            إعادة ضبط
          </Button>
        </div>
      </div>
      
      {/* القياسات */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-muted p-4 rounded">
          <div className="text-sm text-muted-foreground">القياس 1</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
    </div>
  )
}
```

### 3. ربط التجربة

في `src/components/ExperimentDetails.tsx`:

```typescript
// أضف الاستيراد
import { NewExperimentSimulation } from './simulations/NewExperimentSim'

// في دالة renderSimulation:
case "phys-new-exp":
  return <NewExperimentSimulation />
```

## 🎨 التصميم والأنماط

### الألوان
```typescript
// استخدم متغيرات CSS المعرفة
className="bg-primary text-primary-foreground"
className="bg-accent text-accent-foreground"
```

### الخطوط
```typescript
// للعناوين
className="font-cairo font-bold"

// للمحتوى
className="font-noto"
```

### المسافات
```typescript
// gap بين العناصر في grid
className="grid gap-4"

// padding داخل البطاقات
className="p-6"

// margin vertical
className="space-y-4"
```

## 🔄 التخزين والحالة

### للبيانات الدائمة (useKV)
```typescript
import { useKV } from '@github/spark/hooks'

const [favorites, setFavorites] = useKV<string[]>('favorites', [])

// ✅ الطريقة الصحيحة - استخدم functional update
setFavorites(current => [...current, newItem])

// ❌ خطأ - لا تستخدم القيمة من closure
// setFavorites([...favorites, newItem])
```

### للبيانات المؤقتة (useState)
```typescript
import { useState } from 'react'

const [isOpen, setIsOpen] = useState(false)
const [selectedTab, setSelectedTab] = useState('overview')
```

## 🤖 استخدام الذكاء الاصطناعي

### توليد أسئلة
```typescript
const prompt = spark.llmPrompt`
  أنشئ 5 أسئلة عن تجربة ${experimentTitle}
  مع التركيز على المهارات: ${skills.join(', ')}
`

const response = await spark.llm(prompt, 'gpt-4o')
```

### توليد JSON
```typescript
const prompt = spark.llmPrompt`
  أنشئ جدول بيانات بصيغة JSON يحتوي على خاصية "data"
  التي تحتوي على مصفوفة من القياسات
`

const response = await spark.llm(prompt, 'gpt-4o', true)
const result = JSON.parse(response)
const data = result.data // هنا المصفوفة
```

## 📱 الاستجابة للأجهزة

### استخدام hook للكشف
```typescript
import { useIsMobile } from '@/hooks/use-mobile'

function MyComponent() {
  const isMobile = useIsMobile()
  
  return (
    <div className={isMobile ? 'grid-cols-1' : 'grid-cols-3'}>
      {/* المحتوى */}
    </div>
  )
}
```

### استخدام Tailwind breakpoints
```typescript
// md: للشاشات الأكبر من 768px
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

## 🐛 التنقيح (Debugging)

### طباعة البيانات
```typescript
console.log('Experiment data:', experiment)
console.log('Selected filters:', { subject, skill })
```

### عرض الأخطاء
```typescript
try {
  // الكود
} catch (error) {
  console.error('Error:', error)
  toast.error('حدث خطأ: ' + error.message)
}
```

## ⚡ نصائح الأداء

### تحسين الرندر
```typescript
// استخدم useMemo للحسابات المكلفة
const filteredExperiments = useMemo(() => {
  return experiments.filter(exp => /* الفلترة */)
}, [experiments, filters])

// استخدم useCallback للدوال
const handleClick = useCallback(() => {
  /* الكود */
}, [dependencies])
```

### تحسين الصور
```typescript
// استورد الصور كـ modules
import logo from '@/assets/images/logo.png'

// استخدمها
<img src={logo} alt="Logo" />
```

## 🎯 الاختبار

### اختبار يدوي
1. تحقق من جميع الفلاتر
2. جرب كل تجربة
3. اختبر على الموبايل
4. تحقق من المفضلة
5. جرب مولد الاختبارات

### نقاط الفحص
- ✅ لا توجد أخطاء في console
- ✅ التصميم responsive
- ✅ النصوص العربية صحيحة (RTL)
- ✅ الحركات سلسة
- ✅ البيانات تُحفظ بعد reload

## 📦 البناء والنشر

### بناء محلي
```bash
npm run build
# الملفات في مجلد dist/
```

### معاينة البناء
```bash
npm run preview
```

### نشر على GitHub Pages
1. ادفع الكود لـ GitHub
2. اذهب لـ Settings → Pages
3. اختر GitHub Actions
4. المشروع سيُبنى تلقائياً

## 🔗 روابط مفيدة

- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Phosphor Icons](https://phosphoricons.com/)
- [React Documentation](https://react.dev/)

## 💡 أفكار للتطوير

- [ ] إضافة نظام تسجيل دخول
- [ ] تصدير الاختبارات PDF
- [ ] إحصائيات للمعلمين
- [ ] مشاركة التجارب
- [ ] وضع الطالب/المعلم
- [ ] دعم لغات أخرى
- [ ] تسجيل النتائج
- [ ] مقارنة الأداء

---

**محتاج مساعدة؟** افتح Issue أو اطلع على [CONTRIBUTING.md](CONTRIBUTING.md)
