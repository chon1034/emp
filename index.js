require('dotenv').config();
const path = require('path');
const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();

// 資料庫設定
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
};

// 建立資料庫連線
function connectdb() {
  const connection = mysql.createConnection(dbConfig);
  connection.connect((err) => {
    if (err) {
      console.error("資料庫連線失敗：", err.message);
      return;
    }
    console.log("成功連線到資料庫！");
  });
  return connection;
}

const conn = connectdb();

// 設定 view 和模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// 使用 bodyParser 中介軟體
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 提供靜態資源
app.use('/assets', express.static(path.join(__dirname, 'public')));

// 首頁路由
app.get('/', (req, res) => {
  let sql = "SELECT * FROM emp ORDER BY empno";
  conn.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("資料庫操作失敗");
    }
    res.render('emp_view', { results });
  });
});

// 新增資料路由
app.post('/add', (req, res) => {
  let data = {
    empno: req.body.p_empno,
    ename: req.body.p_ename,
    job: req.body.p_job,
    manager: req.body.p_manager,
    salary: req.body.p_salary,
    hiredate: req.body.p_hiredate,
    comm: req.body.p_comm,
    deptno: req.body.p_deptno,
  };
  let sql = "INSERT INTO emp SET ?";
  conn.query(sql, data, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("資料庫操作失敗");
    }
    res.redirect('/');
  });
});

// 更新資料路由
app.post('/update', (req, res) => {
  let sql = "UPDATE emp SET ename=?, comm=?, salary=? WHERE empno=?";
  let data = [req.body.p_ename, req.body.p_comm, req.body.p_salary, req.body.p_empno];
  conn.query(sql, data, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("資料庫操作失敗");
    }
    res.redirect('/');
  });
});

// 刪除資料路由
app.post('/delete', (req, res) => {
  let sql = "DELETE FROM emp WHERE empno=?";
  let data = [req.body.p_empno2];
  conn.query(sql, data, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("資料庫操作失敗");
    }
    res.redirect('/');
  });
});

// 全域錯誤處理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('伺服器內部錯誤');
});

// 啟動伺服器
app.listen(8000, () => {
  console.log('Server is running at port 8000');
});
