const { User, ROLES } = require('../models/User');
const crypto = require('crypto');

// @desc    Get all users (paginated, searchable, filterable)
// @route   GET /api/users
// @access  Admin, Manager
const getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};

  // Search by name or email
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  // Filter by role
  if (req.query.role && Object.values(ROLES).includes(req.query.role)) {
    query.role = req.query.role;
  }

  // Filter by status
  if (req.query.status && ['active', 'inactive'].includes(req.query.status)) {
    query.status = req.query.status;
  }

  // Managers cannot see admin users
  if (req.user.role === 'manager') {
    query.role = { $ne: 'admin' };
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password -refreshToken')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin, Manager, or own user
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -refreshToken')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Regular users can only view their own profile
  if (req.user.role === 'user' && req.user._id.toString() !== user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to view this profile' });
  }

  // Managers cannot view admin profiles
  if (req.user.role === 'manager' && user.role === 'admin') {
    return res.status(403).json({ message: 'Not authorized to view admin profiles' });
  }

  res.json(user);
};

// @desc    Create new user
// @route   POST /api/users
// @access  Admin only
const createUser = async (req, res) => {
  const { name, email, role, status } = req.body;
  let { password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  // Auto-generate password if not provided
  if (!password) {
    password = crypto.randomBytes(8).toString('hex');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user',
    status: status || 'active',
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  res.status(201).json({
    user: user.toSafeObject(),
    generatedPassword: req.body.password ? undefined : password,
  });
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin (full), Manager (non-admin only), User (own profile)
const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const requesterId = req.user._id.toString();
  const targetId = user._id.toString();
  const requesterRole = req.user.role;

  // Regular users: can only update own profile, cannot change role
  if (requesterRole === 'user') {
    if (requesterId !== targetId) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }
    if (req.body.role !== undefined) {
      return res.status(403).json({ message: 'You cannot change your own role' });
    }
    if (req.body.status !== undefined) {
      return res.status(403).json({ message: 'You cannot change your own status' });
    }
  }

  // Managers: cannot update admin users, cannot assign admin/change roles
  if (requesterRole === 'manager') {
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Managers cannot modify admin accounts' });
    }
    if (req.body.role === 'admin') {
      return res.status(403).json({ message: 'Managers cannot assign admin role' });
    }
  }

  const allowedFields = ['name', 'email', 'password', 'status'];
  if (requesterRole === 'admin') allowedFields.push('role');
  if (requesterRole === 'manager') allowedFields.push('role'); // can assign user/manager but not admin

  const updates = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  updates.updatedBy = req.user._id;

  Object.assign(user, updates);
  await user.save();

  const updatedUser = await User.findById(user._id)
    .select('-password -refreshToken')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  res.json(updatedUser);
};

// @desc    Delete user (soft delete - deactivate)
// @route   DELETE /api/users/:id
// @access  Admin only
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Prevent admin from deleting themselves
  if (req.user._id.toString() === user._id.toString()) {
    return res.status(400).json({ message: 'You cannot delete your own account' });
  }

  // Soft delete - deactivate
  user.status = 'inactive';
  user.updatedBy = req.user._id;
  await user.save();

  res.json({ message: 'User deactivated successfully', userId: user._id });
};

// @desc    Hard delete user
// @route   DELETE /api/users/:id/hard
// @access  Admin only
const hardDeleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (req.user._id.toString() === user._id.toString()) {
    return res.status(400).json({ message: 'You cannot delete your own account' });
  }

  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User permanently deleted', userId: req.params.id });
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, hardDeleteUser };
