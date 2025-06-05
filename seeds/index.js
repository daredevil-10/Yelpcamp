const mongoose = require("mongoose");
const cities = require('./cities');
const Campground = require("../models/campground");
const {places,descriptors} = require ('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database Connected");
});

const sample = (array)=> array[Math.floor(Math.random() * array.length)];

const seedDB = async ()=>{
    await Campground.deleteMany({});
    for(let i = 0 ; i<50; i++)
    {
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author: '684137de65d67971ea29b3d7',
            location:`${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: `https://picsum.photos/400?random=${Math.random()}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam blanditiis at ipsa corporis eaque eos eligendi consectetur excepturi libero earum illo accusamus fugit, asperiores nam exercitationem magni dolor amet cum!',
            price 

        });
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
    console.log("connection closed");
});