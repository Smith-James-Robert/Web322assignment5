var HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const path= require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const { test } = require("media-typer");
const e = require("express");
var qs = require('qs');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
var hash=require('object-hash'); // This is apparently not a very good hash but I don't know how to implment any others and couldn't find that information in the course notes.
const clientSessions= require("client-sessions");
const { nextTick } = require("process");

app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: "/tmp/images/",
    filename: function (req, file, cb) {
      // we write the filename as the current date down to the millisecond
      // in a large web service this would possibly cause a problem if two people
      // uploaded an image at the exact same time. A better way would be to use GUID's for filenames.
      // this is a simple example.
     /* if (path.extname(file.originalname)==".png" || path.extname(file.originalname)=="jpg" || path.extname(file.originalname)=="gif")
      {
      cb(null, Date.now() + path.extname(file.originalname));
      }
      else
      {
            cb(null,false);
      }
      */
    // console.log(file.originalname);
    cb(null,file.originalname);
     //cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  
  // tell multer to use the diskStorage function for naming files instead of the default.
  var upload = multer({ //multer settings
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            //return callback(new Error('Only images are allowed'))
            return callback(null,false);
        }
        callback(null, true)
    }
})
app.use(clientSessions({
    cookieName:"testCookie",
    secret:"21",
    duration:10*60*1000,
    activeDuration:3*60*1000
    
    }));
console.log(hash('admin'));
console.log(hash('Peter'));
console.log(hash('peter'));


mongoose.connect("mongodb+srv://JamesSmith:8bhFGM5LcSPvXrb@senecaweb322.stg0tk4.mongodb.net/testDatabase?retryWrites=true&w=majority")
var Schema = mongoose.Schema;



