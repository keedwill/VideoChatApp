const route = require("express").Router();
const { v4 } = require("uuid");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require('passport')

route.get("/login", (req, res) => {
  res.render("login");
});

route.get("/register", (req, res) => {
  res.render("register");
});

//register user
route.post("/register", async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  //check if passwords match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  //check password lenght
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    // check if user already exist
    await User.findOne({ email: email }, (err, user) => {
      if (user) {
        errors.push({ msg: "Email alraedy exist" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        // hash password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            // set password to hashed password
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash('success_msg', ' You are now registered and can login')
                res.redirect("/users/login");
              })
              .catch((err) => {
                console.log(err);
              });
          });
        });
      }
    });
  }
});



//login user
route.post('/login',(req,res,next)=>{
  passport.authenticate('local',{
    successRedirect:'/dashboard',
    failureRedirect:'/users/login',
    failureFlash:true
  })(req,res,next)
})

//logout user
route.get('/logout',(req,res)=>{
req.logOut()
req.flash('success_msg', 'You are logged out')
res.redirect('/users/login')
})

module.exports = route;
