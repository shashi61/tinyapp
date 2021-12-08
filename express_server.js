const randomStr = function generateRandomString() {
   return  Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);  
}
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
app.get("/urls", (req,res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
    const templateVars = {
        username: req.cookies["username"]
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
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"], };
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
    let username = req.body.username;
    res.cookie('username', username);
    res.redirect('/urls');
})
app.post('/logout', (req, res) => {
    res.clearCookie('username');
    res.redirect('urls');
})
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});