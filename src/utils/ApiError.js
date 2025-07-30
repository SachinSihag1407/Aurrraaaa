class ApiError extends Error {  // error a class h node js ki use extend kr rhe h 
    constructor(
        statusCode,
        message = "Something Went Wrong",
        errors = [],
        stack = ""
    ) {
        super(message)
        this.statusCode = statusCode,
        this.message = message,
        this.data = null,
        this.errors = errors,
        this.success  = false
        this.stack = stack

    }
}

export { ApiError }