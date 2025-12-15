const asyncHandler = (fn)=> async (req,res,next)=>{
    try{
        await fn(req,res,next)
    }catch(err){
        console.log(err)
        res
        .status(err.code || 500)
        .json({
            success:false,
            error:err.message || `Internal server error :(`
        })
    }
}

module.exports = asyncHandler