const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  hardDeleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateCreateUser, validateUpdateUser } = require('../middleware/validationMiddleware');

// All routes require authentication
router.use(protect);

// Admin & Manager only
router.get('/', authorize('admin', 'manager'), getUsers);

// Admin only - create user
router.post('/', authorize('admin'), validateCreateUser, createUser);

// Get, update, delete specific user
router
  .route('/:id')
  .get(getUserById) // access controlled inside controller
  .put(validateUpdateUser, updateUser) // access controlled inside controller
  .delete(authorize('admin'), deleteUser);

// Hard delete - Admin only
router.delete('/:id/hard', authorize('admin'), hardDeleteUser);

module.exports = router;
