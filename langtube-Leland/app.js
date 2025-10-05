// ============================================================================
// ClipLingo - YouTube Learning App
// ============================================================================

// Global State
const state = {
    videoId: null,
    videoUrl: null,
    rawTranscript: '',
    cleanTranscript: '',
    summary: '',
    quiz: [],
    currentQuestionIndex: 0,
    answers: [],
    score: 0,
    targetLanguage: 'en',
};

// API Configuration
const API_CONFIG = {
    // Choose provider: 'openai', 'claude', 'gemini', or 'custom'
    provider: 'gemini',
    
    // Google Gemini API
    geminiKey: 'AIzaSyAmN-UQj8OooKWUvEELTDVU6g7TiL0kNGA',
    geminiModel: 'gemini-2.5-flash', // Stable version - or try 'gemini-flash-latest'
    

    // Supadata API for YouTube transcripts
    supadataKey: 'sd_a7ec43f23cd8652aeee773706121bb25',
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract YouTube video ID from various URL formats
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
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
 * Clean transcript: normalize whitespace, preserve international text, keep timestamps
 */
function cleanTranscript(rawText) {
    if (!rawText || !rawText.trim()) {
        return '';
    }

    // Keep timestamps but clean up formatting
    let cleaned = rawText;
    
    // Remove speaker labels like "Speaker 1:", "John:", etc.
    cleaned = cleaned.replace(/^[A-Za-z\s]+\d*:\s*/gm, '');
    
    // Remove multiple spaces/tabs
    cleaned = cleaned.replace(/[ \t]+/g, ' ');
    
    // Remove multiple newlines but preserve paragraph breaks
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // Trim lines
    cleaned = cleaned.split('\n').map(line => line.trim()).filter(line => line).join('\n');
    
    return cleaned.trim();
}

/**
 * Tokenize text into sentences (international text safe)
 */
function sentenceTokenize(text) {
    // Split on common sentence endings, but preserve international text
    const sentences = text.match(/[^.!?。！？]+[.!?。！？]+|[^.!?。！？]+$/g) || [];
    return sentences.map(s => s.trim()).filter(s => s.length > 10);
}

/**
 * Show/hide sections
 */
function showSection(sectionId) {
    const allSections = document.querySelectorAll('.section');
    
    allSections.forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });
    
    const targetSection = document.getElementById(sectionId);
    
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
    } else {
        console.error('Section not found:', sectionId);
    }
}

/**
 * Display error message
 */
function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

/**
 * Hide error message
 */
function hideError(elementId) {
    const errorEl = document.getElementById(elementId);
    errorEl.classList.add('hidden');
}

// ============================================================================
// AI API Functions
// ============================================================================

/**
 * Call Google Gemini API
 */
