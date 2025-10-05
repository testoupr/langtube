// ============================================================================
// ClipLingo - YouTube Learning App
// ============================================================================

// Import Supadata SDK from CDN
import { Supadata } from "https://cdn.skypack.dev/@supadata/js";
import { GoogleGenAI } from "https://cdn.jsdelivr.net/npm/@google/genai@latest/+esm";

// Global State
const state = {
    videoId: null,
    videoUrl: null,
    rawTranscript: '',
    cleanTranscript: '',
    summary: '',
    vocabulary: [],
    quiz: [],
    currentQuestionIndex: 0,
    answers: [],
    score: 0,
    targetLanguage: 'en',
    nativeLanguage: 'en',
    difficultyLevel: 'intermediate',
};

// API Configuration
const API_CONFIG = {
    // Choose provider: 'openai', 'claude', 'gemini', or 'custom'
    provider: 'gemini',
    
    // Google Gemini API
    geminiKey: 'AIzaSyAmN-UQj8OooKWUvEELTDVU6g7TiL0kNGA',
    geminiModel: 'gemini-2.5-flash', // Stable version - or try 'gemini-flash-latest'
    

    // Supadata API for YouTube transcripts
    supadataKey: 'sd_54bdba6597b2544d5aba402554e7220b',
};

// Initialize Supadata SDK
const supadata = new Supadata({
    apiKey: API_CONFIG.supadataKey,
});

// Initialize Google GenAI SDK
const ai = new GoogleGenAI({
    apiKey: API_CONFIG.geminiKey
});

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
 * Clean transcript: remove timestamps, normalize whitespace, preserve international text
 */
