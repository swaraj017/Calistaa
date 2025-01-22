 

const listing = require("../models/listing")
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const ExpressError = require("../utils/ExpressError");
const User = require("../models/user.js");
const Review = require("../models/review.js");
const { isLoggedIn } = require("../middleware.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
module.exports.index = async (req, res) => {
    const allListings = await listing.find();
    res.render("listings/index.ejs", { allListings });
}

module.exports.newListingForm = async (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.show = async (req, res, next) => {
    const { id } = req.params;

    try {
        const alisting = await listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");

        console.log("Listing data:", alisting);

        const { username: fullName, _id: ownerid } = alisting.owner || {};
        console.log("Owner Name", fullName);

        const logedId = req.session.userId

        console.log("............Authorized The Owner......\n")
        console.log("Loged User ->", logedId, "\n", "Owner Of Post ->", ownerid)
        res.render("listings/show.ejs", { alisting, fullName, logedId, ownerid });
    } catch (err) {
        console.log(err);
        next(err);
    }
}

module.exports.create = async (req, res) => {
    const newlistingentry = new listing(req.body.listing);
    console.log(req.user)
    const filename = req.file.filename;
    const url = req.file.path;

    newlistingentry.image.filename = filename;
    newlistingentry.image.url = url;
    newlistingentry.owner = req.user._id;
    await newlistingentry.save();
    res.redirect("/listing");
}

module.exports.edit = async (req, res, next) => {
    const { id } = req.params;

    const alisting = await listing.findById(id);
    if (!alisting) {
        return next(new ExpressError(404, "Listing not found"));
    }
    res.render("listings/edit.ejs", { alisting });
}

module.exports.update = async (req, res, next) => {
    const { id } = req.params;
    const listingData = req.body.listing;

    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);

    if (!listingData) {
        throw new ExpressError(400, "Send valid data for listing");
    }

    try {
        let imageUrl = '';
        let imageFilename = '';

        if (req.file) {
            imageUrl = req.file.path;
            imageFilename = req.file.filename;
        }
        else {
            const existingListing = await listing.findById(id);

            if (!existingListing) {
                return next(new ExpressError(404, "Listing not found"));
            }

            imageUrl = existingListing.image.url;
            imageFilename = existingListing.image.filename;
        }

        const updatedListing = await listing.findByIdAndUpdate(
            id,
            {
                title: listingData.title,
                description: listingData.description,
                price: listingData.price,
                country: listingData.country,
                location: listingData.location,
                image: { url: imageUrl, filename: imageFilename },
            },
            { new: true }
        );

        if (!updatedListing) {
            return next(new ExpressError(404, "Listing not found"));
        }

        res.redirect(`/listing/${updatedListing._id}`);
    } catch (error) {
        console.error("Error updating listing:", error);
        next(new ExpressError(500, "Error updating listing"));
    }
};

module.exports.delete = async (req, res, next) => {
    const { id } = req.params;

    const deletedListing = await listing.findByIdAndDelete(id);
    if (!deletedListing) {
        return next(new ExpressError(404, "Listing not found"));
    }
    res.redirect("/listing");
}
