var express = require("express");
var app = express();
const mysql = require("mysql2");
var bodyParser = require("body-parser");
var path=require('path')
var currentLocation,masterlogin=null;
var destination, busData, length,datas=null,masterdata=null;
var adminid=null;
var cookieParser = require("cookie-parser");
const { name } = require("ejs");

let users = {
  currentLocation: null,
  destination: null,
  date: null,
};


const toRendermaster = {
  user: false,
}; 
const toRender = {
  user: false,
}; // const keys can be changed

app.set("view engine", "ejs");
// app.set("view engine", "html");
// app.engine('html', require('ejs').renderFile);

app.use(express.static("views"));
app.use(express.static("JAVASCRIPT"));
app.use(express.static("/"));
app.use(express.static("admin_works"));

app.use(express.static( path.join(__dirname, '/')));

app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const pool = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "s2ahil",
  database: "project",
  connectionLimit: 10,
});

pool.connect(function (error) {
  if (error) throw error;

  pool.query("select * from project.travelinfo", function (err, result) {
    if (err) throw err;
    console.warn("all results are here", result);
  });
});

// # server framework for node js
app.get("/", (req, res) => {
  res.render("display", { busDatas: busData, info: toRender });
  
});  // main 


// Now, we will render this page on a certain request
app.post("/search", (req, res) => {
  currentLocation = req.body.locate;
  destination = req.body.dest;
  timing = req.body.time;

  console.log(timing);

  

  var sql =
    "SELECT busno,currentlocation,destination,arrivaltime,reachingtime,amt from  project.travelinfo where currentlocation= ? and destination = ? and day = ?";

  pool.query(
    sql,
    [currentLocation, destination, timing],
    function (error, result) {
      if (error) {res.redirect("/");}
      else {
        console.log(result);
        if (result.length > 0) {
          str = JSON.stringify(result);
          obj = JSON.parse(str);

          console.log(obj);

          busData = obj;

          msg1: true;
          msg2: false;

          //  businfo:[obj[0].busNo, obj[0].currentLocation, obj[0].destination]

          toRender.user = true;
          console.log(busData);

          users.currentLocation = currentLocation;
          users.destination = destination;
          users.date = timing;

          // res.cookie("cookies", users);
          // localStorage.setItem("localstorage", user);

          res.redirect("/");
        } else {
          busData = null;
          msg1: false;
          msg2: true;
          toRender.user = false;
          res.redirect("/");
        }
      }
    }
  );
});

app.get("/signin", (req, res) => {
  res.render("signup");
});


app.get("/booking", (req, res) => {
  console.log("booking",users);

  toRender.user=false;
  // console.log(req.cookies.destination);
  res.render("booking", { users: users ,  datas: datas, info: toRender });


});

app.get("/showresult", (req, res) => {
  console.log("show result",users);  

  console.log("final araha hai",datas);
  res.render("booking", { users: users ,  datas: datas, info: toRender });


});

app.post("/show", (req, res) => {

  currentLocat = req.body.locate;
  dest = req.body.dest;
  date = req.body.date;
  time=req.body.time;
  
  


  var sql =
    "SELECT busno,currentlocation,destination,arrivaltime,reachingtime,amt,day from  project.travelinfo where currentlocation= ? and destination = ? and day = ? and arrivaltime= ?";

  pool.query(
    sql,
    [currentLocat, dest,date,time],
    function (error, result) {
      if (error){ res.redirect("/showresult");}
      else {
        console.log(result);
        if (result.length > 0) {
          str = JSON.stringify(result);
          obj = JSON.parse(str);

          

          datas = obj;


          //  businfo:[obj[0].busNo, obj[0].currentLocation, obj[0].destination]

          toRender.user = true;
          console.log("data received at post:",datas);

         

          // res.cookie("cookies", users);
          // localStorage.setItem("localstorage", user);

          res.redirect("/showresult");

        } else {

          busData = null;
         
          toRender.user = false;

          res.redirect("/showresult");
        }
      }
    }
  );
  
     
});

