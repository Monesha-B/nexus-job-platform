/**
 * Role-based Access Control Middleware
 * 
 * NEXUS has 2 roles:
 * - jobseeker: Can upload resume, match jobs, apply, view own analytics
 * - admin: All jobseeker permissions + manage users, jobs, platform analytics
 */

/**
 * Authorize specific roles
 * Usage: authorize('admin') or authorize('jobseeker', 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }

    next();
  };
};

/**
 * Admin only middleware
 * Usage: router.get('/admin/users', protect, adminOnly, getUsers)
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please log in.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.',
    });
  }

  next();
};

/**
 * Check if user owns the resource or is admin
 * Usage: router.put('/resumes/:id', protect, ownerOrAdmin(getResumeOwner), updateResume)
 */
const ownerOrAdmin = (getOwnerId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in.',
      });
    }

    // Admin can access anything
    if (req.user.role === 'admin') {
      return next();
    }

    try {
      const ownerId = await getOwnerId(req);
      
      if (!ownerId) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found.',
        });
      }

      if (ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.',
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking resource ownership.',
      });
    }
  };
};

/**
 * Self or admin - user can only access their own data
 * Usage: router.get('/users/:id', protect, selfOrAdmin, getUser)
 */
const selfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please log in.',
    });
  }

  const requestedUserId = req.params.id || req.params.userId;

  // Admin can access any user
  if (req.user.role === 'admin') {
    return next();
  }

  // User can only access their own data
  if (requestedUserId && requestedUserId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own data.',
    });
  }

  next();
};

module.exports = {
  authorize,
  adminOnly,
  ownerOrAdmin,
  selfOrAdmin,
};
