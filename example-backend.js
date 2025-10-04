// ============================================================================
// Example Backend API for ClipLingo
// ============================================================================
// This is an example serverless function that can be deployed to:
// - Vercel (vercel.com)
// - Netlify Functions
// - AWS Lambda
// - Cloudflare Workers
// ============================================================================

// VERCEL EXAMPLE (api/process-transcript.js)
// ============================================================================

import OpenAI from 'openai';

// Initialize OpenAI with API key from environment variable
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { transcript } = req.body;

        // Validate input
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

        // Call OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an educational content analyzer. Always respond with valid JSON only.'
                },
                {
                    role: 'user',
                    content: `You are an educational content analyzer. Analyze the following video transcript and provide:

1. A summary with 5 key points (as an array of strings)
2. A quiz with exactly 5 questions:
   - 3 multiple choice questions (each with 4 options)
   - 2 fill-in-the-blank questions

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
    },
    {
      "type": "cloze",
      "question": "Fill in the blank: Some text ______ more text",
      "correctAnswer": "the missing word",
      "explanation": "why this is the answer"
    }
  ]
}

Transcript:
${processedTranscript}`
                }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" },
            max_tokens: 2000
        });

        const result = JSON.parse(completion.choices[0].message.content);

        // Validate response structure
        if (!result.summary || !Array.isArray(result.summary) || result.summary.length < 5) {
            throw new Error('Invalid AI response: missing or incomplete summary');
        }

        if (!result.quiz || !Array.isArray(result.quiz) || result.quiz.length < 5) {
            throw new Error('Invalid AI response: missing or incomplete quiz');
        }

        console.log('Successfully processed transcript');
        return res.status(200).json(result);

    } catch (error) {
        console.error('Processing error:', error);
        
        return res.status(500).json({ 
            error: 'Failed to process transcript',
            message: error.message 
        });
    }
}

// ============================================================================
// NETLIFY FUNCTIONS EXAMPLE (netlify/functions/process-transcript.js)
// ============================================================================

/*
exports.handler = async (event, context) => {
    // Same logic as above, but return format is:
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(result)
    };
};
*/

// ============================================================================
// DEPLOYMENT INSTRUCTIONS
// ============================================================================

/*

VERCEL:
-------
1. Install Vercel CLI: npm i -g vercel
2. Create vercel.json:
   {
     "functions": {
       "api/*.js": {
         "maxDuration": 30
       }
     }
   }
3. Add environment variable: vercel env add OPENAI_API_KEY
4. Deploy: vercel --prod

Project structure:
/api
  /process-transcript.js  (this file)
/public
  /index.html
  /app.js
  /styles.css


NETLIFY:
--------
1. Install Netlify CLI: npm i -g netlify-cli
2. Create netlify.toml:
   [build]
   functions = "netlify/functions"
   
   [[redirects]]
   from = "/api/*"
   to = "/.netlify/functions/:splat"
   status = 200
3. Add environment variable in Netlify UI
4. Deploy: netlify deploy --prod

Project structure:
/netlify
  /functions
    /process-transcript.js  (this file)
/index.html
/app.js
/styles.css


AWS LAMBDA:
-----------
1. Zip this file with node_modules
2. Create Lambda function
3. Set environment variable OPENAI_API_KEY
4. Create API Gateway endpoint
5. Update app.js with your API endpoint


CONFIGURATION IN CLIPLINGO:
---------------------------
In app.js, set:
const API_CONFIG = {
    provider: 'custom',
    customEndpoint: 'https://your-app.vercel.app/api/process-transcript',
    // or for Netlify: 'https://your-app.netlify.app/.netlify/functions/process-transcript'
};

*/

// ============================================================================
// RATE LIMITING (Optional but recommended)
// ============================================================================

/*
// Add to your serverless function to prevent abuse:

const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per minute

function checkRateLimit(ip) {
    const now = Date.now();
    const userRequests = rateLimit.get(ip) || [];
    
    // Clean old requests
    const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
    
    if (recentRequests.length >= MAX_REQUESTS) {
        throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    recentRequests.push(now);
    rateLimit.set(ip, recentRequests);
}

// Use in handler:
const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
checkRateLimit(ip);
*/

