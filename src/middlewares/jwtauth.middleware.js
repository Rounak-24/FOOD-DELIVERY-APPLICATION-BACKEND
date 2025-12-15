const jwt = require('jsonwebtoken')
const user = require('../models/user.model')
const shop = require('../models/shop.model')
const driver = require('../models/driver.model')

const jwtAuthMiddleware = async (req,res,next)=>{
    try{
        const auth = req.headers.authorization || req.cookie?.refreshToken;
        if(!auth) return res.status(401).json({error:'Unauthorized'});

        const token = auth.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
        let User;

        if(decoded.role==="user") User = await user.findById(decoded._id).select('-password -refreshToken')
        else if(decoded.role==="shop") User = await shop.findById(decoded._id).select('-password -refreshToken')
        else if(decoded.role==="driver") User = await driver.findById(decoded._id).select('-password -refreshToken')

        if(!User) return res.status(401).json({err:'Invalid token'});
        else req.user = User;

        next();

    }catch(err){
        res.status(401).json({err:'Invalid token'})
    }
}

module.exports = jwtAuthMiddleware