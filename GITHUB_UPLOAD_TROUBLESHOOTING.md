# 🔧 حل مشكلة "Failed to fetch" عند رفع المشروع على GitHub

## 🚨 المشكلة
تظهر رسالة خطأ **"Failed to fetch"** عند محاولة إنشاء repository على GitHub من واجهة المشروع.

---

## ✅ الحلول المقترحة (حسب الأولوية)

### الحل 1️⃣: التحقق من الاتصال بالإنترنت
```bash
# تحقق من الاتصال بـ GitHub
ping github.com

# أو جرب فتح رابط GitHub في المتصفح
# https://github.com
```

**إذا لم يكن هناك اتصال:**
- تحقق من اتصالك بالإنترنت
- تأكد أن GitHub غير محظور على شبكتك
- جرب استخدام VPN إذا كانت هناك قيود

---

### الحل 2️⃣: استخدام الطريقة اليدوية (موصى بها ✅)

#### الخطوة 1: إنشاء Repository يدوياً على GitHub

1. اذهب إلى [github.com](https://github.com)
2. سجل دخول أو أنشئ حساب
3. اضغط على **"+"** → **"New repository"**
4. املأ البيانات:
   ```
   Repository name: science-lab-grade12
   Description: مختبر التجارب العلمية للصف الثاني عشر
   ✓ Public (أو Private حسب رغبتك)
   ✗ لا تختر "Add a README file"
   ```
5. اضغط **"Create repository"**

#### الخطوة 2: رفع الكود من Terminal

**افتح Terminal في مجلد المشروع** وشغل هذه الأوامر:

```bash
# 1. تهيئة Git (إذا لم يكن مهيأ)
git init

# 2. إضافة جميع الملفات
git add .

# 3. إنشاء أول commit
git commit -m "Initial commit: مختبر التجارب العلمية"

# 4. ربط المشروع بالـ repository (استبدل USERNAME و REPO_NAME)
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# 5. تحديد الفرع الرئيسي
git branch -M main

# 6. رفع الكود
git push -u origin main
```

**ملاحظة:** استبدل `USERNAME` باسم المستخدم الخاص بك و `REPO_NAME` باسم الـ repository

---

### الحل 3️⃣: إعداد Personal Access Token

إذا طلب منك تسجيل دخول:

#### إنشاء Token:
1. اذهب إلى GitHub → **Settings**
2. **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **Generate new token (classic)**
4. اختر الصلاحيات:
   - ✅ `repo` (جميع صلاحيات المستودعات)
5. انسخ الـ Token (سيظهر مرة واحدة فقط!)

#### استخدام Token:
```bash
# عند طلب كلمة المرور، استخدم الـ Token بدلاً منها
Username: your-username
Password: [الصق الـ Token هنا]
```

#### حفظ المعلومات للمستقبل:
```bash
# حفظ بيانات الدخول (اختياري)
git config --global credential.helper store
```

---

### الحل 4️⃣: استخدام SSH بدلاً من HTTPS

إذا كنت تفضل استخدام SSH:

#### إعداد SSH Key:
```bash
# 1. إنشاء SSH key جديد
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. بدء SSH agent
eval "$(ssh-agent -s)"

# 3. إضافة الـ key للـ agent
ssh-add ~/.ssh/id_ed25519

# 4. نسخ الـ public key
cat ~/.ssh/id_ed25519.pub
```

#### إضافة Key لـ GitHub:
1. GitHub → **Settings** → **SSH and GPG keys**
2. **New SSH key**
3. الصق الـ public key
4. **Add SSH key**

#### استخدام SSH URL:
```bash
# استخدم SSH URL بدلاً من HTTPS
git remote add origin git@github.com:USERNAME/REPO_NAME.git
git push -u origin main
```

---

### الحل 5️⃣: التحقق من المستودع الموجود

إذا كان المستودع موجوداً بالفعل:

```bash
# إزالة الـ remote القديم
git remote remove origin

# إضافة الـ remote الصحيح
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# التحقق من الـ remotes
git remote -v

# سحب التغييرات أولاً (إذا كان المستودع يحتوي ملفات)
git pull origin main --allow-unrelated-histories

# ثم رفع التغييرات
git push -u origin main
```

---

## 🎯 استخدام السكريبت المساعد

قمت بإعداد سكريبت يسهل عليك العملية:

### على Linux/Mac:
```bash
chmod +x upload-to-github.sh
./upload-to-github.sh
```

### على Windows:
```cmd
upload-to-github.bat
```

أو شغل الأوامر يدوياً حسب **الحل 2** أعلاه.

---

## 🔍 تشخيص المشكلة

### تحقق من حالة Git:
```bash
# التحقق من حالة الملفات
git status

# التحقق من الـ remotes
git remote -v

# التحقق من الفروع
git branch -a

# التحقق من السجل
git log --oneline
```

### رسائل خطأ شائعة وحلولها:

#### ❌ "fatal: not a git repository"
```bash
# الحل: تهيئة Git
git init
```

#### ❌ "remote origin already exists"
```bash
# الحل: إزالة الـ remote القديم
git remote remove origin
git remote add origin YOUR_URL
```

#### ❌ "Authentication failed"
```bash
# الحل: استخدم Personal Access Token بدلاً من كلمة المرور
# أو استخدم SSH
```

#### ❌ "Updates were rejected"
```bash
# الحل: سحب التغييرات أولاً
git pull origin main --rebase
git push origin main
```

---

## 📝 التحديثات المستقبلية

بعد رفع المشروع لأول مرة، استخدم هذه الأوامر للتحديثات:

```bash
# 1. إضافة التغييرات
git add .

# 2. إنشاء commit
git commit -m "وصف التعديلات"

# 3. رفع التحديثات
git push
```

---

## 🆘 لا زالت المشكلة موجودة؟

إذا جربت جميع الحلول ولم تنجح:

1. **تحقق من رسائل الخطأ بالكامل** في Terminal
2. **جرب من جهاز أو شبكة أخرى**
3. **تواصل مع دعم GitHub**: https://support.github.com
4. **افتح Issue في المشروع** مع تفاصيل الخطأ

---

## ✅ قائمة التحقق النهائية

قبل الرفع، تأكد من:

- [ ] Git مثبت على جهازك
- [ ] لديك حساب GitHub فعّال
- [ ] أنشأت repository على GitHub
- [ ] الاتصال بالإنترنت يعمل
- [ ] لديك Personal Access Token (أو SSH key مهيأ)
- [ ] الملفات الحساسة في `.gitignore`
- [ ] المشروع يعمل بدون أخطاء محلياً

---

## 🎓 مصادر إضافية

- [دليل Git الرسمي بالعربية](https://git-scm.com/book/ar/v2)
- [توثيق GitHub بالإنجليزية](https://docs.github.com)
- [فيديو تعليمي: Git للمبتدئين](https://www.youtube.com/results?search_query=git+github+arabic)

---

**تم إعداد هذا الدليل لمساعدتك في حل مشكلة رفع المشروع** 🚀

إذا نجحت في الرفع، لا تنسى:
- مشاركة رابط المشروع مع الطلاب
- تفعيل GitHub Pages للاستضافة المجانية
- كتابة README.md جذاب
