const ApiError = require('../utils/ApiError')
const ApiResponse = require('../utils/ApiResponse')
const shop = require('../models/shop.model')
const review = require('../models/review.model')
const asyncHandler = require('../utils/asyncHandler')

const searchShopbyName = asyncHandler(async (req,res)=>{
    const shopNameForSearching = req.params.shopNameForSearching.toLowerCase().replaceAll("-"," ").trim()
    console.log(shopNameForSearching)

    const data = await shop.aggregate([
        {
            $match: { shopname:shopNameForSearching }
        },
        {
            $lookup: {
                from: 'items',
                localField: 'items',
                foreignField: "_id",
                as: 'allAvailableItems'
            }
        },
        {
            $project: {
                rating:1,
                allAvailableItems:1,
                shopname:1
            }
        },
        {
            $project: {
                'allAvailableItems.__v':0,
                'allAvailableItems.updatedAt':0,
                'allAvailableItems.createdAt':0,
                'allAvailableItems.sales':0,
            }
        }
    ])

    if(!data.length) return res.status(404).json(
        new ApiError(404,`${shopNameForSearching} not found`)
    )
    else res.status(200).json(
        new ApiResponse(200,data[0])
    )
})

const getAllShopReviews = asyncHandler(async (req,res)=>{
    const allReviews = await review.find({shop:req.user?._id},{
        user:0, shop:0
    })

    return res.status(200).json(new ApiResponse(200,allReviews))
})

module.exports = {
    searchShopbyName,
    getAllShopReviews
}
