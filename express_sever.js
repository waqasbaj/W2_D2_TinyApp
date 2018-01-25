var express = require("express");
var app = express();
var cookieParser = require('cookie-parser');

var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

var users = {"userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }};

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


var templateVars = { id: "Not Signed in"};



app.get("/", (req, res) => {

  res.end("Hello!");
});

app.get("/urls", (req, res) => {

  console.log("before get urls:", users);

  if(req.cookies.user_id !== undefined)
  {
     templateVars = users[req.cookies.user_id];
  }

  console.log("after get urls:", users);


  res.render("urls_index", {urlDatabase : urlDatabase, newUser : templateVars});

});

app.get("/urls/new", (req, res) => {


  if(req.cookies.user_id !== undefined)
  {
     templateVars = users[req.cookies.user_id];
  }

  res.render("urls_new", {newUser : templateVars});

});

app.get("/urls/:id", (req, res) => {
  // var templateVars = { shortURL : req.params.id };
  console.log(req.params.id);

  if(req.cookies.user_id !== undefined)
  {
     templateVars = users[req.cookies.user_id];
  }

  let id = req.params.id;
  res.render("urls_show", {id : id, newUser: templateVars});
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

  for(user in users){

    console.log("Lets Start");

    console.log("Post Login: User Object:", users[user].email , "Post Login: User input:",req.body.email);


    if (users[user].email === req.body.email)
    {
      console.log("Post Login: User Object:", users[user].email , "Post Login: User input:",req.body.email);

        if (users[user].password === req.body.password)
        {
           res.cookie("user_id", users[user].id);

           res.redirect("/");

           return;

        }
        else
        {
          res.status(403).send("Please enter valid password");
          return;
        }
    }

  }

    res.status(403).send("Please enter valid email");

    return;



});

app.post("/logout", (req, res) => {


  res.clearCookie("user_id");

  console.log(req.cookies);

  templateVars= { id: "Not Signed in"};

  console.log("after logout post:", users);


  res.redirect("/urls");

});

app.get("/register", (req, res) => {

  if(req.cookies.user_id !== undefined)
  {
     templateVars = users[req.cookies.user_id];
  }


  res.render("urls_register", {newUser: templateVars});

});

app.post("/register", (req, res) => {


  console.log(req.body);

  if (req.body.email== ''|| req.body.password == '')
  {
    res.status(400).send("Please enter valid email and password");

    return;

  }

  for(id in users)
  {
    if (users[id].email === req.body.email)
    {
      res.status(400).send("Email already exists");

      return ;
    }


  }


  {

  let randomID = generateRandomString();

  users[randomID] = {};

  users[randomID].id= randomID;

  users[randomID].email= req.body.email;

  users[randomID].password= req.body.password;

  console.log(users);

  res.cookie("user_id", randomID);

  console.log(req.cookies);

  }


  res.redirect("/urls");


});

app.get("/login", (req, res) => {


 if(req.cookies.user_id !== undefined)
  {
     templateVars = users[req.cookies.user_id];
  }

  console.log("after get login:", users);


  res.render("urls_login", {newUser: templateVars});
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});