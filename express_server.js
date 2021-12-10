// Returns a random alphanumeric string
const randomStr = function generateRandomString() {
  return  Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};
const express = require("express");

const cookieSession = require("cookie-session");
 
const getUserByEmail = require("./helpers");
//Package to hash user password
const bcrypt = require('bcryptjs');

const app = express();

app.use(cookieSession({
  name: "session",
  keys: ["Key1","Key2"]
}));
const PORT = 8080; // default port 8080

//For template use
app.set("view engine", "ejs");

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

//Users database to store user_id, id, email, password
const users = {};

//Urls database to store shortUrl, longurl, and user_id
const urlDatabase = {};

//Return true or false based if password matches
const passwordLookUp = function(obj, str) {
  for (let user in obj) {
    if (bcrypt.compareSync(str, obj[user].hashedPassword)) {
      return true;
    }
  }
  return false;
};

//Returns user_id if both password and email matches
const emailAndPassword = function(obj, email, password) {
  for (let user in obj) {
    if (getUserByEmail(obj, email) && passwordLookUp(obj, password)) {
      console.log(obj[user].id);
      return obj[user].id;
    }
  }
};
//Handle to get registration page
app.get("/register", (req, res)=>{
  res.render("register.ejs");
});
//Handle to get login page
app.get("/login", (req,res) => {
  res.render("login.ejs");
});
//Handle to get all urls created page
app.get("/urls", (req,res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  if (templateVars.user) {
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});
//Handle to get page to create new urls
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  let shortURL = randomStr();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
  console.log(urlDatabase[shortURL].userID);  // Log the POST request body to the console
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    const userID = req.session.user_id;
    const user = users[userID];
    const templateVars = { shortURL: shortURL, longURL: longURL, user: user, urlDatabase: urlDatabase};
    res.render("urls_show", templateVars);
  } else {
    res.send("<html><body><p>This URL does not exsist. Please log in to create a new URL</p></body></html>\n");
  }
});
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(`${longURL}`);
  } else {
    res.send("<html><body><p>This URL does not exsist. Please log in to create a new URL</p></body></html>\n");
  }
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
  if (getUserByEmail(users, email)) {
    res.send("<html><body><p>Email already in use. Please login or register with another email address</p></body></html>\n");
  } else if (!password || !email) {
    res.send("<html><body><p>Please fill the empty fields</p></body></html>\n");
  } else {
    users[user_Id] = {
      id: user_Id,
      email,
      hashedPassword
    };
  }
  req.session.user_id = `${users[user_Id].id}`;
  console.log(users);
  res.redirect('/urls');
});
app.post('/login', (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.send("<html><body><p>Please fill the empty fields</p></body></html>\n");
  } else if (!getUserByEmail(users, email) || !passwordLookUp(users, password)) {
    res.send("<html><body><p>Email or password does not match </p></body></html>\n");
  } else {
    req.session.user_id = `${emailAndPassword(users, email, password)}`;
    res.redirect('/urls');
  }
});
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});