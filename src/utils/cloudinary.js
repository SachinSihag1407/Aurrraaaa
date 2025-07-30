import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
}
)

const uploadOnCloudinary = async => (localFilePath){ // yha pr time lega to async bna diya
    try {
        if (!localFilePath) return null;
        //upload the file on cloudinary
        const response = await v2.uploder.upload(localFilePath,
            {
                resoure_type: "auto"
            })
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)  // agr file upload ho gyi h to use unlink kr do taki server pr load km ho
        return response;
    }

    catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
}

export {uploadOnCloudinary}