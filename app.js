const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsmate = require("ejs-mate");
const session = require('express-session');
// const {campgroundSchema,reviewSchema} = require('./schemacheck');
// const catchAsync = require('./utils/catchAsync');
const expressError = require('./utils/expressError');
const methodOverride = require("method-override");
const flash = require('connect-flash');
// const Campground = require("./models/campground");
// const campground = require("./models/campground");
// const Review = require('./models/review')

const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require ('./routes/reviews');
const usersRoutes = require('./routes/users')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');


mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database Connected");
});

const app = express();

app.engine("ejs", ejsmate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname , 'public')));
const sessionconfig ={
  secret: 'thisshouldbeabettersecret',
  resave: false,
  saveUninitialized:true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000*60*60*24*7,
    maxAge: 1000*60*60*24*7
    
  }
}
app.use(session(sessionconfig))
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
next();
});
// const validateCampground = (req,res,next)=>{
// const {error} =  campgroundSchema.validate(req.body);
 
//   if(error)
//   {
//     const msg = error.details.map(el=>el.message).join(',')
//     throw new expressError(msg , 400);
//   }else{
//   next();
//   }
// }

// const validateReview = (req,res,next)=>{
//   const {error} = reviewSchema.validate(req.body);
//   if(error)
//   {
//   const msg = error.details.map(el=>el.message).join(',')
//     throw new expressError(msg , 400);
//   }
//   else
//   {
//   next();
//   }
// }
app.use('/' , usersRoutes);
app.use('/campgrounds' , campgroundsRoutes);
app.use('/campgrounds/:id/reviews' , reviewsRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all(/(.*)/ ,(req,res,next)=>{
  next(new expressError('Page not found',404));
  
})

app.use((err,req,res,next)=>{
  const {status = 500} = err;
  if(!err.message)err.message = "oh no! Something went wrong";
  res.status(status).render('error',{err});
})

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
