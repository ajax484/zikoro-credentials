import { v2 as cloudinary } from "cloudinary";

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string,
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string,
  apiSecrete: process.env.CLOUDINARY_API_SECRET as string,
  secureUrl: process.env.CLOUDINARY_URL as string, // Optional: full Cloudinary URL if needed
  uploadPreset: "w5xbik6z",
  folder: "ZIKORO",
};

cloudinary.config({
  cloud_name: cloudinaryConfig.cloudName,
  api_key: cloudinaryConfig.apiKey,
  api_secret: cloudinaryConfig.apiSecrete,
  secure: true,
});

export default cloudinary;
