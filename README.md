# ClipLingo 🎬

Transform YouTube videos into interactive learning experiences with automatic summarization and quiz generation.

## Features

✨ **YouTube Integration**
- Paste any YouTube URL to get started
- Extract video ID from various URL formats
- Serverless endpoint stub for transcript fetching

📝 **Manual Transcript Fallback**
- Paste transcripts directly (from YouTube's "Show transcript" feature)
- Automatic timestamp removal
- International text support (all Unicode scripts)

🧹 **Smart Text Processing**
- Removes timestamps (00:00, [00:00], etc.)
- Strips speaker labels
- Normalizes whitespace while preserving paragraph breaks
- Handles multi-language content safely

🤖 **AI-Powered Analysis**
- **Integrates with OpenAI, Claude, or custom APIs**
- Intelligent content summarization
- Context-aware quiz generation
- High-quality educational questions

📊 **AI-Generated Summaries**
- 5 key points extracted by AI
- Semantic understanding of content
- Maintains context and meaning
- Works with any topic or language

🎯 **Auto-Generated Quiz**
- **3 Multiple Choice Questions**: Facts and meaning-based
- **2 Cloze Questions**: Fill-in-the-blank from key sentences
- AI generates relevant, educational questions
- Detailed explanations for each answer

💾 **Local Persistence**
- Quiz attempts saved to localStorage
- View history of previous scores
- Track learning progress over time

🎨 **Modern UX**
- Clean, responsive design
- Loading states and spinners
- Error messages and empty states
- Mobile-friendly interface
- Smooth animations and transitions

## Setup

### 1. Configure AI API (Required)

ClipLingo uses AI to generate summaries and quizzes. **Google Gemini is pre-configured and ready to use!**

The app is currently set to use:
- **Provider:** Google Gemini
- **Model:** gemini-1.5-flash
- **API Key:** Already configured ✅
- **Cost:** FREE (no credit card needed)

**You can start using the app immediately!** Or choose a different provider:

1. Open `app.js`
2. Find the `API_CONFIG` section at the top
3. Change provider or add your own key:

```javascript
const API_CONFIG = {
    provider: 'gemini', // or 'openai', 'claude', 'custom'
    geminiKey: 'AIzaSyAmN-UQj8OooKWUvEELTDVU6g7TiL0kNGA', // Already set!
    geminiModel: 'gemini-1.5-flash',
};
```

**📖 See [API_SETUP.md](API_SETUP.md) for other providers (OpenAI, Claude, custom)**

### 2. Start the App

```bash
python3 -m http.server 8000
# or
npx http-server
```

Open http://localhost:8000 in your browser.

## How to Use

1. **Good news: Gemini API is already configured!** Just start using it. (See Setup to change providers)

2. **Choose Input Method:**
   - **Option A**: Paste a YouTube URL and click "Fetch Transcript" (note: stub will suggest manual paste)
   - **Option B**: Paste a transcript manually (recommended)

3. **Get Transcript from YouTube:**
   - Go to any YouTube video
   - Click the "..." menu below the video
   - Click "Show transcript"
   - Copy all the text (timestamps will be cleaned automatically)
   - Paste into ClipLingo's manual transcript field

4. **View Summary:**
   - Read the auto-generated key points
   - Click "View Full Transcript" to see cleaned version
   - Click "Start Quiz" when ready

5. **Take the Quiz:**
   - Answer 5 questions (3 multiple choice, 2 fill-in-blank)
   - Get immediate feedback with explanations
   - View your score and detailed results

6. **Track Progress:**
   - Previous attempts are saved automatically
   - Compare scores over time
   - Retake quiz with shuffled questions

## Technical Details

### Architecture
- **Pure vanilla JavaScript** (no frameworks)
- **Semantic HTML5** with ARIA labels
- **Modern CSS** with CSS variables and flexbox/grid
- **localStorage** for client-side persistence

### Algorithms
- **URL Parsing**: Regex-based YouTube ID extraction
- **Text Cleaning**: Multi-pattern timestamp removal, whitespace normalization
- **Tokenization**: Sentence boundary detection with international text support
- **AI Integration**: 
  - OpenAI GPT-4o/GPT-4o-mini support
  - Claude (Anthropic) support
  - Custom backend API support
- **Content Analysis**: AI-powered semantic understanding
- **Question Generation**: AI generates contextually relevant quiz questions

### Browser Compatibility
- Modern browsers (ES6+ required)
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### International Text Support
- Unicode-aware regex (`\p{L}` patterns)
- Handles Latin, Cyrillic, Chinese, Japanese, Korean, Arabic, etc.
- No character encoding issues

## File Structure

```
ClipLingo/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling (responsive, modern)
├── app.js             # All application logic
└── README.md          # This file
```

## Extending the App

### Adding Real Transcript API

Replace the stub in `app.js` at the `fetchTranscript()` function:

```javascript
async function fetchTranscript(videoId) {
    const response = await fetch(`https://your-api.com/transcript/${videoId}`);
    if (!response.ok) throw new Error('Failed to fetch transcript');
    const data = await response.json();
    return data.transcript;
}
```

### Customizing Quiz Generation

Adjust parameters in `app.js`:
- Change `numSentences` in `generateSummary()` for longer/shorter summaries
- Modify question count in `generateQuiz()`
- Customize distractor generation logic in `generateDistractors()`

### Styling

Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #4f46e5;  /* Change brand color */
    --radius-md: 0.5rem;       /* Adjust border radius */
    /* etc. */
}
```

## Deployment

### Static Hosting (Easy)
- Upload all files to:
  - GitHub Pages
  - Netlify
  - Vercel
  - AWS S3 + CloudFront
  - Any static host

### With Backend (Advanced)
1. Deploy serverless function for transcript fetching:
   - AWS Lambda + API Gateway
   - Netlify Functions
   - Vercel Serverless Functions
   - Cloudflare Workers

2. Update API endpoint in `fetchTranscript()`

3. Handle CORS if needed

## License

MIT License - Feel free to use, modify, and distribute!

## Credits

Built with ❤️ for better learning experiences.

---

**Pro Tip**: For best results, use transcripts from educational videos with clear speech. Longer transcripts (500+ words) generate better quizzes!

