# YouTube Transcript Extractor

A clean, modular web application for extracting transcripts from YouTube videos.

## Features

- Clean, modern UI with responsive design
- Real-time URL validation
- Loading states and error handling
- Transcript storage in JavaScript variables
- Modular code structure for easy maintenance
- Ready for API integration

## Project Structure

```
/
├── index.html              # Main HTML structure
├── styles.css              # CSS styling
├── main.js                 # UI interactions and form handling
├── transcriptExtractor.js  # Transcript extraction logic (placeholder)
└── README.md               # This file
```

## How to Use

1. Open `index.html` in a web browser
2. Enter a YouTube video URL
3. Click "Extract Transcript"
4. The transcript will be stored in JavaScript variables:
   - `extractedTranscript` (global variable in main.js)
   - `TranscriptExtractor.getStoredTranscript()` (method in transcriptExtractor.js)
5. Check the browser console to see the transcript data

## Adding API Integration

To integrate with a real transcript API, modify the `transcriptExtractor.js` file:

1. Replace the `extractTranscript` method with your API call
2. Update error handling for your specific API
3. Remove the mock data and simulation delays

### Example API Integration

```javascript
static async extractTranscript(videoId) {
    try {
        const response = await fetch(`/api/youtube/transcript/${videoId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        return this.formatTranscript(data.transcript);
        
    } catch (error) {
        throw this.handleApiError(error);
    }
}
```

## Code Organization

- **HTML**: Semantic structure with proper accessibility
- **CSS**: Modern styling with responsive design
- **JavaScript**: Modular approach with separation of concerns
  - `main.js`: UI interactions and form handling
  - `transcriptExtractor.js`: Business logic for transcript extraction

## Browser Support

- Modern browsers with ES6+ support
- Clipboard API support for copy functionality
- Responsive design for mobile and desktop
