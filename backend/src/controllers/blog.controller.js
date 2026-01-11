const { db } = require("../config/firebase.config");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../config/cloudinary.config");

// Create a new blog post with media
const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.userId;
    let mediaUrl = null;
    let mediaData = null;

    console.log("📝 Creating blog for user:", userId);

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Please provide title and content.",
      });
    }

    // Handle file upload if provided
    if (req.files && req.files.media) {
      const file = req.files.media;
      console.log("📎 File uploaded:", file.name, file.mimetype);

      // Determine resource type
      const resourceType = file.mimetype.startsWith("video/")
        ? "video"
        : "image";

      // Upload to Cloudinary
      try {
        mediaData = await uploadToCloudinary(
          file.data,
          "devblog/posts",
          resourceType
        );
        mediaUrl = mediaData.url;
        console.log("✅ Media uploaded:", mediaUrl);
      } catch (uploadError) {
        console.error("❌ Media upload failed:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload media",
          error: uploadError.message,
        });
      }
    }

    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const userData = userDoc.data();

    const newBlog = {
      title,
      content,
      authorId: userId,
      authorName: userData.name,
      authorEmail: userData.email,
      media: mediaData
        ? {
            url: mediaData.url,
            publicId: mediaData.publicId,
            format: mediaData.format,
            resourceType: mediaData.resourceType,
            width: mediaData.width,
            height: mediaData.height,
          }
        : null,
      views: 0,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const blogDoc = await db.collection("blogs").add(newBlog);

    console.log("✅ Blog created:", blogDoc.id);

    res.status(201).json({
      success: true,
      message: "Blog created successfully!",
      blog: {
        id: blogDoc.id,
        ...newBlog,
      },
    });
  } catch (error) {
    console.error("💥 Error creating blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create blog.",
      error: error.message,
    });
  }
};

// Get all blogs with real stats
const getAllBlogs = async (req, res) => {
  try {
    console.log("📚 Getting all blogs");

    const blogsSnapshot = await db
      .collection("blogs")
      .orderBy("createdAt", "desc")
      .get();

    const blogs = [];
    blogsSnapshot.forEach((doc) => {
      blogs.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log("✅ Found", blogs.length, "blogs");

    res.status(200).json({
      success: true,
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    console.error("💥 Error getting all blogs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get blogs.",
      error: error.message,
    });
  }
};

// Get single blog by ID and increment view count
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("📖 Getting blog:", id);

    const blogRef = db.collection("blogs").doc(id);
    const blogDoc = await blogRef.get();

    if (!blogDoc.exists) {
      console.log("❌ Blog not found:", id);
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    // Increment view count
    const currentData = blogDoc.data();
    const newViews = (currentData.views || 0) + 1;

    await blogRef.update({
      views: newViews,
    });

    console.log("✅ Blog found and view count updated:", id);

    res.status(200).json({
      success: true,
      blog: {
        id: blogDoc.id,
        ...currentData,
        views: newViews,
      },
    });
  } catch (error) {
    console.error("💥 Error getting blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get blog.",
      error: error.message,
    });
  }
};

// Update blog with optional new media
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, removeMedia } = req.body;
    const userId = req.userId;
    let newMediaData = null;

    console.log("✏️ Updating blog:", id, "by user:", userId);

    const blogDoc = await db.collection("blogs").doc(id).get();

    if (!blogDoc.exists) {
      console.log("❌ Blog not found:", id);
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    const blogData = blogDoc.data();

    if (blogData.authorId !== userId) {
      console.log("❌ Unauthorized update attempt");
      return res.status(403).json({
        success: false,
        message: "You can only update your own blogs.",
      });
    }

    // Handle remove media request
    if (removeMedia === "true" && blogData.media) {
      try {
        await deleteFromCloudinary(
          blogData.media.publicId,
          blogData.media.resourceType
        );
        console.log("🗑️  Old media removed");
      } catch (error) {
        console.error("⚠️  Failed to delete old media:", error);
      }
    }

    // Handle new media upload
    if (req.files && req.files.media) {
      const file = req.files.media;
      const resourceType = file.mimetype.startsWith("video/")
        ? "video"
        : "image";

      // Delete old media if exists
      if (blogData.media && removeMedia !== "true") {
        try {
          await deleteFromCloudinary(
            blogData.media.publicId,
            blogData.media.resourceType
          );
        } catch (error) {
          console.error("⚠️  Failed to delete old media:", error);
        }
      }

      // Upload new media
      newMediaData = await uploadToCloudinary(
        file.data,
        "devblog/posts",
        resourceType
      );
      console.log("✅ New media uploaded:", newMediaData.url);
    }

    const updatedData = {
      ...(title && { title }),
      ...(content && { content }),
      ...(newMediaData && {
        media: {
          url: newMediaData.url,
          publicId: newMediaData.publicId,
          format: newMediaData.format,
          resourceType: newMediaData.resourceType,
          width: newMediaData.width,
          height: newMediaData.height,
        },
      }),
      ...(removeMedia === "true" && { media: null }),
      updatedAt: new Date().toISOString(),
    };

    await db.collection("blogs").doc(id).update(updatedData);

    console.log("✅ Blog updated:", id);

    res.status(200).json({
      success: true,
      message: "Blog updated successfully!",
      blog: {
        id,
        ...blogData,
        ...updatedData,
      },
    });
  } catch (error) {
    console.error("💥 Error updating blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update blog.",
      error: error.message,
    });
  }
};

