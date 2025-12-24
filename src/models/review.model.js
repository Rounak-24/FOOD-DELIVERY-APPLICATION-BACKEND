const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    content:{type:String},
    images:[ {type:String} ],
    rating:{type:Number, required:[true,`At least rating is required for review posting`]},

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },

    shop:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"shop"
    }

},{timestamps:true});

const review = mongoose.model("review", reviewSchema);
module.exports = review;