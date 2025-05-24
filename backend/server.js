// backend/server.js

const express = require('express');
const path = require('path');
const conversionRoutes = require('./routes/conversionRoutes'); // Uncommented and assuming it's correctly referenced
const { notFound, errorHandler } = require('./middleware/errorMiddleware'); // Import error handlers
const userRoutes = require('./routes/userRoutes');
const dotenv = require('dotenv'); // Require dotenv
const connectDB = require('./config/db');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load env vars (ensure this path is correct for your root .env file)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') }); 
// connectDB(); // Call connectDB *after* dotenv.config() has loaded MONGO_URI

// Connect to Database
connectDB(); // Moved here

// Serve static files from the 'public' directory (frontend)
// Adjust the path if your server.js is not in the root of 'backend' relative to 'public'
// If server.js is in freeconvertpdf/backend/, and public is in freeconvertpdf/public/
app.use(express.static(path.join(__dirname, '../public')));

// --- Add this route to serve downloaded files --- 
// The 'processed_files' directory is inside the 'upload' directory at the project root.
// __dirname in server.js is freeconvertpdf/backend/
app.use('/downloads', express.static(path.join(__dirname, '../upload/processed_files')));

// Basic Route for API check
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

// --- API Routes ---
app.use('/api/convert', conversionRoutes); // Mount your conversion routes

app.use('/api/users', userRoutes); 

// Catch-all for SPA or to serve index.html for any other route not handled by API or static files
// This ensures that if you navigate directly to /login or /register, index.html is served
// (if you are building a Single Page Application with client-side routing for these pages)
// If login.html and register.html are separate files, ensure they are served correctly by express.static
// For multi-page app, ensure direct navigation works or redirect appropriately.
// The current express.static setup should serve login.html and register.html directly.

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// --- Error Handling Middleware ---
// Must be after all other app.use() and routes calls
app.use(notFound); // Handles 404 errors - routes not found
app.use(errorHandler); // Handles all other errors

app.listen(PORT, () => {
    console.log(`✅ Server listening on port ${PORT}`);
    console.log(`🌐 Server is running on http://localhost:${PORT}`);
    console.log('Serving static files from:', path.join(__dirname, '../public'));
    console.log(`-------------------------------------------`);
});
