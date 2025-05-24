// File: backend/routes/conversionRoutes.js

const express = require('express');
const router = express.Router();
// Corrected path: 'controller' (singular) instead of 'controllers'
const conversionController = require('../controller/conversionController');
const multer = require('multer'); // For handling file uploads
const path = require('path');
const fs = require('fs');

// Configure Multer for file storage
// Ensure 'uploads/' directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir); // Save files to the 'uploads/' directory
    },
    filename: function (req, file, cb) {
        // Use a unique name for the uploaded file to avoid conflicts
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

// File filter example (optional, can be more specific per route)
const fileFilter = (req, file, cb) => {
    // Basic filter: accept common image and document types
    // You might want to make this more dynamic based on the 'toolType'
    // For now, this is a general filter. Specific validation should happen in the controller.
    if (file.mimetype.startsWith('image/') ||
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-powerpoint' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
        file.mimetype === 'text/plain' ||
        file.mimetype === 'text/csv' ||
        file.mimetype === 'text/html' ||
        file.mimetype === 'application/postscript' || // .ps, .eps
        file.mimetype === 'application/vnd.oasis.opendocument.text' || // .odt
        file.mimetype === 'application/vnd.oasis.opendocument.spreadsheet' || // .ods
        file.mimetype === 'application/vnd.oasis.opendocument.presentation' || // .odp
        file.mimetype === 'application/rtf' ||
        file.mimetype === 'application/vnd.ms-outlook' || // .msg
        file.mimetype === 'message/rfc822' || // .eml
        file.mimetype === 'application/zip' ||
        file.mimetype === 'text/x-c++src' || // .cpp, .h etc.
        file.mimetype === 'text/x-python' || // .py
        file.mimetype === 'text/css' // .css
        ) {
        cb(null, true);
    } else {
        cb(new Error('File type not supported!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 50 // 50MB limit (adjust as needed)
    },
    // fileFilter: fileFilter // You can enable this for basic filtering
});

// POST /api/convert/:toolType - Handles file upload and initiates conversion
// :toolType will be something like 'jpg-to-pdf', 'doc-to-pdf', etc.
// THIS IS THE LINE TO CHANGE/REPLACE:
router.post('/:toolType', upload.array('files', 10), conversionController.convertFileToPdf);
// 'files' (plural) should match the name attribute of your file input in the frontend form

// Example route for downloading processed files (ensure 'processed' dir exists)
// This is a basic example. In a real app, you'd secure downloads.
const processedDir = path.join(__dirname, '../../processed');
if (!fs.existsSync(processedDir)) {
    fs.mkdirSync(processedDir, { recursive: true });
}
router.get('/downloads/:filename', (req, res, next) => {
    const filename = req.params.filename;
    const filePath = path.join(processedDir, filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath, (err) => {
            if (err) {
                console.error("Error downloading file:", err);
                // It's important to pass the error to the error handler if headers were not yet sent
                if (!res.headersSent) {
                    next(err);
                }
            } else {
                // Optional: Delete file after download if it's temporary
                // fs.unlink(filePath, (unlinkErr) => {
                //     if (unlinkErr) console.error("Error deleting file:", unlinkErr);
                // });
            }
        });
    } else {
        res.status(404).send('File not found.');
    }
});


module.exports = router;