# 🌟 FantasyWorld Hub

An AI-powered immersive experiences platform featuring 88+ unique interactive experiences across multiple categories. From space exploration to ancient civilizations, from AI conversations to creative challenges - dive into worlds limited only by imagination.

## ✨ Features

- **88+ Unique Experiences** - Explore diverse worlds from retro-futurism to ancient cities
- **Multi-LLM Integration** - Powered by GPT 5.2, Gemini 3 Pro, Claude 4 Sonnet, Llama 3.1 70B, and Deepseek
- **AI Roast Battle** - Watch 5 AIs roast each other with savage wit and clever comebacks
- **Funny AI Chatbox** - Control conversations between different AI personalities
- **Creativity Learning Platform** - Master creative thinking with interactive principles and challenges
- **Multiple Content Types** - Text, image, video, and hybrid interactive experiences
- **Responsive Design** - Beautiful UI that works on desktop and mobile
- **Secure Architecture** - Environment variables properly protected

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Keys
Create a `.env` file in the root directory with your API keys:
```env
VITE_SEGMIND_API_KEY=your_segmind_api_key_here
```

**API Key Needed:**
- **Segmind API Key**: Get from [Segmind](https://segmind.com) - Powers all AI models and image generation

### 3. Start the Development Server
```bash
npm run dev
```

The platform will be available at `http://localhost:5173`

## 🎮 How to Use

### Main Hub
- Browse 88+ experience cards organized by category
- Click any experience card to launch that world
- Use the slideshow to discover the vision and creativity principles
- Access the "Create Your Own Experience" tool for custom content

### Experience Types
- **Text Experiences** - AI-generated stories, conversations, and narratives
- **Image Experiences** - Visual worlds with AI-generated artwork
- **Video Experiences** - Dynamic video content creation
- **Interactive Experiences** - Multi-step adventures with user choices
- **Hybrid Experiences** - Combinations of text, images, and interactivity

### Featured Experiences
- 🤖 **AI Roast Battle** - Watch 5 AIs roast each other with witty burns
- 💬 **Funny AI Chatbox** - Control conversations between AI personalities
- �️ **Space Cafe** - Therapeutic observer experience in a cosmic setting
- 🎭 **Retro Futurism** - Explore alternate timeline aesthetics
- 🏰 **Ancient Cities** - Journey through historical civilizations
- � **Impossible Coexistence** - Reality-bending scenarios

## 🎭 Experience Categories

### Futuristic & Sci-Fi
- **Space Exploration** - Cosmic adventures and alien encounters
- **Retro Futurism** - Alternate timeline aesthetics
- **Orbital Megastructures** - Massive space constructions
- **Future Memories** - Time-bending narratives

### Historical & Cultural
- **Ancient Cities** - Journey through past civilizations
- **Ghibli Historical** - Animated history with magical realism
- **Epic Dharmic Legends** - Hindu mythology and philosophy
- **Bollywood Parody** - Humorous takes on Indian cinema

### Reality-Bending
- **Impossible Coexistence** - Paradoxical scenarios
- **Mind Bending Hindu** - Consciousness-expanding stories
- **Alternate Reality** - What-if scenarios
- **Plot Twist** - Narrative surprises and turns

## 🎨 AI Content Generation

FantasyWorld Hub uses advanced AI models for dynamic content creation:
- **Text Generation** - Stories, conversations, and narratives via multiple LLMs
- **Image Generation** - Visual content using Segmind's Nano Banana model
- **Video Generation** - Dynamic video creation with LTX-2-19B-I2V
- **Multi-Modal Experiences** - Combinations of text, images, and video

Content is generated in real-time based on user choices and experience parameters.

## 🧠 AI Models Integrated

**Language Models:**
- **GPT 5.2** - Advanced reasoning and analysis
- **Gemini 3 Pro** - Creative and imaginative responses
- **Claude 4 Sonnet** - Thoughtful and ethical AI
- **Llama 3.1 70B** - Open-source powerhouse
- **Deepseek** - Specialized problem-solving

**Media Models:**
- **Nano Banana** - High-quality image generation
- **LTX-2-19B-I2V** - Image-to-video conversion

## 🔧 Technical Details

### Built With
- **React 18** - Modern UI framework with hooks
- **Vite** - Fast build tool and development server
- **Segmind API** - Multi-model AI platform (GPT, Gemini, Claude, Llama, Deepseek)
- **CSS3** - Custom styling with responsive design
- **JavaScript ES6+** - Modern JavaScript features

### Project Structure
```
fantasy-world-hub/
├── src/
│   ├── components/          # Experience components
│   │   ├── App.jsx         # Main application router
│   │   ├── *Experience.jsx # Individual experience components
│   │   ├── CreativityLearningPage.jsx # Learning platform
│   │   └── DiscoverTheVisionSlideshow.jsx # Vision slideshow
│   ├── hooks/              # Custom React hooks
│   │   ├── use*Content.js  # Content generation hooks
│   │   ├── useAIRoastBattleContent.js # Multi-LLM roasting
│   │   └── useFunnyAIChatboxContent.js # AI conversations
│   ├── data/
│   │   └── experiences.js   # Experience metadata
│   ├── styles/             # CSS files for each experience
│   └── utils/
│       └── audioUtils.js   # Audio utilities
├── public/                 # Static assets
└── package.json
```

## 🚨 Troubleshooting

### Common Issues

1. **No API Response**
   - Check your `VITE_SEGMIND_API_KEY` in `.env`
   - Ensure you have credits in your Segmind account
   - Verify the API key has access to required models

2. **Experience Not Loading**
   - Check browser console for JavaScript errors
   - Ensure stable internet connection
   - Try refreshing the page

3. **Performance Issues**
   - Close other browser tabs to free up memory
   - Try a different browser (Chrome recommended)
   - Check if your device meets minimum requirements

4. **Image/Video Generation Slow**
   - AI generation can take 10-30 seconds
   - Check your Segmind account credits
   - Some models may have higher latency

## 🎯 Future Enhancements

- Additional AI model integrations
- User accounts and experience saving
- Community sharing of custom experiences
- Advanced creativity challenges
- Mobile app version
- Collaborative multi-user experiences
- Enhanced personalization algorithms

## 🤝 Contributing

Interested in adding new experiences or improving existing ones?
1. Fork the repository
2. Create a feature branch
3. Add your experience following the existing patterns
4. Submit a pull request

## 📝 License

This project is for educational and demonstration purposes. Please respect API usage limits and terms of service.

---

**Welcome to FantasyWorld Hub - Where Imagination Meets AI! 🌟**
