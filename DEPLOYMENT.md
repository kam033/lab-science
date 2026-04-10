# 🌐 نشر المشروع على GitHub Pages

هذا الدليل يشرح كيفية نشر المشروع مجاناً على GitHub Pages.

## ✅ المتطلبات

- [x] رفع المشروع على GitHub (انظر [SETUP.md](SETUP.md))
- [x] حساب GitHub نشط

## 🚀 الطريقة 1: النشر التلقائي (مستحسن)

### الخطوة 1: تفعيل GitHub Pages

1. اذهب إلى صفحة الـ repository على GitHub
2. اذهب إلى **Settings** (الإعدادات)
3. من القائمة الجانبية، اختر **Pages**
4. في قسم **Source**:
   - اختر **GitHub Actions**

### الخطوة 2: التحقق من ملف Workflow

الملف `.github/workflows/deploy.yml` موجود بالفعل، وسيقوم بـ:
- بناء المشروع تلقائياً عند كل push للفرع `main`
- نشره على GitHub Pages

### الخطوة 3: الانتظار

- بعد أول push، انتظر 2-3 دقائق
- اذهب إلى تبويب **Actions** في الـ repository
- تحقق من نجاح الـ workflow
- المشروع سيكون متاحاً على:
  ```
  https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
  ```

## 📝 الطريقة 2: النشر اليدوي

إذا أردت النشر بدون GitHub Actions:

### الخطوة 1: تعديل vite.config.ts

أضف `base` في التكوين:

```typescript
export default defineConfig({
  base: '/YOUR_REPO_NAME/',  // اسم الـ repository
  // ...باقي التكوين
})
```

### الخطوة 2: البناء

```bash
npm run build
```

### الخطوة 3: النشر

```bash
# تثبيت gh-pages
npm install -D gh-pages

# نشر مجلد dist
npx gh-pages -d dist
```

### الخطوة 4: تفعيل Pages

1. اذهب إلى **Settings → Pages**
2. في **Source**: اختر **Deploy from a branch**
3. اختر الفرع **gh-pages**
4. احفظ

## 🔧 إصلاح المشاكل الشائعة

### المشكلة: الصفحة فارغة أو خطأ 404

**السبب**: `base` في `vite.config.ts` غير صحيح

**الحل**:
```typescript
// في vite.config.ts
export default defineConfig({
  base: '/اسم-الـ-repository/',
  // ...
})
```

### المشكلة: CSS/JS لا يعمل

**السبب**: المسارات غير صحيحة

**الحل**: تأكد من:
```html
<!-- في index.html -->
<link href="/src/main.css" rel="stylesheet" />
<script type="module" src="/src/main.tsx"></script>
```

### المشكلة: الخطوط العربية لا تظهر

**السبب**: Google Fonts محجوب أو بطيء

**الحل**: استخدم خطوط محلية أو CDN آخر

### المشكلة: الصور لا تظهر

**السبب**: مسارات الصور خاطئة

**الحل**: استورد الصور كـ modules
```typescript
import logo from '@/assets/images/logo.png'
<img src={logo} alt="Logo" />
```

## 🎯 التحقق من النشر

بعد النشر، تحقق من:

- [x] الصفحة الرئيسية تفتح بدون أخطاء
- [x] جميع التجارب تعمل
- [x] الخطوط العربية تظهر صحيحة
- [x] الألوان والتصميم صحيح
- [x] المختبرات التفاعلية تعمل
- [x] مولد الاختبارات يعمل
- [x] التخزين المحلي (المفضلة) يعمل

## 📱 الاختبار على الأجهزة

اختبر الموقع على:

- [x] Chrome Desktop
- [x] Firefox Desktop
- [x] Safari Desktop
- [x] Chrome Mobile
- [x] Safari iOS
- [x] أحجام شاشة مختلفة

## 🔗 مشاركة الرابط

بعد النشر الناجح، شارك الرابط:

```
🔬 مختبر التجارب العلمية - الصف الثاني عشر
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/

منصة تعليمية تفاعلية تحتوي على 42 تجربة في:
⚛️ الفيزياء
🧪 الكيمياء
🧬 الأحياء
```

## 📊 إحصائيات الموقع (اختياري)

لإضافة Google Analytics:

1. أنشئ حساب في Google Analytics
2. احصل على tracking ID
3. أضفه في `index.html`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 🔄 التحديثات المستقبلية

بعد إجراء تعديلات:

```bash
# 1. احفظ التغييرات
git add .
git commit -m "وصف التعديلات"

# 2. ارفع للـ GitHub
git push origin main

# 3. الموقع سيُحدّث تلقائياً خلال 2-3 دقائق
```

## 🎨 تخصيص الدومين (اختياري)

لاستخدام دومين خاص بك:

1. اشترِ دومين
2. في إعدادات الدومين، أضف CNAME record:
   ```
   www → YOUR_USERNAME.github.io
   ```
3. في GitHub Pages Settings:
   - أدخل الدومين الخاص بك
   - فعّل HTTPS

## 📞 الدعم

إذا واجهت مشكلة:

1. تحقق من تبويب **Actions** للأخطاء
2. راجع **Console** في المتصفح
3. افتح Issue في الـ repository
4. راجع [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

**تهانينا! 🎉** مشروعك الآن منشور ومتاح للجميع!
