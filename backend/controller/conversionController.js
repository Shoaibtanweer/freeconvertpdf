// File: backend/controller/conversionController.js
const fs = require('fs-extra');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const sharp = require('sharp');
const libreoffice = require('libreoffice-convert');
// const { promisify } = require('util'); // promisify is no longer needed for libreoffice.convert
// const libreConvertAsync = libreoffice.convert; // Use directly

// Add this helper function
const convertAsync = (buffer, format, filter) => {
    return new Promise((resolve, reject) => {
        libreoffice.convert(buffer, format, filter, (err, result) => {
            if (err) { 
                console.error('Error during libreoffice.convert callback:', err);
                return reject(err); 
            }
            resolve(result);
        });
    });
};

const { exec } = require('child_process');
const puppeteer = require('puppeteer');
const AdmZip = require('adm-zip');
// const { MailParser } = require('mailparser'); // MailParser is more for parsing, not direct PDF conversion
const MsgReader = require('@kenjiuno/msgreader').default; // Ensure this is the correct import

// Helper function to sanitize file names for output
const sanitizeOutputFileName = (name) => {
    return name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, '_');
};


const convertFileToPdf = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded.' });
    }
    
    const uploadedFiles = req.files;
    const toolType = req.params.toolType; // Use from URL parameter
    const outputPdfNameBody = req.body.outputPdfName;

    if (!toolType) {
        // This case should ideally be caught by routing if :toolType is mandatory
        return res.status(400).json({ message: 'Tool type not specified in URL.' });
    }

    // __dirname is backend/controller/
    // ../../ goes to project root
    const processedDir = path.join(__dirname, '../../upload/processed_files');
    await fs.ensureDir(processedDir);

    const pdfDoc = await PDFDocument.create();
    let conversionPerformedOverall = false;
    let outputFilePath;
    let successfullyProcessedFilesCount = 0;
    const originalFileNamesProcessed = [];

    try {
        const baseOutputName = sanitizeOutputFileName(outputPdfNameBody || `converted_output_${Date.now()}`);
        outputFilePath = path.join(processedDir, `${baseOutputName}.pdf`);

        for (const uploadedFile of uploadedFiles) {
            const inputFilePath = uploadedFile.path;
            const originalFileName = uploadedFile.originalname;
            const fileExtension = path.extname(originalFileName).toLowerCase();
            let fileMimeType = uploadedFile.mimetype; // Use multer's detected MIME type
            let currentFileConvertedSuccessfully = false;

            console.log(`Processing file: ${originalFileName}, MIME: ${fileMimeType}, Tool: ${toolType}, Extension: ${fileExtension}`);

            try {
                // --- Image Conversion Logic ---
                if (toolType.endsWith('-to-pdf') && 
                    (fileMimeType.startsWith('image/') && !fileMimeType.includes('vnd.adobe.photoshop'))) { // Exclude PSD for now
                    let imageBytesToEmbed;
                    let targetMimeForPdfLib = fileMimeType;

                    if (fileMimeType === 'image/svg+xml') {
                        imageBytesToEmbed = await sharp(inputFilePath).png().toBuffer();
                        targetMimeForPdfLib = 'image/png';
                    } else if (fileMimeType === 'image/gif') {
                        // For GIFs, take the first frame for PDF. Animated GIFs aren't directly supported in PDF.
                        imageBytesToEmbed = await sharp(inputFilePath, { animated: false }).png().toBuffer();
                        targetMimeForPdfLib = 'image/png';
                    } else if (fileMimeType === 'image/tiff' || fileMimeType === 'image/tif') {
                        imageBytesToEmbed = await sharp(inputFilePath).png().toBuffer();
                        targetMimeForPdfLib = 'image/png';
                    } else if (fileMimeType === 'image/webp') {
                        imageBytesToEmbed = await sharp(inputFilePath).png().toBuffer();
                        targetMimeForPdfLib = 'image/png';
                    } else if (fileMimeType === 'image/jpeg' || fileMimeType === 'image/png') {
                        imageBytesToEmbed = await fs.readFile(inputFilePath);
                    } else {
                        console.warn(`Unsupported image type ${fileMimeType} for direct embedding, attempting conversion to PNG.`);
                        imageBytesToEmbed = await sharp(inputFilePath).png().toBuffer(); // Fallback attempt
                        targetMimeForPdfLib = 'image/png';
                    }

                    if (imageBytesToEmbed) {
                        let embeddedImage;
                        if (targetMimeForPdfLib === 'image/png') embeddedImage = await pdfDoc.embedPng(imageBytesToEmbed);
                        else if (targetMimeForPdfLib === 'image/jpeg') embeddedImage = await pdfDoc.embedJpg(imageBytesToEmbed);

                        if (embeddedImage) {
                            const page = pdfDoc.addPage();
                            const { width, height } = embeddedImage.scale(1);
                            page.setSize(width, height);
                            page.drawImage(embeddedImage, { x: 0, y: 0, width: width, height: height });
                            currentFileConvertedSuccessfully = true;
                        }
                    }
                // --- Document Conversion Logic (LibreOffice) ---
                } else if (toolType.endsWith('-to-pdf') && 
                           (fileMimeType === 'application/msword' || 
                            fileMimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                            fileMimeType === 'application/vnd.oasis.opendocument.text' || // .odt
                            fileMimeType === 'text/plain' || // .txt
                            fileMimeType === 'application/rtf' || // .rtf
                            fileMimeType === 'application/vnd.ms-excel' || 
                            fileMimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                            fileMimeType === 'application/vnd.oasis.opendocument.spreadsheet' || // .ods
                            fileMimeType === 'text/csv' || // .csv
                            fileMimeType === 'application/vnd.ms-powerpoint' || 
                            fileMimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
                            fileMimeType === 'application/vnd.oasis.opendocument.presentation' || // .odp
                            // Source code files (treat as plain text for LibreOffice)
                            fileExtension === '.c' || fileExtension === '.h' || 
                            fileExtension === '.cpp' || fileExtension === '.cxx' || fileExtension === '.cc' || fileExtension === '.hpp' || 
                            fileExtension === '.py' || fileExtension === '.css' || fileExtension === '.java' || fileExtension === '.js' ||
                            fileMimeType === 'message/rfc822' || fileExtension === '.eml' // EML with LibreOffice
                           )) {
                    console.log(`Converting document: ${originalFileName} using LibreOffice`);
                    const fileBuffer = await fs.readFile(inputFilePath);
                    // Use the new convertAsync function here
                    const pdfBuffer = await convertAsync(fileBuffer, '.pdf', undefined);
                    const externalPdfDoc = await PDFDocument.load(pdfBuffer);
                    const copiedPages = await pdfDoc.copyPages(externalPdfDoc, externalPdfDoc.getPageIndices());
                    copiedPages.forEach(page => pdfDoc.addPage(page));
                    currentFileConvertedSuccessfully = true;
                
                // --- HTML to PDF Conversion (Puppeteer) ---
                } else if (toolType === 'html-to-pdf' && (fileMimeType === 'text/html' || fileExtension === '.html' || fileExtension === '.htm')) {
                    console.log(`Converting HTML: ${originalFileName} using Puppeteer`);
                    let browser;
                    try {
                        browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
                        const page = await browser.newPage();
                        const htmlContent = await fs.readFile(inputFilePath, 'utf-8');
                        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
                        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
                        const externalPdfDoc = await PDFDocument.load(pdfBuffer);
                        const copiedPages = await pdfDoc.copyPages(externalPdfDoc, externalPdfDoc.getPageIndices());
                        copiedPages.forEach(page => pdfDoc.addPage(page));
                        currentFileConvertedSuccessfully = true;
                    } finally {
                        if (browser) await browser.close();
                    }
                // --- PS/EPS to PDF Conversion (Ghostscript) ---
                } else if ((toolType === 'ps-to-pdf' || toolType === 'eps-to-pdf') && 
                           (fileMimeType === 'application/postscript' || fileExtension === '.ps' || fileExtension === '.eps')) {
                    console.log(`Converting PostScript/EPS: ${originalFileName} using Ghostscript`);
                    const tempOutputForGs = path.join(path.dirname(inputFilePath), `${path.basename(originalFileName, fileExtension)}_gsconverted.pdf`);
                    const gsCommand = process.platform === 'win32' ? 'gswin64c' : 'gs'; // Ensure Ghostscript is in PATH
                    const command = `${gsCommand} -sDEVICE=pdfwrite -o "${tempOutputForGs}" -dNOPAUSE -dBATCH -f "${inputFilePath}"`;
                    
                    await new Promise((resolve, reject) => {
                        exec(command, (error, stdout, stderr) => {
                            if (error) {
                                console.error(`Ghostscript Error for ${originalFileName}: ${stderr || error.message}`);
                                return reject(new Error(`Ghostscript conversion failed for ${originalFileName}: ${stderr || error.message}`));
                            }
                            resolve(stdout);
                        });
                    });

                    if (await fs.pathExists(tempOutputForGs)) {
                        const pdfBuffer = await fs.readFile(tempOutputForGs);
                        const externalPdfDoc = await PDFDocument.load(pdfBuffer);
                        const copiedPages = await pdfDoc.copyPages(externalPdfDoc, externalPdfDoc.getPageIndices());
                        copiedPages.forEach(page => pdfDoc.addPage(page));
                        currentFileConvertedSuccessfully = true;
                        await fs.remove(tempOutputForGs); // Clean up GS temp output
                    } else {
                        console.warn(`Ghostscript conversion failed to produce output for ${originalFileName}`);
                    }
                // --- MSG to PDF Conversion (MsgReader) ---
                } else if (toolType === 'msg-to-pdf' && (fileMimeType === 'application/vnd.ms-outlook' || fileExtension === '.msg')) { // Fixed: imageMimeType -> fileMimeType
                    console.log(`Converting MSG: ${originalFileName}`);
                    const fileBuffer = await fs.readFile(inputFilePath);
                    const msgReader = new MsgReader(fileBuffer);
                    const msgData = msgReader.getFileData();
                    let contentToConvert = 'MSG content could not be fully extracted.';

                    if (msgData.body) {
                        contentToConvert = msgData.body;
                    } else if (msgData.rtfBody) {
                        // Basic RTF to text (very simplified)
                        contentToConvert = msgData.rtfBody.toString().replace(/\\pard[^\\}]*}/g, '').replace(/{\\[^}]+}/g, '').replace(/\\[a-zA-Z0-9]+ ?/g, '');
                    } else if (msgData.htmlBody) { // Prefer HTML body if available and no plain text body
                        const S = require('string');
                        contentToConvert = S(msgData.htmlBody).stripTags().s;
                    } else if (msgData.headers && msgData.headers.subject) {
                        contentToConvert = `Subject: ${msgData.headers.subject}\n\n(Body not extractable in plain text)`;
                    }

                    // Sanitize content for WinAnsiEncoding
                    // This will replace unsupported characters with a question mark.
                    // A more sophisticated approach might be needed for broader character support.
                    const winAnsiSafeContent = contentToConvert.split('').map(char => {
                        const code = char.charCodeAt(0);
                        // Basic check for common printable ASCII and some extended ASCII relevant to WinAnsi
                        // This is not a perfect WinAnsi check but aims to filter out problematic characters.
                        if (code >= 32 && code <= 126 || (code >= 160 && code <= 255)) {
                            // Characters like bullet (•, charCode 8226) are outside this simplified range
                            // and would need specific handling or a font that supports them.
                            // For now, we'll rely on pdf-lib's behavior for characters it can't encode with the chosen font.
                            // A simple replacement for truly problematic ones:
                            if (code === 8226) return '-'; // Replace bullet with hyphen for example
                            return char;
                        }
                        return '?'; // Replace unsupported characters
                    }).join('');
                    
                    const page = pdfDoc.addPage();
                    const { width, height } = page.getSize();
                    const font = await pdfDoc.embedFont(StandardFonts.Helvetica); // Or StandardFonts.TimesRoman
                    page.drawText(winAnsiSafeContent, {
                        x: 50,
                        y: height - 4 * 50, // Adjust starting Y position
                        size: 10,
                        font: font,
                        color: rgb(0, 0, 0),
                        maxWidth: width - 100,
                        lineHeight: 12
                    });
                    // Fix: Replace these lines
                    currentFileConvertedSuccessfully = true; // Instead of conversionPerformed and currentFileConverted
                    // --- ZIP to PDF Conversion ---
                    } else if (toolType === 'zip-to-pdf' && (fileMimeType === 'application/zip' || fileMimeType === 'application/x-zip-compressed' || fileExtension === '.zip')) {
                    console.log(`Processing ZIP file: ${originalFileName}`);
                    const tempExtractPath = path.join(path.dirname(inputFilePath), `temp_extract_${Date.now()}`);
                    await fs.ensureDir(tempExtractPath);
                    let atLeastOneFileInZipConverted = false;

                    try {
                        const zip = new AdmZip(inputFilePath);
                        const zipEntries = zip.getEntries();

                        for (const zipEntry of zipEntries) {
                            if (zipEntry.isDirectory) {
                                continue; // Skip directories
                            }

                            const entryName = zipEntry.entryName;
                            const entryExt = path.extname(entryName).toLowerCase();
                            const entryTempPath = path.join(tempExtractPath, entryName);
                            await fs.ensureDir(path.dirname(entryTempPath)); // Ensure sub-directories within zip are created
                            
                            // Extract the entry to a temporary file
                            await fs.writeFile(entryTempPath, zipEntry.getData());

                            console.log(`Processing ZIP entry: ${entryName}, Extension: ${entryExt}`);

                            try {
                                let entryConverted = false;
                                if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif'].includes(entryExt)) {
                                    let imageBytesToEmbed;
                                    let targetMimeForPdfLibEntry = '';

                                    if (entryExt === '.svg') { // Assuming SVG was meant to be image/svg+xml
                                        imageBytesToEmbed = await sharp(entryTempPath).png().toBuffer();
                                        targetMimeForPdfLibEntry = 'image/png';
                                    } else if (entryExt === '.gif') {
                                        imageBytesToEmbed = await sharp(entryTempPath, { animated: false }).png().toBuffer();
                                        targetMimeForPdfLibEntry = 'image/png';
                                    } else if (['.tiff', '.tif'].includes(entryExt)) {
                                        imageBytesToEmbed = await sharp(entryTempPath).png().toBuffer();
                                        targetMimeForPdfLibEntry = 'image/png';
                                    } else if (entryExt === '.webp') {
                                        imageBytesToEmbed = await sharp(entryTempPath).png().toBuffer();
                                        targetMimeForPdfLibEntry = 'image/png';
                                    } else if (['.jpg', '.jpeg'].includes(entryExt)) {
                                        imageBytesToEmbed = await fs.readFile(entryTempPath);
                                        targetMimeForPdfLibEntry = 'image/jpeg';
                                    } else if (entryExt === '.png') {
                                        imageBytesToEmbed = await fs.readFile(entryTempPath);
                                        targetMimeForPdfLibEntry = 'image/png';
                                    } else {
                                        // Fallback for other image types, attempt conversion to PNG
                                        imageBytesToEmbed = await sharp(entryTempPath).png().toBuffer();
                                        targetMimeForPdfLibEntry = 'image/png';
                                    }
                                    
                                    if (imageBytesToEmbed) {
                                        let embeddedImage;
                                        if (targetMimeForPdfLibEntry === 'image/png') embeddedImage = await pdfDoc.embedPng(imageBytesToEmbed);
                                        else if (targetMimeForPdfLibEntry === 'image/jpeg') embeddedImage = await pdfDoc.embedJpg(imageBytesToEmbed);

                                        if (embeddedImage) {
                                            const page = pdfDoc.addPage();
                                            const { width, height } = embeddedImage.scale(1);
                                            page.setSize(width, height);
                                            page.drawImage(embeddedImage, { x: 0, y: 0, width: width, height: height });
                                            entryConverted = true;
                                        }
                                    }
                                } else if (['.doc', '.docx', '.odt', '.txt', '.rtf', '.xls', '.xlsx', '.ods', '.csv', '.ppt', '.pptx', '.odp', '.c', '.h', '.cpp', '.py', '.css', '.java', '.js', '.eml'].some(ext => entryExt === ext)) {
                                    const fileBufferEntry = await fs.readFile(entryTempPath);
                                    const pdfBufferEntry = await convertAsync(fileBufferEntry, '.pdf', undefined);
                                    const externalPdfDocEntry = await PDFDocument.load(pdfBufferEntry);
                                    const copiedPagesEntry = await pdfDoc.copyPages(externalPdfDocEntry, externalPdfDocEntry.getPageIndices());
                                    copiedPagesEntry.forEach(page => pdfDoc.addPage(page));
                                    entryConverted = true;
                                } else if (['.html', '.htm'].includes(entryExt)) {
                                    let browser;
                                    try {
                                        browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
                                        const page = await browser.newPage();
                                        const htmlContent = await fs.readFile(entryTempPath, 'utf-8');
                                        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
                                        const pdfBufferEntry = await page.pdf({ format: 'A4', printBackground: true });
                                        const externalPdfDocEntry = await PDFDocument.load(pdfBufferEntry);
                                        const copiedPagesEntry = await pdfDoc.copyPages(externalPdfDocEntry, externalPdfDocEntry.getPageIndices());
                                        copiedPagesEntry.forEach(page => pdfDoc.addPage(page));
                                        entryConverted = true;
                                    } finally {
                                        if (browser) await browser.close();
                                    }
                                } else {
                                    console.warn(`Unsupported file type within ZIP: ${entryName}. Skipping.`);
                                }

                                if (entryConverted) {
                                    atLeastOneFileInZipConverted = true;
                                }

                            } catch (entryError) {
                                console.error(`Error processing ZIP entry ${entryName}:`, entryError.message, entryError.stack);
                            } finally {
                                // Clean up individual extracted file
                                if (await fs.pathExists(entryTempPath)) {
                                    await fs.remove(entryTempPath).catch(cleanupErr => console.error(`Failed to cleanup temp entry file ${entryTempPath}:`, cleanupErr.message));
                                }
                            }
                        } // End of for loop over zipEntries

                        if (atLeastOneFileInZipConverted) {
                            currentFileConvertedSuccessfully = true;
                        } else {
                            console.warn(`No convertible files found or processed within ZIP: ${originalFileName}`);
                        }

                    } catch (zipProcessingError) {
                        console.error(`Error processing ZIP file ${originalFileName}:`, zipProcessingError.message, zipProcessingError.stack);
                        // No throw here, let the main loop continue to the finally block for cleanup
                    } finally {
                        // Clean up the main extraction directory
                        if (await fs.pathExists(tempExtractPath)) {
                            await fs.remove(tempExtractPath).catch(cleanupErr => console.error(`Failed to cleanup temp extract directory ${tempExtractPath}:`, cleanupErr.message));
                        }
                    }
                } else {
                    console.warn(`Unsupported file type or tool combination for ${originalFileName}: Mimetype ${fileMimeType}, Tool ${toolType}, Extension ${fileExtension}. Skipping.`);
                }

                if(currentFileConvertedSuccessfully) {
                    successfullyProcessedFilesCount++;
                    originalFileNamesProcessed.push(originalFileName);
                    conversionPerformedOverall = true; // Mark that at least one file was processed for the final PDF
                }

            } catch (fileProcessingError) {
                console.error(`Error processing individual file ${originalFileName}:`, fileProcessingError.message, fileProcessingError.stack);
                // Optionally, collect errors per file to report to the user later
            } finally {
                // Clean up the uploaded temp file (from multer)
                if (inputFilePath && await fs.pathExists(inputFilePath)) {
                    await fs.remove(inputFilePath).catch(cleanupErr => console.error(`Failed to cleanup multer temp file ${inputFilePath}:`, cleanupErr.message));
                }
            }
        } // End of for loop over uploadedFiles

        if (!conversionPerformedOverall || pdfDoc.getPageCount() === 0) {
            // Clean up any partially created output file if no pages were added or no conversion happened
            if (outputFilePath && await fs.pathExists(outputFilePath)) {
                await fs.remove(outputFilePath).catch(err => console.error(`Error cleaning up empty output PDF: ${err.message}`));
            }
            if (res.headersSent) return; // Avoid sending multiple responses
            return res.status(400).json({ message: 'No files were successfully converted into the PDF. Please check file types and tool compatibility.' });
        }
        
        const finalPdfBytes = await pdfDoc.save();
        await fs.writeFile(outputFilePath, finalPdfBytes);
        console.log(`Successfully created PDF: ${outputFilePath} from ${successfullyProcessedFilesCount} file(s). Total pages: ${pdfDoc.getPageCount()}`);

        res.json({
            message: `${successfullyProcessedFilesCount} file(s) converted successfully! Total pages: ${pdfDoc.getPageCount()}.`,
            downloadPath: `/downloads/${path.basename(outputFilePath)}`, // Relative path for client
            outputFileName: path.basename(outputFilePath),
            originalNames: originalFileNamesProcessed, // Send back names of processed files
            filesProcessed: successfullyProcessedFilesCount,
            totalPages: pdfDoc.getPageCount()
        });

    } catch (error) {
        console.error('Critical error in conversion process:', error.message, error.stack);
        // General cleanup for any remaining temp files from multer if error happens outside loop
        for (const uploadedFile of uploadedFiles) {
            if (uploadedFile && uploadedFile.path && await fs.pathExists(uploadedFile.path)) {
                 fs.remove(uploadedFile.path).catch(err => console.error(`Failed to cleanup temp file ${uploadedFile.path} during error handling:`, err.message));
            }
        }
        // Clean up partially created output file on error
        if (outputFilePath && await fs.pathExists(outputFilePath)) {
            await fs.remove(outputFilePath).catch(err => console.error(`Error cleaning up output PDF on error: ${err.message}`));
        }
        if (!res.headersSent) {
            // Pass to the global error handler in server.js
            next(error); 
        }
    }
};

module.exports = { convertFileToPdf };
