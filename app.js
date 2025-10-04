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
};

// API Configuration
const API_CONFIG = {
    // Choose provider: 'openai', 'claude', 'gemini', or 'custom'
    provider: 'gemini',
    
    // Option 1: OpenAI API
    openaiKey: 'YOUR_OPENAI_API_KEY',
    openaiModel: 'gpt-4o-mini',
    
    // Option 2: Claude API
    claudeKey: 'YOUR_CLAUDE_API_KEY',
    claudeModel: 'claude-3-5-sonnet-20241022',
    
    // Option 3: Google Gemini API
    geminiKey: 'AIzaSyAmN-UQj8OooKWUvEELTDVU6g7TiL0kNGA',
    geminiModel: 'gemini-2.5-flash', // Stable version - or try 'gemini-flash-latest'
    
    // Option 4: Custom endpoint (serverless function, backend API)
    customEndpoint: '/api/process-transcript',
    
    // Option 5: Supadata API (for multi-platform transcripts & translation)
    supadataKey: 'sd_a7ec43f23cd8652aeee773706121bb25', // Get from dash.supadata.ai
    useSupadataForTranscripts: true, // Set to true to use Supadata for transcript fetching
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
 * Validate YouTube URL
 */
function isValidYouTubeUrl(url) {
    return extractVideoId(url) !== null;
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
 * Calculate word frequency (case-insensitive, filters stop words)
 */
function calculateWordFrequency(text) {
    const stopWords = new Set([
        'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
        'in', 'with', 'to', 'for', 'of', 'as', 'by', 'that', 'this',
        'it', 'from', 'be', 'are', 'was', 'were', 'been', 'have', 'has',
        'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
        'may', 'might', 'can', 'i', 'you', 'he', 'she', 'we', 'they',
    ]);

    // Extract words (Unicode-aware for international text)
    const words = text.toLowerCase().match(/\p{L}+/gu) || [];
    const frequency = {};

    words.forEach(word => {
        if (word.length > 3 && !stopWords.has(word)) {
            frequency[word] = (frequency[word] || 0) + 1;
        }
    });

    return frequency;
}

/**
 * Extractive summarization using sentence scoring
 */
function generateSummary(text, numSentences = 5) {
    const sentences = sentenceTokenize(text);
    
    if (sentences.length <= numSentences) {
        return sentences.join(' ');
    }

    const wordFreq = calculateWordFrequency(text);
    
    // Score each sentence based on word frequency
    const sentenceScores = sentences.map(sentence => {
        const words = sentence.toLowerCase().match(/\p{L}+/gu) || [];
        const score = words.reduce((sum, word) => sum + (wordFreq[word] || 0), 0);
        return { sentence, score: score / words.length };
    });

    // Sort by score and take top sentences
    const topSentences = sentenceScores
        .sort((a, b) => b.score - a.score)
        .slice(0, numSentences)
        .map(item => item.sentence);

    // Reorder to maintain original sequence
    const orderedSummary = sentences.filter(s => topSentences.includes(s));
    
    return orderedSummary.join(' ');
}

/**
 * Generate quiz questions from transcript and summary
 */
function generateQuiz(transcript, summary) {
    const questions = [];
    const sentences = sentenceTokenize(transcript);
    
    if (sentences.length < 5) {
        throw new Error('Transcript too short to generate quiz');
    }

    // Generate 3 multiple choice questions
    const mcqSentences = selectRandomSentences(sentences, 3);
    mcqSentences.forEach((sentence, idx) => {
        const question = generateMCQ(sentence, transcript, idx);
        if (question) {
            questions.push(question);
        }
    });

    // Generate 2 cloze (fill-in-the-blank) questions
    const clozeSentences = selectRandomSentences(sentences, 2);
    clozeSentences.forEach((sentence, idx) => {
        const question = generateCloze(sentence, idx);
        if (question) {
            questions.push(question);
        }
    });

    // Shuffle questions
    return shuffleArray(questions);
}

/**
 * Select random unique sentences from array
 */
function selectRandomSentences(sentences, count) {
    const selected = [];
    const used = new Set();
    const maxAttempts = sentences.length * 2;
    let attempts = 0;

    while (selected.length < count && attempts < maxAttempts) {
        const idx = Math.floor(Math.random() * sentences.length);
        const sentence = sentences[idx];
        
        if (!used.has(idx) && sentence.split(/\s+/).length >= 6) {
            selected.push(sentence);
            used.add(idx);
        }
        attempts++;
    }

    return selected;
}

/**
 * Generate a multiple choice question from a sentence
 */
function generateMCQ(sentence, context, questionIndex) {
    // Extract key words (proper nouns, numbers, important words)
    const words = sentence.match(/\p{L}+|\d+/gu) || [];
    if (words.length < 5) return null;

    // Find a good word to ask about (longer words, capitalized words, numbers)
    const candidates = words.filter(w => 
        w.length > 4 || /^\p{Lu}/u.test(w) || /\d/.test(w)
    );
    
    if (candidates.length === 0) return null;

    const targetWord = candidates[Math.floor(Math.random() * candidates.length)];
    const questionText = `According to the video, which statement is true?`;

    // Create correct answer from the sentence
    const correctAnswer = sentence.trim();

    // Generate plausible distractors by modifying the sentence
    const distractors = generateDistractors(sentence, context, targetWord);

    const options = shuffleArray([correctAnswer, ...distractors]);
    const correctIndex = options.indexOf(correctAnswer);

    return {
        id: `mcq_${questionIndex}`,
        type: 'multiple-choice',
        question: questionText,
        options: options,
        correctAnswer: correctIndex,
        explanation: `This is stated in the video.`,
    };
}

/**
 * Generate distractor options for MCQ
 */
function generateDistractors(correctSentence, context, targetWord) {
    const distractors = [];
    const words = correctSentence.split(/\s+/);
    
    // Distractor 1: Replace key word with plausible alternative
    const distractor1Words = [...words];
    const targetIdx = distractor1Words.findIndex(w => w.includes(targetWord));
    if (targetIdx !== -1) {
        const alternatives = ['different', 'another', 'alternative', 'other', 'various'];
        distractor1Words[targetIdx] = alternatives[Math.floor(Math.random() * alternatives.length)];
        distractors.push(distractor1Words.join(' '));
    }

    // Distractor 2: Negate or modify the statement
    let distractor2 = correctSentence;
    if (correctSentence.includes('is') && !correctSentence.includes('is not')) {
        distractor2 = correctSentence.replace('is', 'is not');
    } else if (correctSentence.includes('are') && !correctSentence.includes('are not')) {
        distractor2 = correctSentence.replace('are', 'are not');
    } else {
        // Add "rarely" or "never" to modify meaning
        distractor2 = correctSentence.replace(/\s+/, ' rarely ');
    }
    distractors.push(distractor2);

    // Distractor 3: Use a different sentence from context
    const contextSentences = sentenceTokenize(context);
    const differentSentences = contextSentences.filter(s => 
        s !== correctSentence && s.split(/\s+/).length > 5
    );
    if (differentSentences.length > 0) {
        const randomSentence = differentSentences[
            Math.floor(Math.random() * differentSentences.length)
        ];
        distractors.push(randomSentence);
    }

    return distractors.slice(0, 3);
}

/**
 * Generate a cloze (fill-in-blank) question from a sentence
 */
function generateCloze(sentence, questionIndex) {
    const words = sentence.split(/(\s+)/);
    const contentWords = words.filter(w => 
        w.trim().length > 3 && /\p{L}/u.test(w)
    );

    if (contentWords.length < 3) return null;

    // Select a word to blank out (prefer middle words)
    const targetWord = contentWords[Math.floor(contentWords.length / 2)];
    const blankSentence = sentence.replace(
        new RegExp(`\\b${escapeRegex(targetWord)}\\b`, 'i'),
        '______'
    );

    return {
        id: `cloze_${questionIndex}`,
        type: 'cloze',
        question: `Fill in the blank: ${blankSentence}`,
        correctAnswer: targetWord.toLowerCase().replace(/[^a-z0-9\p{L}]/gui, ''),
        explanation: `The correct word is "${targetWord}".`,
        originalSentence: sentence,
    };
}

/**
 * Escape special regex characters
 */
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Show/hide sections
 */
function showSection(sectionId) {
    console.log('showSection called with:', sectionId);
    const allSections = document.querySelectorAll('.section');
    console.log('Found sections:', allSections.length);
    
    allSections.forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
        console.log('Removed active from:', section.id);
    });
    
    const targetSection = document.getElementById(sectionId);
    console.log('Target section:', targetSection);
    
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
        console.log('Added active to:', sectionId);
        console.log('Section classes:', targetSection.classList.toString());
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
 * Call AI API to process transcript and generate summary + quiz
 */
async function processWithAI(cleanedTranscript) {
    const provider = API_CONFIG.provider;
    
    console.log(`Processing with AI (${provider})...`);
    
    try {
        if (provider === 'openai') {
            return await callOpenAI(cleanedTranscript);
        } else if (provider === 'claude') {
            return await callClaude(cleanedTranscript);
        } else if (provider === 'gemini') {
            return await callGemini(cleanedTranscript);
        } else if (provider === 'custom') {
            return await callCustomAPI(cleanedTranscript);
        } else {
            throw new Error('Invalid API provider configuration');
        }
    } catch (error) {
        console.error('AI processing error:', error);
        throw error;
    }
}

/**
 * Call OpenAI API
 */
async function callOpenAI(transcript) {
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
      "explanation": "why this is correct"
    }
  ]
}

