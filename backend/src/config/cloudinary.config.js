const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify configuration
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn("⚠️  Cloudinary credentials not found in .env file");
} else {
  console.log("✅ Cloudinary configured successfully");
}

/**
 * Upload image/video to Cloudinary with optimizations
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} folder - Cloudinary folder name
 * @param {string} resourceType - 'image' or 'video'
 */
const uploadToCloudinary = async (
  fileBuffer,
  folder = "devblog",
  resourceType = "image"
) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: folder,
        resource_type: resourceType,
        // Automatic format optimization
        fetch_format: "auto",
        // Automatic quality optimization
        quality: "auto",
        // For images: generate responsive breakpoints (FIXED)
        ...(resourceType === "image" && {
          responsive_breakpoints: {
            create_derived: true, // ✅ ADDED THIS REQUIRED PROPERTY
            bytes_step: 20000,
            min_width: 200,
            max_width: 1000,
            max_images: 5,
          },
        }),
        // For videos: optimize encoding
        ...(resourceType === "video" && {
          eager: [
            { width: 300, height: 300, crop: "pad", audio_codec: "none" },
            {
              width: 160,
              height: 100,
              crop: "crop",
              gravity: "south",
              audio_codec: "none",
            },
          ],
          eager_async: true,
        }),
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary upload error:", error);
            reject(error);
          } else {
            console.log("✅ File uploaded to Cloudinary:", result.public_id);
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              resourceType: result.resource_type,
              width: result.width,
              height: result.height,
              bytes: result.bytes,
              createdAt: result.created_at,
            });
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error("💥 Upload to Cloudinary failed:", error);
    throw error;
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - 'image' or 'video'
 */
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log("🗑️  Deleted from Cloudinary:", publicId);
    return result;
  } catch (error) {
    console.error("💥 Delete from Cloudinary failed:", error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
};