// Delete blog and its media
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log("🗑️ Deleting blog:", id, "by user:", userId);

    const blogDoc = await db.collection("blogs").doc(id).get();

    if (!blogDoc.exists) {
      console.log("❌ Blog not found:", id);
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    const blogData = blogDoc.data();

    if (blogData.authorId !== userId) {
      console.log("❌ Unauthorized delete attempt");
      return res.status(403).json({
        success: false,
        message: "You can only delete your own blogs.",
      });
    }

    // Delete media from Cloudinary if exists
    if (blogData.media) {
      try {
        await deleteFromCloudinary(
          blogData.media.publicId,
          blogData.media.resourceType
        );
        console.log("🗑️  Media deleted from Cloudinary");
      } catch (error) {
        console.error("⚠️  Failed to delete media:", error);
      }
    }

    await db.collection("blogs").doc(id).delete();

    console.log("✅ Blog deleted:", id);

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully!",
    });
  } catch (error) {
    console.error("💥 Error deleting blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete blog.",
      error: error.message,
    });
  }
};

// Get blogs by current user with real stats
const getMyBlogs = async (req, res) => {
  try {
    const userId = req.userId;

    console.log("👤 Getting blogs for user:", userId);

    if (!userId) {
      console.log("❌ No userId in request");
      return res.status(401).json({
        success: false,
        message: "User ID not found in token.",
      });
    }

    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      console.log("❌ User not found in database:", userId);
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    console.log("✅ User found:", userDoc.data().email);

    const blogsSnapshot = await db
      .collection("blogs")
      .where("authorId", "==", userId)
      .get();

    const blogs = [];
    blogsSnapshot.forEach((doc) => {
      blogs.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort in memory by createdAt
    blogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate total stats
    const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
    const totalLikes = blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0);

    console.log("✅ Found", blogs.length, "blogs for user:", userId);

    res.status(200).json({
      success: true,
      count: blogs.length,
      totalViews,
      totalLikes,
      blogs,
    });
  } catch (error) {
    console.error("💥 Error getting user blogs:", error);
    console.error("💥 Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to get your blogs.",
      error: error.message,
    });
  }
};

// Toggle like on a blog
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log("💙 Toggling like on blog:", id, "by user:", userId);

    const blogRef = db.collection("blogs").doc(id);
    const blogDoc = await blogRef.get();

    if (!blogDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    const blogData = blogDoc.data();
    const likedBy = blogData.likedBy || [];
    const hasLiked = likedBy.includes(userId);

    if (hasLiked) {
      // Unlike
      await blogRef.update({
        likes: (blogData.likes || 1) - 1,
        likedBy: likedBy.filter((id) => id !== userId),
      });
      console.log("💔 Unliked blog:", id);
    } else {
      // Like
      await blogRef.update({
        likes: (blogData.likes || 0) + 1,
        likedBy: [...likedBy, userId],
      });
      console.log("💙 Liked blog:", id);
    }

    res.status(200).json({
      success: true,
      liked: !hasLiked,
      likes: hasLiked ? (blogData.likes || 1) - 1 : (blogData.likes || 0) + 1,
    });
  } catch (error) {
    console.error("💥 Error toggling like:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle like.",
      error: error.message,
    });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getMyBlogs,
  toggleLike,
};
