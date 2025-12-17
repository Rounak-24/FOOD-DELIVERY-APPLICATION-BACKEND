const shop = require('../models/shop.model');
const item = require('../models/item.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const findItembyName = async (_id,itemname)=>{
    try{
        return await shop.aggregate([
            {
                $match: { _id:_id }
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
    }catch(err){
        console.log(err);
        return;
    }
}

const getItem = asyncHandler(async (req,res)=>{
    const {itemname} = req.body;
    if(!itemname) return res.status(400).json(new ApiError(400,'item name is required'));

    const itemData = await findItembyName(req.user?._id,itemname)

    if(!itemData.length) return res.status(404).json(
        new ApiError(404,`${itemname} not found`)
    )
    else res.status(200).json(
        new ApiResponse(200,itemData,`${itemname} fetched sucessfully`)
    )
})

const addItem = asyncHandler(async (req,res)=>{
    const {itemname, price, available, description} = req.body;
    const findItem = await findItembyName(req.user?._id, itemname);
    
    if(findItem.length) return res.status(400).json(
        new ApiError(400,`${itemname} already added to your shop`)
    )

    const currShop = req.user
    const newItem = new item({
        itemname: itemname.toLowerCase().trim(),
        price: price,
        available,
        description
    })
    const saveItem = await newItem.save();

    await shop.updateOne({_id:req.user?._id},{
        $push: {items:saveItem._id}
    })
    await currShop.save()
    res.status(200).json(new ApiResponse(200,saveItem,'Item Added')) 
})

const getAllItems = asyncHandler(async (req,res)=>{
    if(!req.user?.items.length) return res.status(200).json(
        new ApiResponse(200,"",`No items added yet`)
    )

    const allItems = await shop.aggregate([
        { $match:{ _id:req.user?._id } },
        {
            $lookup: {
                from: 'items',
                localField: 'items',
                foreignField: '_id',
                as: 'res'
            }
        },
        {
            $project: { res:1, _id:0 }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200,allItems,`All items fetched successfully`)
    )
})

const editItem = asyncHandler(async (req,res)=>{
    const { _id } = req.body
    const Item = await item.findByIdAndUpdate(_id,req.body,{new: true})

    if(!Item) res.status(400).json(
        new ApiError(404,`Item not found`)
    )
    else return res.status(200).json( new ApiResponse(200,Item))
})

const removeItem = asyncHandler(async (req,res)=>{
    const { _id } = req.params
    
    await shop.updateOne({_id: req.user?._id},{
        $pull:{ items : _id }
    })
    await item.findByIdAndDelete(_id)

    res.status(200).json(
        new ApiResponse(200,null,`Item deleted successfully`)
    )
})

const searchItembyName = asyncHandler(async (req,res)=>{
    const itemNameForSearch = req.params.itemNameForSearch.toLowerCase().replaceAll("-"," ").trim()

    const data = await shop.aggregate([
        {
            $lookup: {
                from: 'items',
                localField: 'items',
                foreignField: '_id',
                as: 'res',
            }
        },
        {
            $project: {
                shopname:1,
                _id:0,
                rating:1,
                res:1,
            }
        },
        {
            $unwind: { path: '$res' }
        },
        {
            $match: { 'res.itemname':itemNameForSearch }
        },
        {
            $project: {
                'res.sales':0,
                'res.__v':0,
                'res.createdAt':0,
                'res.updatedAt':0,
            }
        }
    ])

    if(!data.length) return res.status(404).json(
        new ApiError(404,`Item not available`)
    )
    else return res.status(200).json(
        new ApiResponse(200,data)
    )
})

module.exports = {
    addItem,
    getItem,
    getAllItems,
    editItem,
    removeItem,
    searchItembyName
}