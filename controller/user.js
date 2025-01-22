const listing = require("../models/listing");
const User = require("../models/user");

module.exports.postsignup = async (req, res) => {
    try {
        let { username, email, password } = req.body;

         
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render("user/signupp.ejs", { message: "Username already registered!" });
        }

     
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

  
        req.session.userId = registeredUser._id;
        
        console.log("User registered and logged in:", registeredUser);

     
        res.redirect("/listing");

    } catch (e) {
        console.error("Error during registration:", e);
        res.render("user/signupp.ejs", { message: "An error occurred. Please try again." });
    }
};



module.exports.postlogin=async (req, res) => {
   
    const { username } = req.body;
const existingUser = await User.findOne({ username });

if (existingUser) {
    // req.session.userId = existingUser._id;
    // console.log("Logged in User Id == >>", req.session.userId);
    const allListings = await listing.find();
    res.render("listings/index.ejs", { allListings });
} else {
    return res.render("user/loggin.ejs", { message: "Username or not found." });
}

}
