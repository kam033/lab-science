# 🔧 حل سريع لمشكلة "Failed to fetch"

## 📌 المشكلة
ظهور خطأ **"Failed to fetch"** عند محاولة رفع المشروع على GitHub

---

## ✅ الحل السريع (3 خطوات فقط)

### الخطوة 1: إنشاء Repository على GitHub يدوياً

1. اذهب إلى: https://github.com/new
2. املأ المعلومات:
   - **اسم المشروع**: `science-lab-grade12`
   - **الوصف**: `مختبر التجارب العلمية - الصف الثاني عشر`
   - اختر **Public**
   - **لا تختر أي خيارات إضافية** (README, .gitignore, License)
3. اضغط **Create repository**
4. **احفظ الرابط** الذي سيظهر (مثل: `https://github.com/اسمك/science-lab-grade12.git`)

---

### الخطوة 2: فتح Terminal

**على Windows:**
- اضغط `Ctrl + J` في VS Code
- أو: Terminal → New Terminal من القائمة العلوية

**على Mac/Linux:**
- اضغط `Ctrl + \`` في VS Code
- أو: Terminal → New Terminal

---

### الخطوة 3: تشغيل هذه الأوامر

انسخ والصق كل سطر واضغط Enter:

```bash
# تهيئة Git
git init

# إضافة جميع الملفات
git add .

# إنشاء commit
git commit -m "Initial commit: مختبر التجارب العلمية"

# ربط المشروع (غير الرابط بالرابط الخاص بك!)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# تحديد الفرع
git branch -M main

# رفع الكود
git push -u origin main
```

**⚠️ مهم:** في السطر الرابع، غيّر:
- `YOUR_USERNAME` → اسم حسابك على GitHub
- `YOUR_REPO_NAME` → اسم الـ repository (مثل: `science-lab-grade12`)

---

## 🔐 إذا طلب تسجيل دخول

### الطريقة 1: Personal Access Token (موصى بها)

1. اذهب إلى: https://github.com/settings/tokens
2. اضغط **Generate new token (classic)**
3. اكتب اسم للـ token (مثل: `My Computer`)
4. اختر صلاحية: ✅ **repo**
5. اضغط **Generate token**
6. **انسخ الـ Token فوراً** (لن يظهر مرة أخرى!)

**عند الرفع:**
```
Username: your-username
Password: [الصق الـ Token هنا وليس كلمة المرور!]
```

### الطريقة 2: حفظ بيانات الدخول

بعد تسجيل الدخول مرة واحدة:
```bash
git config --global credential.helper store
```

هذا سيحفظ المعلومات للمرة القادمة.

---

## ✅ تم الرفع بنجاح؟

إذا رأيت رسالة تشبه:
```
Enumerating objects: 100, done.
Writing objects: 100% (100/100), 50 KiB | 5 MiB/s, done.
To https://github.com/username/repo.git
 * [new branch]      main -> main
```

**تهانينا! 🎉** المشروع الآن على GitHub

### الخطوات التالية:
1. افتح رابط الـ repository على GitHub
2. تحقق من ظهور جميع الملفات
3. شارك الرابط مع من تريد

---

## 🎓 للتحديثات المستقبلية

عندما تعدل الكود وتريد رفع التحديثات:

```bash
git add .
git commit -m "وصف التعديل"
git push
```

---

## ❌ لا زالت المشكلة موجودة؟

**اقرأ الدليل الكامل:**
- [`GITHUB_UPLOAD_TROUBLESHOOTING.md`](./GITHUB_UPLOAD_TROUBLESHOOTING.md) - دليل شامل لحل جميع المشاكل
- [`SETUP.md`](./SETUP.md) - شرح مفصل خطوة بخطوة

**أو استخدم السكريبت المساعد:**
```bash
# على Linux/Mac
./upload-to-github.sh

# على Windows
upload-to-github.bat
```

---

## 📞 محتاج مساعدة؟

- تحقق من [GitHub Status](https://www.githubstatus.com/) للتأكد أن GitHub يعمل
- ابحث عن رسالة الخطأ على Google
- اطلب المساعدة من مجتمع GitHub

---

**نصيحة:** احفظ رابط الـ repository وبيانات الدخول في مكان آمن! 🔐
