var express = require("express");
var app = express();
var cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
var morgan = require("morgan");
const bcrypt = require('bcrypt');

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

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));

var urlDatabase = { "userRandomID" : {userID: "userRandomID",
                                    userUrl: {"b2xVn2": "http://www.lighthouselabs.ca"}},
                    "user2RandomID": { userID: "user2RandomID",
                                    userUrl: {"9sm5xK": "http://www.google.com"}}};


var templateVars = { id: "Not Signed in"};



app.get("/", (req, res) => {

  res.end("Hello!");
});

app.get("/urls", (req, res) => {


  if(req.cookies.user_id !== undefined)
  {
     templateVars = users[req.cookies.user_id];
  }

  res.render("urls_index", {urlDatabase : urlDatabase, newUser : templateVars});

});

app.get("/urls/new", (req, res) => {


  if(req.cookies.user_id !== undefined)
  {
     templateVars = users[req.cookies.user_id];
  }
  else{
    res.redirect("/login");
  }

  res.render("urls_new", {newUser : templateVars});

});

app.get("/urls/:id", (req, res) => {
  // var templateVars = { shortURL : req.params.id };
  console.log(req.params.id);

  let id = req.params.id

  if(req.cookies.user_id !== undefined)
  {
     templateVars = users[req.cookies.user_id];
  }
  else
  {
    res.status(400).send("Please login in prior to continuting");

    return;

  }

  for(x in urlDatabase)
  {
    for(y in urlDatabase[x].userUrl)
    {
      if(y === id && req.cookies.user_id=== x)
      {
        res.render("urls_show", {id : id, newUser: templateVars});

        return;
      }
    }
  }

  res.status(400).send("You are not authorized to visit this page");

  return;

});



app.post("/urls", (req, res) => {
  console.log(req.body);
  let output = generateRandomString();

  console.log(req.cookies.user_id);

  // urlDatabase[req.cookies.user_id].userUrl[output] = req.body.longURL;

    if (urlDatabase[req.cookies.user_id] === undefined)
    {
      urlDatabase[req.cookies.user_id] = {};
      urlDatabase[req.cookies.user_id].userID = req.cookies.user_id;
      urlDatabase[req.cookies.user_id].userUrl= {};
      urlDatabase[req.cookies.user_id].userUrl[output] = req.body.longURL;

    }
    else
    {
      urlDatabase[req.cookies.user_id].userUrl[output] = req.body.longURL;
    }

  console.log(urlDatabase);

  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  // let longURL =...
  let shortURL= req.params.shortURL;

  for(x in urlDatabase)
  {
    for (y in urlDatabase[x].userUrl)
    {
    if(y === shortURL)
      {
        res.redirect(urlDatabase[x].userUrl[y]);
        return;
      }
    }
  }
  res.status(400).send("Please enter valid URL");

  return;
});

app.post("/urls/:id/delete", (req, res) => {
  let deleteItem = req.params.id;
  console.log(req.params.id, req.body);
  delete urlDatabase[req.cookies.user_id].userUrl[req.params.id];
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {

  let updateItem = req.params.id;
  console.log(req.body.updateURL);
  urlDatabase[req.cookies.user_id].userUrl[req.params.id] = req.body.updateURL;
  res.redirect("/urls");
  console.log(urlDatabase);

});

app.post("/login", (req, res) => {

  for(user in users){


    if (users[user].email === req.body.email)
    {

        if (bcrypt.compareSync(req.body.password, users[user].password))
        {
           res.cookie("user_id", users[user].id);

           res.redirect("/urls");

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

  if (req.body.email=== ''|| req.body.password === '')
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

  const password = req.body.password;

  const hashedPassword = bcrypt.hashSync(password, 10);

  users[randomID].password= hashedPassword;

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


  res.render("urls_login", {newUser: templateVars});
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});