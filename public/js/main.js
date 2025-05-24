// public/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const tools = [
        // Keeping your existing tools array. Ensure 'id' matches backend expectations.
        { id: 'jpg-to-pdf', name: 'JPG to PDF', description: 'Convert JPG images to PDF documents.', icon: 'fa-file-image', supportedInputTypes: ['.jpg', '.jpeg'], inputAccept: 'image/jpeg' },
        { id: 'png-to-pdf', name: 'PNG to PDF', description: 'Convert PNG images to PDF documents.', icon: 'fa-file-image', supportedInputTypes: ['.png'], inputAccept: 'image/png' },
        { id: 'gif-to-pdf', name: 'GIF to PDF', description: 'Convert GIF images to PDF documents.', icon: 'fa-file-image', supportedInputTypes: ['.gif'], inputAccept: 'image/gif' },
        { id: 'svg-to-pdf', name: 'SVG to PDF', description: 'Convert SVG images to PDF documents.', icon: 'fa-file-image', supportedInputTypes: ['.svg'], inputAccept: 'image/svg+xml' },
        { id: 'tiff-to-pdf', name: 'TIFF to PDF', description: 'Convert TIFF images to PDF documents.', icon: 'fa-file-image', supportedInputTypes: ['.tiff', '.tif'], inputAccept: 'image/tiff' },
        { id: 'doc-to-pdf', name: 'Word to PDF', description: 'Convert DOC & DOCX files to PDF.', icon: 'fa-file-word', supportedInputTypes: ['.doc', '.docx'], inputAccept: '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { id: 'odt-to-pdf', name: 'ODT to PDF', description: 'Convert ODT files to PDF.', icon: 'fa-file-alt', supportedInputTypes: ['.odt'], inputAccept: '.odt,application/vnd.oasis.opendocument.text' },
        { id: 'rtf-to-pdf', name: 'RTF to PDF', description: 'Convert RTF files to PDF.', icon: 'fa-file-alt', supportedInputTypes: ['.rtf'], inputAccept: '.rtf,application/rtf' },
        { id: 'txt-to-pdf', name: 'Text to PDF', description: 'Convert TXT files to PDF.', icon: 'fa-file-alt', supportedInputTypes: ['.txt'], inputAccept: 'text/plain' },
        { id: 'ppt-to-pdf', name: 'PowerPoint to PDF', description: 'Convert PPT & PPTX files to PDF.', icon: 'fa-file-powerpoint', supportedInputTypes: ['.ppt', '.pptx'], inputAccept: '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation' },
        { id: 'odp-to-pdf', name: 'ODP to PDF', description: 'Convert ODP (OpenDocument Presentation) files to PDF.', icon: 'fa-file-powerpoint', supportedInputTypes: ['.odp'], inputAccept: 'application/vnd.oasis.opendocument.presentation,.odp' },
        { id: 'xls-to-pdf', name: 'Excel to PDF', description: 'Convert XLS & XLSX files to PDF.', icon: 'fa-file-excel', supportedInputTypes: ['.xls', '.xlsx'], inputAccept: '.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        { id: 'ods-to-pdf', name: 'ODS to PDF', description: 'Convert ODS (OpenDocument Spreadsheet) files to PDF.', icon: 'fa-file-excel', supportedInputTypes: ['.ods'], inputAccept: 'application/vnd.oasis.opendocument.spreadsheet,.ods' },
        { id: 'csv-to-pdf', name: 'CSV to PDF', description: 'Convert CSV (Comma Separated Values) files to PDF.', icon: 'fa-file-csv', supportedInputTypes: ['.csv'], inputAccept: 'text/csv,.csv' },
        { id: 'cpp-to-pdf', name: 'C++ to PDF', description: 'Convert C++ source files to PDF.', icon: 'fa-file-code', supportedInputTypes: ['.cpp', '.cxx', '.cc', '.h', '.hpp'], inputAccept: 'text/x-c++src,text/x-c,text/x-chdr,.cpp,.cxx,.cc,.h,.hpp' },
        { id: 'py-to-pdf', name: 'Python to PDF', description: 'Convert Python source files to PDF.', icon: 'fa-file-code', supportedInputTypes: ['.py'], inputAccept: 'text/x-python,.py' },
        { id: 'css-to-pdf', name: 'CSS to PDF', description: 'Convert CSS files to PDF.', icon: 'fa-file-code', supportedInputTypes: ['.css'], inputAccept: 'text/css,.css' },
        { id: 'eml-to-pdf', name: 'EML to PDF', description: 'Convert EML email files to PDF.', icon: 'fa-envelope', supportedInputTypes: ['.eml'], inputAccept: 'message/rfc822,.eml' },
        { id: 'html-to-pdf', name: 'HTML to PDF', description: 'Convert HTML files to PDF.', icon: 'fa-file-code', supportedInputTypes: ['.html', '.htm'], inputAccept: 'text/html' },
        { id: 'ps-to-pdf', name: 'PS to PDF', description: 'Convert PostScript files to PDF.', icon: 'fa-file-invoice', supportedInputTypes: ['.ps'], inputAccept: 'application/postscript,.ps' },
        { id: 'eps-to-pdf', name: 'EPS to PDF', description: 'Convert EPS files to PDF.', icon: 'fa-file-invoice', supportedInputTypes: ['.eps'], inputAccept: 'application/postscript,.eps' },
        { id: 'msg-to-pdf', name: 'MSG to PDF', description: 'Convert MSG email files to PDF.', icon: 'fa-envelope', supportedInputTypes: ['.msg'], inputAccept: 'application/vnd.ms-outlook,.msg' },
        { id: 'zip-to-pdf', name: 'ZIP to PDF', description: 'Extract and convert files in ZIP to PDF.', icon: 'fa-file-archive', supportedInputTypes: ['.zip'], inputAccept: 'application/zip,.zip' }
    ];

    let currentSelectedTool = null;
    let uploadedFiles = [];

    // --- Element Selectors ---
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const mobileDarkModeToggle = document.getElementById('mobile-dark-mode-toggle');
    const htmlElement = document.documentElement;
    const toolsDropdownButton = document.getElementById('tools-dropdown-button');
    const toolsDropdownMenu = document.getElementById('tools-dropdown-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileToolsDropdownButton = document.getElementById('mobile-tools-dropdown-button');
    const mobileToolsDropdownMenu = document.getElementById('mobile-tools-dropdown-menu');

    const toolsGrid = document.getElementById('tools-grid');
    const uploadSection = document.getElementById('upload-section');
    const uploadSectionTitle = document.getElementById('upload-section-title');
    const dragDropArea = document.getElementById('drag-drop-area');
    const fileInput = document.getElementById('file-input');
    const filePreviewArea = document.getElementById('file-preview-area');
    const conversionOptions = document.getElementById('conversion-options');
    const outputPdfNameInput = document.getElementById('output-pdf-name');
    const convertButton = document.getElementById('convert-button');
    
    // Processing Indicator Elements
    const processingIndicator = document.getElementById('processing-indicator');
    const processingBar = document.getElementById('processing-bar');
    const processingMessage = document.getElementById('processing-message');
    const loadingSpinner = document.getElementById('loading-spinner'); // Keep this for general loading if needed

    const resultSection = document.getElementById('result-section');
    const downloadPdfButton = document.getElementById('download-pdf-button');
    const clearButton = document.getElementById('clear-button');
    const currentYearSpan = document.getElementById('current-year');
    const fileTypesInfo = document.getElementById('file-types-info');
    const conversionSuccessMessage = document.getElementById('conversion-success-message');

    // --- Dark Mode --- (Assuming this logic is correct and working)
    const applyDarkModePreference = () => {
        const sunIcon = `<i class="fas fa-sun"></i>`;
        const moonIcon = `<i class="fas fa-moon"></i>`;
        const sunIconMobile = `<i class="fas fa-sun inline-block mr-2"></i> Light Mode`;
        const moonIconMobile = `<i class="fas fa-moon inline-block mr-2"></i> Dark Mode`;

        if (localStorage.getItem('darkMode') === 'true' ||
            (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            htmlElement.classList.add('dark');
            if(darkModeToggle) darkModeToggle.innerHTML = sunIcon;
            if(mobileDarkModeToggle) mobileDarkModeToggle.innerHTML = sunIconMobile;
        } else {
            htmlElement.classList.remove('dark');
            if(darkModeToggle) darkModeToggle.innerHTML = moonIcon;
            if(mobileDarkModeToggle) mobileDarkModeToggle.innerHTML = moonIconMobile;
        }
    };
    const toggleDarkMode = () => {
        htmlElement.classList.toggle('dark');
        const isDarkMode = htmlElement.classList.contains('dark');
        localStorage.setItem('darkMode', isDarkMode);
        applyDarkModePreference();
    };
    if (darkModeToggle) darkModeToggle.addEventListener('click', toggleDarkMode);
    if (mobileDarkModeToggle) mobileDarkModeToggle.addEventListener('click', toggleDarkMode);
    applyDarkModePreference();

    // --- Navigation --- (Assuming this logic is correct and working)
    if (toolsDropdownButton) {
        toolsDropdownButton.addEventListener('click', () => {
            if (toolsDropdownMenu) toolsDropdownMenu.classList.toggle('hidden');
        });
    }
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            if (mobileMenu) mobileMenu.classList.toggle('hidden');
        });
    }
    if (mobileToolsDropdownButton) {
        mobileToolsDropdownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (mobileToolsDropdownMenu) mobileToolsDropdownMenu.classList.toggle('hidden');
        });
    }
    document.addEventListener('click', (event) => {
        if (toolsDropdownButton && toolsDropdownMenu && !toolsDropdownButton.contains(event.target) && !toolsDropdownMenu.contains(event.target)) {
            toolsDropdownMenu.classList.add('hidden');
        }
        if (mobileMenuButton && mobileMenu && mobileToolsDropdownButton && mobileToolsDropdownMenu) {
            if (!mobileMenuButton.contains(event.target) && !mobileMenu.contains(event.target) &&
                !mobileToolsDropdownButton.contains(event.target) && !mobileToolsDropdownMenu.contains(event.target)) {
                mobileMenu.classList.add('hidden');
                mobileToolsDropdownMenu.classList.add('hidden');
            }
        }
    });

    // --- Populate Tools --- (Assuming this logic is correct and working)
    function populateTools() {
        if (!toolsGrid || !toolsDropdownMenu || !mobileToolsDropdownMenu) return;
        toolsGrid.innerHTML = '';
        toolsDropdownMenu.innerHTML = '';
        mobileToolsDropdownMenu.innerHTML = '';
        tools.forEach(tool => {
            const card = document.createElement('div');
            card.className = 'tool-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer';
            card.dataset.toolId = tool.id;
            card.innerHTML = `
                <div class="flex items-center justify-center mb-4 text-blue-500 dark:text-blue-400 text-3xl">
                   <i class="fas ${tool.icon || 'fa-tools'}"></i>
                </div>
                <h3 class="text-xl font-semibold mb-2 text-center text-gray-800 dark:text-gray-200">${tool.name}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 text-center">${tool.description}</p>
            `;
            card.addEventListener('click', () => selectTool(tool));
            toolsGrid.appendChild(card);
            const dropdownItem = document.createElement('a');
            dropdownItem.href = '#upload-section';
            dropdownItem.className = 'block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700';
            dropdownItem.textContent = tool.name;
            dropdownItem.addEventListener('click', (e) => {
                e.preventDefault();
                selectTool(tool);
                toolsDropdownMenu.classList.add('hidden');
            });
            toolsDropdownMenu.appendChild(dropdownItem);
            const mobileDropdownItem = document.createElement('a');
            mobileDropdownItem.href = '#upload-section';
            mobileDropdownItem.className = 'block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700';
            mobileDropdownItem.textContent = tool.name;
            mobileDropdownItem.addEventListener('click', (e) => {
                e.preventDefault();
                selectTool(tool);
                if (mobileToolsDropdownMenu) mobileToolsDropdownMenu.classList.add('hidden');
                if (mobileMenu) mobileMenu.classList.add('hidden');
            });
            mobileToolsDropdownMenu.appendChild(mobileDropdownItem);
        });
    }
    populateTools();
    
    // --- Tool Selection ---
    function selectTool(tool) {
        currentSelectedTool = tool;
        if(uploadSectionTitle) uploadSectionTitle.textContent = `Convert ${tool.name}`;
        if(fileTypesInfo) fileTypesInfo.textContent = `Supported file types: ${tool.supportedInputTypes.join(', ')}`;
        if(fileInput) fileInput.accept = tool.inputAccept || '';
        resetUploadArea();
        if(uploadSection) uploadSection.scrollIntoView({ behavior: 'smooth' });
        if(dragDropArea) dragDropArea.classList.remove('hidden');
        if(fileInput) fileInput.multiple = true;
    }

    // --- File Handling --- (Assuming this logic is generally correct)
    if (dragDropArea) {
        dragDropArea.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); dragDropArea.classList.add('drag-over'); });
        dragDropArea.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); dragDropArea.classList.remove('drag-over'); });
        dragDropArea.addEventListener('drop', (e) => { e.preventDefault(); e.stopPropagation(); dragDropArea.classList.remove('drag-over'); handleFiles(e.dataTransfer.files); });
        dragDropArea.addEventListener('click', () => { if (fileInput) fileInput.click(); });
    }
    if (fileInput) {
        fileInput.addEventListener('change', (e) => { handleFiles(e.target.files); });
    }

    function handleFiles(files) {
        if (!currentSelectedTool) {
            alert('Please select a conversion tool first!');
            return;
        }
        const newFiles = Array.from(files).filter(file => {
            const extension = `.${file.name.split('.').pop().toLowerCase()}`;
            if (currentSelectedTool.supportedInputTypes.includes(extension)) {
                return true;
            } else {
                console.warn(`File type ${extension} not supported for ${currentSelectedTool.name}. File: ${file.name}`);
                return false;
            }
        });
        if (newFiles.length === 0 && files.length > 0) {
             alert(`None of the selected files are supported for ${currentSelectedTool.name}. Supported types: ${currentSelectedTool.supportedInputTypes.join(', ')}`);
        }
        newFiles.forEach(file => {
            if (!uploadedFiles.find(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)) {
                 uploadedFiles.push(file);
                 addFilePreview(file);
            }
        });
        if (fileInput) fileInput.value = '';
        if (uploadedFiles.length > 0) {
            if(conversionOptions) conversionOptions.classList.remove('hidden');
            if(dragDropArea) dragDropArea.classList.add('hidden');
        } else {
            if(conversionOptions) conversionOptions.classList.add('hidden');
            if(dragDropArea) dragDropArea.classList.remove('hidden');
        }
    }

    function addFilePreview(file) {
        if (!filePreviewArea) return;
        const previewId = `file-${Date.now()}-${Math.random().toString(36).substring(2,9)}`;
        const previewElement = document.createElement('div');
        previewElement.id = previewId;
        previewElement.className = 'file-preview-item flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md shadow';
        let iconClass = 'fas fa-file-alt';
        if (file.type.startsWith('image/')) iconClass = 'fas fa-file-image';
        else if (file.type.includes('word')) iconClass = 'fas fa-file-word';
        else if (file.type.includes('excel') || file.type.includes('spreadsheet')) iconClass = 'fas fa-file-excel';
        else if (file.type.includes('powerpoint') || file.type.includes('presentation')) iconClass = 'fas fa-file-powerpoint';
        else if (file.type.includes('pdf')) iconClass = 'fas fa-file-pdf';
        else if (file.type.includes('zip') || file.type.includes('archive')) iconClass = 'fas fa-file-archive';
        previewElement.innerHTML = `
            <div class="flex items-center space-x-3 overflow-hidden">
                <i class="${iconClass} text-xl text-blue-500 dark:text-blue-400 flex-shrink-0"></i>
                <div class="overflow-hidden">
                    <p class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate" title="${file.name}">${file.name}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">${(file.size / 1024).toFixed(2)} KB</p>
                </div>
            </div>
            <button data-preview-id="${previewId}" class="remove-file-btn text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 flex-shrink-0 ml-2">
                <i class="fas fa-times-circle"></i>
            </button>
        `;
        filePreviewArea.appendChild(previewElement);
        previewElement.querySelector('.remove-file-btn').addEventListener('click', () => {
            uploadedFiles = uploadedFiles.filter(f => !(f.name === file.name && f.size === file.size && f.lastModified === file.lastModified));
            document.getElementById(previewId).remove();
            if (uploadedFiles.length === 0) {
                if(conversionOptions) conversionOptions.classList.add('hidden');
                if(dragDropArea) dragDropArea.classList.remove('hidden');
            }
        });
    }

    // --- Manage Processing Indicator ---
    function showProcessing(message = "Processing files, please wait...") {
        if (processingIndicator) processingIndicator.classList.remove('hidden');
        if (processingBar) processingBar.style.width = '0%'; // Reset
        if (processingMessage) {
            processingMessage.textContent = message;
            processingMessage.classList.remove('hidden');
        }
        // Simulate progress for demo - replace with actual progress if possible
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (processingBar) processingBar.style.width = `${progress}%`;
            if (progress >= 100) {
                clearInterval(interval);
                 // You might want to change message here or let the conversion result handle it
            }
        }, 200); // Adjust timing for simulation
        return interval; // Return interval to clear it upon completion/error
    }

    function hideProcessing(intervalId) {
        if (intervalId) clearInterval(intervalId);
        if (processingIndicator) processingIndicator.classList.add('hidden');
        if (processingMessage) processingMessage.classList.add('hidden');
        if (processingBar) processingBar.style.width = '0%';
    }


    // --- Conversion Process (Frontend to Backend) ---
    if (convertButton) {
        convertButton.addEventListener('click', async () => {
            if (uploadedFiles.length === 0) {
                alert('Please upload at least one file to convert.');
                return;
            }
            if (!currentSelectedTool) {
                alert('Tool not selected. Please select a tool.');
                return;
            }

            if(conversionOptions) conversionOptions.classList.add('hidden');
            // if(loadingSpinner) loadingSpinner.classList.remove('hidden'); // Use new indicator
            if(resultSection) resultSection.classList.add('hidden');
            
            const progressInterval = showProcessing(`Converting ${uploadedFiles.length} file(s) using ${currentSelectedTool.name}...`);

            const outputName = outputPdfNameInput.value.trim() || `converted_output_${Date.now()}`;            
            const formData = new FormData();
            
            uploadedFiles.forEach(file => {
                formData.append('files', file); // 'files' must match backend (multer fieldname for array)
            });
            formData.append('outputPdfName', outputName);
            // formData.append('toolType', currentSelectedTool.id); // Backend will use req.params.toolType

            try {
                const response = await fetch(`/api/convert/${currentSelectedTool.id}`, {
                    method: 'POST',
                    body: formData,
                });

                hideProcessing(progressInterval);
                // if(loadingSpinner) loadingSpinner.classList.add('hidden');

                if (!response.ok) {
                    let errorData = { message: `HTTP error! status: ${response.status}`};
                    try {
                        errorData = await response.json();
                    } catch (e) {
                        console.warn("Could not parse error response as JSON.", e);
                        // errorData.message is already set
                    }
                    const errorMessage = `Conversion failed: ${errorData.message || response.statusText}. Please try again or check file compatibility.`;
                    console.error('API Error:', errorData);
                    throw new Error(errorMessage);
                }

                const result = await response.json();
                console.log('Conversion result:', result);

                if(conversionSuccessMessage) {
                    conversionSuccessMessage.textContent = result.message || `Successfully converted to '${result.outputFileName}'.`;
                }
                if(resultSection) resultSection.classList.remove('hidden');

                if (downloadPdfButton && result.downloadPath) {
                    downloadPdfButton.onclick = () => {
                        const a = document.createElement('a');
                        a.href = result.downloadPath; // This should be the full path like /downloads/filename.pdf
                        a.download = result.outputFileName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    };
                } else if (!result.downloadPath) {
                     console.warn("Download path not provided in server response.");
                     if(conversionSuccessMessage) conversionSuccessMessage.textContent += " (Download link missing)";
                }

            } catch (error) {
                hideProcessing(progressInterval);
                // if(loadingSpinner) loadingSpinner.classList.add('hidden');
                if(conversionOptions) conversionOptions.classList.remove('hidden');
                console.error('Error during conversion fetch:', error);
                alert(`An error occurred: ${error.message}. Check console for more details.`);
                if(conversionSuccessMessage && resultSection) { // Show error in the result area too
                    resultSection.classList.remove('hidden');
                    conversionSuccessMessage.classList.add("text-red-500", "dark:text-red-400");
                    conversionSuccessMessage.classList.remove("text-green-600", "dark:text-green-400");
                    conversionSuccessMessage.textContent = `Error: ${error.message}`;
                    if(downloadPdfButton) downloadPdfButton.classList.add('hidden'); // Hide download if error
                }
            }
        });
    }

    // --- Clear Button ---
    if (clearButton) {
        clearButton.addEventListener('click', resetUploadArea);
    }

    function resetUploadArea() {
        uploadedFiles = [];
        if(filePreviewArea) filePreviewArea.innerHTML = '';
        if(outputPdfNameInput) outputPdfNameInput.value = '';
        if(conversionOptions) conversionOptions.classList.add('hidden');
        // if(loadingSpinner) loadingSpinner.classList.add('hidden');
        hideProcessing(); // Ensure any active processing indicator is cleared
        if(resultSection) resultSection.classList.add('hidden');
        if(fileInput) fileInput.value = '';

        // Reset success message styling and hide download button
        if (conversionSuccessMessage) {
            conversionSuccessMessage.classList.remove("text-red-500", "dark:text-red-400");
            conversionSuccessMessage.classList.add("text-green-600", "dark:text-green-400");
        }
        if(downloadPdfButton) downloadPdfButton.classList.remove('hidden');


        if (currentSelectedTool) {
            if(dragDropArea) dragDropArea.classList.remove('hidden');
        } else {
            if(uploadSectionTitle) uploadSectionTitle.textContent = 'Select a Tool Above to Get Started';
            if(fileTypesInfo) fileTypesInfo.textContent = '';
            if(dragDropArea) dragDropArea.classList.add('hidden');
        }
    }

    // --- Footer Year ---
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Initial state for upload section
    if (!currentSelectedTool) {
        if(dragDropArea) dragDropArea.classList.add('hidden');
        if(conversionOptions) conversionOptions.classList.add('hidden');
        if(uploadSectionTitle) uploadSectionTitle.textContent = 'Select a Tool Above to Get Started';
    }
});
