// Check if user is admin
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next();  // ✅ User is admin, continue
    } else {
      res.status(403).json({ message: 'Admin access required' });
    }
  };