function cleanTranscript(rawText) {
    if (!rawText || !rawText.trim()) {
        return '';
    }

    // Remove common timestamp patterns:
    // 00:00:00, 0:00, [00:00], (00:00), <00:00:00>
    let cleaned = rawText.replace(/[\[\(<]?\d{1,2}:\d{2}(?::\d{2})?[\]\)>]?/g, '');
    
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
    const nativeLang = state.nativeLanguage || 'en';
    const difficulty = state.difficultyLevel || 'intermediate';
    
    // Console logging for debugging
    console.log('=== AI REQUEST DEBUG INFO ===');
    console.log('Target Language:', targetLang);
    console.log('Native Language:', nativeLang);
    console.log('Difficulty Level:', difficulty);
    console.log('Transcript Length:', transcript.length);
    console.log('Transcript Preview (first 200 chars):', transcript.substring(0, 200));
    console.log('Transcript Preview (last 200 chars):', transcript.substring(transcript.length - 200));
    console.log('================================');
    
    const prompt = `

Generate progressive language learning content at difficulty Level=${difficulty}) from the transcript.

SYSTEM INSTRUCTIONS: We will use ISO 639-1 two-letter codes. For the purpose of these rules, we will use two functional labels:
- IL (Instruction Language): The language for explanations, summaries, and quiz questions.
- TL (Target Language): The language that contains the specific vocabulary or phrases being learned.

CURRENT SCENARIO:
- IL = ${nativeLang}
- TL = ${targetLang}
- When IL and TL are the same, IL = standard version of the language, and TL = advanced version of the language

CONTEXT: URL=${state.videoUrl || 'N/A'}, ID=${state.videoId || 'N/A'}.

OUTPUT ONLY JSON, following this exact schema:
{
  "summary": ["5 key points with progressive TL integration"],
  "vocabulary": [{"word": "TL word", "definition": "IL def", "example": "mixed example", "pronunciation": "aid"}],
  "quiz": [{
    "question": "mixed IL/TL text",
    "options": ["A","B","C","D"],
    "correctAnswer": 0,
    "explanation": "IL text",
    "youtubeUrl": "https://youtube.com/watch?v=${state.videoId}&t=MMmSSs"
  }]
}

RULES:
1. Difficulty (${difficulty}) governs TL/IL mix and vocabulary count in questions (Beginner: 3-4 vocab, mostly IL; Intermediate: 4-5 vocab, balanced; Advanced: 5-6 vocab, mostly TL).
2. Vocabulary: 4/6/8 words (based on difficulty)
3. Quiz: 5/6/7 questions (based on difficulty) 
4. Focus on Vocabulary, Grammar, and Comprehension.
5. Use ONLY <strong>bold</strong> for styling, DO NOT USE MARKDOWN (concepts, words, words in TL).
6. Include pronunciation aids only for words in TL, and exclude them entirely when Level=${difficulty} is ADVANCED.
7. Find the most relevant timestamp (&t=MMmSSs) for each quiz question.

Transcript:
${transcript}`
    // Log the complete prompt being sent to AI
    console.log('=== COMPLETE PROMPT SENT TO AI ===');
    console.log(prompt);
    console.log('=== END PROMPT ===');

    // Use Google GenAI SDK
    const response = await ai.models.generateContent({
        model: API_CONFIG.geminiModel,
        contents: prompt,
        config: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 16384,
            thinkingConfig: {
                thinkingBudget: 0  // Disables thinking for faster responses
            }
        }
    });

    console.log('Gemini full response:', response);
    
    // Log token usage if available
    if (response.usageMetadata) {
        console.log('Token usage:', {
            promptTokens: response.usageMetadata.promptTokenCount,
            responseTokens: response.usageMetadata.candidatesTokenCount,
            totalTokens: response.usageMetadata.totalTokenCount,
        });
    }
    
    // Extract text from Gemini response
    let text = response.text;
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
        if (!parsed.summary || parsed.summary.length < 3) {
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
        
        console.log('=== TRANSCRIPT FETCHING DEBUG ===');
        console.log('Fetching transcript from:', youtubeUrl);
        console.log('Requesting transcript in language:', state.targetLanguage);
        console.log('Native language setting:', state.nativeLanguage);
        console.log('==================================');
        
        // Use Supadata SDK with language selection
        const response = await supadata.transcript({
            url: youtubeUrl,
            lang: state.targetLanguage, // Use target language for transcript
            text: true, // Return plain text instead of timestamped chunks
            mode: "auto", // Auto-detect or generate captions
        });
        
        console.log('Supadata response:', response);
        
        // Extract transcript text from response
        let transcript = '';
        
        if (response.text) {
            transcript = response.text;
        } else if (response.content) {
            transcript = response.content;
        } else if (response.transcript) {
            transcript = response.transcript;
        } else if (Array.isArray(response)) {
            // Handle array of segments
            transcript = response
                .map(segment => segment.text || segment.content || segment)
                .filter(text => typeof text === 'string' && text.trim().length > 0)
                .join(' ');
        } else {
            console.error('Unexpected response format:', response);
            throw new Error('Unable to extract transcript from API response. Please try manual paste.');
        }
        
        if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 50) {
            throw new Error(`No transcript available in ${state.targetLanguage}. The video may not have captions in this language. Please try manual paste.`);
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
        
        if (!aiResult.vocabulary || !Array.isArray(aiResult.vocabulary)) {
            throw new Error('Invalid AI response: missing vocabulary');
        }
        
        if (!aiResult.quiz || !Array.isArray(aiResult.quiz) || aiResult.quiz.length < 3) {
            throw new Error('Invalid AI response: insufficient quiz questions');
        }
        
        // Step 3: Store results
        console.log('Step 3: Processing AI results...');
        updateProcessingStatus('Preparing your learning materials...');
        
        // Store summary array directly (AI already provides array)
        state.summary = aiResult.summary;
        
        // Store vocabulary
        state.vocabulary = aiResult.vocabulary;
        
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
    const summaryContentEl = document.getElementById('summary-content');
    
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
        <div class="key-points-box">
            <ul>
                ${summaryPoints.map(point => `<li>${point}</li>`).join('')}
            </ul>
        </div>
        
        <div class="vocabulary-list" style="margin-top: 1.5rem;">
            ${state.vocabulary.map(vocab => `
                <div class="vocabulary-item">
                    <div class="vocab-word"><strong>${vocab.word}</strong></div>
                    <div class="vocab-definition">${vocab.definition}</div>
                    <div class="vocab-example"><em>Example: ${vocab.example}</em></div>
                </div>
            `).join('')}
        </div>
        
        <p style="margin-top: 1rem; font-size: 0.875rem; color: var(--text-secondary);">
            <em>✨ Generated by AI for language learning</em>
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
    
    // Setup YouTube video with timestamps
    setupYouTubeVideoWithTimestamps(state.quiz);
    
    // Display detailed results
    const detailsEl = document.getElementById('results-details');
    detailsEl.innerHTML = state.answers.map((answer, idx) => {
        const question = answer.question;
        const answerText = question.options[answer.userAnswer];
        const correctAnswerText = question.options[question.correctAnswer];
        
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
    state.vocabulary = [];
    state.quiz = [];
    state.currentQuestionIndex = 0;
    state.answers = [];
    state.score = 0;
    // Keep target language, native language, and fluency level selections - don't reset them
    
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
    
    // Target language selection (language to learn)
    const targetLanguageSelect = document.getElementById('target-language');
    
    if (targetLanguageSelect) {
        targetLanguageSelect.addEventListener('change', (e) => {
            state.targetLanguage = e.target.value;
            console.log('Target learning language changed to:', state.targetLanguage);
        });
    }
    
    // Native language is now set by the language dropdown navigation
    // No separate native language selector needed
    
    // Difficulty level selection (fluency in target language)
    const difficultyLevelSelect = document.getElementById('difficulty-level');
    
    if (difficultyLevelSelect) {
        difficultyLevelSelect.addEventListener('change', (e) => {
            state.difficultyLevel = e.target.value;
            console.log('Fluency level changed to:', state.difficultyLevel);
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

