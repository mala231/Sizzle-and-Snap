const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../db');
const authGuard = require('../middleware/authGuard');
const adminGuard = require('../middleware/adminGuard');

const router = express.Router();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const itemId = req.params.id;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${itemId}${ext}`);
  }
});

// Multer upload config
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExts.includes(ext)) {
      return cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed.'));
    }
    cb(null, true);
  }
});

const uploadSingle = upload.single('image');

// POST /api/menu/:id/image — Upload or replace menu item image
router.post('/:id/image', authGuard, adminGuard, async (req, res, next) => {
  const itemId = parseInt(req.params.id);
  if (isNaN(itemId)) {
    return res.status(400).json({ error: true, message: 'Invalid item ID.' });
  }

  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return res.status(404).json({ error: true, message: 'Menu item not found.' });
    }

    req.menuItem = item; // Attach item to request for next step
    next();
  } catch (error) {
    console.error('Database query error in upload router:', error);
    return res.status(500).json({ error: true, message: 'Internal server error.' });
  }
}, (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: true,
        message: err.message
      });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: true,
      message: 'Please select an image file to upload.'
    });
  }

  const item = req.menuItem;

  try {
    // If the item had a different image name previously, delete it to prevent leakage
    if (item.imageUrl && item.imageUrl !== req.file.filename) {
      const oldFilePath = path.join(__dirname, '..', 'uploads', item.imageUrl);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
          console.log(`Successfully deleted old image file: ${oldFilePath}`);
        } catch (unlinkErr) {
          console.error(`Failed to delete old image file: ${oldFilePath}`, unlinkErr);
        }
      }
    }

    // Update image_url in DB with the filename only
    const updatedItem = await prisma.menuItem.update({
      where: { id: item.id },
      data: {
        imageUrl: req.file.filename
      }
    });

    return res.status(200).json({ data: updatedItem });
  } catch (error) {
    console.error('Error updating menu item image:', error);
    // Delete newly uploaded file if DB update fails to keep disk clean
    if (fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error(unlinkErr);
      }
    }
    return res.status(500).json({
      error: true,
      message: 'Failed to update menu item image in database.'
    });
  }
});

module.exports = router;
