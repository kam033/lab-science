#!/bin/bash

# 🚀 سكريبت رفع المشروع على GitHub
# استخدم هذا السكريبت لرفع المشروع بسهولة

echo "🔬 مختبر التجارب العلمية - إعداد Git"
echo "=========================================="

# التحقق من وجود git
if ! command -v git &> /dev/null
then
    echo "❌ Git غير مثبت. يرجى تثبيت Git أولاً:"
    echo "   https://git-scm.com/downloads"
    exit 1
fi

echo ""
echo "✅ Git مثبت"
echo ""

# اسأل المستخدم عن رابط الـ repository
read -p "📝 أدخل رابط GitHub repository (مثل: https://github.com/username/repo.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ لم تدخل رابط الـ repository"
    exit 1
fi

echo ""
echo "⚙️  جاري إعداد Git..."

# تهيئة git إذا لم يكن مهيأ
if [ ! -d ".git" ]; then
    git init
    echo "✅ تم تهيئة Git"
else
    echo "✅ Git مهيأ بالفعل"
fi

# إضافة الملفات
echo ""
echo "📦 جاري إضافة الملفات..."
git add .

# Commit
echo ""
read -p "📝 أدخل رسالة الـ commit (اضغط Enter للاستخدام الافتراضي): " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Initial commit: مختبر التجارب العلمية - الصف الثاني عشر"
fi

git commit -m "$COMMIT_MSG"
echo "✅ تم إنشاء commit"

# إضافة remote
echo ""
echo "🔗 جاري ربط الـ repository..."

# إزالة remote القديم إن وجد
git remote remove origin 2>/dev/null

git remote add origin "$REPO_URL"
echo "✅ تم ربط repository"

# تحديد الفرع
git branch -M main

# الرفع
echo ""
echo "🚀 جاري رفع الكود إلى GitHub..."
echo "   قد يطلب منك تسجيل الدخول..."
echo ""

if git push -u origin main; then
    echo ""
    echo "🎉 نجح! تم رفع المشروع على GitHub"
    echo ""
    echo "🔗 رابط المشروع:"
    echo "   ${REPO_URL%.git}"
    echo ""
    echo "📝 الخطوات التالية:"
    echo "   1. اذهب إلى رابط المشروع على GitHub"
    echo "   2. تحقق من ظهور جميع الملفات"
    echo "   3. عدّل README.md ليحتوي رابط المشروع الصحيح"
    echo "   4. يمكنك تفعيل GitHub Pages من Settings → Pages"
    echo ""
else
    echo ""
    echo "❌ فشل الرفع. الأسباب المحتملة:"
    echo ""
    echo "1️⃣  لم تسجل دخول:"
    echo "   - إذا استخدمت HTTPS، تحتاج Personal Access Token"
    echo "   - اذهب لـ: GitHub → Settings → Developer settings → Tokens"
    echo "   - أنشئ token جديد واستخدمه بدلاً من كلمة المرور"
    echo ""
    echo "2️⃣  الـ repository غير موجود:"
    echo "   - تأكد من إنشاء repository على GitHub أولاً"
    echo "   - الرابط يجب أن يكون صحيحاً"
    echo ""
    echo "3️⃣  ليس لديك صلاحيات:"
    echo "   - تأكد أن الـ repository ملكك أو لديك صلاحية Push"
    echo ""
    echo "💡 جرب تشغيل الأوامر يدوياً:"
    echo "   git push -u origin main"
    echo ""
fi
