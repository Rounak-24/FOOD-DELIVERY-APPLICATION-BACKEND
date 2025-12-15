const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')
require('dotenv').config()

const shopSchema = new mongoose.Schema({
    shopname:{type:String, required: true, unique:true},
    phone:{type:String},
    password:{type:String, required:true},
    email:{type:String},

    address:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"address"
    },

    items:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"item"
    }],
    
    rating:{type:Number, default:0},
    refreshToken:{type:String}

},{timestamps:true});

shopSchema.plugin(aggregatePaginate)

shopSchema.pre('save',async function (){
    if(!this.isModified('password')) return;

    const hasehedPass = await bcrypt.hash(this.password, 10)
    this.password = hasehedPass

    // try{
    //     if(!this.isModified('password')) return;
    //     const hasehedPass = await bcrypt.hash(this.password, 10)
    //     this.password = hasehedPass

    //     // next()
    // }catch(err){
    //     console.log(err)
    //     // next(err)
    // }  
})

shopSchema.methods.comparePassword = function (pass){
    return bcrypt.compare(pass,this.password)
}

shopSchema.methods.generateAccessToken = function (){
    const accessToken = jwt.sign({
        _id:this._id,
        shopname:this.shopname,
        role:"shop"

    },process.env.JWT_ACCESS_SECRET_KEY,{
        expiresIn:process.env.JWT_ACCESS_EXPIRY
    })

    return accessToken
}

shopSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            shopname:this.shopname
        },
        process.env.JWT_REFRESH_SECRET_KEY,
        {
            expiresIn:process.env.JWT_REFRESH_EXPIRY
        }
    )
}

const shop = mongoose.model("shop", shopSchema);
module.exports = shop;