async function callGemini(transcript) {
    const targetLang = state.targetLanguage || 'en';
    
    // Simple language instruction - Gemini understands language codes directly
    const languageInstruction = `\n\nIMPORTANT: Generate ALL content (summary points, questions, options, and explanations) in ${targetLang}. The transcript may be in a different language, but your output must be in ${targetLang}.`;
    
    const prompt = `You are an educational content analyzer. Analyze the following video transcript and provide:

    1. A summary with 5 key points (as an array of strings)
    2. A quiz with exactly 5 multiple choice questions (each with 4 options)
    
    Return ONLY valid JSON in this exact format:
    {
      "summary": ["point 1", "point 2", "point 3", "point 4", "point 5"],
      "quiz": [
        {
          "type": "multiple-choice",
          "question": "question text",
          "options": ["option A", "option B", "option C", "option D"],
          "correctAnswer": 0,
          "explanation": "why this is correct",
          "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID&t=MMmSSs"
        }
      ]
    }
    
    IMPORTANT: For each question, include a youtubeUrl with the relevant timestamp from the transcript. Use the format &t=MMmSSs where MM is minutes and SS is seconds. Find the timestamp in the transcript that best relates to each question.
    
    Make sure all 5 questions are multiple-choice format with 4 options each. The correctAnswer should be the index (0-3) of the correct option.${languageInstruction}
    
    Transcript:
    ${transcript}`;

    // Use v1beta endpoint for latest models
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${API_CONFIG.geminiModel}:generateContent?key=${API_CONFIG.geminiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 16384,
            }
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        throw new Error(errorData.error?.message || `Gemini API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini full response:', data);
    
    // Log token usage
    if (data.usageMetadata) {
        console.log('Token usage:', {
            promptTokens: data.usageMetadata.promptTokenCount,
            responseTokens: data.usageMetadata.candidatesTokenCount,
            totalTokens: data.usageMetadata.totalTokenCount,
        });
    }
    
    // Check if response has candidates
    if (!data.candidates || data.candidates.length === 0) {
        throw new Error('Gemini returned no candidates. The content may have been blocked.');
    }
    
    // Extract text from Gemini response
    let text = data.candidates[0].content.parts[0].text;
    console.log('Gemini raw response:', text);
    
    // Extract JSON from markdown code blocks if present
    // Try multiple patterns to extract JSON
    let jsonString = text;
    
    // Pattern 1: ```json ... ```
    let match = text.match(/```json\s*\n([\s\S]*?)\n```/);
    if (match) {
        jsonString = match[1];
    } else {
        // Pattern 2: ``` ... ```
        match = text.match(/```\s*\n([\s\S]*?)\n```/);
        if (match) {
            jsonString = match[1];
        } else {
            // Pattern 3: Look for { ... } directly
            match = text.match(/\{[\s\S]*\}/);
            if (match) {
                jsonString = match[0];
            }
        }
    }
    
    console.log('Extracted JSON string length:', jsonString.length);
    console.log('Extracted JSON string (first 200 chars):', jsonString.substring(0, 200) + '...');
    console.log('Extracted JSON string (last 200 chars):', '...' + jsonString.substring(jsonString.length - 200));
    
    try {
        const parsed = JSON.parse(jsonString);
        
        // Validate the response has all required data
        if (!parsed.summary || parsed.summary.length < 5) {
            throw new Error('Incomplete summary in AI response');
        }
        if (!parsed.quiz || parsed.quiz.length < 5) {
            throw new Error(`Incomplete quiz in AI response (got ${parsed.quiz?.length || 0} questions, need 5)`);
        }
        
        return parsed;
    } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Full JSON string:', jsonString);
        
        // Check if JSON was truncated
        if (!jsonString.trim().endsWith('}')) {
            throw new Error('AI response was truncated. The response token limit may be too low. Try a shorter transcript.');
        }
        
        throw new Error('Failed to parse AI response as JSON. The AI may have returned invalid JSON.');
    }
}

// ============================================================================
// Transcript Fetching
// ============================================================================

/**
 * Fetch transcript from Supadata API
 */
async function fetchTranscript(videoId) {
    try {
        // Construct YouTube URL from video ID
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // Call Supadata API - uses GET method with query parameters
        // API auto-detects available captions/language
        const apiUrl = `https://api.supadata.ai/v1/youtube/transcript?url=${encodeURIComponent(youtubeUrl)}`;
        
        console.log('Fetching transcript from:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'x-api-key': API_CONFIG.supadataKey,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Supadata API error response:', errorData);
            
            // Handle specific error cases
            if (response.status === 404) {
                throw new Error('Video not found or no captions available. Please try a different video or use manual paste.');
            } else if (response.status === 401) {
                throw new Error('API authentication failed. Please check the API key.');
            } else if (response.status === 429) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }
            
            throw new Error(errorData.message || `Failed to fetch transcript (status ${response.status})`);
        }
        
        const data = await response.json();
        console.log('Supadata response:', data);
        
        // Extract transcript text from response
        // According to Supadata API: content can be a string or an array of segments
        let transcript = '';
        
        if (data.content) {
            if (typeof data.content === 'string') {
                // Content is already a string
                transcript = data.content;
            } else if (Array.isArray(data.content)) {
                // Content is an array of segments - join all text
                transcript = data.content
                    .map(segment => {
                        // Each segment might have 'text' or 'content' field
                        return segment.text || segment.content || segment;
                    })
                    .filter(text => typeof text === 'string' && text.trim().length > 0)
                    .join(' ');
            }
        } else if (data.text) {
            // Alternative field name
            transcript = data.text;
        } else if (data.transcript) {
            // Another alternative
            transcript = typeof data.transcript === 'string' 
                ? data.transcript 
                : JSON.stringify(data.transcript);
        } else {
            console.error('Unexpected response format:', data);
            throw new Error('Unable to extract transcript from API response. Please try manual paste.');
        }
        
        if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 50) {
            throw new Error('Transcript is too short or empty. The video may not have captions available.');
        }
        
        console.log('Successfully fetched transcript, length:', transcript.length);
        return transcript;
        
    } catch (error) {
        console.error('Supadata API error:', error);
        // Provide user-friendly error message
        const message = error.message || 'Failed to fetch transcript. Please try manual paste.';
        throw new Error(message);
    }
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle fetch transcript button click
 */
