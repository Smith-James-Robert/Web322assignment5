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
    "id":{
        "type":Number,
        "unique":true
    }
})
var articleSchema = new Schema ({
    "title":String,
    "article":String,
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
console.log("apple");
res.redirect('/blog');
})
app.post("/login",function(req,res){
 

    const noSpecial=/[!-\/:-@[-`{-~]/;
 var username=req.body.username;
 var userName=username;
 var password=req.body.password;
 console.log(password);
 var passWord=password;
 console.log(passWord);
 var someData;
// console.log(userName);
Account.findOne({
user:userName,
pass:hash(passWord)
}).exec().then((accounts)=>
{
    //someData=accounts.map(value=>value.toObject());
//console.log(accounts);
   // console.log(accounts.user);
   // console.log(userName);
   // console.log(accounts.pass);
   // console.log(passWord);
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
    res.render('admindashboard',{
        layout:false,
        data:{
            user:accounts.user,
            emailAddress:accounts.emailAddress,
            FirstName:accounts.fName,
            LastName:accounts.lName,
        }
     })
}
else
{
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
    console.log(someData);
   // res.redirect('/login');
   res.render('login',{
        data:someData,
        layout:false
    })
 }
}
)
}
)



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

/*
    console.log("Valid =" + valid);
    console.log(email);
    console.log(firstName);
    console.log(lastName);
    console.log(phone);
    console.log(companyName);
    console.log(address1);
    console.log(address2);
    console.log(username);
    console.log(password);
    console.log(userValid);
    console.log(passValid);
    */
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
            console.log("ACCOUNT FOUND="+accounts[0].user);
            //console.log(accounts);
            console.log(accounts[0].user);
            if (accounts[0].user!=undefined)
            {
                console.log("AccountValue="+accounts[0].user);
                usernameError=true;
                someData.usernameError=true;
                console.log(someData.usernameError);
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
            console.log("Email FOUND="+accounts[0].emailAddress);
            //console.log(accounts.emailAddress);
            if (accounts[0].emailAddress!=undefined)
            {
                console.log("EmailValue");
                emailError=true;
            }
        }
        }).catch()
        account.save().then(()=>{
            console.log(account);
        }).catch(err=>{
            //JUST DO IT RIGHT EVEN IF ITS REALLY ANNOYING TO DO RIGHT
            valid=false;
            console.log("valid="+valid);
            someData.usernameError=usernameError;
            someData.emailError=emailError;
            console.log(someData);
            console.log(usernameError+"= UsernameError");
            res.render('registration',{
                data:someData,
                layout:false
                })
           // res.redirect('/blog');
        });
    //Send data to database.
    }
    else
    {
        res.render('registration',{
            data:someData,
            layout:false
        })
    }
   // console.log(someData);
   console.log("Moving to Dashboard");
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
    console.log(req.params);
    console.log(req.params.id);
    var someData
    Article.find({id:req.params.id}).exec().then((article)=> {
        article = article.map(value => value.toObject());
        //console.log(article);
        someData=article[0];
       // console.log(someData);
        res.render('article',{
            data:someData,
            layout:false
        });
    })

    //res.sendFile(path.join(__dirname,("article"+req.params.id+".html")));
})
/*
app.get("/article/1",function(req,res){
    res.sendFile(path.join(__dirname,"article1.html"));
})
app.get("/article/2",function(req,res){
    res.sendFile(path.join(__dirname,"article2.html"));
})
app.get("/article/3",function(req,res){
    res.sendFile(path.join(__dirname,"article3.html"));
})
/*app.use((req, res) => {
   res.redirect('/');
  });
*/
// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT);
//sequelizer object .sync().then(() => {
//    app.listen(HTTP_PORT)
//})
