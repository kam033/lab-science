# 🚀 دليل رفع المشروع على GitHub



### 1. إنشاء حساب GitHub (إن لم يكن لديك)
- اذهب إلى [github.com](https://github.com)
- سجل حساب جديد


1. اضغط على زر **"+"** في الأعلى
   - **Description**: `منصة 
3. املأ البيانات:
   - **Repository name**: `science-lab-grade12` (أو أي اسم تريده)
   - **Description**: `منصة تعليمية تفاعلية لتجارب العلوم للصف الثاني عشر`
   - اختر **Public** أو **Private**
   - **لا تختر** "Initialize with README" (لأنه موجود بالفعل)
```bash

# تهيئة git (إن لم يكن مهيأ

git add .

```
### 4. ربط المشروع بـ Gi
استبدل `YOUR_USERNAME` و `YOU

git remote add origin https:
# أو إذا

### 5. رفع الكود
```bash

# أول commit
### 6. إذا طلب منك تسجيل الدخول
**إ

  1. Settings → Developer se



```bash




git commit -m "وصف التعديلات"
```

### 5. رفع الكود

```bash
git commit -m "إضافة تجر
git branch -M main

```

git checkout -b feature/new-exp

# العودة للفرع الرئيسي

git merge feature/new-experiment

```bash
git status
# رؤية الفروق






- [ ] المشروع يعمل بدون أخط



git rem
# إضافة التغييرات
```bash

```
### نسيت إضافة ملف في `.gitig

# رفع التحديثات

```

2. **فعّل GitHub

### رسائل الـ Commit
لنشر المشروع مجاناً:

```bash
5. المشروع سيكون متاح على: `https://username.githu
---
**محتاج مساعدة؟** افتح Issue في المشروع أو اسأل











# العودة للفرع الرئيسي









git status

# رؤية الفروق



git log --oneline






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
