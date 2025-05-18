const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsmate = require("ejs-mate");
const catchAsync = require('./utils/catchAsync');
const expressError = require('./utils/expressError');
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const campground = require("./models/campground");
const joi = require('joi');


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

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds", catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
}));

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.post("/campgrounds", catchAsync(async (req, res,next) => {
  //if(!req.body.campground) throw new expressError('Invalid campground data', 400);  
  const campgroundSchema = joi.object({
  campground: joi.object({
    title: joi.string() .required(),
    price: joi.number().min(0, "Price must be non-negative").required(),
    image: joi.string().required,
    location: joi.string().required(),
    description: joi.string().required()
  }).required()
});
const {error} =  campgroundSchema.validate(req.body);
 
  if(error)
  {
    const msg = error.details.map(el=>el.message).join(',')
    throw new expressError(msg , 400);
  }
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}));

app.get("/campgrounds/:id", catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/show", { campground });
}));

app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/edit", { campground });
}));

app.patch("/campgrounds/:id", catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
}));

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
