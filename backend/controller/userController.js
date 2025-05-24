const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // For comparing hashed tokens
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail'); // Import sendEmail utility

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists with this email');
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
        res.status(400);
        throw new Error('Username is already taken');
    }

    const user = new User({ // Use new User() to call instance methods before save
        username,
        email: email.toLowerCase(),
        password,
    });

    const verificationToken = user.getEmailVerificationToken(); // Generate token
    await user.save(); // Save user to hash password and store verification token

    // Create verification URL
    // Adjust DOMAIN based on your frontend URL, use environment variable for production
    const domain = process.env.FRONTEND_DOMAIN || `http://localhost:${process.env.PORT || 3000}`;
    const verificationUrl = `${domain}/verifyemail.html?token=${verificationToken}`; // We'll create verifyemail.html

    const message = `
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>If you did not create an account, please ignore this email.</p>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Email Verification - freeConvertPDF',
            html: message,
        });

        res.status(201).json({
            message: 'Registration successful. Please check your email to verify your account.',
            // Optionally send back some user info, but not token until verified
            // _id: user._id,
            // username: user.username,
            // email: user.email,
        });
    } catch (error) {
        console.error('Email sending error during registration:', error);
        // Potentially delete user if email fails or mark for re-verification
        // For now, we'll let the user exist but unverified.
        user.emailVerificationToken = undefined; // Clear token if email failed
        await user.save({ validateBeforeSave: false });

        res.status(500);
        throw new Error('User registered, but email could not be sent. Please contact support or try registering again later.');
    }
});

// @desc    Authenticate a user (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    if (!user.isVerified) {
        res.status(401);
        // Optionally, allow resending verification email here
        throw new Error('Your account is not verified. Please check your email or contact support.');
    }

    if (await user.matchPassword(password)) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
            message: 'Login successful'
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Verify email
// @route   GET /api/users/verifyemail/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
    // Get hashed token
    const emailVerificationToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({ emailVerificationToken });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired verification token.');
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined; // Clear the token
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'Email verified successfully. You can now login.' });
});


// @desc    Forgot password
// @route   POST /api/users/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        // Don't reveal if user exists or not for security, send generic message
        return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Get reset token
    const resetToken = user.getPasswordResetToken();
    await user.save({ validateBeforeSave: false }); // Save user to store reset token and expiry

    // Create reset URL
    const domain = process.env.FRONTEND_DOMAIN || `http://localhost:${process.env.PORT || 3000}`;
    const resetUrl = `${domain}/resetpassword.html?token=${resetToken}`; // We'll create resetpassword.html

    const message = `
        <p>You are receiving this email because you (or someone else) has requested the reset of a password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process within 10 minutes of receiving it:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request - freeConvertPDF',
            html: message,
        });
        res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (err) {
        console.error('Forgot Password Email Error:', err);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(500);
        throw new Error('Email could not be sent for password reset.');
    }
});

// @desc    Reset password
// @route   PUT /api/users/resetpassword/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    // Get hashed token from URL param
    const passwordResetToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken,
        passwordResetExpires: { $gt: Date.now() }, // Check if token is not expired
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired password reset token.');
    }

    // Set new password
    user.password = req.body.password; // Password will be hashed by pre-save hook
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.isVerified = true; // Also verify user if they are resetting password
    await user.save();

    // Optionally, log the user in by sending a new JWT token
    res.json({
        message: 'Password reset successful. You can now login with your new password.',
        // token: generateToken(user._id) // If you want to auto-login
    });
});


// Generate JWT
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        console.error('FATAL ERROR: JWT_SECRET is not defined.');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_dev_only', {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    loginUser,
    verifyEmail,     // Export new function
    forgotPassword,  // Export new function
    resetPassword,   // Export new function
};