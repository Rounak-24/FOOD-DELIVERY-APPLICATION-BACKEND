const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const driverSchema = new mongoose.Schema({
    phone:{type:String, required: true, unique: true},
    password:{type:String, required:true},
    email:{type:String},
    username:{type:String},
    isAvailable:{type:Boolean, default:false},

    savings:{type:Number},
    
    refreshToken:{type:String}

},{timestamps:true});

driverSchema.pre('save', async function (){
    if(!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);
})

driverSchema.methods.comparePassword = function (pass){
    return bcrypt.compare(pass,this.password)
}

driverSchema.methods.generateAccessToken = function (){
    const accessToken = jwt.sign({
        _id:this._id,
        username:this.username,
        role:"driver"

    },process.env.JWT_ACCESS_SECRET_KEY,{
        expiresIn:process.env.JWT_ACCESS_EXPIRY
    })

    return accessToken;
}

driverSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
            email:this.email,
            role:"driver",
        },
        process.env.JWT_REFRESH_SECRET_KEY,
        {
            expiresIn:process.env.JWT_REFRESH_EXPIRY
        }
    )
}

const driver = mongoose.model("driver", driverSchema);
module.exports = driver;