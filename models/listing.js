const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: String,
    description: String,
    image: {
        filename: {
            type: String,
            default: "defaultImage",
        },
        url: {
            type: String,
            default: "https://tyreehouseplans.com/wp-content/uploads/2016/08/Custom-Floor-Plan-Artwork.jpg",
            set: (v) => v === "" ? "https://tyreehouseplans.com/wp-content/uploads/2016/08/Custom-Floor-Plan-Artwork.jpg" : v,
        }
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"   
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'  
    }
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        if (listing.reviews && listing.reviews.length > 0) {
            
            await Review.deleteMany({ _id: { $in: listing.reviews } });
        }
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
