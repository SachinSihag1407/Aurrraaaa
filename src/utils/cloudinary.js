import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        fs.unlinkSync(localFilePath); // remove local file after upload
        return response;
    } catch (error) {
        console.log("❌ Cloudinary upload error:", error);  // 🔍 Added for debugging
        fs.unlinkSync(localFilePath); // clean up temp file even on error
        return null;
    }
};

export { uploadOnCloudinary };
