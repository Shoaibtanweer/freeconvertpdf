const fs = require('fs-extra');
const path = require('path');
const libre = require('libreoffice-convert');

async function testConversion() {
    const testFilePath = path.join(__dirname, 'test_document.txt');
    const outputPdfPath = path.join(__dirname, 'test_document_output.pdf');
    
    // Ensure the dummy file exists
    if (!await fs.exists(testFilePath)) {
        await fs.writeFile(testFilePath, 'This is a simple test.');
        console.log(`Created dummy file: ${testFilePath}`);
    }

    try {
        console.log(`Reading file: ${testFilePath}`);
        const docxBuf = await fs.readFile(testFilePath);
        console.log('File buffer read. Starting conversion...');
        
        // Promisify the convert function directly if the built-in async is problematic
        const convertAsync = (buffer, format, filter) => {
            return new Promise((resolve, reject) => {
                libre.convert(buffer, format, filter, (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(result);
                });
            });
        };

        const pdfBuf = await convertAsync(docxBuf, '.pdf', undefined);
        console.log('Conversion to PDF buffer supposedly successful. Writing to file...');
        await fs.writeFile(outputPdfPath, pdfBuf);
        console.log(`Conversion successful! Output at: ${outputPdfPath}`);
    } catch (error) {
        console.error('Standalone LibreOffice Conversion failed:', error);
    } finally {
        // Clean up the dummy test file
        // if (await fs.exists(testFilePath)) {
        //     await fs.remove(testFilePath);
        // }
    }
}

testConversion();