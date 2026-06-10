const express = require('express');
const path = require('path');
const fs = require('fs');
const prisma = require('../db');
const authGuard = require('../middleware/authGuard');
const adminGuard = require('../middleware/adminGuard');
const { CATEGORIES } = require('../constants');

const router = express.Router();

// Helper to sort items by category order defined in constants.js
const sortMenuItems = (items) => {
  const categoryOrder = {};
  CATEGORIES.forEach((cat, index) => {
    categoryOrder[cat] = index;
  });
  
  return [...items].sort((a, b) => {
    const orderA = categoryOrder[a.category] !== undefined ? categoryOrder[a.category] : 999;
    const orderB = categoryOrder[b.category] !== undefined ? categoryOrder[b.category] : 999;
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    // Secondary sort by name
    return a.name.localeCompare(b.name);
  });
};

// 1. GET /api/menu — Public read
router.get('/', async (req, res) => {
  try {
    const items = await prisma.menuItem.findMany();
    const sortedItems = sortMenuItems(items);
    return res.status(200).json({ data: sortedItems });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to fetch menu items.'
    });
  }
});

// 2. POST /api/menu — Admin write (Create)
router.post('/', authGuard, adminGuard, async (req, res) => {
  const { name, description, price, category } = req.body;

  // Validate required fields
  if (!name || !description || price === undefined || !category) {
    return res.status(400).json({
      error: true,
      message: 'Name, description, price, and category are required.'
    });
  }

  // Validate category
  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({
      error: true,
      message: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}`
    });
  }

  // Validate price
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({
      error: true,
      message: 'Price must be a valid positive number.'
    });
  }

  try {
    const newItem = await prisma.menuItem.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        category,
        isAvailable: true
      }
    });

    return res.status(201).json({ data: newItem });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to create menu item.'
    });
  }
});

// 3. PUT /api/menu/:id — Admin write (Update)
router.put('/:id', authGuard, adminGuard, async (req, res) => {
  const itemId = parseInt(req.params.id);
  if (isNaN(itemId)) {
    return res.status(400).json({
      error: true,
      message: 'Invalid item ID.'
    });
  }

  const { name, description, price, category, isAvailable } = req.body;
  const updateData = {};

  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description.trim();
  if (category !== undefined) {
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({
        error: true,
        message: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}`
      });
    }
    updateData.category = category;
  }
  if (price !== undefined) {
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({
        error: true,
        message: 'Price must be a valid positive number.'
      });
    }
    updateData.price = parsedPrice;
  }
  if (isAvailable !== undefined) {
    updateData.isAvailable = Boolean(isAvailable);
  }

  try {
    // Check if item exists
    const item = await prisma.menuItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return res.status(404).json({
        error: true,
        message: 'Menu item not found.'
      });
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: updateData
    });

    return res.status(200).json({ data: updatedItem });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to update menu item.'
    });
  }
});

// 4. DELETE /api/menu/:id — Admin write (Delete)
router.delete('/:id', authGuard, adminGuard, async (req, res) => {
  const itemId = parseInt(req.params.id);
  if (isNaN(itemId)) {
    return res.status(400).json({
      error: true,
      message: 'Invalid item ID.'
    });
  }

  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return res.status(404).json({
        error: true,
        message: 'Menu item not found.'
      });
    }

    // 1. Delete associated image file from disk if it exists
    if (item.imageUrl) {
      const filePath = path.join(__dirname, '..', 'uploads', item.imageUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Successfully deleted image file: ${filePath}`);
        } catch (fileErr) {
          console.error(`Failed to delete file from disk: ${filePath}`, fileErr);
          // Don't throw, let DB deletion proceed so we don't leave db record stuck
        }
      }
    }

    // 2. Delete DB record
    await prisma.menuItem.delete({
      where: { id: itemId }
    });

    return res.status(200).json({
      data: {
        message: 'Menu item deleted successfully.'
      }
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to delete menu item.'
    });
  }
});

// 5. PATCH /api/menu/:id/availability — Admin write (Toggle Availability)
router.patch('/:id/availability', authGuard, adminGuard, async (req, res) => {
  const itemId = parseInt(req.params.id);
  if (isNaN(itemId)) {
    return res.status(400).json({
      error: true,
      message: 'Invalid item ID.'
    });
  }

  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return res.status(404).json({
        error: true,
        message: 'Menu item not found.'
      });
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        isAvailable: !item.isAvailable
      }
    });

    return res.status(200).json({ data: updatedItem });
  } catch (error) {
    console.error('Error toggling availability:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to toggle availability.'
    });
  }
});

module.exports = router;
