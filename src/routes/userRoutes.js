const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getAllUsers, createUser, deleteUser } = require('../controllers/userController');

router.get('/', protect, adminOnly, getAllUsers);
router.post('/', protect, adminOnly, createUser);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
