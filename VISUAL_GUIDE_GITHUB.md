# 🎯 دليل مصور: رفع المشروع على GitHub

## 📋 ملخص المشكلة

عند محاولة رفع المشروع من واجهة Spark، تظهر رسالة خطأ:
```
❌ Failed to fetch
```

**السبب:** مشكلة في الاتصال أو الصلاحيات مع GitHub API

**الحل:** استخدام الطريقة اليدوية التقليدية (Git CLI)

---

## 🛠️ الحل البسيط (بالصور)

### 📍 المرحلة 1: إنشاء Repository على GitHub

#### الخطوة 1.1: افتح GitHub
```
🌐 اذهب إلى: https://github.com/new
```

#### الخطوة 1.2: املأ النموذج
```
📝 Repository name: science-lab-grade12
📝 Description: مختبر التجارب العلمية - الصف الثاني عشر
🔘 Public ← اختر هذا
☐ Add a README file ← لا تختر
☐ Add .gitignore ← لا تختر  
☐ Choose a license ← لا تختر
```

#### الخطوة 1.3: إنشاء
```
🟢 اضغط زر: Create repository
```

#### الخطوة 1.4: احفظ الرابط
سيظهر رابط مثل:
```
https://github.com/YOUR_USERNAME/science-lab-grade12.git
```
**↑ انسخ هذا الرابط!**

---

### 📍 المرحلة 2: فتح Terminal

#### على VS Code:
```
⌨️ اضغط: Ctrl + J (Windows/Linux)
⌨️ أو: Cmd + J (Mac)
⌨️ أو: من القائمة → Terminal → New Terminal
```

#### على أي محرر آخر:
```
📁 افتح مجلد المشروع
🖱️ كليك يمين → Open in Terminal
```

---

### 📍 المرحلة 3: تشغيل الأوامر

انسخ والصق كل أمر **سطر بسطر**، ثم اضغط Enter:

#### الأمر 1: تهيئة Git
```bash
git init
```
**النتيجة المتوقعة:**
```
✓ Initialized empty Git repository in /path/to/project/.git/
```

---

#### الأمر 2: إضافة الملفات
```bash
git add .
```
**النتيجة المتوقعة:**
```
(لا يطبع شيء - هذا طبيعي)
```

---

#### الأمر 3: إنشاء Commit
```bash
git commit -m "Initial commit: مختبر التجارب العلمية"
```
**النتيجة المتوقعة:**
```
✓ [main (root-commit) abc1234] Initial commit: مختبر التجارب العلمية
 XX files changed, XXXX insertions(+)
 create mode 100644 ...
```

---

#### الأمر 4: ربط Repository
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

**⚠️ هام جداً:**
- استبدل `YOUR_USERNAME` باسم حسابك
- استبدل `YOUR_REPO_NAME` باسم المشروع (مثل: `science-lab-grade12`)

**مثال:**
```bash
git remote add origin https://github.com/kam033/science-lab-grade12.git
```

**النتيجة المتوقعة:**
```
(لا يطبع شيء - هذا طبيعي)
```

---

#### الأمر 5: تحديد الفرع
```bash
git branch -M main
```
**النتيجة المتوقعة:**
```
(لا يطبع شيء - هذا طبيعي)
```

---

#### الأمر 6: رفع الكود
```bash
git push -u origin main
```

**سيطلب منك تسجيل دخول!** ← اقرأ المرحلة 4 👇

---

### 📍 المرحلة 4: تسجيل الدخول

#### إذا طلب Username و Password:

```
Username for 'https://github.com': [اكتب اسم المستخدم]
Password for 'https://YOUR_USERNAME@github.com': [الصق الـ Token - ليس كلمة المرور!]
```

**⚠️ GitHub لا يقبل كلمة المرور العادية!**
**يجب استخدام Personal Access Token**

---

### 📍 المرحلة 5: إنشاء Personal Access Token

#### الخطوة 5.1: اذهب للإعدادات
```
🌐 https://github.com/settings/tokens
```

#### الخطوة 5.2: إنشاء Token جديد
```
🖱️ اضغط: Generate new token
🖱️ اختر: Generate new token (classic)
```

#### الخطوة 5.3: املأ البيانات
```
📝 Note: My Computer
📝 Expiration: 90 days (أو No expiration)
✅ Scopes: اختر فقط "repo" (سيختار الكل تلقائياً)
```

#### الخطوة 5.4: توليد
```
🟢 اضغط: Generate token
```

