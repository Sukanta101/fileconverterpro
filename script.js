document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const selectFile = document.getElementById('selectFile');
    const fromFormat = document.getElementById('fromFormat');
    const toFormat = document.getElementById('toFormat');
    const convertBtn = document.getElementById('convertBtn');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileType = document.getElementById('fileType');
    const conversionOptions = document.getElementById('conversionOptions');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');
    const progress = progressBar.querySelector('.progress');
    const downloadSection = document.getElementById('downloadSection');
    const downloadBtn = document.getElementById('downloadBtn');
    const conversionsList = document.getElementById('conversionsList');
    const typeButtons = document.querySelectorAll('.type-btn');
    const sections = document.querySelectorAll('.section-content');
    const toolCards = document.querySelectorAll('.tool-card');
    const pdfInput = document.getElementById('pdfInput');
    const audioInput = document.getElementById('audioInput');
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const errorOkBtn = document.getElementById('errorOkBtn');
    const closeBtn = document.querySelector('.close-btn');

    let currentFile = null;
    let convertedFile = null;
    let currentSection = 'general';

    // Supported formats and their categories
    const supportedFormats = {
        'document': ['pdf', 'doc', 'docx', 'txt', 'rtf'],
        'image': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
        'audio': ['mp3', 'wav', 'ogg', 'm4a'],
        'video': ['mp4', 'avi', 'mov', 'wmv']
    };

    // Format categories mapping
    const formatCategories = {
        'pdf': 'document',
        'doc': 'document',
        'docx': 'document',
        'txt': 'document',
        'rtf': 'document',
        'jpg': 'image',
        'jpeg': 'image',
        'png': 'image',
        'gif': 'image',
        'bmp': 'image',
        'webp': 'image',
        'mp3': 'audio',
        'wav': 'audio',
        'ogg': 'audio',
        'm4a': 'audio',
        'mp4': 'video',
        'avi': 'video',
        'mov': 'video',
        'wmv': 'video'
    };

    // Event Listeners
    selectFile.addEventListener('click', handleFileButtonClick);
    fileInput.addEventListener('change', handleFileSelect);
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    convertBtn.addEventListener('click', handleConversion);
    downloadBtn.addEventListener('click', handleDownload);
    toFormat.addEventListener('change', handleFormatChange);
    errorOkBtn.addEventListener('click', closeErrorModal);
    closeBtn.addEventListener('click', closeErrorModal);

    // Tab switching
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            typeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${type}Section`) {
                    section.classList.add('active');
                }
            });
            currentSection = type;
            resetUI();
        });
    });

    // Tool card click handlers
    toolCards.forEach(card => {
        card.addEventListener('click', () => {
            const tool = card.dataset.tool;
            if (currentSection === 'pdf') {
                pdfInput.click();
            } else if (currentSection === 'audio') {
                audioInput.click();
            }
        });
    });

    // File Selection Handlers
    function handleFileButtonClick() {
        switch (currentSection) {
            case 'general':
                fileInput.click();
                break;
            case 'pdf':
                pdfInput.click();
                break;
            case 'audio':
                audioInput.click();
                break;
        }
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            processFile(file);
        }
    }

    // File Processing
    function processFile(file) {
        const fileExt = file.name.split('.').pop().toLowerCase();
        
        if (!formatCategories[fileExt]) {
            showError(`Unsupported file format: ${fileExt}`);
            return;
        }

        currentFile = file;
        dropZone.classList.add('has-file');
        
        // Update file info
        fileName.textContent = `Name: ${file.name}`;
        fileSize.textContent = `Size: ${formatFileSize(file.size)}`;
        fileType.textContent = `Type: ${file.type || 'Unknown'}`;
        fileInfo.style.display = 'block';
        
        // Update conversion options
        updateFormatSelections(fileExt);
        conversionOptions.style.display = 'block';
    }

    // Format Selection Handlers
    function updateFormatSelections(currentFormat) {
        fromFormat.innerHTML = '';
        toFormat.innerHTML = '';

        // Set current format
        const option = document.createElement('option');
        option.value = currentFormat;
        option.textContent = currentFormat.toUpperCase();
        fromFormat.appendChild(option);
        fromFormat.disabled = true;

        // Get compatible formats
        const category = formatCategories[currentFormat];
        if (category) {
            toFormat.innerHTML = '<option value="">Select Format</option>';
            supportedFormats[category]
                .filter(format => format !== currentFormat)
                .forEach(format => {
                    const option = document.createElement('option');
                    option.value = format;
                    option.textContent = format.toUpperCase();
                    toFormat.appendChild(option);
                });
        }

        convertBtn.disabled = true;
    }

    function handleFormatChange() {
        convertBtn.disabled = !toFormat.value;
    }

    // Conversion Handlers
    async function handleConversion() {
        if (!currentFile || !toFormat.value) {
            showError('Please select a file and conversion format');
            return;
        }

        try {
            showProgress('Starting conversion...');
            const sourceFormat = fromFormat.value.toLowerCase();
            const targetFormat = toFormat.value.toLowerCase();
            
            let result;
            switch (formatCategories[sourceFormat]) {
                case 'document':
                    result = await handleDocumentConversion(currentFile, sourceFormat, targetFormat);
                    break;
                case 'image':
                    result = await handleImageConversion(currentFile, sourceFormat, targetFormat);
                    break;
                case 'audio':
                    result = await handleAudioConversion(currentFile, targetFormat);
                    break;
                case 'video':
                    result = await handleVideoConversion(currentFile, targetFormat);
                    break;
                default:
                    throw new Error('Unsupported conversion type');
            }

            if (result) {
                convertedFile = result;
                updateProgress(100);
                await addToRecentConversions(currentFile.name, sourceFormat, targetFormat);
                showDownloadButton();
            } else {
                throw new Error('Conversion failed');
            }
        } catch (error) {
            showError(error.message || 'Conversion failed. Please try again.');
        } finally {
            hideProgress();
        }
    }

    // Conversion Type Handlers
    async function handleDocumentConversion(file, sourceFormat, targetFormat) {
        updateProgress(0);
        // Simulate document conversion
        await simulateProgress();
        const newFileName = file.name.split('.')[0] + '.' + targetFormat;
        return new File([file], newFileName, { type: getMimeType(targetFormat) });
    }

    async function handleImageConversion(file, sourceFormat, targetFormat) {
        updateProgress(0);
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        const newFileName = file.name.split('.')[0] + '.' + targetFormat;
                        updateProgress(100);
                        resolve(new File([blob], newFileName, { type: getMimeType(targetFormat) }));
                    } else {
                        reject(new Error('Image conversion failed'));
                    }
                }, getMimeType(targetFormat));
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }

    async function handleAudioConversion(file, targetFormat) {
        updateProgress(0);
        // Simulate audio conversion
        await simulateProgress();
        const newFileName = file.name.split('.')[0] + '.' + targetFormat;
        return new File([file], newFileName, { type: getMimeType(targetFormat) });
    }

    async function handleVideoConversion(file, targetFormat) {
        updateProgress(0);
        // Simulate video conversion
        await simulateProgress();
        const newFileName = file.name.split('.')[0] + '.' + targetFormat;
        return new File([file], newFileName, { type: getMimeType(targetFormat) });
    }

    // Download Handler
    function handleDownload() {
        if (convertedFile) {
            const url = URL.createObjectURL(convertedFile);
            const a = document.createElement('a');
            a.href = url;
            a.download = convertedFile.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    // UI Helpers
    function showProgress(text) {
        progressText.textContent = text;
        progressContainer.style.display = 'block';
        downloadSection.style.display = 'none';
    }

    function updateProgress(percent) {
        progress.style.width = `${percent}%`;
        progressPercent.textContent = `${percent}%`;
    }

    function hideProgress() {
        progressContainer.style.display = 'none';
    }

    function showDownloadButton() {
        downloadSection.style.display = 'block';
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorModal.style.display = 'block';
    }

    function closeErrorModal() {
        errorModal.style.display = 'none';
    }

    async function simulateProgress() {
        let progress = 0;
        const interval = 100;
        
        return new Promise(resolve => {
            const timer = setInterval(() => {
                progress += Math.random() * 20;
                if (progress > 90) {
                    clearInterval(timer);
                    updateProgress(100);
                    resolve();
                } else {
                    updateProgress(Math.min(90, progress));
                }
            }, interval);
        });
    }

    // Utility Functions
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function getMimeType(extension) {
        const mimeTypes = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain',
            'rtf': 'application/rtf',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'webp': 'image/webp',
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'm4a': 'audio/mp4',
            'mp4': 'video/mp4',
            'avi': 'video/x-msvideo',
            'mov': 'video/quicktime',
            'wmv': 'video/x-ms-wmv'
        };
        return mimeTypes[extension] || 'application/octet-stream';
    }

    async function addToRecentConversions(fileName, fromFormat, toFormat) {
        const conversion = {
            fileName,
            fromFormat,
            toFormat,
            date: new Date().toLocaleString()
        };

        let recentConversions = JSON.parse(localStorage.getItem('recentConversions')) || [];
        recentConversions.unshift(conversion);
        if (recentConversions.length > 5) {
            recentConversions.pop();
        }
        localStorage.setItem('recentConversions', JSON.stringify(recentConversions));
        updateRecentConversionsList();
    }

    function updateRecentConversionsList() {
        const recentConversions = JSON.parse(localStorage.getItem('recentConversions')) || [];
        conversionsList.innerHTML = '';
        
        recentConversions.forEach(conversion => {
            const item = document.createElement('div');
            item.className = 'conversion-item';
            item.innerHTML = `
                <div>
                    <strong>${conversion.fileName}</strong>
                    <p>${conversion.fromFormat.toUpperCase()} → ${conversion.toFormat.toUpperCase()}</p>
                </div>
                <small>${conversion.date}</small>
            `;
            conversionsList.appendChild(item);
        });
    }

    function resetUI() {
        currentFile = null;
        convertedFile = null;
        dropZone.classList.remove('has-file', 'dragover');
        fileInput.value = '';
        fileInfo.style.display = 'none';
        conversionOptions.style.display = 'none';
        progressContainer.style.display = 'none';
        downloadSection.style.display = 'none';
    }

    // Initialize
    updateRecentConversionsList();
});
