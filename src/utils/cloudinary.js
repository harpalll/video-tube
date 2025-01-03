import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export const deleteFromCloudinary = async (cloudinaryFilepath) => {
  try {
    if (!cloudinaryFilepath) return null;
    const fileName = cloudinaryFilepath.split("/").pop().split(".")[0];
    const response = await cloudinary.uploader.destroy(fileName);
    return response;
  } catch (error) {
    console.log("Error while deleting file from cloudinary : ", error);
    return null;
  }
};
