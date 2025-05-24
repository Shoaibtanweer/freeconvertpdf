const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Import crypto

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Please add a username'],
            unique: true,
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
            lowercase: true, // Ensures email is stored in lowercase
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: 6,
        },
        isVerified: { // New field
            type: Boolean,
            default: false,
        },
        emailVerificationToken: String, // New field
        passwordResetToken: String,     // New field
        passwordResetExpires: Date,     // New field
    },
    {
        timestamps: true,
    }
);

// Middleware to hash password before saving a new user
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10); // Generate a salt
        this.password = await bcrypt.hash(this.password, salt); // Hash the password
        next();
    } catch (error) {
        next(error); // Pass error to the next middleware/handler
    }
});

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate and hash email verification token
userSchema.methods.getEmailVerificationToken = function () {
    const verificationToken = crypto.randomBytes(20).toString('hex');

    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    // Token in email link should not be hashed, only the one stored in DB
    return verificationToken; 
};

// Method to generate and hash password reset token
userSchema.methods.getPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to passwordResetToken field
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire time (e.g., 10 minutes)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken; // Return the unhashed token to be sent via email
};


const User = mongoose.model('User', userSchema);

module.exports = User;