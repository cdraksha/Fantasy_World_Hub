import React, { useState, useRef } from 'react';
import '../styles/living-space-oracle.css';

const LivingSpaceOracle = ({ onStop }) => {
  const [currentStep, setCurrentStep] = useState('upload'); // upload, analyze, theme, transform, reading
  const [uploadedImage, setUploadedImage] = useState(null);
  const [roomAnalysis, setRoomAnalysis] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [transformedImage, setTransformedImage] = useState(null);
  const [mysticalReading, setMysticalReading] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const fileInputRef = useRef(null);

  const themes = [
    {
      id: 'hogwarts',
      name: 'Hogwarts Dormitory',
      icon: '🏰',
      description: 'Magical castle vibes with floating candles and mystical elements'
    },
    {
      id: 'zen',
      name: 'Zen Temple',
      icon: '🧘',
      description: 'Peaceful minimalism with natural materials and flowing energy'
    },
    {
      id: 'hobbit',
      name: 'Hobbit Hole',
      icon: '🏡',
      description: 'Cozy earth tones with round doors and warm lighting'
    },
    {
      id: 'space',
      name: 'Space Pod',
      icon: '🚀',
      description: 'Futuristic sanctuary with ambient lighting and sleek surfaces'
    },
    {
      id: 'vastu',
      name: 'Vastu Harmony',
      icon: '🕉️',
      description: 'Ancient Indian principles for optimal energy flow'
    },
    {
      id: 'feng_shui',
      name: 'Feng Shui Balance',
      icon: '☯️',
      description: 'Chinese wisdom for harmonious living spaces'
    }
  ];

  // Convert image to base64
  const imageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage({ file, url: imageUrl });
      setCurrentStep('analyze');
      analyzeRoom(file);
    }
  };

  // Analyze room using Segmind GPT-5.1 Vision
  const analyzeRoom = async (imageFile) => {
    setIsLoading(true);
    setError(null);

    try {
      const base64Image = await imageToBase64(imageFile);
      
      const response = await fetch('https://api.segmind.com/v1/gpt-5.1', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "messages": [
            {
              "role": "user",
              "content": [
                {
                  "type": "text",
                  "text": `Analyze this room photo briefly. Provide a simple JSON response with:
                  {
                    "roomType": "bedroom/living room/etc",
                    "furniture": "main furniture items",
                    "lighting": "lighting description",
                    "colors": "color scheme",
                    "energy": "energy assessment in 1 sentence",
                    "vastu_note": "1 sentence Vastu observation",
                    "feng_shui_note": "1 sentence Feng Shui observation"
                  }
                  Keep each field to 1-2 sentences maximum.`
                },
                {
                  "type": "image_url",
                  "image_url": {
                    "url": base64Image
                  }
                }
              ]
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`Room analysis failed: ${response.status}`);
      }

      const result = await response.json();
      const analysisText = result.choices[0].message.content;
      
      // Try to parse JSON, fallback to text analysis
      let analysis;
      try {
        analysis = JSON.parse(analysisText);
      } catch {
        analysis = {
          roomType: "Unknown",
          summary: analysisText,
          vastu_analysis: "Room analysis completed",
          feng_shui_analysis: "Energy assessment completed"
        };
      }

      setRoomAnalysis(analysis);
      setCurrentStep('theme');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle theme selection
  const selectTheme = (theme) => {
    setSelectedTheme(theme);
    setCurrentStep('transform');
    generateTransformation(theme);
  };

  // Generate room transformation
  const generateTransformation = async (theme) => {
    setIsLoading(true);
    setError(null);

    try {
      const base64Image = await imageToBase64(uploadedImage.file);
      
      const roomDescription = roomAnalysis.summary || `${roomAnalysis.roomType || 'room'} with ${roomAnalysis.furniture?.join(', ') || 'furniture'}`;
      
      const themePrompts = {
        hogwarts: `${roomDescription} transformed into magical Hogwarts dormitory with floating candles, mystical tapestries, warm golden lighting, wooden furniture, enchanted atmosphere`,
        zen: `${roomDescription} transformed into peaceful Zen temple with natural materials, bamboo elements, soft lighting, minimal furniture, meditation cushions, harmonious energy`,
        hobbit: `${roomDescription} transformed into cozy Hobbit hole with round doors, warm earth tones, wooden beams, soft lighting, comfortable furniture, rustic charm`,
        space: `${roomDescription} transformed into futuristic space pod with sleek surfaces, ambient LED lighting, modern furniture, metallic accents, high-tech atmosphere`,
        vastu: `${roomDescription} redesigned with Vastu Shastra principles, proper directional alignment, natural materials, appropriate colors, balanced furniture placement, positive energy flow`,
        feng_shui: `${roomDescription} redesigned with Feng Shui principles, balanced elements, proper chi flow, harmonious colors, strategic furniture placement, peaceful energy`
      };

      const response = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          prompt: `${themePrompts[theme.id]}, interior design, high quality, detailed, realistic lighting, professional photography style`,
          negative_prompt: 'blurry, low quality, distorted, unrealistic, cartoon, anime, oversaturated',
          width: 1024,
          height: 1024,
          num_inference_steps: 20,
          guidance_scale: 7.5
        })
      });

      if (!response.ok) {
        throw new Error(`Image generation failed: ${response.status}`);
      }

      const imageBlob = await response.blob();
      const transformedImageUrl = URL.createObjectURL(imageBlob);
      
      setTransformedImage({
        url: transformedImageUrl,
        theme: theme
      });

      // Generate hotspots for interactive elements
      const mockHotspots = [
        { x: 25, y: 30, suggestion: 'Add mystical lighting here', type: 'lighting' },
        { x: 70, y: 45, suggestion: 'Place energy crystals on this surface', type: 'decor' },
        { x: 50, y: 70, suggestion: 'Rearrange furniture for better flow', type: 'furniture' },
        { x: 15, y: 60, suggestion: 'Add plants for natural energy', type: 'plants' }
      ];
      setHotspots(mockHotspots);

      setCurrentStep('reading');
      generateMysticalReading(theme);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Generate mystical reading
  const generateMysticalReading = async (theme) => {
    try {
      const response = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a mystical space oracle who combines practical interior design with ancient wisdom. Provide personalized readings that blend Vastu Shastra, Feng Shui, and fantasy elements.'
            },
            {
              role: 'user',
              content: `Based on this room: ${roomAnalysis.roomType || 'room'} with ${roomAnalysis.energy || 'mixed energy'} and chosen theme: ${theme.name}, write EXACTLY 100 words total:

              Energy Assessment (25 words): [current state]
              Benefits (25 words): [transformation benefits] 
              Recommendations (35 words): [specific Vastu/Feng Shui advice]
              Shopping List (15 words): [items to buy]

              Use mystical tone. COUNT WORDS CAREFULLY. STOP AT EXACTLY 100 WORDS.`
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Reading generation failed: ${response.status}`);
      }

      const result = await response.json();
      setMysticalReading(result.choices[0].message.content);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetExperience = () => {
    setCurrentStep('upload');
    setUploadedImage(null);
    setRoomAnalysis(null);
    setSelectedTheme(null);
    setTransformedImage(null);
    setMysticalReading(null);
    setHotspots([]);
    setError(null);
  };

  return (
    <div className="living-space-oracle-container">
      <div className="oracle-header">
        <h1>🏠✨ Living Space Oracle</h1>
        <p>Transform your space with mystical wisdom</p>
      </div>

      {error && (
        <div className="oracle-error">
          <h3>⚠️ Oracle Vision Clouded</h3>
          <p>{error}</p>
          <button onClick={resetExperience} className="oracle-btn secondary">
            Try Again
          </button>
        </div>
      )}

      {/* Step 1: Upload */}
      {currentStep === 'upload' && (
        <div className="oracle-step">
          <div className="upload-section">
            <h2>📸 Share Your Sacred Space</h2>
            <p>Upload a photo of your room to begin the mystical analysis</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="oracle-btn primary upload-btn"
            >
              Choose Room Photo
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Analysis Loading */}
      {currentStep === 'analyze' && (
        <div className="oracle-step">
          <div className="analysis-loading">
            <div className="mystical-spinner"></div>
            <h2>🔮 Reading Your Space's Energy</h2>
            <p>The oracle is analyzing your room's spiritual essence...</p>
          </div>
        </div>
      )}

      {/* Step 3: Theme Selection */}
      {currentStep === 'theme' && roomAnalysis && (
        <div className="oracle-step">
          <h2>🎭 Choose Your Mystical Realm</h2>
          <div className="room-preview">
            <img src={uploadedImage.url} alt="Your room" className="room-image" />
            <div className="analysis-summary">
              <h3>Oracle's Vision:</h3>
              <p>{roomAnalysis.summary || `${roomAnalysis.roomType} with ${roomAnalysis.energy || 'mixed energy flow'}`}</p>
            </div>
          </div>
          <div className="themes-grid">
            {themes.map(theme => (
              <div 
                key={theme.id} 
                className="theme-card"
                onClick={() => selectTheme(theme)}
              >
                <div className="theme-icon">{theme.icon}</div>
                <h3>{theme.name}</h3>
                <p>{theme.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Transformation Loading */}
      {currentStep === 'transform' && (
        <div className="oracle-step">
          <div className="transform-loading">
            <div className="mystical-spinner"></div>
            <h2>✨ Weaving {selectedTheme?.name} Magic</h2>
            <p>The oracle is manifesting your mystical transformation...</p>
          </div>
        </div>
      )}

      {/* Step 5: Final Reading */}
      {currentStep === 'reading' && transformedImage && mysticalReading && (
        <div className="oracle-step">
          <h2>🔮 Your Mystical Transformation</h2>
          <div className="transformation-result">
            <div className="images-comparison">
              <div className="image-container">
                <h3>Before</h3>
                <img src={uploadedImage.url} alt="Original room" />
              </div>
              <div className="image-container interactive-image">
                <h3>After - {selectedTheme.name}</h3>
                <div className="image-wrapper">
                  <img src={transformedImage.url} alt="Transformed room" />
                  {hotspots.map((hotspot, index) => (
                    <div
                      key={index}
                      className="hotspot"
                      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                      title={hotspot.suggestion}
                    >
                      ✨
                    </div>
                  ))}
                </div>
                <p className="hotspot-hint">✨ Click the sparkles to see mystical suggestions</p>
              </div>
            </div>
            
            <div className="mystical-reading">
              <h3>🔮 Your Personal Oracle Reading</h3>
              <div className="reading-content">
                {mysticalReading.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="oracle-actions">
            <button onClick={resetExperience} className="oracle-btn primary">
              🔄 Transform Another Space
            </button>
            <button onClick={onStop} className="oracle-btn secondary">
              ← Return to FantasyWorld Hub
            </button>
          </div>
        </div>
      )}

      {isLoading && currentStep !== 'analyze' && currentStep !== 'transform' && (
        <div className="loading-overlay">
          <div className="mystical-spinner"></div>
          <p>Oracle magic in progress...</p>
        </div>
      )}
    </div>
  );
};

export default LivingSpaceOracle;
