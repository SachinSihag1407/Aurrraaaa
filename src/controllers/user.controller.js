import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/Asynchandler.js"

const registerUser = AsyncHandler (async(req,res)=>{
    // res.status(200).json(new ApiResponse(200,"Sachu Don"))
    // another way 
    res.status(200).json({
        message : "Sachu Don"
    })
}) 
     // isme hmne message pass kiya  h 
export default registerUser;
