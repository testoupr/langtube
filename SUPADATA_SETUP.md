# Supadata Integration Setup Guide

## What is Supadata?

[Supadata](https://supadata.ai) is an API service that extracts transcripts from videos across multiple platforms (YouTube, TikTok, Instagram, X/Twitter) and provides translation capabilities.

## Features Added to ClipLingo

✅ **Multi-language Translation** - Translate YouTube transcripts to 18+ languages  
✅ **Automatic Transcript Fetching** - No more manual copy/paste  
✅ **Reliable Fallbacks** - Uses native, auto-generated, or AI-generated transcripts  
✅ **Multi-platform Support** - Ready for TikTok, Instagram, X (future feature)

---

## Setup Instructions

### Step 1: Get Your Supadata API Key

1. Visit [dash.supadata.ai](https://dash.supadata.ai)
2. Sign up for a free account
3. Copy your API key from the dashboard

### Step 2: Configure ClipLingo

Open `app.js` and update the `API_CONFIG` section:

```javascript
const API_CONFIG = {
    provider: 'gemini', // Keep your current AI provider
    
    // ... other config ...
    
    // Add Supadata configuration:
    supadataKey: 'YOUR_SUPADATA_API_KEY_HERE', // ⬅️ Paste your key here
    useSupadataForTranscripts: true, // ⬅️ Set to true to enable
};
```

### Step 3: Test It Out

1. Open your app at `http://localhost:8000`
2. Paste a YouTube URL
3. (Optional) Select a translation language from the dropdown
4. Click "Fetch Transcript"
5. Watch the magic happen! ✨

---

## How Translation Works

When you select a language from the dropdown:

1. **Supadata fetches** the original transcript
2. **Translates it** to your selected language using AI
3. **Returns the translated text** for processing
4. Your AI (Gemini/GPT/Claude) then generates summaries and quizzes from the translated text

### Supported Languages

- 🇬🇧 English
- 🇪🇸 Spanish (Español)
- 🇫🇷 French (Français)
- 🇩🇪 German (Deutsch)
- 🇮🇹 Italian (Italiano)
- 🇵🇹 Portuguese (Português)
- 🇷🇺 Russian (Русский)
- 🇯🇵 Japanese (日本語)
- 🇰🇷 Korean (한국어)
- 🇨🇳 Chinese (中文)
- 🇸🇦 Arabic (العربية)
- 🇮🇳 Hindi (हिन्दी)
- And more...

---

## API Usage & Pricing

Check the latest pricing at [supadata.ai/pricing](https://supadata.ai/pricing)

### Free Tier (Typical)
- ~100-500 requests per month (varies)
- Perfect for development and testing

### Pro Tier
- Unlimited requests
- Priority support
- Production-ready

---

## Troubleshooting

### "Supadata API key not configured"

**Solution**: Make sure you've replaced `'YOUR_SUPADATA_API_KEY'` with your actual API key in `app.js`

### "Translation failed: 401"

**Solution**: Your API key is invalid or expired. Check your dashboard and regenerate if needed.

### "Transcript fetch failed: 404"

**Solution**: The video doesn't have transcripts available, or the video ID is incorrect. Try the manual paste option.

### "Job timed out"

**Solution**: For very long videos, the processing might take longer. The timeout is set to 60 seconds (30 attempts × 2 seconds). You can manually paste the transcript instead.

---

## API Endpoints Used

### 1. Fetch Transcript (No Translation)
```
POST https://api.supadata.ai/v1/transcript
```

### 2. Translate Transcript
```
POST https://api.supadata.ai/v1/youtube/translate
```

### 3. Job Status (for long videos)
```
GET https://api.supadata.ai/v1/transcript/job/{jobId}
```

---

## Advanced: Backend Implementation (Recommended for Production)

For production apps, **never expose API keys in frontend code**. Instead, create a backend endpoint:

1. Create `api/transcript.js`:

```javascript
import { Supadata } from '@supadata/js';

const supadata = new Supadata({
  apiKey: process.env.SUPADATA_API_KEY, // From environment variable
});

export default async function handler(req, res) {
  const { videoId, targetLang } = req.body;
  
  try {
    let result;
    
    if (targetLang) {
      result = await supadata.youtube.translate({
        videoId: videoId,
        lang: targetLang,
      });
    } else {
      result = await supadata.transcript({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        text: true,
      });
    }
    
    res.json({ transcript: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

2. Update `app.js` to call your backend instead:

```javascript
const API_CONFIG = {
  // ...
  customEndpoint: '/api/transcript',
  useSupadataForTranscripts: false, // Disable direct calls
};
```

---

## Documentation

Full Supadata documentation: [docs.supadata.ai](http://docs.supadata.ai/integrations/node)

---

## Questions?

- **Supadata Support**: [supadata.ai](https://supadata.ai)
- **ClipLingo Issues**: Check the README.md

Happy learning! 🎓

