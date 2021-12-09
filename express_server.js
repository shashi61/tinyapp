const randomStr = function generateRandomString() {
   return  Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);  
}
const express = require("express");

const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
//Users database
const users = {}
const emailLookUp = function(obj, str){
    for(let user in obj){
        if(obj[user].email === str){
            return true;
        }
    }
    return false;
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
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
    const templateVars = {
        user: users[req.cookies["user_id"]]
    }
    res.render("urls_new", templateVars);
});
app.post("/urls", (req, res) => {
    let shortURL = randomStr();
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
    console.log(req.body);  // Log the POST request body to the console
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]], };
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
     const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});
app.post("/urls/:shortURL/edit", (req,res) => {
    let shortURL = req.params.shortURL;
    res.redirect(`/urls/${shortURL}`);
});
app.post("/urls/:shortURL/edited", (req, res) => {
   let shortURL = req.params.shortURL;
   urlDatabase[shortURL] = req.body.longURL;
    res.redirect("/urls");    
});
app.post("/urls/:shortURL/delete", (req,res) => {
    let shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
});
app.post('/login', (req,res) => {
    // let username = req.body.username;
    // res.cookie('username', username);
    let user = users[req.cookies["user_Id"]];  
    res.redirect('/urls');
})
app.post('/logout', (req, res) => {
    res.clearCookie('user_id');
    res.redirect('urls');
})
app.post("/register", (req, res) => {
    const user_Id = randomStr();
    const email = req.body.email;
    if(emailLookUp(users, email) || email === "" || req.body.password === "" ){
        res.send(404);
    }
    else{
        users[user_Id] = {
            id: user_Id,
            email,
            password: req.body.password
    } 
}
    res.cookie("user_id", users[user_Id].id);
    console.log(users);
    res.redirect('/urls');
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});