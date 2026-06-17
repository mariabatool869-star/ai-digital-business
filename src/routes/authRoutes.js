// 1. IMPORT EXPRESS (for routing)
const express = require('express');

// 2. IMPORT THE AUTH CONTROLLER (the functions we just created)
const { register, login } = require('../controllers/authController');

// 3. CREATE A ROUTER (this handles different URLs)
const router = express.Router();

// 4. DEFINE ROUTES
// When someone visits /api/auth/register with POST, run the register function
router.post('/register', register);

// When someone visits /api/auth/login with POST, run the login function
router.post('/login', login);

// 5. EXPORT THE ROUTER so server.js can use it
module.exports = router;