@echo off
REM 🚀 سكريبت رفع المشروع على GitHub لنظام Windows
REM استخدم هذا السكريبت لرفع المشروع بسهولة

echo.
echo 🔬 مختبر التجارب العلمية - إعداد Git
echo ==========================================
echo.

REM التحقق من وجود git
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Git غير مثبت. يرجى تثبيت Git أولاً:
    echo    https://git-scm.com/downloads
    pause
    exit /b 1
)

echo ✅ Git مثبت
echo.

REM اسأل المستخدم عن رابط الـ repository
set /p REPO_URL="📝 أدخل رابط GitHub repository (مثل: https://github.com/username/repo.git): "

if "%REPO_URL%"=="" (
    echo ❌ لم تدخل رابط الـ repository
    pause
    exit /b 1
)

echo.
echo ⚙️  جاري إعداد Git...

REM تهيئة git إذا لم يكن مهيأ
if not exist ".git" (
    git init
    echo ✅ تم تهيئة Git
) else (
    echo ✅ Git مهيأ بالفعل
)

REM إضافة الملفات
echo.
echo 📦 جاري إضافة الملفات...
git add .

REM Commit
echo.
set /p COMMIT_MSG="📝 أدخل رسالة الـ commit (اضغط Enter للاستخدام الافتراضي): "

if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=Initial commit: مختبر التجارب العلمية - الصف الثاني عشر
)

git commit -m "%COMMIT_MSG%"
echo ✅ تم إنشاء commit

REM إضافة remote
echo.
echo 🔗 جاري ربط الـ repository...

REM إزالة remote القديم إن وجد
git remote remove origin 2>nul

git remote add origin "%REPO_URL%"
echo ✅ تم ربط repository

REM تحديد الفرع
git branch -M main

REM الرفع
echo.
echo 🚀 جاري رفع الكود إلى GitHub...
echo    قد يطلب منك تسجيل الدخول...
echo.

git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo 🎉 نجح! تم رفع المشروع على GitHub
    echo.
    echo 🔗 رابط المشروع:
    echo    %REPO_URL:.git=%
    echo.
    echo 📝 الخطوات التالية:
    echo    1. اذهب إلى رابط المشروع على GitHub
    echo    2. تحقق من ظهور جميع الملفات
    echo    3. عدّل README.md ليحتوي رابط المشروع الصحيح
    echo    4. يمكنك تفعيل GitHub Pages من Settings → Pages
    echo.
) else (
    echo.
    echo ❌ فشل الرفع. الأسباب المحتملة:
    echo.
    echo 1️⃣  لم تسجل دخول:
    echo    - إذا استخدمت HTTPS، تحتاج Personal Access Token
    echo    - اذهب لـ: GitHub → Settings → Developer settings → Tokens
    echo    - أنشئ token جديد واستخدمه بدلاً من كلمة المرور
    echo.
    echo 2️⃣  الـ repository غير موجود:
    echo    - تأكد من إنشاء repository على GitHub أولاً
    echo    - الرابط يجب أن يكون صحيحاً
    echo.
    echo 3️⃣  ليس لديك صلاحيات:
    echo    - تأكد أن الـ repository ملكك أو لديك صلاحية Push
    echo.
    echo 💡 جرب تشغيل الأوامر يدوياً:
    echo    git push -u origin main
    echo.
)

pause
