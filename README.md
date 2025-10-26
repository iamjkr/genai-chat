# GenAI Chatbot Application

A modern AI-powered chatbot built with FastAPI backend and React frontend, designed to integrate with free AI APIs including OpenAI and Hugging Face.

## Features

- 🤖 **Smart AI Integration**: Supports multiple AI providers (OpenAI, Hugging Face)
- 💬 **Real-time Chat**: Modern chat interface with message history
- 🎨 **Modern UI**: Dark theme with Material-UI components
- 🔄 **Fallback System**: Rule-based responses when AI APIs are unavailable
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Fast Performance**: Built with FastAPI and React

## Quick Start

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd D:\FastAPI\chatbot\backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8001
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd D:\FastAPI\chatbot\frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open browser to: http://localhost:5173

## AI API Integration

### OpenAI Integration (Recommended)
1. Get a free API key from [OpenAI](https://platform.openai.com/)
2. Edit `backend/main.py`:
   ```python
   AI_PROVIDERS = [
       {
           "name": "OpenAI Compatible (Free)",
           "url": "https://api.openai.com/v1/chat/completions",
           "headers": {"Authorization": "Bearer YOUR_ACTUAL_API_KEY_HERE"},
           "enabled": True  # Change to True
       }
   ]
   ```

### Hugging Face Integration (Free Alternative)
1. Get a free token from [Hugging Face](https://huggingface.co/settings/tokens)
2. Edit `backend/main.py`:
   ```python
   {
       "name": "Hugging Face Inference",
       "url": "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
       "headers": {"Authorization": "Bearer YOUR_HF_TOKEN_HERE"},
       "enabled": True  # Change to True
   }
   ```

### Free AI Alternatives
- **Together AI**: Free tier with various models
- **Replicate**: Free credits for AI models
- **Cohere**: Free tier for text generation
- **Anthropic Claude**: Free tier available

## API Endpoints

- `GET /` - Health check
- `GET /api/status` - Check AI provider status
- `POST /api/chat` - Send chat message
  ```json
  {
    "message": "Hello, how are you?",
    "conversation_history": []
  }
  ```

## Demo Mode

The chatbot runs in demo mode with intelligent rule-based responses when no AI APIs are configured. It can discuss:
- Python programming
- Machine Learning & AI
- Data Science
- Web Development
- General technical topics

## Customization

### Adding New AI Providers
1. Add provider config to `AI_PROVIDERS` in `backend/main.py`
2. Implement API call logic in `call_ai_api()` function
3. Test with your API credentials

### Styling
- Modify theme in `frontend/src/App.jsx`
- Update CSS in `frontend/src/index.css`
- Customize Material-UI components

### Features to Add
- User authentication
- Chat history persistence
- File upload support
- Voice input/output
- Multiple chat rooms
- AI model selection

## Architecture

```
chatbot/
├── backend/
│   ├── main.py              # FastAPI server with AI integration
│   └── requirements.txt     # Python dependencies
└── frontend/
    ├── src/
    │   ├── App.jsx         # Main React component
    │   ├── main.jsx        # React entry point
    │   ├── index.css       # Global styles
    │   └── components/
    │       └── ChatMessage.jsx  # Chat message component
    ├── package.json        # Node.js dependencies
    └── index.html         # HTML template
```

## Troubleshooting

### Backend Issues
- **Port already in use**: Change port in uvicorn command
- **Module not found**: Ensure virtual environment is activated
- **API key errors**: Check AI provider configuration

### Frontend Issues
- **npm install fails**: Update Node.js to latest version
- **CORS errors**: Ensure backend CORS is properly configured
- **Build fails**: Check for syntax errors in JSX files

## Development

### Running Both Servers
Backend (Terminal 1):
```bash
cd D:\FastAPI\chatbot\backend
uvicorn main:app --reload --port 8001
```

Frontend (Terminal 2):
```bash
cd D:\FastAPI\chatbot\frontend
npm run dev
```

### Production Deployment
1. Build frontend: `npm run build`
2. Serve static files from FastAPI or use CDN
3. Configure environment variables for API keys
4. Use production ASGI server (gunicorn + uvicorn)

## License

MIT License - feel free to use and modify for your projects!