async function handleFetchTranscript() {
    const urlInput = document.getElementById('youtube-url');
    const url = urlInput.value.trim();
    
    hideError('url-error');
    
    if (!url) {
        showError('url-error', 'Please enter a YouTube URL');
        return;
    }
    
    const videoId = extractVideoId(url);
    
    if (!videoId) {
        showError('url-error', 'Invalid YouTube URL. Please check and try again.');
        return;
    }
    
    // Update button state
    const btn = document.getElementById('fetch-transcript-btn');
    const btnText = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.spinner');
    
    btn.disabled = true;
    btnText.textContent = 'Fetching...';
    spinner.classList.remove('hidden');
    
    try {
        state.videoId = videoId;
        state.videoUrl = url;
        
        const transcript = await fetchTranscript(videoId);
        state.rawTranscript = transcript;
        
        // Process the transcript
        processTranscript();
        
    } catch (error) {
        // Show error and suggest manual paste
        showError('url-error', 
            `${error.message} Please use the manual transcript paste option below.`
        );
        
        // Focus on manual textarea
        document.getElementById('manual-transcript').focus();
        
    } finally {
        btn.disabled = false;
        btnText.textContent = 'Fetch Transcript';
        spinner.classList.add('hidden');
    }
}

/**
 * Handle manual transcript processing
 */
function handleManualTranscript() {
    const textarea = document.getElementById('manual-transcript');
    const transcript = textarea.value.trim();
    
    console.log('Manual transcript length:', transcript.length);
    
    hideError('url-error');
    
    if (!transcript) {
        showError('url-error', 'Please paste a transcript');
        return;
    }
    
    if (transcript.length < 100) {
        showError('url-error', 'Transcript seems too short. Please paste a longer transcript.');
        return;
    }
    
    state.rawTranscript = transcript;
    console.log('Raw transcript set:', state.rawTranscript.substring(0, 100) + '...');
    
    // Try to extract video ID from URL if provided
    const urlInput = document.getElementById('youtube-url');
    const url = urlInput.value.trim();
    if (url) {
        state.videoId = extractVideoId(url);
        state.videoUrl = url;
    }
    
    console.log('Starting processTranscript...');
    processTranscript();
}

/**
 * Process transcript: clean, send to AI, display results
 */
