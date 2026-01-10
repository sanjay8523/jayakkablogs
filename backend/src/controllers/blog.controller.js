const { db } = require('../config/firebase.config');

// Create a new blog post
const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.userId;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and content.'
      });
    }

    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    const newBlog = {
      title,
      content,
      authorId: userId,
      authorName: userData.name,
      authorEmail: userData.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const blogDoc = await db.collection('blogs').add(newBlog);

    res.status(201).json({
      success: true,
      message: 'Blog created successfully!',
      blog: {
        id: blogDoc.id,
        ...newBlog
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create blog.',
      error: error.message
    });
  }
};

// Get all blogs
const getAllBlogs = async (req, res) => {
  try {
    const blogsSnapshot = await db.collection('blogs')
      .orderBy('createdAt', 'desc')
      .get();

    const blogs = [];
    blogsSnapshot.forEach(doc => {
      blogs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      count: blogs.length,
      blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get blogs.',
      error: error.message
    });
  }
};

// Get single blog by ID
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blogDoc = await db.collection('blogs').doc(id).get();

    if (!blogDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found.'
      });
    }

    res.status(200).json({
      success: true,
      blog: {
        id: blogDoc.id,
        ...blogDoc.data()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get blog.',
      error: error.message
    });
  }
};

// Update blog
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.userId;

    const blogDoc = await db.collection('blogs').doc(id).get();

    if (!blogDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found.'
      });
    }

    const blogData = blogDoc.data();

    if (blogData.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own blogs.'
      });
    }

    const updatedData = {
      ...(title && { title }),
      ...(content && { content }),
      updatedAt: new Date().toISOString()
    };

    await db.collection('blogs').doc(id).update(updatedData);

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully!',
      blog: {
        id,
        ...blogData,
        ...updatedData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update blog.',
      error: error.message
    });
  }
};

// Delete blog
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const blogDoc = await db.collection('blogs').doc(id).get();

    if (!blogDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found.'
      });
    }

    const blogData = blogDoc.data();

    if (blogData.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own blogs.'
      });
    }

    await db.collection('blogs').doc(id).delete();

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog.',
      error: error.message
    });
  }
};

// Get blogs by current user
const getMyBlogs = async (req, res) => {
  try {
    const userId = req.userId;

    const blogsSnapshot = await db.collection('blogs')
      .where('authorId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const blogs = [];
    blogsSnapshot.forEach(doc => {
      blogs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      count: blogs.length,
      blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get your blogs.',
      error: error.message
    });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getMyBlogs
};