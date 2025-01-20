//use path module
const path = require('path');
//use express module
const express = require('express');

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
 
//connect to database
conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected...');
});
 
//set views file : 指定你存放網頁樣板的目錄
// ＿＿dirname : 目前node執行 index.js 的目錄
app.set('views',path.join(__dirname,'views'));

//set view engine ： 指定網頁樣板使用的語言
app.set('view engine', 'hbs');

// bodyParser 用來解析送過來的request
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false }));

// 在Express中如果要提供一些靜態檔案，例如圖像檔、CSS檔、Javascript檔，你必須指定路徑
// 在這裡我們的路徑是 pokemom
//                 |----public
//                        |---css
//                        |---js
//                 |----views
//                 |----index.js
// 這裡我們設定儀個虛擬路徑字首 /assets ， ＿＿dirname 表示 node執行的路徑 ， /public代表實際目錄名稱
app.use('/assets',express.static(__dirname + '/public'));
 
//route for homepage ： 每次連到首頁時，要執行的動作
// SQL 查詢結果會寫入 pokemon_view 這個網頁樣板
app.get('/',function(req, res) {
  let sql = "SELECT * FROM emp ORDER BY empno";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.render('emp_view',{
      results: results
      // results : results --> 第二個 results 是指 SQL查詢回傳的結果，也就是 55行中的results變數
      //                   --> 第一個 results 是指要傳給hbs網頁樣板的變數
    });
  });
});
 
//route for insert data ： 執行新增員工資料
// 變數 data 為一個物件 {} ，其中， empno, ename, job, manager, salary, hiredate, comm, deptno 都是表格emp的欄位名稱
//                        其中， req 是傳入的變數，包含每一個欄位的值
// function(req,res){ }  跟  直接寫成 （req,res)=> {  }  是一樣的！！
app.post('/add',(req, res) => {
  let data = {empno: req.body.p_empno, ename: req.body.p_ename, job: req.body.p_job, manager: req.body.p_manager, 
              salary: req.body.p_salary,hiredate: req.body.p_hiredate, comm: req.body.p_comm,deptno: req.body.p_deptno};
  let sql = "INSERT INTO emp SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.redirect('/');   // 這一句語法的意義是 ： 將網頁轉回首頁．網頁是無狀態，所以若沒有重新導回首頁，瀏覽器的首頁內容不會更新
  });
});
 
//route for update data ： 執行更新員工資料
app.post('/update',(req, res) => {
  let sql = "UPDATE emp SET ename='"+req.body.p_ename+"', comm='"+req.body.p_comm+"', \
            salary='"+req.body.p_salary+"' WHERE empno='"+req.body.p_empno+"'";
    console.log(sql);
    let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.redirect('/');
  });
});
 
//route for delete data ： 執行刪除員工動作
app.post('/delete',function(req, res) {
  let sql = "DELETE FROM emp WHERE empno='"+req.body.p_empno2+"'";
  console.log(sql);
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.redirect('/');
  });
});


//server listening ： 啟動Web Server
app.listen(8000, () => {
  console.log('Server is running at port 8000');
});