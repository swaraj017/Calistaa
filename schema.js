const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.object({
            filename: Joi.string().allow("").default("defaultImage"),
            url: Joi.string().uri().allow("").default("https://tyreehouseplans.com/wp-content/uploads/2016/08/Custom-Floor-Plan-Artwork.jpg")
        }).required()
    }).required()
});
