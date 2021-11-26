


if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
};




const { adventureSchema, reviewSchema } = require('./schemas');
const Joi = require('joi');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const flash = require('connect-flash');
const Adventure = require('./models/listings');
const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const dbURL = process.env.DB_URL;
const adventureRoutes = require('./routes/adventures');
const methodOverride = require('method-override');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const mapboxgl = require('mapbox-gl');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
MongoStore = require('connect-mongo');


const User = require('./models/user');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const e = require('connect-flash');




mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Database Connected")
}).catch(err => {
    console.log("Error!")
    console.log(err)
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('frontend', path.join(__dirname, 'frontend'));


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(mongoSanitize());


const store = new MongoStore({
    mongoUrl: dbURL,
    secret: 'secret',
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("Session store error", e)
});

const sessionConfig = {
    store,
    name: 'session',
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};



app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
    'https://unpkg.com/@mapbox/mapbox-sdk/umd/mapbox-sdk.js',
    'https://unpkg.com/@mapbox/mapbox-sdk/umd/mapbox-sdk.min.js',
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.2/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css'
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/ventrity/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});



app.use('/', userRoutes);
app.use('/adventures', adventureRoutes);
app.use('/adventures/:id/reviews', reviewRoutes);




app.get('/', catchAsync(async (req, res) => {
    const adventures = await Adventure.find({});
    res.render('home', { adventures });
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Something went wrong'
    res.status(statusCode).render('error', { err });
    
});

app.listen(3000, () => {
    console.log(`Server started on port 3000`)
});
module.exports = router;