Make sure all 5 questions are multiple-choice format with 4 options each. The correctAnswer should be the index (0-3) of the correct option.

Transcript:
${transcript}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_CONFIG.openaiKey}`
        },
        body: JSON.stringify({
            model: API_CONFIG.openaiModel,
            messages: [
                {
                    role: 'system',
                    content: 'You are an educational content analyzer. Always respond with valid JSON only.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
}

/**
 * Call Claude API
 */
async function callClaude(transcript) {
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
      "explanation": "why this is correct"
    }
  ]
}

Make sure all 5 questions are multiple-choice format with 4 options each. The correctAnswer should be the index (0-3) of the correct option.

Transcript:
${transcript}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_CONFIG.claudeKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: API_CONFIG.claudeModel,
            max_tokens: 2000,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Claude API request failed');
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;
    
    return JSON.parse(jsonString);
}

/**
 * Call Google Gemini API
 */
async function callGemini(transcript) {
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
      "explanation": "why this is correct"
    }
  ]
}

Make sure all 5 questions are multiple-choice format with 4 options each. The correctAnswer should be the index (0-3) of the correct option.

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
                maxOutputTokens: 4096,
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

/**
 * Call custom API endpoint
 */
async function callCustomAPI(transcript) {
    const response = await fetch(API_CONFIG.customEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            transcript: transcript
        })
    });

    if (!response.ok) {
        throw new Error('Custom API request failed');
    }

    return await response.json();
}

// ============================================================================
// Transcript Fetching
// ============================================================================

/**
 * Fetch transcript from serverless endpoint (stub with fallback)
 */
/**
 * Fetch transcript using Supadata API
 * Supports translation to different languages
 */
async function fetchTranscriptWithSupadata(videoId, targetLang = null) {
    if (!API_CONFIG.supadataKey || API_CONFIG.supadataKey === 'YOUR_SUPADATA_API_KEY') {
        throw new Error('Supadata API key not configured. Please add your API key in app.js');
    }
    
    try {
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        
        // If translation is requested, use the translate endpoint
        if (targetLang && targetLang !== '') {
            console.log(`Fetching and translating transcript to ${targetLang}...`);
            
            const response = await fetch('https://api.supadata.ai/v1/youtube/translate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.supadataKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    videoId: videoId,
                    lang: targetLang,
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Translation failed: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Convert timestamped chunks to plain text
            if (Array.isArray(data.transcript)) {
                return data.transcript.map(chunk => chunk.text).join(' ');
            } else if (typeof data.transcript === 'string') {
                return data.transcript;
            }
            
            throw new Error('Unexpected transcript format from Supadata');
            
        } else {
            // Fetch transcript without translation
            console.log('Fetching transcript...');
            
            const response = await fetch('https://api.supadata.ai/v1/transcript', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.supadataKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url,
                    text: true, // Get plain text instead of timestamped chunks
                    mode: 'auto', // Use auto mode for best results
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Transcript fetch failed: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Handle both direct transcript and job-based responses
            if (data.jobId) {
                // For large files, poll for results
                return await pollSupadataJob(data.jobId);
            } else if (data.transcript) {
                return data.transcript;
            } else if (typeof data === 'string') {
                return data;
            }
            
            throw new Error('Unexpected response format from Supadata');
        }
        
    } catch (error) {
        console.error('Supadata API error:', error);
        throw error;
    }
}

/**
 * Poll Supadata job status for async transcript processing
 */
async function pollSupadataJob(jobId, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        
        try {
            const response = await fetch(`https://api.supadata.ai/v1/transcript/job/${jobId}`, {
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.supadataKey}`,
                },
            });
            
            if (!response.ok) {
                throw new Error('Failed to check job status');
            }
            
            const result = await response.json();
            
            if (result.status === 'completed') {
                return result.content || result.transcript;
            } else if (result.status === 'failed') {
                throw new Error(`Job failed: ${result.error || 'Unknown error'}`);
            }
            
            console.log(`Job status: ${result.status}... (attempt ${i + 1}/${maxAttempts})`);
            
        } catch (error) {
            console.error('Error polling job:', error);
            throw error;
        }
    }
    
    throw new Error('Transcript processing timed out');
}

async function fetchTranscript(videoId, targetLang = null) {
    // Check if Supadata should be used
    if (API_CONFIG.useSupadataForTranscripts || targetLang) {
        return await fetchTranscriptWithSupadata(videoId, targetLang);
    }
    
    // Fallback: Stub implementation
    try {
        // Simulate API endpoint
        const apiEndpoint = `/api/transcript/${videoId}`;
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, throw an error to demonstrate fallback
        throw new Error('Transcript fetching not available. Please paste transcript manually or enable Supadata in API_CONFIG.');
        
    } catch (error) {
        throw error;
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
    const targetLangSelect = document.getElementById('target-language');
    const targetLang = targetLangSelect ? targetLangSelect.value : null;
    
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
    const originalText = btnText.textContent;
    btnText.textContent = targetLang ? 'Fetching & Translating...' : 'Fetching...';
    spinner.classList.remove('hidden');
    
    try {
        state.videoId = videoId;
        state.videoUrl = url;
        
        // Fetch transcript with optional translation
        const transcript = await fetchTranscript(videoId, targetLang);
        state.rawTranscript = transcript;
        
        // Add language info to state if translated
        if (targetLang) {
            state.translatedTo = targetLang;
            console.log(`Transcript translated to: ${targetLang}`);
        }
        
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
        btnText.textContent = originalText;
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
        await sleep(300);
        
        state.cleanTranscript = cleanTranscript(state.rawTranscript);
        console.log('Cleaned transcript length:', state.cleanTranscript.length);
        
        if (state.cleanTranscript.length < 50) {
            throw new Error('Cleaned transcript is too short to process');
        }
        
        // Step 2: Send to AI for processing
        console.log('Step 2: Sending to AI...');
        updateProcessingStatus('Analyzing content with AI...');
        
        const aiResult = await processWithAI(state.cleanTranscript);
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
        await sleep(300);
        
        // Convert summary array to string for display
        state.summary = aiResult.summary.join(' ');
        
        // Add IDs to quiz questions for tracking
        state.quiz = aiResult.quiz.map((q, idx) => ({
            ...q,
            id: `ai_q_${idx}`
        }));
        
        console.log('Summary:', state.summary.substring(0, 100) + '...');
        console.log('Quiz questions:', state.quiz.length);
        
        // Step 4: Display results
        await sleep(300);
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
 * Helper function for delays
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    console.log('displaySummary called');
    const videoInfoEl = document.getElementById('video-info');
    const summaryContentEl = document.getElementById('summary-content');
    
    console.log('Video info element:', videoInfoEl);
    console.log('Summary content element:', summaryContentEl);
    
    // Display video info if available
    if (state.videoId) {
        videoInfoEl.innerHTML = `
            <h3>Video Information</h3>
            <p>Video ID: ${state.videoId}</p>
            ${state.videoUrl ? `<p><a href="${state.videoUrl}" target="_blank" rel="noopener">Watch on YouTube</a></p>` : ''}
        `;
        console.log('Set video info HTML');
    } else {
        videoInfoEl.innerHTML = `
            <h3>AI-Generated Content Summary</h3>
        `;
        console.log('Set content summary header');
    }
    
    // Display summary - use sentence tokenization to split if needed
    let summaryPoints;
    if (state.summary.includes('. ')) {
        // If it's a joined string, split it back
        summaryPoints = sentenceTokenize(state.summary);
    } else {
        // If it's already formatted, just use it
        summaryPoints = [state.summary];
    }
    
    console.log('Summary points:', summaryPoints.length);
    summaryContentEl.innerHTML = `
        <h3>Key Points</h3>
        <ul>
            ${summaryPoints.map(point => `<li>${point}</li>`).join('')}
        </ul>
        <p style="margin-top: 1rem; font-size: 0.875rem; color: var(--text-secondary);">
            <em>✨ Generated by AI</em>
        </p>
    `;
    console.log('Set summary content HTML');
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
    state.quiz = shuffleArray(state.quiz);
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

