const express = require('express');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const cors = require('cors');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const Mongostore = require('connect-mongo');
const passport = require('passport');
const localstrategy = require('passport-local');
const User = require('./models/user');
const ExpressError = require('./utils/ExpressError');
const flash = require('connect-flash');
const dotenv = require('dotenv');
const { isLoggedIn } = require("./middleware.js");
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const app = express();
const port = process.env.PORT || 3000;

const razorpay = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
});

const dburl = "mongodb+srv://swarajgaikwad:swaraj1991@cluster0.ggxns9s.mongodb.net/wanderlust?retryWrites=true&w=majority&appName=Cluster0" + '?ssl=true';
async function main() {
    await mongoose.connect(dburl);
}
main().then(() => { console.log('MongoDB connected'); });

const store = Mongostore.create({
    mongoUrl: dburl,
    crypto: { secret: 'swaraj12345' },
    touchAfter: 24 * 3600,
});

store.on('error', (err) => { console.log(err); });

const sessionOptions = {
    store,
    secret: 'swaraj12345',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.session());

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);

passport.use(new localstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(passport.initialize());
app.use(passport.session());

const listingrouter = require('./routes/listing');
const reviewsrouter = require('./routes/review');
const userrouter = require('./routes/user');
 
app.use('/listing', listingrouter);
app.use('/listing/:id/reviews', reviewsrouter);
app.use('/', userrouter);

const listing = require("./models/listing")
// Root route for homepage
app.get('/', async (req, res) => {
    const allListings = await listing.find();
    res.render("listings/index.ejs", { allListings });
});

const ordersFilePath = path.join(__dirname, 'payments', 'orders.json');

const readData = () => {
    if (fs.existsSync(ordersFilePath)) {
        const data = fs.readFileSync(ordersFilePath);
        return JSON.parse(data);
    }
    return [];
};

const writeData = (data) => {
    fs.writeFileSync(ordersFilePath, JSON.stringify(data, null, 2));
};

if (!fs.existsSync(ordersFilePath)) {
    writeData([]);
}

app.post('/create-order', async (req, res) => {
    try {
        const { amount, currency, receipt, notes } = req.body;

        const options = {
            amount: amount * 100,
            currency,
            receipt,
            notes,
        };

        const order = await razorpay.orders.create(options);

        const orders = readData();
        orders.push({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            status: 'created',
        });
        writeData(orders);

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating order');
    }
});

app.get('/payment-success', (req, res) => {
    res.send('success.html');
});

app.post('/verify-payment', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = razorpay.key_secret;
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    try {
        const isValidSignature = validateWebhookSignature(body, razorpay_signature, secret);
        if (isValidSignature) {
            const orders = readData();
            const order = orders.find(o => o.order_id === razorpay_order_id);
            if (order) {
                order.status = 'paid';
                order.payment_id = razorpay_payment_id;
                writeData(orders);
            }
            res.status(200).json({ status: 'ok' });
            console.log('Payment verification successful');
        } else {
            res.status(400).json({ status: 'verification_failed' });
            console.log('Payment verification failed');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error verifying payment' });
    }
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    res.render('listings/error', { message });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
