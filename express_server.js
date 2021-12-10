const randomStr = function generateRandomString() {
   return  Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);  
}
const express = require("express");

const cookieSession = require("cookie-session");
 
const getUserByEmail = require("./helpers");

// const cookieParser = require("cookie-parser");

const bcrypt = require('bcryptjs');

const app = express();
// app.use(cookieParser());
app.use(cookieSession({
    name: "session",
    keys: ["Key1","Key2"]
}))
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
//Users database
const users = {}

const passwordLookUp = function(obj, str){
    for(let user in obj){
        if(bcrypt.compareSync(str, obj[user].hashedPassword)){
            return true;
        }
    }
    return false;
}
const emailAndPassword = function(obj, email, password){
    for(let user in obj){
        if(getUserByEmail(obj, email) && passwordLookUp(obj, password)){
            console.log(obj[user].id);
            return obj[user].id;
        }
    }
  }
//Urls database
const urlDatabase = {};

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/register", (req, res)=>{
res.render("register.ejs");
})
app.get("/login", (req,res) => {
    res.render("login.ejs");
})
app.get("/urls", (req,res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  if(templateVars.user){
    res.render("urls_index", templateVars); 
}
else{
res.redirect("/login");
}

});
app.get("/urls/new", (req, res) => {
    const templateVars = {
        user: users[req.session.user_id]
    }
    if(templateVars.user){
        res.render("urls_new", templateVars); 
    }
    else{
res.redirect("/login");
    }
});
app.post("/urls", (req, res) => {
    let shortURL = randomStr();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    }
    res.redirect(`/urls/${shortURL}`);
    console.log( urlDatabase[shortURL].userID);  // Log the POST request body to the console
});
app.get("/urls/:shortURL", (req, res) => {
 const shortURL = req.params.shortURL;
 const longURL = urlDatabase[req.params.shortURL].longURL;
 const userID = req.session.user_id
 const user = users[userID];
 const templateVars = { shortURL: shortURL, longURL: longURL, user: user, urlDatabase: urlDatabase};
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(`${longURL}`);
});
app.post("/urls/:shortURL/edit", (req,res) => {
    let shortURL = req.params.shortURL;   
      res.redirect(`/urls/${shortURL}`);  
});
app.post("/urls/:shortURL/edited", (req, res) => {
   let shortURL = req.params.shortURL;
   urlDatabase[shortURL] =  {longURL: req.body.longURL, userID: req.session.user_id};
    res.redirect("/urls");     
});
app.post("/urls/:shortURL/delete", (req,res) => {
    let shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
});
app.post("/register", (req, res) => {
    const user_Id = randomStr();
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    if(getUserByEmail(users, email) || !password || !email){
        res.sendStatus(404);
    }
    else{
        users[user_Id] = {
            id: user_Id,
            email,
            hashedPassword
    } 
}
    // res.cookie("user_id", users[user_Id].id);
    req.session.user_id = `${users[user_Id].id}`;
    console.log(users);
    res.redirect('/urls');
})
app.post('/login', (req,res) => {
    // let username = req.body.username;
    // res.cookie('username', username);
    // let user = users[req.cookies["user_Id"]];
    const email = req.body.email;
    const password = req.body.password;
    if(!getUserByEmail(users, email) || !passwordLookUp(users, password) ){
        res.sendStatus(403);   
    }
    else{
        req.session.user_id = `${emailAndPassword(users, email, password)}`;
        res.redirect('/urls'); 
    }   
})
app.post('/logout', (req, res) => {
    // res.clearCookie('user_id');
    req.session = null;
    res.redirect('urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});