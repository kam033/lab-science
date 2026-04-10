# 📋 دليل رفع المشروع على GitHub - خطوة بخطوة

## 🎯 الهدف
رفع مشروع "مختبر التجارب العلمية" على GitHub ونشره مجاناً.

---

## ⚡ الطريقة السريعة (للمبتدئين)

### 1️⃣ أنشئ Repository على GitHub

1. اذهب إلى [github.com](https://github.com)
2. سجل دخول (أو أنشئ حساب)
3. اضغط زر **"+"** في الأعلى → **"New repository"**
4. املأ البيانات:
   - **Repository name**: `science-lab-grade12`
   - **Description**: `منصة تعليمية تفاعلية لتجارب العلوم`
   - اختر **Public**
   - **لا تختر** أي خيارات أخرى
5. اضغط **"Create repository"**

### 2️⃣ احفظ رابط الـ Repository

انسخ الرابط الذي سيظهر، مثل:
```
https://github.com/YOUR_USERNAME/science-lab-grade12.git
```

### 3️⃣ استخدم السكريبت الجاهز

#### على Windows:
1. افتح `Command Prompt` أو `PowerShell`
2. انتقل لمجلد المشروع:
   ```cmd
   cd \workspaces\spark-template
   ```
3. شغل السكريبت:
   ```cmd
   upload-to-github.bat
   ```
4. الصق رابط الـ repository عندما يُطلب منك
5. اتبع التعليمات

#### على Mac/Linux:
1. افتح Terminal
2. انتقل لمجلد المشروع:
   ```bash
   cd /workspaces/spark-template
   ```
3. اجعل السكريبت قابل للتشغيل:
   ```bash
   chmod +x upload-to-github.sh
   ```
4. شغل السكريبت:
   ```bash
   ./upload-to-github.sh
   ```
5. الصق رابط الـ repository عندما يُطلب منك
6. اتبع التعليمات

---

## 📝 الطريقة اليدوية (للمتقدمين)

### 1️⃣ أنشئ Repository (نفس الخطوة أعلاه)

### 2️⃣ افتح Terminal في مجلد المشروع

```bash
cd /workspaces/spark-template
```

### 3️⃣ تهيئة Git

```bash
# تهيئة Git
git init

# إضافة جميع الملفات
git add .

# أول commit
git commit -m "Initial commit: مختبر التجارب العلمية"
```

### 4️⃣ ربط الـ Repository

استبدل `YOUR_USERNAME` و `YOUR_REPO` بالقيم الخاصة بك:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

### 5️⃣ رفع الكود

```bash
git branch -M main
git push -u origin main
```

---

## 🔐 التعامل مع تسجيل الدخول

### إذا طلب منك Username و Password:

**⚠️ مهم:** GitHub لم يعد يقبل كلمة المرور العادية!

#### الحل: استخدم Personal Access Token

1. اذهب إلى GitHub
2. **Settings** (من صورة الملف الشخصي)
3. **Developer settings** (آخر خيار في القائمة)
4. **Personal access tokens** → **Tokens (classic)**
5. **Generate new token** → **Generate new token (classic)**
6. املأ البيانات:
   - **Note**: `Spark Science Lab`
   - **Expiration**: `90 days` (أو حسب رغبتك)
   - **Scopes**: اختر `repo` فقط
7. اضغط **Generate token**
8. **انسخ الـ Token فوراً** (لن تراه مرة أخرى!)

#### الاستخدام:

عند طلب Password، الصق الـ Token بدلاً من كلمة المرور

```
Username: YOUR_GITHUB_USERNAME
Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🌐 نشر الموقع (GitHub Pages)

بعد رفع الكود بنجاح:

### 1️⃣ تفعيل GitHub Pages

1. اذهب للـ repository على GitHub
2. **Settings** → **Pages**
3. في **Source**: اختر **GitHub Actions**
4. احفظ

### 2️⃣ انتظر البناء

1. اذهب لتبويب **Actions**
2. ستجد workflow يعمل
3. انتظر حتى ينتهي (2-3 دقائق)
4. إذا ظهر ✅ معناها نجح

### 3️⃣ افتح الموقع

الموقع سيكون متاحاً على:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

---

## 🐛 حل المشاكل الشائعة

### ❌ "remote origin already exists"

```bash
git remote remove origin
git remote add origin YOUR_REPO_URL
```

### ❌ "failed to push"

```bash
git pull origin main --rebase
git push origin main
```

### ❌ "Authentication failed"

- استخدم Personal Access Token بدلاً من كلمة المرور
- راجع قسم "التعامل مع تسجيل الدخول" أعلاه

### ❌ الصفحة فارغة بعد النشر

1. افتح Developer Tools (F12)
2. شوف الأخطاء في Console
3. غالباً مشكلة في المسارات

---

## 📂 الملفات المهمة المضافة

✅ **README.md** - وصف المشروع الشامل
✅ **SETUP.md** - دليل الإعداد والرفع
✅ **DEPLOYMENT.md** - دليل النشر
✅ **DEVELOPER_GUIDE.md** - دليل المطور
✅ **CONTRIBUTING.md** - دليل المساهمة
✅ **LICENSE** - رخصة MIT
✅ **.gitignore** - ملفات مستثناة من Git
✅ **upload-to-github.sh** - سكريبت لـ Mac/Linux
✅ **upload-to-github.bat** - سكريبت لـ Windows
✅ **.github/workflows/deploy.yml** - نشر تلقائي

---

## ✅ قائمة التحقق النهائية

قبل الرفع:

- [ ] عدّلت `README.md` بمعلوماتك
- [ ] اختبرت المشروع محلياً (`npm run dev`)
- [ ] لا توجد أخطاء في Console
- [ ] جميع الملفات الحساسة في `.gitignore`

بعد الرفع:

- [ ] الملفات ظهرت على GitHub
- [ ] README يظهر بشكل صحيح
- [ ] فعّلت GitHub Pages
- [ ] الموقع يعمل بدون أخطاء
- [ ] اختبرت على الموبايل

---

## 🎓 التعلم أكثر

- [Git Handbook](https://guides.github.com/introduction/git-handbook/)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Markdown Guide](https://www.markdownguide.org/)

---

## 💬 تحتاج مساعدة؟

1. **اقرأ الوثائق**:
   - [SETUP.md](SETUP.md)
   - [DEPLOYMENT.md](DEPLOYMENT.md)
   - [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)

2. **افتح Issue** على GitHub

3. **اسأل المجتمع** في Discussions

---

## 🎉 بعد النشر

شارك مشروعك:

```
🔬 مختبر التجارب العلمية - الصف الثاني عشر

منصة تعليمية تفاعلية تحتوي على 42 تجربة علمية:
⚛️ 12 تجربة فيزياء
🧪 15 تجربة كيمياء  
🧬 15 تجربة أحياء

✨ مختبرات تفاعلية
🧠 مولد اختبارات ذكي
📊 رسوم بيانية حية
📱 يعمل على جميع الأجهزة

🔗 https://YOUR_USERNAME.github.io/YOUR_REPO/
⭐ Star على GitHub: https://github.com/YOUR_USERNAME/YOUR_REPO
```

---

**حظاً موفقاً! 🚀**
