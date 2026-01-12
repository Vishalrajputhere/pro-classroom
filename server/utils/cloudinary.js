const cloudinary = require("cloudinary").v2;

/**
 * Cloudinary configuration
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload buffer (PDF / TXT) to Cloudinary
 * IMPORTANT: resource_type = "auto" (NOT raw)
 */
const uploadBufferToCloudinary = (
  buffer,
  folder = "uploads",
  originalName = "file"
) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto", // ✅ AUTO-DETECT (FIX)
        folder,
        use_filename: true, // keep original name
        unique_filename: false,
        filename_override: originalName,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

module.exports = {
  cloudinary,
  uploadBufferToCloudinary,
};
