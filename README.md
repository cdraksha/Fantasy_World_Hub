# 🚀 Space Cafe Simulation

An immersive 3D space station cafe simulation with AI-powered characters and interactive image generation hotspots.

## ✨ Features

- **3D Space Station Environment** - Explore a detailed orbital cafe with Earth views
- **AI Characters** - Chat with diverse space travelers (miners, scientists, tourists, pilots, etc.)
- **Interactive Image Hotspots** - Click on image icons throughout the cafe to generate space-themed images
- **Service Bots** - Interact with robotic staff members
- **Real-time Business Metrics** - Track cafe revenue, occupancy, and customer activity
- **Spatial Audio** - Immersive space station ambient sounds
- **Character Personalities** - Each character has unique traits, conversation topics, and behaviors

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
cd space-cafe
npm install
```

### 2. Configure API Keys
Copy the example environment file and add your API keys:
```bash
cp .env.example .env
```

Edit `.env` file with your actual API keys:
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_SEGMIND_API_KEY=your_segmind_api_key_here
```

**API Keys Needed:**
- **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Segmind API Key**: Get from [Segmind](https://segmind.com)

### 3. Start the Development Server
```bash
npm run dev
```

The simulation will be available at `http://localhost:4646`

## 🎮 How to Use

### Navigation
- **Mouse**: Look around the 3D environment
- **Scroll**: Zoom in/out
- **Drag**: Rotate camera view

### Interactions
- **Click Characters**: Chat with AI-powered space travelers
- **Click Service Bots**: Interact with robotic staff
- **Click Image Icons**: Generate contextual space images at hotspots
- **Continue Conversations**: Use "Continue..." button for extended chats

### Image Generation Hotspots
Look for glowing icons throughout the cafe:
- 🌍 **Earth View Window** - Generate Earth from space images
- 🌌 **Deep Space Window** - Create galaxy and nebula scenes
- ⛏️ **Mining Operations** - Visualize asteroid mining
- 🚀 **Docking Bay** - Generate cargo ship scenes
- 🏗️ **Station Interior** - Create futuristic interior shots
- 👽 **Alien Encounters** - Generate alien spacecraft
- 🛸 **Tourism Views** - Create luxury space travel scenes

## 🎭 Character Types

### Human Characters
- **Asteroid Miners** - Rugged workers with mining stories
- **Research Scientists** - Brilliant minds studying cosmic phenomena
- **Space Tourists** - Wealthy civilians on vacation
- **Cargo Pilots** - Experienced transporters
- **Station Engineers** - Technical experts maintaining systems
- **Diplomatic Envoys** - Ambassadors between worlds

### Service Bots
- **Cleaning Bots** - Maintain station hygiene
- **Service Bots** - Assist customers with orders
- **Security Bots** - Monitor station safety

## 🎨 Image Generation

The simulation uses the Segmind API to generate contextual images based on:
- Your location in the cafe
- What you're "looking at" (windows, equipment, etc.)
- Character interactions and conversations
- Random events during character conversations

Generated images appear in the bottom-left corner and represent what you might "see" in that space.

## 📊 Business Metrics

Monitor the cafe's performance in real-time:
- **Revenue** - Credits earned from customer orders
- **Customers Served** - Total number of satisfied customers
- **Occupancy** - Current customer count (max 8)
- **Active Orders** - Orders being processed
- **Images Generated** - Total images created

## 🔧 Technical Details

### Built With
- **React 18** - UI framework
- **Three.js** - 3D graphics
- **@react-three/fiber** - React Three.js renderer
- **@react-three/drei** - Three.js helpers
- **OpenAI API** - Character conversations
- **Segmind API** - Image generation
- **Howler.js** - Audio management
- **Vite** - Build tool

### Project Structure
```
space-cafe/
├── src/
│   ├── components/          # React components
│   │   ├── SpaceCafe.jsx   # Main orchestrator
│   │   ├── SpaceEnvironment.jsx # 3D environment
│   │   ├── SpaceCharacter.jsx   # AI characters
│   │   ├── ServiceBot.jsx       # Robot staff
│   │   ├── SpeechBubble.jsx     # Chat interface
│   │   └── BusinessMetrics.jsx  # Stats overlay
│   ├── hooks/              # Custom React hooks
│   │   ├── useSpaceCharacters.js # Character management
│   │   ├── useOpenAI.js         # AI conversations
│   │   ├── useSpaceAudio.js     # Audio system
│   │   └── useImageGeneration.js # Image creation
│   ├── data/
│   │   └── personalities.js     # Character data
│   └── utils/
│       └── audioUtils.js        # Audio utilities
├── public/sounds/          # Audio files (placeholder)
└── package.json
```

## 🚨 Troubleshooting

### Common Issues

1. **No API Response**
   - Check your API keys in `.env`
   - Ensure you have credits in your OpenAI/Segmind accounts

2. **Audio Not Working**
   - Click anywhere in the browser to enable audio
   - Check browser audio permissions

3. **Performance Issues**
   - Reduce browser zoom level
   - Close other tabs to free up memory
   - Try a different browser (Chrome recommended)

4. **3D Environment Not Loading**
   - Ensure WebGL is enabled in your browser
   - Update your graphics drivers

## 🎯 Future Enhancements

- Real audio files for ambient space sounds
- More character types and personalities
- Multiplayer support
- VR compatibility
- Advanced AI conversations with memory
- Custom image generation prompts
- Save/load simulation states

## 📝 License

This project is for educational and demonstration purposes.

---

**Enjoy exploring the cosmos! 🌌**
