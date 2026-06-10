const express = require('express');
const prisma = require('../db');
const authGuard = require('../middleware/authGuard');
const adminGuard = require('../middleware/adminGuard');

const router = express.Router();

// 1. GET /api/settings — Public read settings for client-side shop status checking
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.shopSettings.findFirst();
    if (!settings) {
      return res.status(404).json({
        error: true,
        message: 'Shop settings not found.'
      });
    }
    return res.status(200).json({ data: settings });
  } catch (error) {
    console.error('Error fetching shop settings:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to fetch shop settings.'
    });
  }
});

// 2. PATCH /api/settings — Admin update settings
router.patch('/', authGuard, adminGuard, async (req, res) => {
  const { isOpenOverride, openTime, closeTime } = req.body;
  const updateData = {};

  // Validate and assign isOpenOverride (can be true, false, or null)
  if (isOpenOverride !== undefined) {
    if (isOpenOverride !== null && typeof isOpenOverride !== 'boolean') {
      return res.status(400).json({
        error: true,
        message: 'isOpenOverride must be a boolean or null.'
      });
    }
    updateData.isOpenOverride = isOpenOverride;
  }

  // Validate and assign openTime (HH:MM format)
  const timeRegex = /^\d{2}:\d{2}$/;
  if (openTime !== undefined) {
    if (typeof openTime !== 'string' || !timeRegex.test(openTime)) {
      return res.status(400).json({
        error: true,
        message: 'openTime must be a string in HH:MM format.'
      });
    }
    updateData.openTime = openTime;
  }

  // Validate and assign closeTime (HH:MM format)
  if (closeTime !== undefined) {
    if (typeof closeTime !== 'string' || !timeRegex.test(closeTime)) {
      return res.status(400).json({
        error: true,
        message: 'closeTime must be a string in HH:MM format.'
      });
    }
    updateData.closeTime = closeTime;
  }

  try {
    const settings = await prisma.shopSettings.findFirst();

    let updatedSettings;
    if (!settings) {
      // Create settings if not exists (fallback)
      updatedSettings = await prisma.shopSettings.create({
        data: {
          isOpenOverride: updateData.isOpenOverride !== undefined ? updateData.isOpenOverride : null,
          openTime: updateData.openTime || '10:00',
          closeTime: updateData.closeTime || '16:00'
        }
      });
    } else {
      updatedSettings = await prisma.shopSettings.update({
        where: { id: settings.id },
        data: updateData
      });
    }

    return res.status(200).json({ data: updatedSettings });
  } catch (error) {
    console.error('Error updating shop settings:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to update shop settings.'
    });
  }
});

module.exports = router;
