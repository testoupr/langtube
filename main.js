/**
 * Main JavaScript file for YouTube Transcript Extractor
 * Handles UI interactions and coordinates with transcript extraction module
 */

// DOM element references - cached for better performance
const elements = {
    urlForm: document.getElementById('urlForm'),
    youtubeUrl: document.getElementById('youtubeUrl'),
    extractBtn: document.getElementById('extractBtn'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    resultsSection: document.getElementById('resultsSection'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText')
};

// Global variable to store the extracted transcript
let extractedTranscript = null;

/**
 * Initialize the application
 * Sets up event listeners and initial state
 */
function initializeApp() {
    // Add form submission event listener
    elements.urlForm.addEventListener('submit', handleFormSubmission);
    
    // Add input validation on URL change
    elements.youtubeUrl.addEventListener('input', validateYouTubeUrl);
    
    console.log('YouTube Transcript Extractor initialized');
}

/**
 * Handle form submission
 * Validates URL and triggers transcript extraction
 * @param {Event} event - Form submission event
 */
async function handleFormSubmission(event) {
    event.preventDefault(); // Prevent default form submission
    
    const url = elements.youtubeUrl.value.trim();
    
    // Validate URL before proceeding
    if (!isValidYouTubeUrl(url)) {
        showError('Please enter a valid YouTube URL');
        return;
    }
    
    try {
        // Show loading state
        showLoadingState();
        
        // Extract video ID from URL
        const videoId = extractVideoId(url);
        
        // Call transcript extraction module
        const transcript = await TranscriptExtractor.extractTranscript(videoId);
        
        // Store transcript in global variable
        extractedTranscript = transcript;
        
        // Also store in the transcript extractor module
        // (This ensures the transcript is available in both places)
        
        // Log transcript to console for debugging
        console.log('Extracted transcript stored in extractedTranscript variable:', transcript);
        console.log('You can access it via: extractedTranscript');
        console.log('Or via: TranscriptExtractor.getStoredTranscript()');
        
        // Display success message
        displaySuccess();
        
    } catch (error) {
        console.error('Error extracting transcript:', error);
        showError(error.message || 'Failed to extract transcript. Please try again.');
    }
}

/**
 * Validate YouTube URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid YouTube URL
 */
function isValidYouTubeUrl(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(url);
}

/**
 * Extract video ID from YouTube URL
 * Supports both youtube.com and youtu.be formats
 * @param {string} url - YouTube URL
 * @returns {string} - Video ID
 */
function extractVideoId(url) {
    const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
    
    // Handle youtu.be format
    if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.substring(1);
    }
    
    // Handle youtube.com format
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
        return urlObj.searchParams.get('v');
    }
    
    throw new Error('Invalid YouTube URL format');
}

/**
 * Show loading state with spinner
 */
function showLoadingState() {
    // Hide other elements
    elements.resultsSection.classList.add('hidden');
    elements.errorMessage.classList.add('hidden');
    
    // Show loading indicator
    elements.loadingIndicator.classList.remove('hidden');
    
    // Disable form elements
    elements.extractBtn.disabled = true;
    elements.youtubeUrl.disabled = true;
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    elements.loadingIndicator.classList.add('hidden');
    elements.extractBtn.disabled = false;
    elements.youtubeUrl.disabled = false;
}

/**
 * Display success message
 */
function displaySuccess() {
    hideLoadingState();
    
    // Show results section
    elements.resultsSection.classList.remove('hidden');
    
    // Scroll to results
    elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    hideLoadingState();
    
    // Hide results section
    elements.resultsSection.classList.add('hidden');
    
    // Show error message
    elements.errorText.textContent = message;
    elements.errorMessage.classList.remove('hidden');
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        elements.errorMessage.classList.add('hidden');
    }, 5000);
}


/**
 * Validate YouTube URL in real-time
 * Provides immediate feedback to user
 */
function validateYouTubeUrl() {
    const url = elements.youtubeUrl.value.trim();
    
    if (url && !isValidYouTubeUrl(url)) {
        elements.youtubeUrl.style.borderColor = '#dc3545';
    } else {
        elements.youtubeUrl.style.borderColor = '';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
