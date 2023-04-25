const router = require("express").Router();
const { isLoggedIn } = require("../middleware/route-guard");

/* GET private page */
router.get("/", isLoggedIn, (req, res, next) => {
  res.render("users/private");
});

module.exports = router;
