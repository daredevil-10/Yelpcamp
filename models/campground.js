const mongoose = require("mongoose");
const { campgroundSchema } = require("../schemacheck");
const Schema = mongoose.Schema;
const Review = require('./review');
const { ref } = require("joi");

const CampgroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  author:{
    type:Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ]
});

CampgroundSchema.post('findOneAndDelete' , async (doc)=>{
  if(doc)
  {
    await Review.deleteMany({
      _id:{$in: doc.reviews}
    })
  }
})

module.exports = mongoose.model("Campground", CampgroundSchema);
