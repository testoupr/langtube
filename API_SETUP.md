# ClipLingo AI API Setup Guide


ClipLingo now uses AI to generate summaries and quizzes! This guide will help you configure your AI provider.

## Quick Start

Open `app.js` and find the `API_CONFIG` section at the top (around line 18):

```javascript
const API_CONFIG = {
    provider: 'gemini', // or 'openai', 'claude', 'custom'
    openaiKey: 'YOUR_OPENAI_API_KEY',
    openaiModel: 'gpt-4o-mini',
    claudeKey: 'YOUR_CLAUDE_API_KEY',
    claudeModel: 'claude-3-5-sonnet-20241022',
    geminiKey: 'YOUR_GEMINI_API_KEY',
    geminiModel: 'gemini-1.5-flash',
    customEndpoint: '/api/process-transcript',
};
```

## Option 1: OpenAI (Recommended)

### Setup Steps:

1. **Get API Key:**
   - Go to [OpenAI Platform](https://platform.openai.com/)
   - Sign up or log in
   - Navigate to [API Keys](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Copy the key (starts with `sk-...`)

2. **Configure ClipLingo:**
   ```javascript
   const API_CONFIG = {
       provider: 'openai',
       openaiKey: 'sk-proj-your-actual-key-here',
       openaiModel: 'gpt-4o-mini', // Fast and affordable
       // or 'gpt-4o' for highest quality
   };
   ```

3. **Cost:** ~$0.001-0.01 per transcript (very affordable)

### Models:
- `gpt-4o-mini` - Fast, cheap, great quality (recommended)
- `gpt-4o` - Highest quality, slightly more expensive
- `gpt-4-turbo` - Good balance

## Option 2: Google Gemini (Free Tier Available!)

### Setup Steps:

1. **Get API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the key (starts with `AIza...`)

2. **Configure ClipLingo:**
   ```javascript
   const API_CONFIG = {
       provider: 'gemini',
       geminiKey: 'AIzaSyAmN-UQj8OooKWUvEELTDVU6g7TiL0kNGA',
       geminiModel: 'gemini-1.5-flash', // Fast and free!
       // or 'gemini-1.5-pro' for highest quality
   };
   ```

3. **Cost:** FREE for up to 15 requests per minute! 🎉

### Models:
- `gemini-1.5-flash` - Fast, FREE, great quality (recommended)
- `gemini-1.5-pro` - Highest quality, FREE up to limits
- `gemini-1.0-pro` - Older model, also FREE

### Why Gemini?
- ✅ **Generous free tier** - Perfect for personal use and demos
- ✅ **No credit card required** for free tier
- ✅ **Fast responses** - Flash model is optimized for speed
- ✅ **High quality** - Comparable to GPT-4
- ✅ **15 RPM free** - Plenty for learning apps

## Option 3: Claude (Anthropic)

### Setup Steps:

1. **Get API Key:**
   - Go to [Anthropic Console](https://console.anthropic.com/)
   - Sign up or log in
   - Navigate to API Keys
   - Create a new key
   - Copy the key

2. **Configure ClipLingo:**
   ```javascript
   const API_CONFIG = {
       provider: 'claude',
       claudeKey: 'sk-ant-your-actual-key-here',
       claudeModel: 'claude-3-5-sonnet-20241022',
   };
   ```

3. **Cost:** ~$0.003-0.015 per transcript

### Models:
- `claude-3-5-sonnet-20241022` - Best overall (recommended)
- `claude-3-5-haiku-20241022` - Fastest and cheapest
- `claude-3-opus-20240229` - Highest quality

## Option 4: Custom Backend API

If you want to hide your API keys or add custom logic, create a backend endpoint:

### Backend Example (Node.js/Express):

```javascript
// backend/api/process-transcript.js
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
    const { transcript } = req.body;
    
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: 'You are an educational content analyzer...'
            },
            {
                role: 'user',
                content: `Analyze this transcript: ${transcript}`
            }
        ],
        response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);
}
```

### Configure ClipLingo:

```javascript
const API_CONFIG = {
    provider: 'custom',
    customEndpoint: 'https://your-api.com/api/process-transcript',
    // or '/api/process-transcript' for same-origin
};
```

### Deployment Options:
- **Vercel Serverless Functions** (recommended, free tier)
- **Netlify Functions** (easy deployment)
- **AWS Lambda + API Gateway** (scalable)
- **Cloudflare Workers** (edge computing)

## Security Best Practices

### ⚠️ Important: Never commit API keys to GitHub!

### For Development:
1. Keep keys in `app.js` (add to `.gitignore`)
2. Or use environment variables

### For Production:
1. **Use a backend** - Never expose API keys in frontend code
2. Add rate limiting
3. Implement user authentication
4. Monitor usage and costs

## Testing Your Setup

1. **Start the app:**
   ```bash
   python3 -m http.server 8000
   ```

2. **Open browser console** (F12)

3. **Paste a transcript** and click "Process Transcript"

4. **Watch the console** for:
   ```
   Processing with AI (gemini)...
   Gemini raw response: {...}
   AI processing complete: {summary: [...], quiz: [...]}
   ```

5. If you see errors:
   - Check your API key is correct
   - Verify you have credits/billing set up
   - Check browser network tab for detailed errors

## Expected AI Response Format

The AI must return JSON in this exact structure:

```json
{
  "summary": [
    "First key point from the video",
    "Second important concept discussed",
    "Third main takeaway",
    "Fourth essential detail",
    "Fifth concluding point"
  ],
  "quiz": [
    {
      "type": "multiple-choice",
      "question": "What is the main topic discussed?",
      "options": [
        "Option A",
        "Option B", 
        "Option C",
        "Option D"
      ],
      "correctAnswer": 1,
      "explanation": "The video clearly states..."
    },
    {
      "type": "cloze",
      "question": "Fill in the blank: The key concept is ______",
      "correctAnswer": "the answer",
      "explanation": "This was explained in the section about..."
    }
  ]
}
```

## Troubleshooting

### "API key not configured" error
- Make sure you replaced the placeholder with your actual key
- Key formats:
  - OpenAI: starts with `sk-`
  - Claude: starts with `sk-ant-`
  - Gemini: starts with `AIza`

### "Invalid API response" error
- Check browser console for full error details
- Verify you have API credits/billing enabled
- Try a shorter transcript first

### CORS errors (when using custom endpoint)
- Add CORS headers to your backend:
  ```javascript
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  ```

### Rate limit errors
- OpenAI free tier: Limited requests per minute
- Add delays between requests
- Upgrade to paid tier

## Cost Comparison

| Provider | Free Tier | Cost per Transcript | Best For |
|----------|-----------|---------------------|----------|
| **Gemini** | ✅ 15 req/min | FREE | Hackathons, demos, personal use |
| **OpenAI** | Limited trial | $0.001-0.01 | Production apps |
| **Claude** | $5 credit | $0.003-0.015 | High-quality content |

**Recommendation:** Start with Gemini (free) for development, then choose based on needs.

## Cost Optimization Tips

1. **Use free/cheaper models:**
   - Gemini: `gemini-1.5-flash` (FREE!)
   - OpenAI: `gpt-4o-mini` instead of `gpt-4o`
   - Claude: `haiku` instead of `sonnet`

2. **Truncate long transcripts:**
   ```javascript
   const maxLength = 10000; // chars
   if (transcript.length > maxLength) {
       transcript = transcript.substring(0, maxLength);
   }
   ```

3. **Cache results** in localStorage (already implemented for quiz attempts)

4. **Set spending limits** in your AI provider dashboard

## Support

- **Gemini Docs:** https://ai.google.dev/docs
- **OpenAI Docs:** https://platform.openai.com/docs
- **Claude Docs:** https://docs.anthropic.com/
- **GitHub Issues:** [Your repo URL]

## Quick Links

- **Get Gemini API Key (FREE):** https://makersuite.google.com/app/apikey
- **Get OpenAI API Key:** https://platform.openai.com/api-keys
- **Get Claude API Key:** https://console.anthropic.com/

---

Happy learning! 🎬✨

