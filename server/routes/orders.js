const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const authGuard = require('../middleware/authGuard');
const adminGuard = require('../middleware/adminGuard');
const shopOpenGuard = require('../middleware/shopOpenGuard');
const { ORDER_STATUS, USER_ROLES, DISCOUNT_RATE } = require('../constants');

const router = express.Router();

// Optional Auth Middleware for POST /api/orders (accepts both guests and registered users)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        userId: decoded.userId,
        role: decoded.role
      };
    } catch (error) {
      return res.status(401).json({
        error: true,
        message: 'Invalid or expired authentication token.'
      });
    }
  }
  next();
};

// 1. POST /api/orders — Guest or registered checkout
router.post('/', shopOpenGuard, optionalAuth, async (req, res) => {
  const { customerName, customerPhone, items } = req.body;

  // Validate request inputs
  if (!customerName || !customerPhone) {
    return res.status(400).json({
      error: true,
      message: 'Customer name and phone number are required.'
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: true,
      message: 'Order must contain at least one item.'
    });
  }

  try {
    // Collect all requested MenuItem IDs
    const itemIds = items.map(i => parseInt(i.menuItemId)).filter(id => !isNaN(id));
    if (itemIds.length !== items.length) {
      return res.status(400).json({
        error: true,
        message: 'Invalid menuItemId in order items.'
      });
    }

    // Retrieve the menu items from DB
    const dbItems = await prisma.menuItem.findMany({
      where: {
        id: { in: itemIds }
      }
    });

    // Create a map for easy lookup
    const dbItemMap = {};
    dbItems.forEach(item => {
      dbItemMap[item.id] = item;
    });

    // Check if all requested items exist and are available
    for (const item of items) {
      const dbItem = dbItemMap[item.menuItemId];
      if (!dbItem) {
        return res.status(400).json({
          error: true,
          message: `Menu item with ID ${item.menuItemId} does not exist.`
        });
      }
      if (!dbItem.isAvailable) {
        return res.status(400).json({
          error: true,
          message: `Item "${dbItem.name}" is currently sold out.`
        });
      }
      const quantity = parseInt(item.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          error: true,
          message: `Invalid quantity for item "${dbItem.name}".`
        });
      }
    }

    // Calculate subtotal
    let subtotal = 0;
    const itemsWithDetails = items.map(item => {
      const dbItem = dbItemMap[item.menuItemId];
      const quantity = parseInt(item.quantity);
      const price = parseFloat(dbItem.price);
      subtotal += price * quantity;
      
      return {
        menuItemId: dbItem.id,
        quantity,
        unitPrice: price
      };
    });

    // Check discount applicability (registered customer role required)
    const discountApplied = !!(req.user && req.user.role === USER_ROLES.CUSTOMER);
    const totalAmount = discountApplied ? subtotal * (1 - DISCOUNT_RATE) : subtotal;

    // Save order in transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: req.user ? req.user.userId : null,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          status: ORDER_STATUS.PENDING,
          totalAmount,
          discountApplied,
          orderItems: {
            create: itemsWithDetails.map(item => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice
            }))
          }
        },
        include: {
          orderItems: {
            include: {
              menuItem: true
            }
          }
        }
      });
      return order;
    });

    return res.status(201).json({ data: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to place order.'
    });
  }
});

// 2. GET /api/orders — Admin list all orders (newest first)
router.get('/', authGuard, adminGuard, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        }
      }
    });

    return res.status(200).json({ data: orders });
  } catch (error) {
    console.error('Error fetching admin orders list:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to fetch orders.'
    });
  }
});

// 3. GET /api/orders/my — Customer view own history (newest first)
router.get('/my', authGuard, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.user.userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        }
      }
    });

    return res.status(200).json({ data: orders });
  } catch (error) {
    console.error('Error fetching customer orders list:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to fetch your order history.'
    });
  }
});

// 4. PATCH /api/orders/:id/status — Admin change status
router.patch('/:id/status', authGuard, adminGuard, async (req, res) => {
  const orderId = parseInt(req.params.id);
  if (isNaN(orderId)) {
    return res.status(400).json({
      error: true,
      message: 'Invalid order ID.'
    });
  }

  const { status } = req.body;
  if (!status) {
    return res.status(400).json({
      error: true,
      message: 'Status is required.'
    });
  }

  const allowedStatuses = Object.values(ORDER_STATUS);
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      error: true,
      message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
    });
  }

  try {
    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({
        error: true,
        message: 'Order not found.'
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        }
      }
    });

    return res.status(200).json({ data: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to update order status.'
    });
  }
});

module.exports = router;
