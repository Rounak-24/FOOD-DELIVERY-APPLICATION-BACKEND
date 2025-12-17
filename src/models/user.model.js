const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
require('dotenv').config()

const userSchema = new mongoose.Schema({
    phone:{type:String, required: true, unique: true},
    password:{type:String, required:true},
    email:{type:String},
    username:{type:String},

    address:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"address"
    }],

    cart:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"item"
    }],
    
    refreshToken:{type:String}

},{timestamps:true});

userSchema.plugin(aggregatePaginate)

userSchema.pre('save', async function (){
    if(!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);
    // next(); In version 9.0.1 unable to fetch next() as a function 
})

userSchema.methods.comparePassword = function (pass){
    return bcrypt.compare(pass,this.password)
}

userSchema.methods.generateAccessToken = function (){
    const accessToken = jwt.sign({
        _id:this._id,
        username:this.username,
        role:"user"

    },process.env.JWT_ACCESS_SECRET_KEY,{
        expiresIn:process.env.JWT_ACCESS_EXPIRY
    })

    return accessToken;
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
            email:this.email,
            role:"user",
        },
        process.env.JWT_REFRESH_SECRET_KEY,
        {
            expiresIn:process.env.JWT_REFRESH_EXPIRY
        }
    )
}

const user = mongoose.model("user", userSchema);
module.exports = user;