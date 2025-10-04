# ClipLingo with Supadata Integration Setup

This guide will help you integrate Supadata API into your ClipLingo project for automatic YouTube transcript fetching.

## 🚀 Quick Start

### 1. Get Supadata API Key

1. Visit [Supadata Dashboard](https://dash.supadata.ai)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Copy the API key (starts with `supa_...`)

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your Supadata API key:
   ```
   SUPADATA_API_KEY=your_actual_api_key_here
   ```

### 4. Start the Server

```bash
npm start
```

The server will run on `http://localhost:3000`

### 5. Open the App

Open `http://localhost:3000` in your browser and test with any YouTube URL!

## 📁 Project Structure

```
langtube/
├── server.js              # Backend server with Supadata integration
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (create this)
├── env.example            # Environment template
├── index.html             # Frontend HTML
├── app.js                 # Frontend JavaScript (updated)
├── styles.css             # Frontend styles
└── setup-supadata.md      # This guide
```

## 🔧 How It Works

### Backend (server.js)
- **Express server** with CORS enabled
- **Supadata integration** for YouTube transcript fetching
- **API endpoints**:
  - `POST /api/transcript` - Fetch YouTube transcript
  - `POST /api/process-transcript` - Process transcript with AI
  - `POST /api/video-info` - Get video metadata
  - `GET /api/health` - Health check

### Frontend (app.js)
- **Updated transcript fetching** to use Supadata API
- **Automatic transcript processing** - no more manual pasting!
- **Fallback to manual input** if API fails
- **Same AI processing** for summaries and quizzes

## 🎯 Features

### ✨ Automatic Transcript Fetching
- Paste any YouTube URL
- Click "Fetch Transcript" 
- Get clean, processed transcript automatically
- No more manual copying from YouTube!

### 🤖 AI-Powered Analysis
- Automatic content summarization
- Intelligent quiz generation
- Multiple AI provider support (OpenAI, Claude, Gemini)

### 📊 Video Information
- Get video title, description, duration
- Channel information and view counts
- Thumbnail images

## 🔌 API Endpoints

### Fetch Transcript
```javascript
POST /api/transcript
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}

Response:
{
  "success": true,
  "videoId": "VIDEO_ID",
  "rawTranscript": "Full transcript text...",
  "cleanTranscript": "Cleaned transcript...",
  "source": "supadata"
}
```

### Get Video Info
```javascript
POST /api/video-info
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}

Response:
{
  "success": true,
  "videoId": "VIDEO_ID",
  "title": "Video Title",
  "description": "Video description...",
  "duration": "10:30",
  "channel": "Channel Name",
  "viewCount": 12345
}
```

## 🛠️ Configuration Options

### Environment Variables

```bash
# Required
SUPADATA_API_KEY=your_supadata_api_key

# Optional
PORT=3000
```

### Supadata Configuration

The server uses these Supadata settings:
- **Language**: English (`en`)
- **Format**: Plain text (`text: true`)
- **Mode**: Auto (`auto`)

You can modify these in `server.js`:

```javascript
const transcriptResult = await supadata.transcript({
    url: url,
    lang: 'en',        // Change language
    text: true,        // Plain text format
    mode: 'auto'       // Auto mode
});
```

## 🚨 Error Handling

The integration includes comprehensive error handling:

### Common Errors
- **Video not found**: Video doesn't exist or is private
- **No transcript**: Video doesn't have captions/transcript
- **API key invalid**: Check your Supadata API key
- **Rate limit**: Too many requests (check Supadata limits)

### Fallback Behavior
- If Supadata fails, users can still paste transcripts manually
- Clear error messages guide users to manual input
- No functionality is lost

## 📈 Supadata Limits

Check your Supadata dashboard for current limits:
- **Free tier**: Usually includes generous limits
- **Rate limiting**: Built-in to prevent abuse
- **Usage tracking**: Monitor in Supadata dashboard

## 🔒 Security

### API Key Protection
- Never commit `.env` files to version control
- Use environment variables in production
- Consider using a backend proxy for production

### CORS Configuration
- Currently allows all origins (`*`)
- For production, restrict to your domain:
  ```javascript
  app.use(cors({
    origin: 'https://yourdomain.com'
  }));
  ```

## 🚀 Deployment

### Option 1: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Set environment variables: `vercel env add SUPADATA_API_KEY`
3. Deploy: `vercel --prod`

### Option 2: Netlify
1. Install Netlify CLI: `npm i -g netlify-cli`
2. Build and deploy: `netlify deploy --prod`
3. Set environment variables in Netlify dashboard

### Option 3: Railway/Render
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

## 🧪 Testing

### Test the Integration
1. Start the server: `npm start`
2. Open `http://localhost:3000`
3. Try these test URLs:
   - Educational videos (usually have transcripts)
   - Popular channels (more likely to have captions)
   - Recent videos (better transcript quality)

### Test API Endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# Fetch transcript
curl -X POST http://localhost:3000/api/transcript \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

## 🔧 Troubleshooting

### Common Issues

1. **"Supadata API key not configured"**
   - Check your `.env` file exists
   - Verify the API key is correct
   - Restart the server after adding the key

2. **"Video not found or transcript not available"**
   - Try a different video
   - Check if the video has captions
   - Some videos may not have transcripts

3. **"Rate limit exceeded"**
   - Wait a few minutes before trying again
   - Check your Supadata usage limits
   - Consider upgrading your Supadata plan

4. **CORS errors**
   - Make sure you're accessing the app through the server
   - Don't open `index.html` directly in browser
   - Use `http://localhost:3000` not `file://`

### Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
```

## 📚 Additional Resources

- [Supadata Documentation](https://docs.supadata.ai/)
- [Supadata Node SDK](https://docs.supadata.ai/integrations/node)
- [Express.js Documentation](https://expressjs.com/)
- [ClipLingo Original Documentation](README.md)

## 🎉 Success!

Once set up, your ClipLingo app will:
- ✅ Automatically fetch YouTube transcripts
- ✅ Generate AI-powered summaries
- ✅ Create interactive quizzes
- ✅ Provide a seamless learning experience

No more manual transcript copying! 🎬✨
