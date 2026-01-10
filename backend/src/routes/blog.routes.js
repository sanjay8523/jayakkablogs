const express = require('express');
const router = express.Router();

// Simple test route
router.get('/', (req, res) => {
  res.json({ message: 'Blog routes are working!' });
});

module.exports = router;