async function processTranscript() {
    // Show processing section
    console.log('Showing processing section...');
    showSection('processing-section');
    
    try {
        // Step 1: Clean transcript
        console.log('Step 1: Cleaning transcript...');
        updateProcessingStatus('Cleaning transcript...');
        
        state.cleanTranscript = cleanTranscript(state.rawTranscript);
        console.log('Cleaned transcript length:', state.cleanTranscript.length);
        
        if (state.cleanTranscript.length < 50) {
            throw new Error('Cleaned transcript is too short to process');
        }
        
        // Step 2: Send to AI for processing
        console.log('Step 2: Sending to AI...');
        updateProcessingStatus('Analyzing content with AI...');
        
        const aiResult = await callGemini(state.cleanTranscript);
        console.log('AI processing complete:', aiResult);
        
        // Validate AI response
        if (!aiResult.summary || !Array.isArray(aiResult.summary)) {
            throw new Error('Invalid AI response: missing summary');
        }
        
        if (!aiResult.quiz || !Array.isArray(aiResult.quiz) || aiResult.quiz.length < 3) {
            throw new Error('Invalid AI response: insufficient quiz questions');
        }
        
        // Step 3: Store results
        console.log('Step 3: Processing AI results...');
        updateProcessingStatus('Preparing your learning materials...');
        
        // Store summary array directly (AI already provides array)
        state.summary = aiResult.summary;
        
        // Add IDs to quiz questions for tracking
        state.quiz = aiResult.quiz.map((q, idx) => ({
            ...q,
            id: `ai_q_${idx}`
        }));
        
        console.log('Summary points:', state.summary.length);
        console.log('Quiz questions:', state.quiz.length);
        
        // Step 4: Display results
        console.log('Displaying summary...');
        displaySummary();
        showSection('summary-section');
        
    } catch (error) {
        console.error('Processing error:', error);
        let errorMessage = error.message;
        
        // Provide helpful error messages
        if (error.message.includes('API key')) {
            errorMessage = 'AI API key not configured. Please add your API key in app.js (API_CONFIG section).';
        } else if (error.message.includes('API request failed')) {
            errorMessage = 'Unable to connect to AI service. Please check your API configuration and internet connection.';
        }
        
        showError('url-error', errorMessage);
        showSection('input-section');
    }
}

/**
 * Update processing status message
 */
function updateProcessingStatus(message) {
    document.getElementById('processing-status').textContent = message;
}

/**
 * Display summary section
 */
function displaySummary() {
    const videoInfoEl = document.getElementById('video-info');
    const summaryContentEl = document.getElementById('summary-content');
    
    // Display video info if available
    if (state.videoId) {
        videoInfoEl.innerHTML = `
            <h3>Video Information</h3>
            <p>Video ID: ${state.videoId}</p>
            ${state.videoUrl ? `<p><a href="${state.videoUrl}" target="_blank" rel="noopener">Watch on YouTube</a></p>` : ''}
        `;
    } else {
        videoInfoEl.innerHTML = `
            <h3>AI-Generated Content Summary</h3>
        `;
    }
    
    // Display summary - AI already returns array of points
    let summaryPoints;
    if (Array.isArray(state.summary)) {
        // AI returned array of summary points
        summaryPoints = state.summary;
    } else if (state.summary.includes('. ')) {
        // Fallback: split joined string
        summaryPoints = sentenceTokenize(state.summary);
    } else {
        // Single summary point
        summaryPoints = [state.summary];
    }
    
    summaryContentEl.innerHTML = `
        <h3>Key Points</h3>
        <ul>
            ${summaryPoints.map(point => `<li>${point}</li>`).join('')}
        </ul>
        <p style="margin-top: 1rem; font-size: 0.875rem; color: var(--text-secondary);">
            <em>✨ Generated by AI</em>
        </p>
    `;
}

/**
 * Handle view transcript button
 */
function handleViewTranscript() {
    const modal = document.getElementById('transcript-modal');
    const modalBody = document.getElementById('transcript-modal-body');
    
    // Format transcript with paragraphs
    const paragraphs = state.cleanTranscript.split('\n\n');
    modalBody.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
    
    modal.classList.remove('hidden');
}

/**
 * Handle start quiz button
 */
function handleStartQuiz() {
    state.currentQuestionIndex = 0;
    state.answers = [];
    state.score = 0;
    
    displayQuiz();
    showSection('quiz-section');
}

/**
 * Display quiz
 */
function displayQuiz() {
    updateQuizProgress();
    displayCurrentQuestion();
}

/**
 * Update quiz progress indicator
 */
function updateQuizProgress() {
    const progressText = document.getElementById('quiz-progress-text');
    progressText.textContent = `Question ${state.currentQuestionIndex + 1} of ${state.quiz.length}`;
}

/**
 * Display current question
 */
