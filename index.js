//use path module
const path = require('path');
//use express module
const express = require('express');

const fs = require('fs');

// use multer module for image
const multer = require('multer');

// diskStorage 用來設定檔案儲存的資訊
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/photos');
  },
  filename: function (req, file, cb) {
    const str = file.originalname.split('.');
    cb(null, str[0] + '-' + Date.now() + '.jpg');
  },
});

// 將儲存的設定寫入給 multer
var upload = multer({ storage: storage });

//use hbs view engine
const hbs = require('hbs');

//use bodyParser middleware
const bodyParser = require('body-parser');
//use mysql database
const mysql = require('mysql');

const app = express();

// 資料庫設定
const dbConfig = {
  host: "ewk5w.h.filess.io",
  user: "noisecar_viewjobup",
  password: "6aa2d7447c0cdbaa95ecddb873841d21af9ee310",
  database: "noisecar_viewjobup",
  port: 3307,
};

// 建立資料庫連線
const conn = mysql.createConnection(dbConfig);

//connect to database
conn.connect((err) => {
  if (err) {
    console.error("資料庫連線失敗：", err.message);
    return;
  }
  console.log('Mysql Connected...');
});

//set views file : 指定存放網頁樣板的目錄
app.set('views', path.join(__dirname, 'views'));

//set view engine ： 指定網頁樣板使用的語言
app.set('view engine', 'hbs');

// bodyParser 用來解析送過來的request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 提供靜態檔案服務
app.use('/assets', express.static(__dirname + '/public'));

//route for homepage
app.get('/', function (req, res) {
  let sql = "SELECT * FROM emp ORDER BY empno";
  conn.query(sql, (err, results) => {
    if (err) throw err;
    res.render('emp_view', { results: results });
  });
});

//route for insert data
app.post('/add', upload.single("p_path"), (req, res) => {
  const data = req.file
    ? {
        empno: req.body.p_empno,
        ename: req.body.p_ename,
        job: req.body.p_job,
        manager: req.body.p_manager,
        salary: req.body.p_salary,
        hiredate: req.body.p_hiredate,
        comm: req.body.p_comm,
        deptno: req.body.p_deptno,
        picpath: req.file.filename,
      }
    : {
        empno: req.body.p_empno,
        ename: req.body.p_ename,
        job: req.body.p_job,
        manager: req.body.p_manager,
        salary: req.body.p_salary,
        hiredate: req.body.p_hiredate,
        comm: req.body.p_comm,
        deptno: req.body.p_deptno,
        picpath: 'guest.jpg',
      };

  const sql = "INSERT INTO emp SET ?";
  conn.query(sql, data, (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

//route for update data
app.post('/update', upload.single("p_path2"), (req, res) => {
  const newPicPath = req.file ? req.file.filename : null;
  let sql = `UPDATE emp SET ename='${req.body.p_ename}', comm='${req.body.p_comm}', salary='${req.body.p_salary}'`;
  if (newPicPath) sql += `, picpath='${newPicPath}'`;
  sql += ` WHERE empno='${req.body.p_empno}'`;

  if (newPicPath && req.body.p_picpath2) {
    fs.unlink(`./public/photos/${req.body.p_picpath2}`, (err) => {
      if (err) console.error("檔案刪除失敗：", err.message);
      else console.log('已經刪除舊檔案:', req.body.p_picpath2);
    });
  }

  conn.query(sql, (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

//route for delete data
app.post('/delete', function (req, res) {
  const sql = `DELETE FROM emp WHERE empno='${req.body.p_empno2}'`;

  conn.query(sql, (err) => {
    if (err) throw err;

    if (req.body.p_picpath2) {
      fs.unlink(`./public/photos/${req.body.p_picpath2}`, (err) => {
        if (err) console.error("檔案刪除失敗：", err.message);
        else console.log('已經刪除檔案:', req.body.p_picpath2);
      });
    }

    res.redirect('/');
  });
});

//server listening
app.listen(8000, () => {
  console.log('Server is running at port 8000');
});
