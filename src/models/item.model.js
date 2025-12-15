const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    itemname:{type:String, required: true, unique:true},
    description:{type:String},

    price:{type:Number, required:[true,"price is required"]},
    available:{type:Number, default:1},
    sales:{type:Number, default:0},

    courseType:{type:String}

},{timestamps:true});

const item = mongoose.model("item", itemSchema);
module.exports = item;