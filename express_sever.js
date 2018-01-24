var express = require("express");
var app = express();
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

var urlDatabase = { "b2xVn2": "http://www.lighthouselabs.ca",
                    "9sm5xK": "http://www.google.com"};



app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {

  res.render("urls_index", {templateVars : urlDatabase});
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  // var templateVars = { shortURL : req.params.id };
  res.render("urls_show");
});



app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  let output = generateRandomString();
  urlDatabase[output] = req.body.longURL;
  // res.send("http://localhost:8080/urls/" + output);
  console.log(urlDatabase[output]);
  res.redirect("/urls/" + output);        // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  // let longURL =...
  let shortURL= req.params.shortURL;
  let longURL= urlDatabase[shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});