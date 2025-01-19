const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { route } = require("./listing.js");
const listing = require("../models/listing");
const userController= require("../controller/user.js")


router.get("/signup", (req, res) => {
    res.render("user/signupp.ejs", { message: null });
});

router.post("/signup", wrapAsync(userController.postsignup));

router.get("/login", (req, res) => {
    res.render("user/loggin.ejs", { message: "" });
});

const savedRedirectUrl = require("../middleware.js").savedRedirectUrl;

router.post("/login", savedRedirectUrl, userController.postlogin);


router.get("/logout", (req, res) => {
    req.logOut((err) => {
        if (err) { return next(err) }
        res.redirect("/listing")
    })
})
module.exports = router;
