const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')

const orderItemSchema = new mongoose.Schema({
    quantity:{type:Number, default:1},

    item:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"item"
    }
})

const orderSchema = new mongoose.Schema({
    price:{type:Number},

    orderItems:{
        type:[orderItemSchema]
    },

    status:{
        type:String,
        enum:["pending","cancelled","preparing","out for delivery","delivered"],
        default:"pending"
    },
    
    payment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"payment"
    },

    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },

    driver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"driver"
    },

    address:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"address"
    },

},{timestamps:true});

orderSchema.plugin(aggregatePaginate)

const order = mongoose.model("order", orderSchema);
module.exports = order;