const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const expressError = require("../utils/expressError");
const Campground = require("../models/campground");
const { campgroundSchema } = require("../schemacheck");
const{isLoggedIn , validateCampground , isAuthor} = require('../middleware');


router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

router.get("/new",isLoggedIn,(req, res) => {
  res.render("campgrounds/new");
});

router.post(
  "/",isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    //if(!req.body.campground) throw new expressError('Invalid campground data', 400);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully made new campground");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    ).populate("author");
      if(!campground)
    {
      req.flash('error' , "Cannot find that Campground");
      return res.redirect('/campgrounds')
    }
     res.render("campgrounds/show", { campground });
  })
);

router.get(
  "/:id/edit",isLoggedIn,isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground) {
      req.flash('error', 'Cannot find that campground!');
      return res.redirect('/campground');
    }
  
  })
);

router.patch(
  "/:id",isLoggedIn,isAuthor,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
     const camp = await Campground.findByIdAndUpdate(id, {
       ...req.body.campground,
     });
    req.flash('success' , "Successfully Updated Campground")
    res.redirect(`/campgrounds/${id}`);
  })
);

router.delete(
  "/:id",isLoggedIn,isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
        req.flash('success' , "Successfully Deleted Campground")
    res.redirect("/campgrounds");
  })
);

module.exports = router;
