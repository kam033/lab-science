# 💻 مرجع سريع: أوامر Git للمشروع

## 🚀 الإعداد الأولي (مرة واحدة)

```bash
# تهيئة Git في المشروع
git init

# إضافة جميع الملفات
git add .

# أول commit
git commit -m "Initial commit: مختبر التجارب العلمية"

# ربط بـ GitHub (غيّر USERNAME و REPO)
git remote add origin https://github.com/USERNAME/REPO.git

# تحديد الفرع الرئيسي
git branch -M main

# رفع الكود
git push -u origin main
```

---

## 🔄 التحديثات اليومية

```bash
# إضافة التغييرات
git add .

# حفظ التغييرات
git commit -m "وصف التعديل"

# رفع التحديثات
git push
```

---

## 📋 التحقق والمعلومات

```bash
# حالة الملفات
git status

# سجل التغييرات
git log --oneline

# آخر 5 commits
git log -5 --oneline

# رؤية الفروقات
git diff

# المستودعات المربوطة
git remote -v

# قائمة الفروع
git branch -a

# معلومات Git
git --version
```

---

## 🔧 إصلاح المشاكل

```bash
# إزالة remote خاطئ
git remote remove origin

# إضافة remote جديد
git remote add origin https://github.com/USERNAME/REPO.git

# تغيير URL للـ remote
git remote set-url origin https://github.com/USERNAME/REPO.git

# سحب تحديثات من GitHub
git pull origin main

# سحب مع rebase
git pull origin main --rebase

# إلغاء تغييرات غير محفوظة
git restore .

# إلغاء آخر commit (لكن الملفات تبقى)
git reset --soft HEAD~1

# إلغاء آخر commit (وحذف التغييرات!)
git reset --hard HEAD~1

# تجاهل ملف بدأ تتبعه بالخطأ
git rm --cached FILENAME
```

---

## 🌿 العمل مع الفروع

```bash
# إنشاء فرع جديد
git checkout -b feature-name

# التبديل بين الفروع
git checkout main
git checkout feature-name

# دمج فرع في الفرع الحالي
git merge feature-name

# حذف فرع محلي
git branch -d feature-name

# حذف فرع بقوة
git branch -D feature-name

# رفع فرع جديد
git push -u origin feature-name

# حذف فرع من GitHub
git push origin --delete feature-name
```

---

## 🔐 المصادقة

```bash
# حفظ بيانات الدخول
git config --global credential.helper store

# إزالة بيانات الدخول المحفوظة
git config --global --unset credential.helper

# عرض إعدادات المستخدم
git config --global --list

# تعيين اسم المستخدم
git config --global user.name "Your Name"

# تعيين البريد الإلكتروني
git config --global user.email "your.email@example.com"
```

---

## 📦 تنظيف وصيانة

```bash
# تنظيف الملفات غير المتتبعة
git clean -fd

# تحسين أداء المستودع
git gc

# التحقق من سلامة المستودع
git fsck

# عرض حجم المستودع
git count-objects -vH
```

---

## 🔄 التراجع والاستعادة

```bash
# استعادة ملف من آخر commit
git restore FILENAME

# استعادة ملف من commit معين
git restore --source=COMMIT_HASH FILENAME

# التراجع عن التغييرات المحفوظة في staging
git restore --staged FILENAME

# عرض محتوى ملف من commit قديم
git show COMMIT_HASH:path/to/file
```

---

## 🏷️ العمل مع Tags

```bash
# إنشاء tag
git tag v1.0.0

# إنشاء tag مع رسالة
git tag -a v1.0.0 -m "Version 1.0.0"

# عرض جميع Tags
git tag

# رفع tag لـ GitHub
git push origin v1.0.0

# رفع جميع Tags
git push origin --tags

# حذف tag محلي
git tag -d v1.0.0

# حذف tag من GitHub
git push origin --delete v1.0.0
```

---

## 📊 مقارنات وفروقات

```bash
# فروقات الملفات غير المحفوظة
git diff

# فروقات الملفات في staging
git diff --staged

# فروقات بين فرعين
git diff main..feature-name

# فروقات بين commits
git diff COMMIT1..COMMIT2

# فروقات لملف معين
git diff -- path/to/file

# إحصائيات الفروقات
git diff --stat
```

---

## 🔍 البحث

```bash
# البحث في محتوى الملفات
git grep "text to search"

# البحث في commits
git log --grep="search term"

# البحث عن commits من شخص معين
git log --author="username"

# البحث عن تغييرات على ملف معين
git log -- path/to/file

# من غيّر هذا السطر؟
git blame FILENAME
```

---

## 🚨 حالات الطوارئ

### نسيت إضافة ملف في آخر commit
```bash
git add FILENAME
git commit --amend --no-edit
```

### تغيير رسالة آخر commit
```bash
git commit --amend -m "رسالة جديدة"
```

### رفعت commit بالخطأ
```bash
# التراجع عن آخر commit
git reset --soft HEAD~1

# أو إذا رفعته لـ GitHub
git revert HEAD
git push
```

### تعارضات عند الدمج (Conflicts)
```bash
# رؤية الملفات المتعارضة
git status

# بعد حل التعارضات:
git add .
git commit -m "حل التعارضات"
```

### حذفت ملفات بالخطأ
```bash
git restore .
```

---

## 💡 نصائح مفيدة

### اختصارات مفيدة
```bash
# alias للأوامر الشائعة
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'restore --staged'

# الآن يمكنك استخدام:
git st    # بدلاً من git status
git co    # بدلاً من git checkout
git br    # بدلاً من git branch
```

### سجل جميل للـ commits
```bash
git log --oneline --graph --decorate --all
```

### عرض التغييرات الأخيرة
```bash
git show
```

### عرض الملفات في commit معين
```bash
git show COMMIT_HASH --name-only
```

---

## 📚 الأوامر المتقدمة

```bash
# Interactive rebase (تعديل تاريخ commits)
git rebase -i HEAD~3

# Cherry-pick (نقل commit معين)
git cherry-pick COMMIT_HASH

# Stash (حفظ تغييرات مؤقتة)
git stash
git stash pop
git stash list

# Submodules (مشاريع فرعية)
git submodule add URL path
git submodule update --init

# Worktree (نسخ عمل متعددة)
git worktree add ../project-feature feature-branch
```

---

## 🔗 روابط مفيدة

| الخدمة | الأمر / الرابط |
|--------|---------------|
| إنشاء Repository | https://github.com/new |
| Personal Access Tokens | https://github.com/settings/tokens |
| SSH Keys | https://github.com/settings/keys |
| تنزيل Git | https://git-scm.com/downloads |

---

## 📖 المساعدة

```bash
# مساعدة عامة
git help

# مساعدة أمر معين
git help commit
git help push

# نسخة مختصرة
git commit -h
git push -h
```

---

## ✅ أوامر للنسخ السريع

### إعداد مشروع جديد:
```bash
git init && git add . && git commit -m "Initial commit" && git remote add origin URL && git push -u origin main
```

### تحديث سريع:
```bash
git add . && git commit -m "تحديث" && git push
```

### حالة كاملة:
```bash
git status && git log --oneline -5 && git remote -v
```

---

**احفظ هذا الملف كمرجع سريع!** 📌

**للمزيد من التفاصيل، راجع الأدلة الأخرى في المشروع** 📚
