var express = require("express");
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var morgan = require("morgan");
var bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');
var methodOverride = require('method-override');

var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

//Declare the Database and username Objects

var urlDatabase = { "userRandomID" : {userID: "userRandomID",
                                    userUrl: {"b2xVn2": "http://www.lighthouselabs.ca"}},

                    "user2RandomID": { userID: "user2RandomID",
                                    userUrl: {"9sm5xK": "http://www.google.com"}}};


var templateVars = { email: "Not Signed in"};

var users =  {"userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
    "mrbajwa": {
    id: "mrbajwa",
    email: "mrbaj@gmail.com",
    password: bcrypt.hashSync("hello", 10)}
  };


// This function will be used to generate a random number when ever required
function generateRandomString() {

    let chars = '';

    while (chars.length < 6) {
        chars += Math.random().toString(36).substring(2);
    }
   // Remove unnecessary additional characters.
    return chars.substring(0, 6);
};


//ALL THE GET FUNCTIONS ARE LISTED HERE

app.get("/", (req, res) => {

    res.redirect("/urls");

});



app.get("/urls", (req, res) => {

    if(req.session.user_id !== undefined){
       templateVars = users[req.session.user_id];
    }
    else{
      res.redirect("/login");
      return;
    }

    res.render("urls_index", {urlDatabase : urlDatabase, newUser : templateVars});

});

app.get("/urls/new", (req, res) => {

    if(req.session.user_id !== undefined){
       templateVars = users[req.session.user_id];
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

    if(req.session.user_id !== undefined){
       templateVars = users[req.session.user_id];
    }
    else{
      res.redirect("/login");;

      return;
    }

    for(x in urlDatabase){

      for(y in urlDatabase[x].userUrl){

        if(y === id && req.session.user_id === x){
          res.render("urls_show", {id : id, newUser: templateVars, long: urlDatabase[x].userUrl[y]});

          return;
        }
      }
    }

    res.status(400).send("You are not authorized to visit this page");

    return;

});


app.get("/u/:shortURL", (req, res) => {

    let shortURL = req.params.shortURL;

    for(var x in urlDatabase){

      for (var y in urlDatabase[x].userUrl){

      if(y === shortURL){

          console.log(urlDatabase[x].userUrl[y]);
          res.redirect(urlDatabase[x].userUrl[y]);
          return;
        }
      }
    }

    res.status(400).send("400 :Please enter valid URL");

  return;
});


app.get("/register", (req, res) => {

    if(req.session.user_id !== undefined){

       templateVars = users[req.session.user_id];
      }

    res.render("urls_register", {newUser: templateVars});

});


app.get("/login", (req, res) => {

     if(req.session.user_id) {

      res.redirect('/urls');
     }

     else {
      res.render("urls_login", {newUser : templateVars});
     }

});



//ALL THE POST FUNCTIONS ARE LISTED HERE

app.post("/urls", (req, res) => {

  let output = generateRandomString();

  //Update the date base with the entries received from the user.
  //The randomly generated number will be used as ID
  //If the user is not an exsiting user than a new user profile will be created

     req.body.longURL = checkHttp(req.body.longURL);

    if (urlDatabase[req.session.user_id] === undefined){
      urlDatabase[req.session.user_id] = {};
      urlDatabase[req.session.user_id].userID = req.session.user_id;
      urlDatabase[req.session.user_id].userUrl = {};
      urlDatabase[req.session.user_id].userUrl[output] = req.body.longURL;
      urlDatabase[req.session.user_id].date = new Date();
    }
    else {
      urlDatabase[req.session.user_id].userUrl[output] = req.body.longURL;
    }

    res.redirect("/urls");
});


app.delete("/urls/:id", (req, res) => {

  // When deleting a short URL, the data base will be updated and the user will be redirected to /urls

    let deleteItem = req.params.id;

    console.log(req.params.id);

    delete urlDatabase[req.session.user_id].userUrl[req.params.id];

    res.redirect("/urls");
});

app.put("/urls/:id", (req, res) => {

  // When the user updates the eisting URL at /urls/id, the database is updated and the user is redirected to /urls

    let updateItem = req.params.id;

    req.body.updateURL = checkHttp(req.body.updateURL);

    urlDatabase[req.session.user_id].userUrl[req.params.id] = req.body.updateURL;

    res.redirect("/urls");

});

app.post("/login", (req, res) => {

  // When user enters information at the login page, the given email and password are
  // cross verified against the information in the datebase
  // If the user exists, Cookie is update with the user_id which is used throughout the logged in session
  // If the inforamtion can't be verified, an error message is sent back

  for(var user in users){

    if (users[user].email === req.body.email){

      if (bcrypt.compareSync(req.body.password, users[user].password)){

       req.session.user_id = user;

       console.log(req.session.user_id);

       res.redirect("/urls");

       return;
      }

      else{

        res.status(403).send("Please enter valid password");
        return;
      }
    }

  }

  res.status(403).send("Please enter valid email");

  return;
});

app.post("/logout", (req, res) => {

  // When user lod out, the Cookie is set to null and page redireted to /login

  req.session = null;

  templateVars = { email: "Not Signed in"};

  res.redirect("/login");

});




app.post("/register", (req, res) => {

  // When a new user registers, the entered information is verified against the database
  // to ensure the email is not already used.
  // After verification the newly entered information is added to the database

    if (req.body.email === ''|| req.body.password === ''){

      res.status(400).send("Please enter valid email and password");

      return;

    }

    for(var id in users){

      if (users[id].email === req.body.email)
      {
        res.status(400).send("Email already exists");

        return ;
      }
    }

    let randomID = generateRandomString();

    users[randomID] = {};

    users[randomID].id = randomID;

    users[randomID].email = req.body.email;

    const password = req.body.password;

    const hashedPassword = bcrypt.hashSync(password, 10);

    users[randomID].password = hashedPassword;

    req.session.user_id = randomID;

    res.redirect("/urls");

});

function checkHttp(input){

  var valid = /^(ftp|http|https):\/\/[^ "]+$/.test(input);

  if (valid === true){

  return input;

  }else{

    return ("http://" + input);
  }

}


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});