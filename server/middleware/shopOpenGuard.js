const prisma = require('../db');

module.exports = async (req, res, next) => {
  try {
    const settings = await prisma.shopSettings.findFirst();
    
    if (!settings) {
      // Default to open if settings are missing to avoid blocking client checkout
      return next();
    }

    const { isOpenOverride, openTime, closeTime } = settings;

    // 1. Check override status
    if (isOpenOverride !== null && isOpenOverride !== undefined) {
      if (isOpenOverride === true) {
        return next(); // Forced open
      } else {
        return res.status(403).json({
          error: true,
          message: 'Shop is currently closed.'
        });
      }
    }

    // 2. Check scheduled operating hours
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;

    if (currentTime >= openTime && currentTime <= closeTime) {
      next();
    } else {
      res.status(403).json({
        error: true,
        message: `Shop is currently closed. Operating hours are ${openTime} - ${closeTime}.`
      });
    }
  } catch (error) {
    console.error('Error in shopOpenGuard:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error while verifying shop status.'
    });
  }
};
