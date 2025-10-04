// ============================================================================
// ClipLingo Server with Supadata Integration
// ============================================================================
// This server provides API endpoints for:
// 1. Fetching YouTube transcripts using Supadata
// 2. Processing transcripts with AI (existing functionality)
// ============================================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Supadata } from '@supadata/js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static('.'));

// Initialize Supadata client
const supadata = new Supadata({
    apiKey: process.env.SUPADATA_API_KEY
});

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract YouTube video ID from various URL formats
 */
function extractVideoId(url) {
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
 * Clean transcript: remove timestamps, normalize whitespace
 */
function cleanTranscript(rawText) {
    // Handle different data types from Supadata
    let text = rawText;
    
    // If it's an object, try to extract text content
    if (typeof rawText === 'object' && rawText !== null) {
        // Check if it's an array of transcript chunks
        if (Array.isArray(rawText)) {
            text = rawText.map(chunk => {
                if (typeof chunk === 'string') return chunk;
                if (chunk && typeof chunk.text === 'string') return chunk.text;
                if (chunk && typeof chunk.content === 'string') return chunk.content;
                return '';
            }).join(' ');
        } else if (rawText.text) {
            text = rawText.text;
        } else if (rawText.content) {
            text = rawText.content;
        } else if (rawText.transcript) {
            text = rawText.transcript;
        } else {
            // Try to stringify the object
            text = JSON.stringify(rawText);
        }
    }
    
    // Ensure we have a string
    if (typeof text !== 'string') {
        text = String(text || '');
    }
    
    if (!text || !text.trim()) {
        return '';
    }

    // Remove common timestamp patterns
    let cleaned = text.replace(/[\[\(<]?\d{1,2}:\d{2}(?::\d{2})?[\]\)>]?/g, '');
    
    // Remove speaker labels
    cleaned = cleaned.replace(/^[A-Za-z\s]+\d*:\s*/gm, '');
    
    // Remove multiple spaces/tabs
    cleaned = cleaned.replace(/[ \t]+/g, ' ');
    
    // Remove multiple newlines but preserve paragraph breaks
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // Trim lines
    cleaned = cleaned.split('\n').map(line => line.trim()).filter(line => line).join('\n');
    
    return cleaned.trim();
}

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'ClipLingo with Supadata',
        timestamp: new Date().toISOString()
    });
});

/**
 * Fetch YouTube transcript using Supadata
 */
app.post('/api/transcript', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ 
                error: 'YouTube URL is required' 
            });
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            return res.status(400).json({ 
                error: 'Invalid YouTube URL format' 
            });
        }

        console.log(`Fetching transcript for video ID: ${videoId}`);

        // Use Supadata to get transcript
        const transcriptResult = await supadata.transcript({
            url: url,
            lang: 'en', // optional: specify language
            text: true,  // return plain text instead of timestamped chunks
            mode: 'auto' // optional: 'native', 'auto', or 'generate'
        });

        // Check if we got a transcript directly or a job ID for async processing
        if ('jobId' in transcriptResult) {
            // For large files, we get a job ID and need to poll for results
            console.log(`Transcript job started: ${transcriptResult.jobId}`);
            
            // Poll for job status (with timeout)
            let attempts = 0;
            const maxAttempts = 30; // 30 seconds timeout
            let jobResult;
            
            while (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                
                jobResult = await supadata.transcript.getJobStatus(transcriptResult.jobId);
                
                if (jobResult.status === 'completed') {
                    console.log('Transcript job completed');
                    break;
                } else if (jobResult.status === 'failed') {
                    throw new Error(`Transcript job failed: ${jobResult.error}`);
                }
                
                attempts++;
            }
            
            if (attempts >= maxAttempts) {
                throw new Error('Transcript job timed out');
            }
            
            // Clean and return the transcript
            const cleanedTranscript = cleanTranscript(jobResult.content);
            
            res.json({
                success: true,
                videoId: videoId,
                rawTranscript: jobResult.content,
                cleanTranscript: cleanedTranscript,
                source: 'supadata'
            });
            
        } else {
            // For smaller files, we get the transcript directly
            console.log('Transcript received directly');
            console.log('Transcript type:', typeof transcriptResult);
            console.log('Transcript sample:', JSON.stringify(transcriptResult).substring(0, 200));
            
            // Clean and return the transcript
            const cleanedTranscript = cleanTranscript(transcriptResult);
            
            res.json({
                success: true,
                videoId: videoId,
                rawTranscript: transcriptResult,
                cleanTranscript: cleanedTranscript,
                source: 'supadata'
            });
        }

    } catch (error) {
        console.error('Transcript fetch error:', error);
        
        // Provide helpful error messages
        let errorMessage = error.message;
        if (error.message.includes('video-not-found')) {
            errorMessage = 'Video not found or transcript not available';
        } else if (error.message.includes('API key')) {
            errorMessage = 'Supadata API key not configured';
        } else if (error.message.includes('rate limit')) {
            errorMessage = 'Rate limit exceeded. Please try again later.';
        }
        
        res.status(500).json({
            error: 'Failed to fetch transcript',
            message: errorMessage,
            details: error.message
        });
    }
});

