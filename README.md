# freeConvertPDF Web Application

**Website Name:** freeConvertPDF
**Type:** Multiple-Page Web Application
**Purpose:** Allows users to upload and convert various file formats into PDF.
**Target Platforms:** Desktop, Mobile, and Tablet (Fully Responsive)

## Project Overview

freeConvertPDF aims to be a powerful and easy-to-use online platform for all PDF conversion needs. It provides a clean, modern UI and supports a wide range of file formats.

## Key Features

* **Clean & Modern UI:** Fast, responsive, and intuitive user interface.
* **Responsive Design:** Works seamlessly on desktops, tablets, and mobile devices.
* **Multiple File Format Support:**
    * Images: JPG, PNG, GIF, SVG, TIFF
    * Documents: DOC, DOCX, ODT, RTF, TXT
    * Presentations: PPT, PPTX, ODP
    * Spreadsheets: XLS, XLSX, ODS, CSV
    * Other: HTML, PS, EPS, MSG, EML, ZIP, C++, Python, CSS, and more.
* **Tools Menu:** All conversion tools are grouped under a "Tools" dropdown and displayed as cards on the main page.
* **Direct Tool Access:** Clicking a tool scrolls to its specific upload section.
* **Upload Functionality:**
    * Drag & drop area with visual feedback.
    * "Choose Files" button for manual selection.
    * Multiple file upload support (Note: current backend mock handles one at a time, needs enhancement for batch).
    * Real-time file preview with a remove option.
* **Conversion Process:**
    * Optional PDF output name.
    * Loading spinner during conversion.
    * Download button for the converted PDF.
    * Clear button to reset the upload area.
* **User Accounts (Optional):** Login/Register functionality (placeholder).
* **Dark Mode:** Theme toggle for user preference.

## Folder Structure

freeconvertpdf/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── utils/
│   └── server.js
├── public/
│   ├── css/
│   ├── js/
│   ├── assets/ (for images, icons etc.)
│   ├── tools/ (if using separate HTML snippets)
│   ├── index.html
│   ├── login.html
│   └── register.html
├── uploads/         # Temporary storage for uploaded files (add to .gitignore)
├── processed/       # Temporary storage for converted PDF files (add to .gitignore)
├── .env             # Environment variables
├── .gitignore       # Files to ignore by Git
├── package.json     # Project dependencies and scripts
├── README.md        # This file
└── node_modules/    # Installed npm packages