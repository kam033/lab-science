# 🤝 المساهمة في المشروع

نرحب بمساهماتكم لتطوير منصة مختبر التجارب العلمية!

## 🎯 كيف تساهم؟

### 1. الإبلاغ عن المشاكل (Issues)
- استخدم قالب Issue المناسب
- اشرح المشكلة بوضوح
- أرفق صور إن أمكن
- حدد المتصفح ونظام التشغيل

### 2. اقتراح ميزات جديدة
- افتح Issue جديد
- اشرح الفائدة من الميزة
- ناقشها مع المجتمع قبل البدء

### 3. المساهمة بالكود

#### خطوات المساهمة:

1. **Fork المشروع**
   - اضغط زر "Fork" في الأعلى

2. **استنسخ النسخة الخاصة بك**
   ```bash
   git clone https://github.com/YOUR_USERNAME/spark-template.git
   cd spark-template
   ```

3. **أنشئ فرع جديد**
   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **اعمل على التعديلات**
   - اتبع معايير الكود (انظر أدناه)
   - اختبر التعديلات
   - تأكد من عمل المشروع

5. **Commit التغييرات**
   ```bash
   git add .
   git commit -m "إضافة: وصف مختصر للميزة"
   ```

6. **Push للـ GitHub**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **افتح Pull Request**
   - اذهب لصفحة المشروع الأصلي
   - اضغط "New Pull Request"
   - اختر الفرع الخاص بك
   - اشرح التغييرات بوضوح

## 📝 معايير الكود

### TypeScript/React
- استخدم TypeScript دائماً
- اتبع React hooks patterns
- استخدم functional components
- أضف types واضحة

### التنسيق
- استخدم 2 spaces للـ indentation
- استخدم single quotes للـ strings
- أضف فاصلة trailing comma في objects/arrays

### التسمية
- Components: `PascalCase` (مثل `ExperimentCard`)
- Functions: `camelCase` (مثل `handleClick`)
- Constants: `UPPER_CASE` (مثل `MAX_VALUE`)
- Files: مطابقة للـ component name

### التعليقات
- استخدم JSDoc للـ functions
- اشرح الكود المعقد
- اكتب التعليقات بالعربية أو الإنجليزية

### مثال:
```typescript
/**
 * يحسب معدل سرعة التفاعل بناءً على التركيز
 * @param concentration - تركيز المادة المتفاعلة
 * @param temperature - درجة الحرارة بالكلفن
 * @returns معدل السرعة
 */
function calculateReactionRate(
  concentration: number,
  temperature: number
): number {
  return concentration * Math.exp(-ACTIVATION_ENERGY / temperature)
}
```

## 🧪 إضافة تجربة جديدة

### 1. إضافة البيانات
في `src/data/experiments.ts`:

```typescript
{
  id: "phys-new-experiment",
  subject: "physics",
  title: "عنوان التجربة",
  unitTitle: "الوحدة",
  lesson: "الدرس",
  objectives: ["الهدف الأول", "الهدف الثاني"],
  components: ["مكون 1", "مكون 2"],
  apparatus: ["جهاز 1", "جهاز 2"],
  skills: ["مهارة 1", "مهارة 2"],
  experimentType: "virtual",
  hasInteractiveLab: true
}
```

### 2. إنشاء المختبر التفاعلي
في `src/components/simulations/`:

```typescript
export function NewExperimentSimulation() {
  // المنطق التفاعلي هنا
  return (
    <div className="simulation-container">
      {/* UI التجربة */}
    </div>
  )
}
```

### 3. ربط التجربة
في `ExperimentDetails.tsx`:

```typescript
case "phys-new-experiment":
  return <NewExperimentSimulation />
```

## 🎨 إضافة ميزة جديدة

### البنية المقترحة:
1. **خطط أولاً**: اشرح الميزة في Issue
2. **صمم الـ UI**: استخدم Figma/رسم تخطيطي
3. **اكتب الكود**: اتبع المعايير
4. **اختبر**: تأكد من عمل كل شيء
5. **وثّق**: أضف شرح في README

## 🐛 إصلاح مشكلة

### قبل الإصلاح:
1. افتح Issue إن لم يكن موجود
2. اشرح المشكلة والحل المقترح
3. احصل على موافقة

### أثناء الإصلاح:
1. أصلح المشكلة فقط (لا تعديلات إضافية)
2. اختبر الإصلاح جيداً
3. تأكد من عدم كسر أي شيء آخر

### بعد الإصلاح:
1. اشرح الحل في commit message
2. اربط الـ Issue في PR: `Fixes #123`

## 📋 قائمة التحقق قبل PR

- [ ] الكود يعمل بدون أخطاء
- [ ] لا توجد console warnings
- [ ] TypeScript types صحيحة
- [ ] التصميم responsive
- [ ] يعمل على Chrome/Firefox/Safari
- [ ] Commit messages واضحة
- [ ] PR description مفصل

## 🌍 الترجمة والمحتوى

نرحب بـ:
- إضافة محتوى علمي جديد
- تحسين الشروحات الموجودة
- ترجمة للغات أخرى
- إصلاح الأخطاء اللغوية

## 💬 المجتمع

- ناقش الأفكار في Discussions
- اطلب المساعدة إذا احتجت
- شارك خبرتك مع الآخرين
- كن محترماً ومتعاوناً

## 📧 التواصل

- **Issues**: للمشاكل والاقتراحات
- **Discussions**: للنقاشات العامة
- **Email**: للتواصل المباشر

---

شكراً لمساهمتك في دعم التعليم العلمي! 🙏
