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
 * Setup YouTube video with clickable timestamps
 */
function setupYouTubeVideoWithTimestamps(quizData) {
    const videoSection = document.getElementById('youtube-video-section');
    const videoContainer = document.getElementById('youtube-video-container');
    const timestampNav = document.getElementById('timestamp-navigation');
    
    // Collect all unique YouTube URLs with timestamps from quiz questions
    const videoTimestamps = [];
    const seenUrls = new Set();
    
    quizData.forEach((question, index) => {
        if (question.youtubeUrl && !seenUrls.has(question.youtubeUrl)) {
            seenUrls.add(question.youtubeUrl);
            const timestamp = extractTimestampFromUrl(question.youtubeUrl);
            const videoId = extractVideoIdFromUrl(question.youtubeUrl);
            
            if (videoId) {
                videoTimestamps.push({
                    questionIndex: index + 1,
                    timestamp: timestamp,
                    seconds: timestampToSeconds(timestamp),
                    videoId: videoId,
                    question: question.question.substring(0, 50) + '...'
                });
            }
        }
    });
    
    if (videoTimestamps.length === 0) {
        videoSection.classList.add('hidden');
        return;
    }
    
    // Show video section
    videoSection.classList.remove('hidden');
    
    // Get the first video ID for the main embed
    const mainVideoId = videoTimestamps[0].videoId;
    
    // Create main video embed
    videoContainer.innerHTML = `
        <iframe 
            id="main-youtube-video"
            width="100%" 
            height="450" 
            src="https://www.youtube.com/embed/${mainVideoId}?rel=0&modestbranding=1" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;
    
    // Create timestamp navigation buttons
    timestampNav.innerHTML = videoTimestamps.map((item, index) => `
        <button class="timestamp-button" data-seconds="${item.seconds}" data-video-id="${item.videoId}">
            Q${item.questionIndex}
        </button>
    `).join('');
    
    // Add click handlers for timestamp buttons
    timestampNav.addEventListener('click', (e) => {
        if (e.target.classList.contains('timestamp-button')) {
            const seconds = parseInt(e.target.dataset.seconds);
            const videoId = e.target.dataset.videoId;
            
            // Update active button
            timestampNav.querySelectorAll('.timestamp-button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            // Update video if different video ID
            const currentVideo = document.getElementById('main-youtube-video');
            const currentSrc = currentVideo.src;
            const newSrc = `https://www.youtube.com/embed/${videoId}?start=${seconds}&autoplay=1&rel=0&modestbranding=1`;
            
            if (!currentSrc.includes(videoId)) {
                currentVideo.src = newSrc;
            } else {
                // Same video, just seek to timestamp
                currentVideo.src = newSrc;
            }
        }
    });
}

/**
 * Convert timestamp string to seconds
 */
function timestampToSeconds(timestamp) {
    if (!timestamp) return 0;
    
    const parts = timestamp.split(':').map(Number);
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    return 0;
}

