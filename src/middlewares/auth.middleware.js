import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/Asynchandler.js";
import jwt from "jsonwebtoken"

// agr jese res nhi kam me aa rhi ho to kisi ki bhi jgh _ dal do
export const verifyJwt = AsyncHandler(async (req, __, next) => {
    try {

        //now hm yha pr token nikalanege qki "req " k pas cookie ka access h to us se
        const token = req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ", "")

      console.log("Extracted Token:", token); // 👈 Add this line
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        //now verify that is this right or wrong
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        // ydi tokem shi h to is se hm user ko dudh lete h
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "User is Invalid")
        }

        //  now hmne user ko ab req me add krenge qki req se hme logout me access krnanh ise 
        req.user = user   // ye sb logout me acces krne k liye hi kiya tha
        next() // terminate

    }

    catch (error) {
        // 500 liya qki ye db ki error h 
        throw new ApiError(500, error?.message || "Invalid access token")
    }

})