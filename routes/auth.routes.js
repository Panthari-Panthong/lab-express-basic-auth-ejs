const router = require("express").Router();

// Load the bcrypt module
const bcryptjs = require("bcryptjs");

const User = require("../models/User.model");

// Use RegEx To Test Password Strength
// must be matched 8 or more times
// need to match the special characters [@$!%*?&]
const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

// GET route ==> to display the signup form to users
router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

// POST route ==> to process form data
router.post("/signup", async (req, res, next) => {
  try {
    // Find the username in DB if exists
    const findUserName = await User.findOne({ username: req.body.username });

    // If it not find the username in DB
    if (!findUserName) {
      // Check if the password is strong enough
      // Then create the user
      if (pwdRegex.test(req.body.password)) {
        // Generate a salt
        const salt = bcryptjs.genSaltSync(13);
        // Hash the password with the salt
        const passwordHash = bcryptjs.hashSync(req.body.password, salt);

        //Create user in the database with Hash password
        await User.create({
          username: req.body.username,
          password: passwordHash,
        });

        res.redirect("/auth/login");

        // If the password is not strong enough
        // Send back to signup page
      } else {
        res.render("auth/signup", {
          errorMessage:
            "Password needs to have at least 8 chars and must contain at least one special characters, one lowercase and one uppercase letter.",
          userName: req.body.username,
        });
      }
      // If the username alredy use
      // Send back to signup page
    } else {
      res.render("auth/signup", {
        errorMessage: "Username already in use",
        userName: req.body.username,
      });
    }
  } catch (error) {
    console.log("ERROR : " + error);
  }
});

// Login
// GET route ==> to display the login form to users
router.get("/login", (req, res) => {
  res.render("auth/login");
});

// POST login route ==> to process form data
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // check if username and password are empty in form value
    if (username === "" || password === "") {
      res.render("auth/login", {
        errorMessage: "Please enter both, username and password to login.",
      });
      return;
    }

    // Find username in DB
    const user = await User.findOne({ username: req.body.username });

    /* Trying to check if user is not not false
    user = null
    !user => true
    !true => false
    !!user => false */
    if (!!user) {
      // If password is correct
      if (bcryptjs.compareSync(req.body.password, user.password)) {
        // when we introduce session, the following line gets replaced with what follows:
        // res.render('users/user-profile', { user });

        //******* SAVE THE USER IN THE SESSION ********//
        req.session.currentUser = { username: user.username };
        res.redirect("/auth/userProfile");

        // If password is wrong
      } else {
        res.render("auth/login", { errorMessage: "Incorrect password." });
      }

      // If we don't have a user with the given username
    } else {
      res.render("auth/login", { errorMessage: "User does not exists" });
    }
  } catch (error) {
    console.log("ERROR : " + error);
  }
});

router.get("/userProfile", (req, res) => {
  res.render("users/user-profile.ejs", {
    userInSession: req.session.currentUser,
  });
});

// Logout
router.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) next(err);
    res.redirect("/");
  });
});

module.exports = router;
