# ✅ قائمة التحقق: رفع المشروع على GitHub

## 📋 قبل البدء

- [ ] لدي اتصال بالإنترنت
- [ ] لدي حساب على GitHub (أو سأنشئ واحد)
- [ ] Git مثبت على جهازي (تحقق: `git --version`)
- [ ] المشروع يعمل محلياً بدون أخطاء
- [ ] راجعت ملف `.gitignore`

---

## 🎯 الخطوات الأساسية

### المرحلة 1: إنشاء Repository
- [ ] فتحت https://github.com/new
- [ ] أدخلت اسم المشروع: `science-lab-grade12`
- [ ] اخترت Public أو Private
- [ ] **لم أختر** "Add README"
- [ ] **لم أختر** "Add .gitignore"
- [ ] **لم أختر** "Choose license"
- [ ] ضغطت "Create repository"
- [ ] نسخت رابط الـ repository

---

### المرحلة 2: تهيئة Git محلياً
- [ ] فتحت Terminal في مجلد المشروع
- [ ] شغلت: `git init`
- [ ] شغلت: `git add .`
- [ ] شغلت: `git commit -m "Initial commit"`
- [ ] لم تظهر أي أخطاء

---

### المرحلة 3: ربط GitHub
- [ ] شغلت: `git remote add origin [رابط الـ repo]`
- [ ] تأكدت من الرابط الصحيح
- [ ] شغلت: `git branch -M main`
- [ ] جاهز للرفع

---

### المرحلة 4: الرفع
- [ ] شغلت: `git push -u origin main`
- [ ] **إذا طلب تسجيل دخول:**
  - [ ] أدخلت Username
  - [ ] أدخلت Personal Access Token (وليس كلمة المرور!)
  - [ ] نجح تسجيل الدخول
- [ ] رأيت رسالة النجاح
- [ ] رأيت: "Branch 'main' set up to track..."

---

### المرحلة 5: التحقق
- [ ] فتحت الرابط: `https://github.com/USERNAME/REPO`
- [ ] رأيت جميع ملفات المشروع
- [ ] ملف README.md يظهر بشكل صحيح
- [ ] جميع المجلدات موجودة (src, public, إلخ)
- [ ] آخر commit موجود

---

## 🔐 Personal Access Token (إذا طلب)

- [ ] فتحت https://github.com/settings/tokens
- [ ] ضغطت "Generate new token (classic)"
- [ ] أدخلت اسم للـ token
- [ ] اخترت Expiration (90 days موصى به)
- [ ] اخترت Scope: **repo** ✅
- [ ] ضغطت "Generate token"
- [ ] نسخت الـ Token فوراً
- [ ] حفظته في مكان آمن
- [ ] استخدمته مكان Password

---

## 🆘 حل المشاكل

### إذا ظهر خطأ "git: command not found"
- [ ] ثبّت Git من https://git-scm.com/downloads
- [ ] أعد تشغيل Terminal
- [ ] تحقق من التثبيت: `git --version`

### إذا ظهر "remote origin already exists"
- [ ] شغلت: `git remote remove origin`
- [ ] أعدت المحاولة: `git remote add origin [URL]`

### إذا ظهر "Authentication failed"
- [ ] تأكدت أني استخدم Token وليس Password
- [ ] تأكدت أن Token صحيح ولم ينتهي
- [ ] تأكدت أن Token لديه صلاحية "repo"

### إذا ظهر "Updates were rejected"
- [ ] شغلت: `git pull origin main --rebase`
- [ ] حللت أي conflicts (إن وجدت)
- [ ] شغلت: `git push origin main`

### إذا ظهر "Permission denied"
- [ ] تأكدت أن الـ repository ملكي
- [ ] تأكدت من Username الصحيح
- [ ] تأكدت من صلاحيات Token

---

## ✨ بعد النجاح

- [ ] المشروع مرفوع بنجاح على GitHub ✅
- [ ] شاركت الرابط مع من أريد
- [ ] حفظت Personal Access Token في مكان آمن
- [ ] راجعت README.md وحدثته إن لزم
- [ ] أضفت Description و Topics للـ repository
- [ ] (اختياري) فعّلت GitHub Pages

---

## 🔄 للتحديثات المستقبلية

عندما تعدل الكود:

- [ ] حفظت جميع الملفات
- [ ] شغلت: `git add .`
- [ ] شغلت: `git commit -m "وصف التعديل"`
- [ ] شغلت: `git push`
- [ ] تحققت من التحديث على GitHub

---

## 💾 حفظ بيانات الدخول (اختياري)

لعدم إدخال Token في كل مرة:

- [ ] شغلت: `git config --global credential.helper store`
- [ ] رفعت المشروع مرة واحدة
- [ ] أدخلت Token
- [ ] تأكدت أنه لا يطلب Token في المرات التالية

---

## 📚 الأدلة المستخدمة

- [ ] [QUICK_FIX_GITHUB.md](./QUICK_FIX_GITHUB.md) - للحل السريع
- [ ] [VISUAL_GUIDE_GITHUB.md](./VISUAL_GUIDE_GITHUB.md) - للدليل المصور
- [ ] [GITHUB_UPLOAD_TROUBLESHOOTING.md](./GITHUB_UPLOAD_TROUBLESHOOTING.md) - لحل المشاكل
- [ ] [INDEX_GUIDES.md](./INDEX_GUIDES.md) - لجميع الأدلة

---

## 🎉 التهاني!

إذا أكملت جميع الخطوات أعلاه:

✅ **مشروعك الآن على GitHub!**

🔗 **الرابط:** `https://github.com/YOUR_USERNAME/YOUR_REPO`

🚀 **يمكنك الآن مشاركته مع العالم!**

---

## 📝 ملاحظات ونصائح

### افعل ✅
- استخدم رسائل commit واضحة
- راجع `.gitignore` قبل الرفع
- احفظ Token في مكان آمن
- اختبر المشروع قبل الرفع
- اقرأ رسائل الخطأ بعناية

### لا تفعل ❌
- لا ترفع ملفات حساسة
- لا ترفع `node_modules`
- لا تشارك Token مع أحد
- لا تستخدم كلمة المرور العادية
- لا تتجاهل رسائل الخطأ

---

## 🎯 الأوامر المفيدة للنسخ

```bash
# التحقق من حالة Git
git status
git log --oneline
git remote -v

# إلغاء التغييرات
git restore .
git reset --soft HEAD~1

# تحديث من GitHub
git pull origin main

# عرض الفروقات
git diff

# إنشاء فرع جديد
git checkout -b feature-name

# دمج فرع
git merge feature-name
```

---

**طباعة هذه القائمة واستخدمها كمرجع!** 📄

**معدل النجاح: 99% عند اتباع جميع الخطوات!** ✨
