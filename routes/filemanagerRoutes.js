// فایل: filemanagerRoutes.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const router = express.Router();

const BASE_DIR = path.join(__dirname, '../public');

// ذخیره‌ساز برای Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const target = sanitizePath(req.query.path || '');
    const fullPath = path.join(BASE_DIR, target);
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

function sanitizePath(p) {
  if (!p || typeof p !== 'string') return '';
  const decoded = decodeURIComponent(p);
  const normalized = path.normalize(decoded).replace(/^(\.\.[\/\\])+/, '');
  return normalized.replace(/\\/g, '/'); // همیشه / استفاده کن
}

// لیست فایل‌ها
router.get('/files', (req, res) => {
  const target = sanitizePath(req.query.path || '');
  const fullPath = path.join(BASE_DIR, target);
  if (!fs.existsSync(fullPath)) return res.status(404).json({ error: 'Path not found' });

  fs.readdir(fullPath, { withFileTypes: true }, (err, entries) => {
    if (err) {
      console.error('Directory read error:', err);
      return res.status(500).json({ error: 'Cannot read directory' });
    }

    const files = entries.map(entry => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
    }));

    res.json({
      path: target,
      files,
    });
  });
});

// مسیر info برای گرفتن اطلاعات فایل/پوشه
router.get('/info', (req, res) => {
  const relativePath = sanitizePath(req.query.path || '');
  const fullPath = path.join(BASE_DIR, relativePath);

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const stat = fs.statSync(fullPath);
  const isDirectory = stat.isDirectory();
  const extension = isDirectory ? null : path.extname(fullPath).slice(1).toLowerCase();

  const info = {
    name: path.basename(fullPath),
    path: relativePath,
    isDirectory,
    size: stat.size,
    modified: stat.mtime,
    extension,
    mime: getMime(extension),
    count: isDirectory ? fs.readdirSync(fullPath).length : undefined
  };

  res.json(info);
});

// تشخیص mime ساده
function getMime(ext) {
  if (!ext) return null;
  const map = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    mp4: 'video/mp4',
    webm: 'video/webm',
    pdf: 'application/pdf',
    txt: 'text/plain',
    js: 'text/javascript',
    css: 'text/css',
    html: 'text/html',
    zip: 'application/zip',
  };
  return map[ext] || 'application/octet-stream';
}

// لیست فایل‌ها از مسیر روت
router.get('/', (req, res) => {
  const target = sanitizePath(req.query.path || '');
  const fullPath = path.join(BASE_DIR, target);
  if (!fs.existsSync(fullPath)) return res.status(404).json({ error: 'Path not found' });

  const files = fs.readdirSync(fullPath).map(name => {
    const stat = fs.statSync(path.join(fullPath, name));
    return {
      name,
      isDirectory: stat.isDirectory(),
      size: stat.size,
      modified: stat.mtime
    };
  });
  res.json({ files });
});

// آپلود فایل
router.post('/upload', upload.single('file'), (req, res) => {
  res.json({ success: true });
});

// ساخت پوشه
router.post('/mkdir', (req, res) => {
  const target = sanitizePath(req.body.path || '');
  const folderName = req.body.name;
  const newPath = path.join(BASE_DIR, target, folderName);
  if (!fs.existsSync(newPath)) {
    fs.mkdirSync(newPath);
    return res.json({ success: true });
  }
  res.status(400).json({ error: 'Folder already exists' });
});

// ساخت فایل خالی
router.post('/create-file', (req, res) => {
  const target = sanitizePath(req.body.path || '');
  const fileName = req.body.name;
  const fullPath = path.join(BASE_DIR, target, fileName);

  if (fs.existsSync(fullPath)) {
    return res.status(400).json({ error: 'File already exists' });
  }

  fs.writeFileSync(fullPath, '');
  res.json({ success: true });
});

// تغییر نام
router.post('/rename', (req, res) => {
  const oldPath = path.join(BASE_DIR, sanitizePath(req.body.oldPath));
  const newPath = path.join(BASE_DIR, sanitizePath(req.body.newPath));
  fs.renameSync(oldPath, newPath);
  res.json({ success: true });
});

// حذف فایل یا پوشه
router.delete('/', (req, res) => {
  const target = path.join(BASE_DIR, sanitizePath(req.query.path));
  if (!fs.existsSync(target)) return res.status(404).json({ error: 'Not found' });
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    fs.rmSync(target, { recursive: true, force: true });
  } else {
    fs.unlinkSync(target);
  }
  res.json({ success: true });
});

// عملیات کپی یا انتقال
router.post('/paste', async (req, res) => {
  const { files, targetPath, operation } = req.body;

  if (!files || !Array.isArray(files) || !targetPath || !operation) {
    return res.status(400).json({ success: false, error: 'Invalid request' });
  }

  try {
    for (const file of files) {
      const filename = path.basename(file);
      const fromPath = path.join(BASE_DIR, file);
      const toPath = path.join(BASE_DIR, targetPath, filename);

      if (operation === 'copy') {
        await fse.copy(fromPath, toPath);
      } else if (operation === 'move') {
        await fse.move(fromPath, toPath);
      } else {
        return res.status(400).json({ success: false, error: 'Invalid operation' });
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Paste error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// دانلود فایل
router.get('/download', (req, res) => {
  const target = path.join(BASE_DIR, sanitizePath(req.query.path));
  if (!fs.existsSync(target)) return res.status(404).json({ error: 'Not found' });
  res.download(target);
});

module.exports = router;
