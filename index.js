//**********************************************
//|-----         **File Manager**         -----|
//|-----           *Amir Roohi*           -----|
//|-----         ***@Hitter356***         -----|
//**********************************************
const express = require('express');
const path = require('path');
const multer = require('multer');


const filemanagerRoutes = require('./routes/filemanagerRoutes');


const app = express();
const PORT =  9000;


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
const PUBLIC_ROOT = path.join(__dirname, 'public'); // مسیر پوشه اصلی
app.set('views', path.join(__dirname, 'views'));



// تنظیم EJS به عنوان موتور رندر
app.set('view engine', 'ejs');

app.use('/api/filemanager', filemanagerRoutes);
app.get('/filemanager', (req, res) => {
  let rawPath = req.query.path || '/';

  // تبدیل backslash به slash
  rawPath = rawPath.replace(/\\/g, '/');

  // جلوگیری از دستکاری مسیر
  if (!rawPath.startsWith('/')) rawPath = '/' + rawPath;

  res.render('filemanager', {
    currentPath: rawPath
  });
});
app.get('/', (req, res) => { 
  res.redirect('/filemanager');
 });



// راه‌اندازی سرور
app.listen(PORT, () => {
  console.log('File manager - Amir Roohi')
  console.log('Server is running on port: ' + PORT);
});