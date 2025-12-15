class ApiError extends Error{
    constructor(
        statusCode,
        messsage = `Error happened in ApiError`,
        errors = [],
        stack = ""
    ){
        super(messsage,)
        // this.statusCode = statusCode
        this.data = null
        this.success = false
        this.message = messsage
        this.errors = errors
    }
}

module.exports = ApiError