import { v2 as cloudinary } from "cloudinary";
import fs from "fs";



const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Check if file exists before uploading
    if (!fs.existsSync(localFilePath)) {
      console.log("File does not exist:", localFilePath);
      return null;
    }

    console.log("Attempting to upload file:", localFilePath);

    // Upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // File has been uploaded successfully
    console.log("File is uploaded on cloudinary:", response.url);

    // Clean up the local file after successful upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    // Remove the local file if it exists
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

export { uploadOnCloudinary };
