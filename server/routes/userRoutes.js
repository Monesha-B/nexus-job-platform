const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changeUserRole,
  toggleUserActive,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { adminOnly, selfOrAdmin } = require('../middleware/roleCheck');

// All routes require authentication
router.use(protect);

// ============ ADMIN ONLY ROUTES ============
router.get('/', adminOnly, getUsers);                    // Get all users
router.delete('/:id', adminOnly, deleteUser);            // Delete user
router.put('/:id/role', adminOnly, changeUserRole);      // Change role
router.put('/:id/toggle-active', adminOnly, toggleUserActive); // Activate/deactivate

// ============ SELF OR ADMIN ROUTES ============
router.get('/:id', selfOrAdmin, getUser);                // Get user by ID
router.put('/:id', selfOrAdmin, updateUser);             // Update profile

module.exports = router;
