const shop = require('../models/shop.model');
const jwt = require('jsonwebtoken');
const asynsHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const ApiResponse = require('../utils/ApiResponse')
require('dotenv').config();

const cookieOptions = {
    httpOnly: true,
    secure: true,
}

const registerShop = async (req,res)=>{
    try{
        const {shopname, phone, password} = req.body;

        if(!shopname && !phone) return res.status(400).json({error: 'username or phone is required'})
        if(!password) return res.status(400).json({error: 'password is required'})

        if(await shop.findOne({
            $or:[{shopname}, {phone}]
        })){
            return res.status(400).json({error: 'user already exists'})
        } 
        
        const newuser = new shop({
            shopname:shopname || "",
            password:password,
            phone:phone || ""
        })

        const saveuser = await newuser.save();
        const createdUser = await shop.findById(saveuser._id).select(
            '-password -refreshToken -cart -address'
        );

        if(!createdUser) res.status(500).json({error: 'something went wrong while creating user'})

        const accessToken = createdUser.generateAccessToken();
        const refreshToken = createdUser.generateRefreshToken();

        createdUser.refreshToken = refreshToken;
        await createdUser.save();

        return res.status(200)
        .cookie("accessToken",accessToken,cookieOptions)
        .cookie("refreshToken",refreshToken,cookieOptions)
        .json({createdUser})

    }catch(err){
        console.log(err)
        res.status(500).json({error: 'Internal Server error'})
    }
}

const loginShop = async (req,res)=>{
    try{
        const {shopname, phone, password} = req.body;

        if(!shopname && !phone) return res.status(400).json({error: 'shopname or phone is required'});
        if(!password) return res.status(400).json({error: 'password is required'});

        const findUser = await shop.findOne({
            $or:[{shopname}, {phone}]
        })

        if(!findUser) return res.status(404).json({error: 'shop does not exists'});
        
        const isMatch = await findUser.comparePassword(password);
        if(!isMatch) return res.status(400).json({error: 'Incorrect Password'});

        const accessToken = findUser.generateAccessToken();
        const refreshToken = findUser.generateRefreshToken();

        findUser.refreshToken = refreshToken;
        await findUser.save({
            validateBeforeSave:false
        });

        findUser.password = undefined;

        return res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json({ findUser, accessToken, refreshToken});

    }catch(err){
        res.status(500).json({error: 'Internal Server error'})
    }
}

const logoutShop = async (req,res)=>{
    try{
        await shop.findByIdAndUpdate(req.user?._id,{
            $unset:{
                refreshToken:1
            },
        },{new:true})

        return res.status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json({message:'User logged out'})

    }catch(err){
        res.status(500).json({error: 'Internal Server error'})
    }
}

const refreshAccessToken = async (req,res)=>{
    try{
        const auth = req.headers.authorization || req.cookie?.accessToken;
        if(!auth) return res.status(401).json({error:'Unauthorized'});

        const refreshTokenFromUser = auth.split(' ')[1];
        const decoded = jwt.verify(refreshTokenFromUser, process.env.JWT_REFRESH_SECRET_KEY);
        
        const User = await shop.findById(decoded._id).select('-password');
        if(!User) return res.status(401).json({err:'Invalid token'});
        
        const newAccessToken = User.generateAccessToken();
        const newRefreshToken = User.generateRefreshToken();

        User.refreshToken = newRefreshToken;
        await User.save();

        res.status(200)
        .cookie('accessToken',newAccessToken,cookieOptions)
        .cookie('refreshToken',newRefreshToken,cookieOptions)
        .json({message:'Access token refreshed', newAccessToken, newRefreshToken})

    }catch(err){
        res.status(401).json({err:'error'})
    }
}

const changePassword = async(req,res)=>{
    try{
        const {oldPassword, newPassword, confirmPassword} = req.body;

        if(!oldPassword || !newPassword || !confirmPassword) return res.status(400).json({error:'all fields are required'});

        const findUser = await shop.findById(req.user?._id);
        if(!findUser) res.status(404).json({error:'user not found'});

        if(!await findUser.comparePassword(oldPassword)){
            return res.status(400).json({error:'Incorrect current password'});
        }

        if(newPassword!==confirmPassword) return res.status(400).json({error:'confirm password accurately'});

        findUser.password = newPassword;
        await findUser.save();

        res.status(200).json({message: 'password changed successfully'});

    }catch(err){
        res.status(500).json({err:'Internal Server error'});
    }
}

const getProfile = async (req,res)=>{
    try{
        const findUser = await shop.findById(req.user._id).select(
            '-password -refreshToken -images -albums -favImages'
        );

        return res.status(200)
        .json({findUser})

    }catch(err){
        res.status(500).json({error: 'Error while fetching user info'})
    }
}

const updateProfile = async(req,res)=>{
    try{
        const newData = req.body;

        const response = await shop.findByIdAndUpdate(req.user?._id,newData,{
            new:true,
        }).select('-password -refreshToken');

        res.status(200).json({response, message:'user profile updated successfully'});

    }catch(err){
        res.status(500).json({err:'Internal Server error'});
    }
}

module.exports = {
    registerShop,
    loginShop,
    logoutShop,
    refreshAccessToken,
    getProfile,
    changePassword,
    updateProfile,
}