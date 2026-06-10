module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: true,
      message: 'Access denied. Administrator permissions required.'
    });
  }
  next();
};
