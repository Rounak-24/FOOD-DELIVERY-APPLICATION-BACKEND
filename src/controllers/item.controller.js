const shop = require('../models/shop.model');
const item = require('../models/item.model');
const ApiError = require('../utils/ApiError')
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
require('dotenv').config();

// const addItem = asynsHandler((req,res)=>{





//     const newItem = new item(req.body)
// })

const getItem = asyncHandler(async (req,res)=>{
    const {itemname} = req.body;
    if(!itemname) return res.status(400).json(new ApiError(400,'item name is required'));

    const itemData = await shop.aggregate([
        {
            $match: { _id:req.user._id }
        },
        {
            $lookup: {
                from: "items",
                localField: "items",
                foreignField: "_id",
                as: "result"
            },
        },
        {
            $project: {'result':1}
        },
        {
            $unwind: { path: '$result'}
        },
        {
            $match: {'result.itemname':itemname}
        }
    ])

    if(!itemData.length) return res.status(404).json(
        new ApiError(404,`${itemname} not found`)
    )
    else res.status(200).json(
        new ApiResponse(200,itemData,`${itemname} fetched sucessfully`)
    )
})

const addItem = asyncHandler(async (req,res)=>{
    const newItem = new item(req.body)
    const saveItem = await newItem.save();
    const currShop = req.user
    console.log(req.user);

    await shop.updateOne({_id:currShop._id},{
        $push: {items:saveItem._id}
    })
    await currShop.save()

    res.status(200).json(new ApiResponse(200,saveItem,'Item Added')) 
})



module.exports = {
    addItem,
    getItem
}