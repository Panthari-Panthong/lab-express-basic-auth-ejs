const router = require("express").Router();
const { isLoggedIn } = require("../middleware/route-guard");

/* GET main page */
router.get("/", isLoggedIn, (req, res, next) => {
  res.render("users/main");
});

module.exports = router;
