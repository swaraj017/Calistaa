const express = require("express");
const router = express.Router({mergeParams:true});
const { isLoggedIn } = require("../middleware.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {reviewSchema } = require("../schema.js");
const listing = require("../models/listing");
const reviewController= require("../controller/reviews.js")

 
router.post("/", isLoggedIn,reviewController.addReview);

 
router.delete("/:reviewId", wrapAsync(reviewController.deleteReview));

module.exports= router;