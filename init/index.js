require('dotenv').config();

const mongoose = require("mongoose");
const initdata = require("./data");
const Listing = require("../models/listing.js");

const dburl = "mongodb+srv://swarajgaikwad:swaraj1991@cluster0.ggxns9s.mongodb.net/wanderlust?retryWrites=true&w=majority&appName=Cluster0";

console.log("MongoDB URL:", dburl);

async function main() {
    try {
        await mongoose.connect(dburl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

main().then(() => {
    initDb(); 
});

const initDb = async () => {
    try {
        await Listing.deleteMany({});
        initdata.data = initdata.data.map((obj) => ({
            ...obj,
            owner: "677813ad81f3cdcb6f7c0d11"
        }));
        await Listing.insertMany(initdata.data);
        console.log("Data was saved successfully.");
    } catch (err) {
        console.error("Error during data initialization:", err);
    }
};
