# 🚀 دليل رفع المشروع على GitHub

## ⚠️ هل واجهت مشكلة "Failed to fetch"؟
**اقرأ ملف:** [`GITHUB_UPLOAD_TROUBLESHOOTING.md`](./GITHUB_UPLOAD_TROUBLESHOOTING.md) للحلول الكاملة

---

## الخطوات المطلوبة

### 1. إنشاء حساب GitHub (إن لم يكن لديك)
- اذهب إلى [github.com](https://github.com)
- سجل حساب جديد

### 2. إنشاء Repository جديد على GitHub

**مهم:** يجب إنشاء الـ repository على موقع GitHub أولاً!

1. اذهب إلى [github.com/new](https://github.com/new)
2. املأ البيانات:
   - **Repository name**: `science-lab-grade12` (أو أي اسم تريده)
   - **Description**: `منصة تعليمية تفاعلية لتجارب العلوم للصف الثاني عشر`
   - اختر **Public** أو **Private**
   - **⚠️ لا تختر** "Add a README file" (لأنه موجود بالفعل)
   - **⚠️ لا تختر** "Add .gitignore"
   - **⚠️ لا تختر** "Choose a license"
3. اضغط **"Create repository"**
4. **احفظ رابط الـ repository** (سنحتاجه في الخطوة التالية)

### 3. تحضير المشروع محلياً

افتح Terminal/Command Prompt في مجلد المشروع:

```bash
# الانتقال لمجلد المشروع
cd /workspaces/spark-template

# تهيئة git (إن لم يكن مهيأ)
git init

# إضافة جميع الملفات
git add .

# أول commit
git commit -m "Initial commit: مختبر التجارب العلمية - الصف الثاني عشر"
```

### 4. ربط المشروع بـ GitHub

استبدل `YOUR_USERNAME` و `YOUR_REPO_NAME` بالقيم الخاصة بك:

```bash
# إضافة الـ remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# أو إذا تستخدم SSH:
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
```

### 5. رفع الكود

```bash
# رفع الكود للمرة الأولى
git branch -M main
git push -u origin main
```

### 6. إذا طلب منك تسجيل الدخول

**إذا استخدمت HTTPS:**
- سيطلب منك Username و Password
- **ملاحظة**: GitHub لم يعد يقبل كلمة المرور العادية
- تحتاج إنشاء **Personal Access Token**:
  1. Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. Generate new token
  3. اختر الصلاحيات: `repo`
  4. انسخ الـ token واستخدمه بدلاً من كلمة المرور

**إذا استخدمت SSH:**
- تحتاج إعداد SSH key أولاً
- اتبع [هذا الدليل](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

### 7. التحديثات المستقبلية

عند إجراء تعديلات جديدة:

```bash
# إضافة التغييرات
git add .

# commit مع رسالة وصفية
git commit -m "وصف التعديلات"

# رفع التحديثات
git push
```

## 🎯 نصائح مهمة

### رسائل الـ Commit
استخدم رسائل واضحة بالعربية أو الإنجليزية:

```bash
git commit -m "إضافة تجربة جديدة: الانقسام الخلوي"
git commit -m "إصلاح خطأ في مولد الاختبارات"
git commit -m "تحسين واجهة المختبرات التفاعلية"
```

### الفروع (Branches)
للعمل على ميزات جديدة:

```bash
# إنشاء فرع جديد
git checkout -b feature/new-experiment

# العمل على الميزة...

# العودة للفرع الرئيسي
git checkout main

# دمج الفرع
git merge feature/new-experiment
```

### التحقق من الحالة
```bash
# معرفة الملفات المعدلة
git status

# رؤية الفروق
git diff

# رؤية سجل الـ commits
git log --oneline
```

## 📋 قائمة التحقق النهائية

قبل الرفع، تأكد من:

- [ ] الملفات غير الضرورية في `.gitignore`
- [ ] لا توجد معلومات حساسة في الكود
- [ ] README.md محدث وواضح
- [ ] المشروع يعمل بدون أخطاء (`npm run dev`)
- [ ] جميع الـ dependencies موجودة في `package.json`

## 🔧 حل المشاكل الشائعة

### خطأ: "remote origin already exists"
```bash
git remote remove origin
git remote add origin YOUR_REPO_URL
```

### خطأ: "failed to push"
```bash
# سحب التغييرات أولاً
git pull origin main --rebase
git push origin main
```

### نسيت إضافة ملف في `.gitignore`
```bash
# إزالة الملف من git (لكن يبقى محلياً)
git rm --cached FILENAME
git commit -m "Remove sensitive file"
```

## 🌐 بعد الرفع

بعد رفع المشروع بنجاح:

1. **شارك الرابط** مع الطلاب والمعلمين
2. **فعّل GitHub Pages** إذا أردت استضافة مجانية
3. **أضف Topics** للـ repository: `education`, `arabic`, `science`, `react`
4. **اكتب في الـ About** وصف مختصر بالعربية

## 🎓 تفعيل GitHub Pages (اختياري)

لنشر المشروع مجاناً:

1. اذهب لإعدادات الـ Repository
2. صفحة **Pages**
3. اختر **Source**: GitHub Actions
4. استخدم Vite workflow
5. المشروع سيكون متاح على: `https://username.github.io/repo-name`

---

**محتاج مساعدة؟** افتح Issue في المشروع أو اسأل المجتمع!
