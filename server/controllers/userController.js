const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
const getUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 10 } = req.query;

  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(query).skip(skip).limit(parseInt(limit)).sort('-createdAt'),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
      },
    },
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: { user },
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
const updateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, location, linkedIn, bio } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { firstName, lastName, phone, location, linkedIn, bio },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'Profile updated',
    data: { user },
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent deleting yourself
  if (user._id.toString() === req.user._id.toString()) {
    throw new AppError('You cannot delete your own account', 400);
  }

  await user.deleteOne();

  res.json({
    success: true,
    message: 'User deleted',
  });
});

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     summary: Change user role (Admin only)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['jobseeker', 'admin'].includes(role)) {
    throw new AppError('Invalid role. Must be jobseeker or admin', 400);
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent changing your own role
  if (user._id.toString() === req.user._id.toString()) {
    throw new AppError('You cannot change your own role', 400);
  }

  user.role = role;
  await user.save();

  res.json({
    success: true,
    message: `User role changed to ${role}`,
    data: { user },
  });
});

/**
 * @swagger
 * /api/users/{id}/toggle-active:
 *   put:
 *     summary: Activate/Deactivate user (Admin only)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user._id.toString() === req.user._id.toString()) {
    throw new AppError('You cannot deactivate your own account', 400);
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    message: user.isActive ? 'User activated' : 'User deactivated',
    data: { user },
  });
});

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changeUserRole,
  toggleUserActive,
};
