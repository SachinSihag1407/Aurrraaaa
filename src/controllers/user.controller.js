import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/Asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const registerUser = AsyncHandler(async (req, res) => {
    // // res.status(200).json(new ApiResponse(200,"Sachu Don"))
    // // another way 
    // res.status(200).json({
    //     message : "Sachu Don"
    // })

    // get the user detail from the frontend 
    //validaton
    //check if the user is alredy exists or not
    //check for avatar and cover Image
    // upload on cloudinary
    // now create a user object and make entry in db
    // remove the password and refresh token
    // check response
    // return response

    const { fullName, email, username, password } = req.body;
    // ab hme yha ek ek krke sb liye validation check krni pdegi is se bdiya eksath kr lete h 

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
        // iska mtlb h ki agr mil gya to trim kr do and fir bhi empty h to true return 
    ) {
        throw new ApiError(400, "all fields are required to fill")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "The User is already existed ")
    }

    const avatarLoacalPath = req.files?.avatar[0]?.path;
    console.log("Avatar path is :", avatarLoacalPath);
    const coverImageLoacalPath = req.files?.coverImage[0]?.path;

    if (!avatarLoacalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLoacalPath)

    // that avatart is upload  or not 
    console.log("📦 Avatar Upload Result:", avatar);
    const coverImage = await uploadOnCloudinary(coverImageLoacalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar fileis required")
    }

    const user = await User.create({
      username: username.toLowerCase(),
        fullName,
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )




})
// isme hmne message pass kiya  h 
export default registerUser;
