const Review = require("../models/review.js");
const listing = require("../models/listing");


module.exports.addReview=async (req, res) => {
    console.log(req.params.id);
    const alisting = await listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author=req.user._id;
    alisting.reviews.push(newReview);
    await newReview.save();
    await alisting.save();
    console.log("Review saved",newReview);


    res.redirect(`/listing/${req.params.id}`);
}

module.exports.deleteReview=async (req, res) => {
    let { id, reviewId } = req.params;

    
    await listing.findByIdAndUpdate(
        id,
        { $pull: { reviews: reviewId } }, 
        { new: true } 
    );

 
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listing/${id}`);
}
