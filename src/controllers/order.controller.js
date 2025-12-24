const user = require('../models/user.model');
const shop = require('../models/shop.model');
const order = require('../models/order.model');
const item = require('../models/item.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const placeOrder = asyncHandler(async (req,res)=>{
    const {newOrderItemArr, totalPrice, orderAddress} = req.body
    if(!newOrderItemArr ||!totalPrice ||!orderAddress) return res.status(400).json(
        new ApiError(400,`OrderItems are required`)
    )

    const newOrder = new order({
        price:totalPrice,
        orderItems:newOrderItemArr,
        customer:req.user?._id,
        address:orderAddress
    }) 

    const saveOrder = await newOrder.save()
    res.status(200).json(
        new ApiResponse(200,saveOrder,`Order has been taken`)
    )
})

const getAllOrders = asyncHandler(async (req,res)=>{
    const allOrders = await order.find({
        customer:req.user?._id
    }).select('-customer -__v')

    return res.status(200).json(
        new ApiResponse(200,allOrders)
    )
})

const cancelOrder = asyncHandler(async (req,res)=>{
    const {orderId} = req.params;
    const findOrder = await order.findById(orderId)

    if(findOrder.status==="out for delivery") return res.status(400).json(
        new ApiError(400,`Unable to delete order`)
    )
    else await order.findByIdAndDelete(orderId)

    return res.status(200).json(new ApiResponse(200,null,`Order deleted successfully`))
})

module.exports = {
    placeOrder,
    getAllOrders,
    cancelOrder
}