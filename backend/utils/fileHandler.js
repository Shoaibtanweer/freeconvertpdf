// File: backend/utils/fileHandler.js

const fs = require('fs').promises; // Using promises version of fs
const path = require('path');

/**
 * Utility functions for file operations.
 * These are placeholders and can be expanded.
 */

// Example: Function to delete a file
const deleteFile = async (filePath) => {
    try {
        await fs.unlink(filePath);
        console.log(`File deleted successfully: ${filePath}`);
        return true;
    } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
        // You might want to throw the error or handle it based on your needs
        // For example, if the file doesn't exist, it might not be an error in some contexts.
        if (error.code === 'ENOENT') {
            console.log('File not found, no need to delete.');
            return true; // Or false, depending on desired behavior
        }
        return false;
    }
};

// Example: Function to create directories if they don't exist
const ensureDirectoryExists = async (dirPath) => {
    try {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`Directory ensured: ${dirPath}`);
    } catch (error) {
        if (error.code === 'EEXIST') { // Directory already exists
            return; // This is fine
        }
        console.error(`Error creating directory ${dirPath}:`, error);
        throw error; // Re-throw if it's another error
    }
};

// Function to generate a unique filename
const getUniqueFileName = (prefix, suffix) => {
    return `${prefix}${Date.now()}${suffix}`;
};

// Function to get the path to the processed files directory and ensure it exists
const getProcessedDir = async () => {
    // Assuming 'upload/processed_files' relative to the project root
    // __dirname in fileHandler.js is backend/utils
    const processedDirPath = path.join(__dirname, '..', '..', 'upload', 'processed_files'); 
    await ensureDirectoryExists(processedDirPath);
    return processedDirPath;
};


// You could add functions here for:
// - Moving files
// - Reading file metadata
// - Cleaning up temporary directories

module.exports = {
    deleteFile,
    ensureDirectoryExists,
    getUniqueFileName, // <<< --- ADD THIS EXPORT --- 
    getProcessedDir,   // <<< --- ADD THIS EXPORT --- 
};