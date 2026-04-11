import multer from "multer";
import { AppError } from "../Error/AppError.js";

/**
 * Basic multer configuration for image uploads
 */
const multerOptions = () => {
  // Use memory storage to avoid saving files locally before uploading to Cloudinary
  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new AppError("Only images are allowed", 400), false);
    }
  };

  return multer({ storage, fileFilter });
};

export const uploadSingleImage = (fieldName) => multerOptions().single(fieldName);
