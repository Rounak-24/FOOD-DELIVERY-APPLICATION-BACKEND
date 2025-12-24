const review = require('../models/review.model');
const shop = require('../models/shop.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const {uploadOnCloudinary} = require('../utils/cloudinary');

const postReview = asyncHandler(async (req,res)=>{
    const {content, rating, shopId} = req.body;
    if(!rating || !shopId) return res.status(400).json(
        new ApiError(400,`rating or shopId is missing`)
    )
    
    const urlArr = []
    if(req.files){
        for(const imgObj of req.files){
            const upload = await uploadOnCloudinary(imgObj.path)
            const currUrl = upload.url
            urlArr.push(currUrl)
        }
    }

    const newReview = new review({
        content:content,
        rating:rating,
        shop:shopId,
        user:req.user?._id,
        images:urlArr
    })

    const saveReview = await newReview.save()
    await shop.findByIdAndUpdate(shopId,{
        $inc:{rating:rating}
    })

    return res.status(200).json(
        new ApiResponse(200,saveReview,`Review posted succcessfully`)
    )
})

const getReviews = asyncHandler(async (req,res)=>{
    const allReviews = await review.find({user:req.user?._id});
    return res.status(200).json(new ApiResponse(200,allReviews))
})

const editReview = asyncHandler(async (req,res)=>{
    const {reviewId, newData} = req.body
    const editedReview = await review.findByIdAndUpdate(reviewId,newData,{
        new:true
    })

    return res.status(200).json(
        new ApiResponse(200,editedReview,`review updated successfully`)
    )
})

const deleteReview = asyncHandler(async (req,res)=>{
    const {reviewId} = req.params
    if(!reviewId) return res.status(400).json(new ApiError(400,`id is required`))
    
    await review.findByIdAndDelete(reviewId)
    return res.status(200).json(new ApiResponse(200,null,`deleted successfully`))
})

module.exports = {
    postReview,
    getReviews,
    editReview,
    deleteReview
}