import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/Asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
// hm ac and ref token k liye alg se method bna lenge 

const accesstokenRefreshtokenGenerator = async (userId) => {

    try {
        // phle user id to le le ki kis k liye generate krna h
        const user = await User.findById(userId)  // db se liya to User kam me aaya
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()


        // yha hme save bhi krna h and object me dala h 
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        // now return the token 
        return { accessToken, refreshToken }
    }
    catch (error) {
        throw new ApiError(500, "Something went wrong while generating the access and refresh token")
    }
}


// yha isme user ko register kravaya h 
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

// yha agr register h to login kr do 
const loginUser = AsyncHandler(async (req, res) => {
    // get data -> body
    // check by email  or usename for presence
    // password check
    //generate accesstoken and refreshtoken
    //send cookie iclude these tokens

    const { username, email, password } = req.body

    // check for present or not
    if (!username && !email) {
        throw new ApiError(400, "username and the email is invalid")
    }

    //now get user from the db so use User bcoz it is db object
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "Enter correct username and email")
    }


    // check password yha user liya qki ye hamra object h 
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid User Crendential")
    }
    // now time for the acces token and refresh token 

    const { accessToken, refreshToken } = await accesstokenRefreshtokenGenerator(user._id)

    // yha dobara isliye kiya qki 1st vale up user me sb fields h to muje ye fileds hatani h
    const loggedUser = await User.findById(user._id).select("-password -refreshToken")

    // for cokiees 
    const options = {
        httpOnly: true,
        secure: true,
    }
    console.log("Token Type:", typeof accessToken);
    console.log("access token --->", accessToken);

    // yha pr response return krna h 

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedUser, accessToken, refreshToken },
                "User loged in Successfully"
            )
        )
})

const logoutUser = AsyncHandler(async (req, res) => {
    // now we have access the user from req by auth middleware
    await User.findByIdAndUpdate(
        req.user._id,    //ye auth middleware se aayega 
        {
            $set: { refreshToken: undefined }
        },
        {
            new: true // mtlb hm new set kr skte h iski value
        }
    )

    // jb bhi cookie hatao ya likho to options jrur likhna h 
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User loggedOut"))

})

// ab hme refresh token ko vapis se generate krne krne k liye banayege

const newrefreshTokenGnerator = AsyncHandler(async (req, res) => {

    // now sbse phle old vala lana pdega 
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

    // now ab hme decode krna pdega qki ye encryptrd aayaa h to verify kro 

    const decodedToken = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)

    // ab ye decode ho gya h to isme se id se user nikal lete h 

    const user =  await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(400,"refreshToken is Invalid")
    }

// ab hm is incoming and jo hmne generator refreshtoken se banya tha vo check krte h 

if(incomingRefreshToken!==user.refreshToken){
    throw new ApiError(401,"refreshToken is expired or used")
}


//generat tokens

const {accessToken,newRefreshToken} = accesstokenRefreshtokenGenerator(user?._id)


// ye sb ho gya h to add kr do  ttoken ko kro 

const options = {
    httpOnly : true,
    secure : true
}

req.status(200)
.cookie("accessToken",accessToken,options)
.cookie("newRefreshToken",newRefreshToken,options)
.json(
    new ApiResponse(
        200,
        {accessToken, refreshToken:newRefreshToken},
        "RefreshToken Generated"
    )
)





})
export {
    registerUser,
    loginUser,
    logoutUser,
    newrefreshTokenGnerator
}
