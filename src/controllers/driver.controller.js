const driver = require('../models/driver.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const cookieOptions = {
    httpOnly: true,
    secure: true,
}

const registerUser = async (req,res)=>{
    try{
        const {username, phone, password} = req.body;

        if(!username && !phone) return res.status(400).json({error: 'username or phone is required'})
        if(!password) return res.status(400).json({error: 'password is required'})

        if(await driver.findOne({
            $or:[{username}, {phone}]
        })){
            return res.status(400).json({error: 'user already exists'})
        } 
        
        const newuser = new driver({
            username:username || "",
            password:password,
            phone:phone || ""
        })

        const saveuser = await newuser.save();
        const createdUser = await driver.findById(saveuser._id).select(
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
        res.status(500).json({error: 'Internal Server error'})
    }
}

const loginUser = async (req,res)=>{
    try{
        const {username, phone, password} = req.body;

        if(!username && !phone) return res.status(400).json({error: 'username or email is required'});
        if(!password) return res.status(400).json({error: 'password is required'});

        const findUser = await driver.findOne({
            $or:[{username}, {phone}]
        })

        if(!findUser) return res.status(404).json({error: 'user does not exists'});
        
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
        .json({ findUser, accessToken});

    }catch(err){
        res.status(500).json({error: 'Internal Server error'})
    }
}

const logoutUser = asyncHandler(async (req,res)=>{
    await driver.findByIdAndUpdate(req.user?._id,{
        $unset:{
            refreshToken:1
        },
        $set:{
            isAvailable: false
        }
    })

    return res.status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json({message:'User logged out'})
})

const refreshAccessToken = async (req,res)=>{
    try{
        const auth = req.headers.authorization || req.cookie?.accessToken;
        if(!auth) return res.status(401).json({error:'Unauthorized'});

        const refreshTokenFromUser = auth.split(' ')[1];
        const decoded = jwt.verify(refreshTokenFromUser, process.env.JWT_REFRESH_SECRET_KEY);
        
        const User = await driver.findById(decoded._id).select('-password');
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

        const findUser = await driver.findById(req.user?._id);
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

const getProfile = asyncHandler(async (req,res)=>{
    const findUser = await driver.findById(req.user._id).select(
        '-password -refreshToken -images -albums -favImages'
    );

    return res.status(200).json(
        new ApiResponse(200,findUser)
    )
})

const updateProfile = asyncHandler(async (req,res)=>{
    const newData = req.body;

    const response = await driver.findByIdAndUpdate(req.user?._id,newData,{
        new:true,
    }).select('-password -refreshToken');

    res.status(200).json({response, message:'user profile updated successfully'});
})

const goOnline = asyncHandler(async (req,res)=>{
    await driver.findByIdAndUpdate(req.user?._id,{
        isAvailable:true
    })

    res.status(200).json(
        new ApiResponse(200,null,`You are online now`)
    )
})

const goOffile = asyncHandler(async (req,res)=>{
    await driver.findByIdAndUpdate(req.user?._id,{
        isAvailable:false
    })

    res.status(200).json(
        new ApiResponse(200,null,`You are online now`)
    )
})


module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getProfile,
    changePassword,
    updateProfile,
    goOnline,
    goOffile
}