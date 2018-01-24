var express = require("express");
var app = express();
var cookieParser = require('cookie-parser');

var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

function generateRandomString() {
    let chars = '';

    while (chars.length < 6) {
        chars += Math.random().toString(36).substring(2);
    }

    // Remove unnecessary additional characters.
    return chars.substring(0, 6);
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

var urlDatabase = { "b2xVn2": "http://www.lighthouselabs.ca",
                    "9sm5xK": "http://www.google.com"};


var templateVars = { username: "Not Signed in"};



app.get("/", (req, res) => {

  res.end("Hello!");
});

app.get("/urls", (req, res) => {

  if(req.cookies.username)
  {
     templateVars.username = req.cookies.username;
  }

  res.render("urls_index", {urlDatabase : urlDatabase, templateVars : templateVars});

});

app.get("/urls/new", (req, res) => {


  if(req.cookies.username)
  {
     templateVars.username = req.cookies.username;
  }

  res.render("urls_new", {templateVars : templateVars});

});

app.get("/urls/:id", (req, res) => {
  // var templateVars = { shortURL : req.params.id };
  console.log(req.params.id);

  if(req.cookies.username)
  {
     templateVars.username = req.cookies.username;
  }

  let id = req.params.id;
  res.render("urls_show", {id : id, templateVars : templateVars});
});



app.post("/urls", (req, res) => {
  console.log(req.body);
  let output = generateRandomString();
  urlDatabase[output] = req.body.longURL;
  // res.send("http://localhost:8080/urls/" + output);
  console.log(urlDatabase);
  res.redirect("/urls/" + output);
});

app.get("/u/:shortURL", (req, res) => {
  // let longURL =...
  let shortURL= req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  let deleteItem = req.params.id;
  delete urlDatabase[deleteItem];
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {

  let updateItem = req.params.id;
  console.log(req.body.updateURL);
  urlDatabase[updateItem] = req.body.updateURL;
  res.redirect("/urls");
  console.log(urlDatabase);

});

app.post("/login", (req, res) => {


  res.cookie("username", req.body.username);

  console.log(req.cookies);


  res.redirect("/urls");

});

app.post("/logout", (req, res) => {


  res.clearCookie("username");

  console.log(req.cookies);

  templateVars.username = "Not Signed in";


  res.redirect("/urls");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});