var accountSchema = new Schema({

    "user":{
        "type":String,
        "unique":true
    },
    "phone":Number,
    "pass":String,
    "fName":String,
    "lName":String,
    "emailAddress":{
        "type":String,
        "unique":true
    },
    "company":{
        "type": String,
        "default": -1
    },
    "adrs1":{
        "type":String,
        "default": -1
    },
    "adrs2":{
        "type":String,
        "default": -1
    },
    "admin":{
        "type":Boolean,
        "default":false
    }
});
var blogSchema = new Schema ({
    "title":String,
    "article":String,
    "imageName":String,
    "id":{
        "type":Number,
        "unique":true
    }
})
var articleSchema = new Schema ({
    "title":String,
    "createdDate":Date,
    "article":String,
    "imageName":String,
    "id":{
        "type":Number,
        "unique":true
    }
})
var Article=mongoose.model("as4Article",articleSchema);
var Blog=mongoose.model("as4Blog",blogSchema);
var Account = mongoose.model("as4Account",accountSchema);
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
res.redirect('/blog');
    //res.send("Hello World!");
});
app.get("/registration", function(req,res){
    res.render('registration',{
        layout:false
    });
})
app.get("/blog", function(req,res){
    var someData;
    var mainArticle=0;
    Blog.find({}).exec().then((articles)=>
    {
        articles=articles.map(value => value.toObject());
        someData=articles;
        mainArticle=someData.shift();
        //In actual production you'd probably want to select the headline seperately and then find the ids for the ones that you want for other articles.
        for (var i=0;i<someData.length;i++)
        {
            
            if (someData[i].id%2)
            {
                someData[i].lineBreak=true;
            }
            else
            {
                someData[i].lineBreak=false;
            }
            someData[i].id="/article/"+someData[i].id;
            someData[i].imageName="../images/"+someData[i].imageName;
        }
        res.render('blog',{
            data:someData,
            headline:mainArticle,
            layout:false
        });
    })

})     
/* 
app.get("/article/:id", function(req,res){
    res.sendFile(path.join(__dirname,"read_more.html"));
})
*/
app.get("/login", function(req,res){
   // res.sendFile(path.join(__dirname,"login.html"));
   res.render('login',{
    layout:false
   });
})
app.get("/dashboard",function (req,res){
   // res.sendFile(path.join(__dirname,"dashboard.html"));
   //res.render('dashboard',{
  //  layout:false
//});
res.redirect('/blog');
})
app.post("/login",function(req,res){
 

    const noSpecial=/[!-\/:-@[-`{-~]/;
 var username=req.body.username;
 var userName=username;
 var password=req.body.password;
 var passWord=password;
 var someData;
Account.findOne({
user:userName,
pass:hash(passWord)
}).exec().then((accounts)=>
{
   if (accounts!=null)
{

someData={
    user:accounts.user,
    emailAddress:accounts.emailAddress,
    FirstName:accounts.fName,
    LastName:accounts.lName,
}
if(accounts.admin)
{
    req.testCookie.userInfo={
        admin:true,
        user:accounts.user,
        emailAddress:accounts.emailAddress,
        FirstName:accounts.fName,
        LastName:accounts.lName
    }
    res.render('admindashboard',{
        layout:false,
        data:req.testCookie.userInfo
       // data:{
       //     user:accounts.user,
       //     emailAddress:accounts.emailAddress,
       //     FirstName:accounts.fName,
       //     LastName:accounts.lName,
       // }
     })
}
else
{
    req.testCookie.userInfo={
        value1:false
    }
res.render('dashboard',{
    
    layout:false,
    data:{
        user:accounts.user,
        emailAddress:accounts.emailAddress,
        FirstName:accounts.fName,
        LastName:accounts.lName,
    }
 })
}
}
 else{
    someData={
        username:userName,
        password:passWord,
        invalid:true
    }
   res.render('login',{
        data:someData,
        layout:false
    })
 }
}
)
}
)
app.post("/updateFile",function(req,res)
{
        
    var body=req.body;
    console.log(req.body);
    if (req.body!=undefined)
    {
       
    Article.updateOne(
        {id:body.id},
        {$set: {title:body.title,date:body.date,article:body.content,imageName:body.image}}
        ).exec().then(()=>{
            if (body.content==undefined)
            {
                body.content="";
            }
            Blog.updateOne(
                {id:body.id},
                {$set: {title:body.title,date:body.date,article:body.content.substr(0,250),imageName:body.image}}
            ).exec().then(()=>{

            });
        });
    }
    res.render("admindashboard",{layout:false,data:req.testCookie.userInfo})
})
app.post("/viewFiles",function(req,res)
{
    Article.find().exec().then((sandwiches)=>
    {
    sandwiches=sandwiches.map(value=>value.toObject());
    res.render("admindashboard",{        layout:false,
        data:req.testCookie.userInfo,
        articles:sandwiches
    });
});
});
app.post("/addFile",upload.single("photo"),function(req,res){
    const formData = req.body;
    const formFile = req.file;
    console.log(formFile);
    //console.log(formFile.title);
    console.log(formData)
    console.log(formData);
    console.log(formData.content);

    Article.find().sort({id:-1}).limit(1).exec().then((accounts)=>
    {
        articleContent=formData.content.substr(0,250);
        var newBlog= new Blog({
            title:formData.title,
            createdDate:formData.date,
            article:articleContent,
            id:accounts[0].id+1,
        })
        var newArticle= new Article({
            title:formData.title,
            createdDate:formData.date,
            article:formData.content,
            id:accounts[0].id+1,
        });
        console.log("FormFile")
        console.log(formFile);

        if (formFile!=undefined)
        {
            newArticle.imageName=formFile.filename;
            newBlog.imageName=formFile.filename;
        }
        const user=req.testCookie.userInfo.user;
        const email=req.testCookie.userInfo.emailAddress;
        const fName=req.testCookie.userInfo.FirstName;
        const lName=req.testCookie.userInfo.LastName;
        console.log(newArticle);
        newArticle.save().then((saving)=>
        {
        newBlog.save().then((saving)=>{


           
       
   
  //  console.log(id);
    //console.log(path.extname(formFile.filename));
    /*db.collection.find().sort({age:-1}).limit(1)
    const dataReceived = "Your submission was received:<br/><br/>" +
      "Your form data was:<br/>" + JSON.stringify(formData) + "<br/><br/>" +
      "Your File data was:<br/>" + JSON.stringify(formFile) +
      "<br/><p>This is the image you sent:<br/><img src='/images/" + formFile.filename + "'/>"+
      "<br/><p>Help!<img src='iconsmall.png'/>";
    console.log(formFile.filename);
    console.log(dataReceived);
    res.send(dataReceived);
    */

    if (formFile!=undefined)
    {
        req.testCookie.userInfo={
            admin:true,
            user:user,
            emailAddress:email,
            FirstName:fName,
            LastName:lName
        }
        
    }

    console.log(req.testCookie.userInfo.user);
    console.log(req.testCookie.userInfo);
   res.render("admindashboard",{        layout:false,
    data:req.testCookie.userInfo
});
});
});
});
  // res.send("Apple");
})
app.get("/images/:id",function(req,res)
{
    res.sendFile(path.join(__dirname,"/images/"+req.params.id));
})
app.get("/articles/images/:id",function(req,res)
{
    res.sendFile(path.join(__dirname,"/images/"+req.params.id));
})
 app.post("/registration",function(req,res){    
    var username=req.body.username;
    var password=req.body.password;
    var email=req.body.email;
    var firstName=req.body.firstName;
    var lastName=req.body.lastName;
    var phone=req.body.phone;
    var companyName=req.body.companyName;
    var address1=req.body.address1;
    var address2=req.body.address2;
    var valid=true;
    var userValid=true;
    var passValid=true;
    var emailValid=true;
    var phoneValid=true;
    var firstValid=true;
    var lastValid=true;

    var usernameError= false;
    var emailError=false;

    const noSpecial=/[!-\/:-@[-`{-~]/;
    const phoneNumber=/[0-9]{10}/
    
    if (username=='' || noSpecial.test(username))
    {
        valid=false;
        userValid=false;
    }
    if (password=='' || !noSpecial.test(password) || password.length<8)
    {
        valid=false;
        passValid=false;
    }
    if (!email.includes('@'))
    {   
        valid=false;
        emailValid=false;
    }
    if (firstName=='') //No additional Validation required
    {
        valid=false;
        firstValid=false;
    }
    if (lastName=='') //No additional Validation required
    {
        valid=false;
        lastValid=false;
    }
    if (!phoneNumber.test(phone))
    {
        valid=false;
        phoneValid=false;
    }
    var someData={
        phoneNum:phone,
        validPhone:!phoneValid,
        user:username,
        validUser:!userValid,
        pass:password,
        validPass:!passValid,
        emailAddress:email,
        validEmail:!emailValid,
        FirstName:firstName,
        validFirst:!firstValid,
        LastName:lastName,
        validLast:!lastValid,
        usernameError:false,
        emailError:false
    }
    if (valid)
    {
        var account = new Account ({
            user:username,
            phone:phone,
            pass:hash(password),
            fName:firstName,
            lName:lastName,
            emailAddress:email,
            company:companyName,
            adrs1:address1,
            adrs2:address2
        })
        Account.find({user: someData.user}, "user" ).exec().then((accounts)=>
        {
            accounts=accounts.map(value => value.toObject());
            if (accounts[0]!=undefined)
            {
            if (accounts[0].user!=undefined)
            {
                usernameError=true;
                someData.usernameError=true;
            }
        }
        }
        ).catch(

        )
        Account.find({emailAddress: someData.emailAddress}, "emailAddress").exec().then((accounts)=>
        {
            accounts=accounts.map(value=>value.toObject());
            if (accounts[0]!=undefined)
            {
            if (accounts[0].emailAddress!=undefined)
            {
                emailError=true;
            }
        }
        }).catch()
        account.save().then(()=>{
        }).catch(err=>{
            valid=false;
            someData.usernameError=usernameError;
            someData.emailError=emailError;
            res.render('registration',{
                data:someData,
                layout:false
                })
        });
    }
    else
    {
        res.render('registration',{
            data:someData,
            layout:false
        })
    }
    res.render('dashboard',{
    data:someData,
    layout:false})
   // res.redirect('/dashboard')
 })
app.get("/iconsmall.png",function(req,res){
    res.sendFile(path.join(__dirname,"icon.png"));
})
app.get("/twitter",function(req,res){
    res.sendFile(path.join(__dirname,"Tweeter.png"));
})
app.get("/article/:id",function(req,res){
    var someData
    Article.find({id:req.params.id}).exec().then((article)=> {
        article = article.map(value => value.toObject());
        someData=article[0];
        console.log(someData.imageName);
        someData.imageName="/images/"+someData.imageName;
        console.log(someData.imageName);
        res.render('article',{
            data:someData,
            layout:false
        });
    })

    //res.sendFile(path.join(__dirname,("article"+req.params.id+".html")));
})
// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT);
//sequelizer object .sync().then(() => {
//    app.listen(HTTP_PORT)
//})
