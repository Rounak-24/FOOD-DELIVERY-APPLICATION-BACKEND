const shop = require('../models/shop.model');
const user = require('../models/user.model');
const address = require('../models/address.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getUserAddress = async (_id)=>{
    try{
        return await user.aggregate([
            {
                $match: { _id:_id }
            },
            {
                $lookup: {
                    from: 'addresses',
                    localField: 'address',
                    foreignField: '_id',
                    as: "allAddresses"
                }
            },
            {
                $project: { allAddresses:1, _id:0 }
            }
        ])
    }catch(err){
        console.log(`Error while fetching userAddress`,err)
    }
}

const getShopAddress = async (_id)=>{
    try{
        return await shop.aggregate([
            {
                $match: { _id:_id }
            },
            {
                $lookup: {
                    from: 'addresses',
                    localField: 'address',
                    foreignField: '_id',
                    as: "allAddresses"
                }
            },
            {
                $project: { allAddresses:1, _id:0 }
            }
        ])
    }catch(err){
        console.log(`Error while fetching shopAddress`,err)
    }
}

const addAddress = asyncHandler(async (req,res)=>{
    if(!req.body) return res.status(400).json(
        new ApiError(400,`Address data is required`)
    )
    const newAddress = new address(req.body)
    const saveAddress = await newAddress.save()

    await req.user.address.push(saveAddress._id)
    await req.user.save()

    res.status(200).json(
        new ApiResponse(200,saveAddress)
    )
})

const updateAddress = asyncHandler(async (req,res)=>{
    const { _id } = req.params

    if(!_id) return res.status(400).json(
        new ApiError(400,`_id is required`)
    )

    const updatedAddress = await address.findByIdAndUpdate(_id,req.body,{new:true})
    res.status(200).json(
        new ApiResponse(200,updatedAddress,`Address updated successfully`)
    )
})

const getAddress = asyncHandler(async (req,res)=>{
    const {role} = req.params
    if(!role) return res.status(400).json(
        new ApiError(400,`role is required`)
    )

    let data;
    if(role==="user") data = await getUserAddress(req.user?._id)
    else if(role==="shop") data = await getShopAddress(req.user?._id)

    return res.status(200).json(
        new ApiResponse(200,data[0])
    )
})

const removeAddress = asyncHandler(async (req,res)=>{
    const { _id ,role } = req.params
    
    if(role==="user"){
        await user.updateOne({_id: req.user?._id},{
            $pull:{ address: _id }
        })
    }
    else if(role==="shop"){
        await shop.updateOne({_id: req.user?._id},{
            $pull:{ address: _id }
        })
    }
    await address.findByIdAndDelete(_id)

    res.status(200).json(
        new ApiResponse(200,null,`Address removed successfully`)
    )
})

module.exports = {
    addAddress,
    updateAddress,
    getAddress,
    removeAddress
}

