
 
const User = require("./models/user");

module.exports.isLoggedIn = async (req, res, next) => {
    if (!req.session || !req.session.userId) {
        req.session.redirectUrl = req.originalUrl;
        return res.redirect("/login");
    }
    const user = await User.findById(req.session.userId);
    req.user = user;
    next();
};

module.exports.savedRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

