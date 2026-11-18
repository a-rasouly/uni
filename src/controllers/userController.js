const store = require('../models/store');

exports.getAllUsers = (req, res) => {
  const users = store.findAllUsers();
  return res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
};

exports.getUserById = (req, res) => {
  const { id } = req.params;
  const user = store.findUserById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: `User with id '${id}' was not found`
    });
  }
  return res.status(200).json({
    success: true,
    data: user
  });
};

exports.createUser = (req, res) => {
  const { name, email, role } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Field "name" is required and must be a non-empty string'
    });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      error: 'Field "email" is required and must be a valid email address'
    });
  }

  const existing = store.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({
      success: false,
      error: `User with email '${email}' already exists`
    });
  }

  const validRoles = ['admin', 'member'];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      error: `Role must be one of: ${validRoles.join(', ')}`
    });
  }

  const newUser = store.createUser({ name: name.trim(), email: email.trim().toLowerCase(), role });
  return res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: newUser
  });
};

exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  const existing = store.findUserById(id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: `User with id '${id}' was not found`
    });
  }

  if (email && email !== existing.email) {
    const conflict = store.findUserByEmail(email);
    if (conflict && conflict.id !== id) {
      return res.status(409).json({
        success: false,
        error: `Email '${email}' is already in use by another user`
      });
    }
  }

  const updated = store.updateUser(id, { name, email, role });
  return res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: updated
  });
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;
  const deleted = store.deleteUser(id);
  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: `User with id '${id}' was not found`
    });
  }
  return res.status(204).send();
};