app.post('/delete',(req,res)=>{

  busno=req.body.busno;
  var sql ="delete from travelinfo where busno=? ";
  var sql2="insert into adminchange(id,busno) values(?,?)";
  pool.query( sql,[busno],function(err,result){
     if(err){res.send("<h1>error</h1>")}
     else{
           pool.query(sql2,[adminid,busno],function(err,result){
                 if(err){res.send("<h1>error</h1>")}
                 else{
                  res.redirect("/masterpage");
                 }
           })
    
     }
  })
})




app.post('/insert',(req,res)=>{

  busno=parseInt(req.body.busno);
  currentLocation=req.body.currentlocation;
  destination=req.body.destination;
  arrivaltime=req.body.arrivaltime;
  reachingtime=req.body.reachingtime;
  amt=parseInt(req.body.amt);
  today= req.body.time;

  

  const myRnId = () => parseInt(Date.now() * Math.random());

  var no=myRnId();
  console.log(busno,currentLocation,destination,arrivaltime,reachingtime,amt,no);
  var sql ="insert into project.travelinfo values(?,?,?,?,?,?,?,?)";
  pool.query( sql,[currentLocation,destination,today,arrivaltime,reachingtime,amt,busno,no],function(err,result){
     if(err){res.send("<h1>error</h1>")
    console.log(err);}
     else{
      res.redirect("/masterpage");
     }
  })
}),


app.get("/masterpage",(req,res)=>{
  
   toRendermaster.user=false;
    var sql ="SELECT * from travelinfo ";
    pool.query( sql,function(err,result){
         if(err){res.send("<h1>error</h1>")
        }
         else{
          if(result.length>0){
            masterdata=result;
            toRendermaster.user=true;

            console.log(masterdata);
            res.render(__dirname+'/admin_works/master',{busDatas:masterdata,info:toRendermaster});
           
        }else{
          toRendermaster.user=false;
          res.send("<h1>error</h1>");
        }
         }
    });
 });

app.post("/admincheck",(req,res)=>{

       var Memail=req.body.login_email;
       var Mpassword=req.body.login_password;
        console.log("hello admin")
       var sql =
       "SELECT id from  project.admininfo where email= ? and password = ? ";
       pool.query( sql,
        [Memail,Mpassword],function(err,result){
            if(err){res.send("<h1> error</h1>")}
            else{
              if(result.length>0){
                str = JSON.stringify(result);
                obj = JSON.parse(str);
      
                
      
         
                console.log(result);
                  res.redirect("/masterpage"); 
                  toRendermaster.user=false;
                adminid=obj[0].id;
              }
              else{
                res.render(__dirname+"/admin_works/imposter");
              }
            }

    
        });

});


app.get("/adminlogin",(req,res)=>{
 
   
     res.render(__dirname+"/admin_works/adminLogin") 
  

})

app.post("/payment",(req,res)=>{

  console.log('aya');
  var emailid=null,name=null,amt=null,busno=null,bookingid=null,seats=null;
   name=req.body.username
   amt=req.body.amt
    emailid=req.body.emailid
  busno=req.body.busno
  seats=req.body.seats
  const myRnId = () => parseInt(Date.now() * Math.random());

  var bookingid=myRnId();
  
  var sql =
       ' insert into project.userinfo values(?,?,?,?,?,?); ';

      //  'sam',10,'sam@gmail.com',2,'101'
       pool.query( sql,
        [name,amt,emailid,busno,bookingid,seats],function(err,result){
            if(err){
              res.send("<h1> error</h1>")
            }
            else{
              console.log('confirmed');
              res.render('confirm',{bookingid:bookingid,name:name})
            }
          })


})



var server = app.listen(4000, function () {
  console.log("listening to port 4000");
});


