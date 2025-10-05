// ============================================================================
// YouTube Embed Functionality
// ============================================================================

/**
 * Extract video ID from YouTube URL
 */
function extractVideoIdFromUrl(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}

/**
 * Extract timestamp from YouTube URL
 */
function extractTimestampFromUrl(url) {
    // Handle MMmSSs format (e.g., &t=2m30s)
    const mmssMatch = url.match(/[?&]t=(\d+)m(\d+)s/);
    if (mmssMatch) {
        const minutes = parseInt(mmssMatch[1]);
        const seconds = parseInt(mmssMatch[2]);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Handle seconds format (e.g., &t=150s or &t=150)
    const secondsMatch = url.match(/[?&]t=(\d+)s?/);
    if (secondsMatch) {
        const totalSeconds = parseInt(secondsMatch[1]);
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return null;
}

/**
 * Create YouTube embed HTML from URL
 */
function createYouTubeEmbedFromUrl(youtubeUrl) {
    const videoId = extractVideoIdFromUrl(youtubeUrl);
    const timestamp = extractTimestampFromUrl(youtubeUrl);
    
    if (!videoId) {
        return '';
    }
    
    // Extract seconds from timestamp for embed
    let startSeconds = 0;
    if (timestamp) {
        const parts = timestamp.split(':').map(Number);
        if (parts.length === 2) {
            startSeconds = parts[0] * 60 + parts[1];
        }
    } else {
        // Try to extract seconds directly from URL if timestamp parsing failed
        const directSecondsMatch = youtubeUrl.match(/[?&]t=(\d+)s?/);
        if (directSecondsMatch) {
            startSeconds = parseInt(directSecondsMatch[1]);
        }
    }
    
    // Also try to extract MMmSSs format directly from URL
    const mmssMatch = youtubeUrl.match(/[?&]t=(\d+)m(\d+)s/);
    if (mmssMatch) {
        const minutes = parseInt(mmssMatch[1]);
        const seconds = parseInt(mmssMatch[2]);
        startSeconds = minutes * 60 + seconds;
    }
    
    return `
        <div class="youtube-embed-container">
            <iframe 
                width="560" 
                height="315" 
                src="https://www.youtube.com/embed/${videoId}?start=${startSeconds}&autoplay=0&rel=0&modestbranding=1" 
                title="YouTube video player" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
            ${timestamp ? `
                <div class="timestamp-info">
                    <span class="timestamp-label">Relevant timestamp:</span>
                    <span class="timestamp-value">${timestamp}</span>
                </div>
            ` : ''}
        </div>
    `;
}
