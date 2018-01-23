var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs")

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars =
  { urls : "My link",
    url1 : "www.google.ca"};
  res.render("urls_index", {templateVars : templateVars});
});

app.get("/urls/:id", (req, res) => {
  let templateVars =
  { shortURL : req.params.id};
  res.render("urls_show");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});