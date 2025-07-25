#  File Manager server Node.js

🎯 یک فایل منیجر قدرتمند و سبک با Node.js + Express + EJS برای مدیریت فایل‌ها در مسیر `public`، طراحی‌شده برای پنل ادمین پروژه‌های حرفه‌ای.

---

## ✨ ویژگی‌ها

- 📂 نمایش پوشه‌ها و فایل‌ها با آیکن مناسب
- 📥 آپلود فایل (با پشتیبانی از Drag & Drop)
- 📁 ساخت پوشه جدید
- ✏️ تغییر نام فایل و پوشه
- ❌ حذف فایل یا پوشه
- 📄 نمایش جزئیات فایل (نام، حجم، نوع)
- 🖼️ پیش‌نمایش عکس‌ها
- 🎵 پخش موسیقی و ویدیو در مرورگر
- 📦 قابلیت دانلود فایل
- 🧩 پشتیبانی از فایل `desktop.ini` برای نمایش آیکن خاص پوشه‌ها

---

## ساختار پوشه

- 📦 project-root
- ┣ 📁 public             ← Your file storage
- ┣ 📁 views              ← EJS templates
- ┣ 📁 routes             ← API routes (e.g., filemanagerRoutes.js)
- ┣ 📄 index.js             ← Main Express server
- ┣ 📄 .env.example       ← Sample env variables
- ┣ 📄 README.md          ← This file
- ┗ 📄 .gitignore

---


## 🚀 نحوه اجرا

```bash
git clone https://github.com/hitter356/FileManager.git
cd FileManager
npm install
npm start
http://localhost:9000/filemanager