function displayCurrentQuestion() {
    const container = document.getElementById('quiz-container');
    const question = state.quiz[state.currentQuestionIndex];
    
    // Add next/submit button HTML
    const isLastQuestion = state.currentQuestionIndex === state.quiz.length - 1;
    const buttonHTML = isLastQuestion 
        ? '<button class="btn btn-primary submit-quiz-btn" id="submit-quiz-btn">Submit Quiz</button>'
        : '<button class="btn btn-primary submit-quiz-btn" id="next-question-btn">Next Question</button>';
    
    // All questions are multiple choice
    container.innerHTML = `
        <div class="question-card">
            <span class="question-type">Multiple Choice</span>
            <div class="question-text">${question.question}</div>
            <ul class="options-list">
                ${question.options.map((option, idx) => `
                    <li class="option-item" data-index="${idx}">
                        <span class="option-label">${String.fromCharCode(65 + idx)}</span>
                        <span>${option}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
        ${buttonHTML}
    `;
    
    // Add click handlers to options
    container.querySelectorAll('.option-item').forEach(item => {
        item.addEventListener('click', handleOptionSelect);
    });
    
    // Attach button click handler
    const button = document.getElementById(isLastQuestion ? 'submit-quiz-btn' : 'next-question-btn');
    button.addEventListener('click', handleNextQuestion);
}

/**
 * Handle option selection for MCQ
 */
function handleOptionSelect(e) {
    const item = e.currentTarget;
    const container = item.closest('.options-list');
    
    // Remove previous selection
    container.querySelectorAll('.option-item').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Mark this as selected
    item.classList.add('selected');
}

/**
 * Handle next question / submit quiz
 */
function handleNextQuestion() {
    const question = state.quiz[state.currentQuestionIndex];
    
    // Check if an option is selected
    const selected = document.querySelector('.option-item.selected');
    if (!selected) {
        alert('Please select an answer');
        return;
    }
    
    // Get user's answer
    const userAnswer = parseInt(selected.dataset.index);
    const isCorrect = userAnswer === question.correctAnswer;
    
    // Store answer
    state.answers.push({
        question: question,
        userAnswer: userAnswer,
        isCorrect: isCorrect,
    });
    
    if (isCorrect) {
        state.score++;
    }
    
    // Move to next question or show results
    state.currentQuestionIndex++;
    
    if (state.currentQuestionIndex < state.quiz.length) {
        displayQuiz();
    } else {
        displayResults();
    }
}

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
    const match = url.match(/[?&]t=(\d+)s?/);
    if (match) {
        const seconds = parseInt(match[1]);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
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

/**
 * Display quiz results
 */
function displayResults() {
    const percentage = Math.round((state.score / state.quiz.length) * 100);
    
    // Update score display
    document.getElementById('score-percentage').textContent = `${percentage}%`;
    
    // Update score message
    const messageEl = document.getElementById('score-message');
    if (percentage >= 90) {
        messageEl.textContent = 'Outstanding! You really understood the content!';
    } else if (percentage >= 70) {
        messageEl.textContent = 'Great job! You got most of it right!';
    } else if (percentage >= 50) {
        messageEl.textContent = 'Good effort! Review the summary to improve.';
    } else {
        messageEl.textContent = 'Keep learning! Try watching the video again.';
    }
    
    // Display detailed results with YouTube embeds
    const detailsEl = document.getElementById('results-details');
    detailsEl.innerHTML = state.answers.map((answer, idx) => {
        const question = answer.question;
        const answerText = question.options[answer.userAnswer];
        const correctAnswerText = question.options[question.correctAnswer];
        
        // Use YouTube URL from AI response if available
        const youtubeEmbed = question.youtubeUrl ? createYouTubeEmbedFromUrl(question.youtubeUrl) : '';
        
        return `
            <div class="result-item ${answer.isCorrect ? 'correct' : 'incorrect'}">
                <div class="result-status ${answer.isCorrect ? 'correct' : 'incorrect'}">
                    ${answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </div>
                <div class="result-question">${question.question}</div>
                <div class="result-answer">
                    <strong>Your answer:</strong> ${answerText}
                </div>
                ${!answer.isCorrect ? `
                    <div class="result-answer">
                        <strong>Correct answer:</strong> ${correctAnswerText}
                    </div>
                ` : ''}
                <div class="result-explanation">
                    ${question.explanation}
                </div>
                ${youtubeEmbed ? `
                    <div class="youtube-explanation">
                        <h4>📺 Watch the relevant part:</h4>
                        ${youtubeEmbed}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    // Save to localStorage
    saveAttemptToHistory(percentage);
    
    // Display history
    displayHistory();
    
    // Show results section
    showSection('results-section');
}

/**
 * Save quiz attempt to localStorage
 */
function saveAttemptToHistory(percentage) {
    const attempt = {
        date: new Date().toISOString(),
        score: percentage,
        videoId: state.videoId || 'manual',
        totalQuestions: state.quiz.length,
    };
    
    const history = getAttemptHistory();
    history.unshift(attempt);
    
    // Keep only last 10 attempts
    const trimmedHistory = history.slice(0, 10);
    
    localStorage.setItem('cliplingo_history', JSON.stringify(trimmedHistory));
}

/**
 * Get attempt history from localStorage
 */
function getAttemptHistory() {
    try {
        const history = localStorage.getItem('cliplingo_history');
        return history ? JSON.parse(history) : [];
    } catch {
        return [];
    }
}

/**
 * Display attempt history
 */
function displayHistory() {
    const historyEl = document.getElementById('attempt-history');
    const history = getAttemptHistory();
    
    if (history.length === 0) {
        historyEl.innerHTML = '<div class="empty-state">No previous attempts</div>';
        return;
    }
    
    historyEl.innerHTML = `
        <div class="history-list">
            ${history.map(attempt => `
                <div class="history-item">
                    <span class="history-date">${new Date(attempt.date).toLocaleString()}</span>
                    <span class="history-score">${attempt.score}%</span>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Handle retake quiz
 */
function handleRetakeQuiz() {
    // Shuffle quiz questions
    state.quiz = state.quiz.sort(() => Math.random() - 0.5);
    handleStartQuiz();
}

/**
 * Handle new video
 */
function handleNewVideo() {
    // Reset state
    state.videoId = null;
    state.videoUrl = null;
    state.rawTranscript = '';
    state.cleanTranscript = '';
    state.summary = '';
    state.quiz = [];
    state.currentQuestionIndex = 0;
    state.answers = [];
    state.score = 0;
    // Keep language selections - don't reset them
    
    // Clear inputs
    document.getElementById('youtube-url').value = '';
    document.getElementById('manual-transcript').value = '';
    hideError('url-error');
    
    // Show input section
    showSection('input-section');
}

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - attaching event listeners...');
    
    // Language selection for quiz/summary output
    const targetLanguageSelect = document.getElementById('target-language');
    
    if (targetLanguageSelect) {
        targetLanguageSelect.addEventListener('change', (e) => {
            state.targetLanguage = e.target.value;
            console.log('Quiz language changed to:', state.targetLanguage);
        });
    }
    
    // Fetch transcript button
    const fetchBtn = document.getElementById('fetch-transcript-btn');
    console.log('Fetch button:', fetchBtn);
    if (fetchBtn) {
        fetchBtn.addEventListener('click', handleFetchTranscript);
    }
    
    // Process manual transcript button
    const processBtn = document.getElementById('process-manual-btn');
    console.log('Process button:', processBtn);
    if (processBtn) {
        processBtn.addEventListener('click', () => {
            console.log('Process button clicked!');
            handleManualTranscript();
        });
    }
    
    // Start quiz button
    const startQuizBtn = document.getElementById('start-quiz-btn');
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', handleStartQuiz);
    }
    
    // View transcript button
    document.getElementById('view-transcript-btn').addEventListener('click', handleViewTranscript);
    
    // Close transcript modal
    document.getElementById('close-transcript-modal').addEventListener('click', () => {
        document.getElementById('transcript-modal').classList.add('hidden');
    });
    
    // Close modal on background click
    document.getElementById('transcript-modal').addEventListener('click', (e) => {
        if (e.target.id === 'transcript-modal') {
            document.getElementById('transcript-modal').classList.add('hidden');
        }
    });
    
    // Retake quiz button
    document.getElementById('retake-quiz-btn').addEventListener('click', handleRetakeQuiz);
    
    // New video button
    document.getElementById('new-video-btn').addEventListener('click', handleNewVideo);
    
    // Enter key on URL input
    document.getElementById('youtube-url').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleFetchTranscript();
        }
    });
    
    console.log('ClipLingo initialized successfully!');
});