#### الخطوة 5.5: نسخ Token
```
⚠️ سيظهر نص طويل مثل:
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

📋 انسخه فوراً! (لن يظهر مرة أخرى)
```

#### الخطوة 5.6: استخدام Token
```
ارجع للـ Terminal واستخدمه مكان Password:

Username: your-username
Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
         ↑ الصق الـ Token هنا
```

---

### 📍 المرحلة 6: تأكيد النجاح

بعد رفع الكود، ستظهر رسالة مثل:

```
✓ Enumerating objects: 100, done.
✓ Counting objects: 100% (100/100), done.
✓ Delta compression using up to 8 threads
✓ Compressing objects: 100% (80/80), done.
✓ Writing objects: 100% (100/100), 50.00 KiB | 5.00 MiB/s, done.
✓ Total 100 (delta 20), reused 0 (delta 0)
To https://github.com/username/repo.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

**🎉 تم بنجاح!**

---

## ✅ التحقق من النجاح

### افتح GitHub:
```
🌐 https://github.com/YOUR_USERNAME/YOUR_REPO_NAME
```

**يجب أن ترى:**
- ✅ جميع ملفات المشروع
- ✅ المجلدات (src, public, إلخ)
- ✅ ملف README.md
- ✅ آخر commit

---

## 🔄 للتحديثات المستقبلية

عندما تعدل الكود وتريد رفع التحديثات:

```bash
# 1. إضافة التغييرات
git add .

# 2. إنشاء commit
git commit -m "وصف التعديل"

# 3. رفع التحديثات
git push
```

**لن يطلب منك تسجيل دخول مرة أخرى** (إذا اخترت حفظ بيانات الدخول)

---

## 🆘 مشاكل شائعة وحلولها

### ❌ المشكلة: "git: command not found"
**الحل:** ثبت Git من https://git-scm.com/downloads

---

### ❌ المشكلة: "remote origin already exists"
**الحل:**
```bash
git remote remove origin
git remote add origin YOUR_URL
```

---

### ❌ المشكلة: "Authentication failed"
**الحل:** تأكد أنك:
- ✅ استخدمت Token (وليس كلمة المرور)
- ✅ اخترت صلاحية "repo" عند إنشاء Token
- ✅ Token لم تنتهي صلاحيته

---

### ❌ المشكلة: "Updates were rejected"
**الحل:**
```bash
git pull origin main --rebase
git push origin main
```

---

### ❌ المشكلة: "Permission denied"
**الحل:** تأكد أن:
- ✅ اسم المستخدم صحيح
- ✅ الـ repository موجود
- ✅ لديك صلاحية Push

---

## 💡 نصائح إضافية

### حفظ بيانات الدخول:
```bash
git config --global credential.helper store
```
بعد هذا الأمر، لن يطلب منك تسجيل دخول في المرات القادمة.

---

### التحقق من حالة Git:
```bash
# معرفة الملفات المعدلة
git status

# معرفة الـ remotes المربوطة
git remote -v

# رؤية سجل الـ commits
git log --oneline
```

---

### استخدام SSH بدلاً من HTTPS:
إذا كنت تفضل عدم إدخال Token في كل مرة، استخدم SSH:

1. أنشئ SSH key:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. أضف Key لـ GitHub:
```
🌐 https://github.com/settings/keys
```

3. استخدم SSH URL:
```bash
git remote set-url origin git@github.com:USERNAME/REPO.git
```

---

## 📚 مصادر إضافية

- 📘 [QUICK_FIX_GITHUB.md](./QUICK_FIX_GITHUB.md) - حل سريع
- 📗 [GITHUB_UPLOAD_TROUBLESHOOTING.md](./GITHUB_UPLOAD_TROUBLESHOOTING.md) - دليل شامل
- 📕 [SETUP.md](./SETUP.md) - دليل كامل
- 🌐 [Git Documentation](https://git-scm.com/doc)
- 🌐 [GitHub Docs](https://docs.github.com)

---

## 📞 لا زلت تحتاج مساعدة؟

1. **تحقق من رسالة الخطأ بالكامل** في Terminal
2. **ابحث عن الخطأ** على Google أو Stack Overflow
3. **اطلب المساعدة** في مجتمع GitHub
4. **تواصل معنا** عبر Issues في المشروع

---

**تذكر:** الطريقة اليدوية (Git CLI) هي الأكثر موثوقية وتعمل دائماً! 💪

**حظاً موفقاً! 🚀**
