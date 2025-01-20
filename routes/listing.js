 
// const express = require("express");
// const router = express.Router();
// const wrapAsync = require("../utils/wrapAsync.js");
// const listing = require("../models/listing");
// const ExpressError = require("../utils/ExpressError");
// const User = require("../models/user.js");
// const Review = require("../models/review.js");
// const { isLoggedIn } = require("../middleware.js");
// const listingController = require("../controller/listing.js");
// const multer = require('multer');
// const { storage } = require("../cloudConfig.js");

// const upload = multer({ storage });

// router.get("/", wrapAsync(listingController.index));

// router.post("/", isLoggedIn, upload.single('listing[image]'), (req, res, next) => {
//     console.log("Uploaded File Information:");
//     console.log(req.file);
//     console.log("Form Data:");
//     console.log(req.body);
//     next();
// }, wrapAsync(listingController.create));

// router.get("/new", isLoggedIn, listingController.newListingForm);

// router.get("/:id", listingController.show);

// router.post("/", isLoggedIn, wrapAsync(listingController.create));

// router.get("/:id/edit", isLoggedIn, listingController.edit);

// router.put("/:id", isLoggedIn, upload.single('listing[image]'), listingController.update);

// router.delete("/:id", isLoggedIn, listingController.delete);

// router.all('*', (req, res, next) => {
//     console.log(`No route found for: ${req.originalUrl}`);
//     next(new ExpressError(404, 'Page not found'));
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const User = require("../models/user.js");
const Review = require("../models/review.js");
const { isLoggedIn } = require("../middleware.js");
const listingController = require("../controller/listing.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");

const upload = multer({ storage });

router.get("/", wrapAsync(listingController.index));

router.get("/new", isLoggedIn, listingController.newListingForm);

router.post("/", isLoggedIn, upload.single('listing[image]'), wrapAsync(listingController.create));

router.get("/:id", listingController.show);

router.get("/:id/edit", isLoggedIn, listingController.edit);

router.put("/:id", isLoggedIn, upload.single('listing[image]'), wrapAsync(listingController.update));

router.delete("/:id", isLoggedIn, wrapAsync(listingController.delete));

router.all('*', (req, res, next) => {
    console.log(`No route found for: ${req.originalUrl}`);
    next(new ExpressError(404, 'Page not found'));
});

module.exports = router;