/**
 * Process transcript with AI (existing functionality)
 * This endpoint maintains compatibility with the existing frontend
 */
app.post('/api/process-transcript', async (req, res) => {
    try {
        const { transcript } = req.body;

        if (!transcript || transcript.length < 50) {
            return res.status(400).json({ 
                error: 'Transcript is required and must be at least 50 characters' 
            });
        }

        // Truncate very long transcripts to save costs
        const maxLength = 15000;
        const processedTranscript = transcript.length > maxLength 
            ? transcript.substring(0, maxLength) + '...'
            : transcript;

        console.log(`Processing transcript (${processedTranscript.length} chars)`);

        // This would integrate with your existing AI processing logic
        // For now, we'll return a mock response to maintain compatibility
        const mockResponse = {
            summary: [
                "This is a mock summary point 1",
                "This is a mock summary point 2", 
                "This is a mock summary point 3",
                "This is a mock summary point 4",
                "This is a mock summary point 5"
            ],
            quiz: [
                {
                    type: "multiple-choice",
                    question: "What is the main topic discussed?",
                    options: ["Option A", "Option B", "Option C", "Option D"],
                    correctAnswer: 0,
                    explanation: "This is explained in the video content."
                },
                {
                    type: "multiple-choice", 
                    question: "Which statement is true?",
                    options: ["Statement A", "Statement B", "Statement C", "Statement D"],
                    correctAnswer: 1,
                    explanation: "This was clearly stated in the transcript."
                },
                {
                    type: "multiple-choice",
                    question: "What was the key takeaway?",
                    options: ["Takeaway A", "Takeaway B", "Takeaway C", "Takeaway D"],
                    correctAnswer: 2,
                    explanation: "This was the main conclusion discussed."
                },
                {
                    type: "cloze",
                    question: "Fill in the blank: The main concept is ______",
                    correctAnswer: "important",
                    explanation: "This was emphasized throughout the video."
                },
                {
                    type: "cloze",
                    question: "Complete: The speaker mentioned ______",
                    correctAnswer: "examples",
                    explanation: "Several examples were provided."
                }
            ]
        };

        console.log('Successfully processed transcript');
        res.json(mockResponse);

    } catch (error) {
        console.error('Processing error:', error);
        
        res.status(500).json({ 
            error: 'Failed to process transcript',
            message: error.message 
        });
    }
});

/**
 * Get video metadata using Supadata
 */
app.post('/api/video-info', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ 
                error: 'YouTube URL is required' 
            });
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            return res.status(400).json({ 
                error: 'Invalid YouTube URL format' 
            });
        }

        console.log(`Fetching video metadata for: ${videoId}`);

        // Get video metadata using Supadata
        const videoInfo = await supadata.youtube.video({
            id: videoId
        });

        res.json({
            success: true,
            videoId: videoId,
            title: videoInfo.title,
            description: videoInfo.description,
            duration: videoInfo.duration,
            channel: videoInfo.channel,
            publishedAt: videoInfo.publishedAt,
            viewCount: videoInfo.viewCount,
            thumbnail: videoInfo.thumbnail
        });

    } catch (error) {
        console.error('Video info fetch error:', error);
        
        res.status(500).json({
            error: 'Failed to fetch video information',
            message: error.message
        });
    }
});

// ============================================================================
// Error Handling
// ============================================================================

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// ============================================================================
// Server Startup
// ============================================================================

app.listen(PORT, () => {
    console.log(`🚀 ClipLingo server running on port ${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🎬 Transcript API: http://localhost:${PORT}/api/transcript`);
    console.log(`🤖 Process API: http://localhost:${PORT}/api/process-transcript`);
    console.log(`📊 Video Info API: http://localhost:${PORT}/api/video-info`);
    
    if (!process.env.SUPADATA_API_KEY) {
        console.warn('⚠️  SUPADATA_API_KEY not found in environment variables');
        console.warn('   Please set SUPADATA_API_KEY in your .env file');
    } else {
        console.log('✅ Supadata API key configured');
    }
});

export default app;
