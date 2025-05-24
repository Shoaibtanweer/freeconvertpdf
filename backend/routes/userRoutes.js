const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    verifyEmail,    // Import new controller
    forgotPassword, // Import new controller
    resetPassword   // Import new controller
} = require('../controller/userController');

// @route   POST api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

// @route   GET api/users/verifyemail/:token
// @desc    Verify user's email address
// @access  Public
router.get('/verifyemail/:token', verifyEmail);

// @route   POST api/users/forgotpassword
// @desc    Request password reset
// @access  Public
router.post('/forgotpassword', forgotPassword);

// @route   PUT api/users/resetpassword/:token
// @desc    Reset password using token
// @access  Public
router.put('/resetpassword/:token', resetPassword);

module.exports = router;