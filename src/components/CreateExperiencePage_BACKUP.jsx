import React, { useState } from 'react';
import '../styles/create-experience.css';

const CreateExperiencePage = ({ onReturn }) => {
  const [selectedFormat, setSelectedFormat] = useState('');
  const [userInput, setUserInput] = useState('');
  const [userMoods, setUserMoods] = useState('');
  const [parsedMoods, setParsedMoods] = useState([]);
  const [refinedPrompt, setRefinedPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [showRefinedPrompt, setShowRefinedPrompt] = useState(false);

  // Example refined prompts for display
  const examplePrompts = [
    {
      input: "space cats",
      refined: "Majestic feline astronauts in crystalline space suits exploring a nebula filled with floating fish-shaped asteroids, their whiskers glowing with cosmic energy as they leap between rainbow-colored planetary rings in zero gravity."
    },
    {
      input: "Space Cats kingdom",
      refined: "A magnificent feline empire built inside a massive space station shaped like a yarn ball, where cat royalty in golden space crowns rule over crystal towers filled with anti-gravity fish ponds, while subjects float gracefully through corridors lined with cosmic catnip gardens."
    },
    {
      input: "ninja librarians",
      refined: "Silent warrior scholars in flowing robes made of ancient book pages, wielding katanas that slice through ignorance while leaping between floating library shelves in a mystical archive where books fly like birds and knowledge glows like fireflies."
    }
  ];

  const creativityPrinciples = [
    { title: "Adjacent Possible", summary: "Connect ideas from different domains" },
    { title: "Cultural Specificity", summary: "Specific details beat generic concepts" },
    { title: "Show Don't Tell", summary: "Make people feel it, don't explain it" },
    { title: "Iteration Instinct", summary: "Great ideas emerge through repeated refinement" },
    { title: "Goldilocks Zone", summary: "Perfect balance of simple and complex" }
  ];

  // Parse moods when userMoods changes
  React.useEffect(() => {
    if (userMoods.trim()) {
      const moods = userMoods.split(',')
        .map(mood => mood.trim())
        .filter(mood => mood.length > 0)
        .slice(0, 5); // Limit to 5 moods
      setParsedMoods(moods);
    } else {
      setParsedMoods([]);
    }
  }, [userMoods]);

  const refinePrompt = async () => {
    if (!userInput.trim()) return;
    
    setIsRefining(true);
    setShowRefinedPrompt(false);
    
    try {
      const moodInstruction = parsedMoods.length > 0 
        ? ` Apply these moods/tones: ${parsedMoods.join(', ')}.`
        : '';
      
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
              content: `You are a creative prompt expansion expert. Take the user's simple idea and expand it into a rich, detailed, fantastical prompt of 100-150 words. Focus on visual details, impossible combinations, and magical elements. Make it wild, creative, and specific. For ${selectedFormat === 'image-only' ? 'image generation' : selectedFormat === 'text-only' ? 'story writing' : 'both image and story creation'}.${moodInstruction}`
            },
            {
              role: 'user',
              content: `Expand this simple idea into a detailed creative prompt: "${userInput}"`
            }
          ],
          model: 'gpt-4',
          max_tokens: 200,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        throw new Error(`Refinement failed: ${response.status}`);
      }

      const data = await response.json();
      const refined = data.choices[0].message.content;
      setRefinedPrompt(refined);
      setShowRefinedPrompt(true);
      
    } catch (error) {
      console.error('Refinement error:', error);
      setRefinedPrompt("Couldn't expand your idea. Try describing it differently or check your connection.");
      setShowRefinedPrompt(true);
    } finally {
      setIsRefining(false);
    }
  };

  const generateContent = async () => {
    if (!refinedPrompt) return;
    
    setIsGenerating(true);
    setGeneratedContent(null);
    
    try {
      let generatedText = null;
      let generatedImage = null;

      // Generate text if needed
      if (selectedFormat === 'text-only' || selectedFormat === 'text-image') {
        const moodInstruction = parsedMoods.length > 0 
          ? ` Apply these moods/tones: ${parsedMoods.join(', ')}.`
          : '';
        
        const textResponse = await fetch('https://api.segmind.com/v1/gpt-4', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: `Create a creative story or description based on this prompt. Keep it under 200 words, make it engaging and fantastical. Focus on ${selectedFormat === 'text-image' ? 'vivid imagery that matches the visual prompt' : 'rich storytelling and character development'}.${moodInstruction}`
              },
              {
                role: 'user',
                content: refinedPrompt
              }
            ],
            model: 'gpt-4',
            max_tokens: 250,
            temperature: 0.8
          })
        });

        if (textResponse.ok) {
          const textData = await textResponse.json();
          generatedText = textData.choices[0].message.content;
        }
      }

      // Generate image if needed
      if (selectedFormat === 'image-only' || selectedFormat === 'text-image') {
        try {
          const moodPromptAddition = parsedMoods.length > 0 
            ? `, ${parsedMoods.join(', ')} mood and atmosphere`
            : '';
          
          console.log('Starting image generation...');
          const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
            },
            body: JSON.stringify({
              prompt: refinedPrompt + ". Vibrant, artistic, fantastical, detailed, high quality" + moodPromptAddition + ".",
              negative_prompt: 'boring, predictable, normal, text, words, letters, ugly, blurry, low quality, simple',
              width: 512,
              height: 512,
              num_inference_steps: 20,
              guidance_scale: 7.5
            })
          });

          console.log('Image response status:', imageResponse.status);
          
          if (imageResponse.ok) {
            const imageBlob = await imageResponse.blob();
            console.log('Image blob size:', imageBlob.size);
            generatedImage = {
              url: URL.createObjectURL(imageBlob),
              description: "Generated visual"
            };
            console.log('Image generated successfully');
          } else {
            const errorText = await imageResponse.text();
            console.error('Image generation failed:', imageResponse.status, errorText);
          }
        } catch (imageError) {
          console.error('Image generation error:', imageError);
        }
      }

      setGeneratedContent({
        text: generatedText,
        image: generatedImage
      });
      
    } catch (error) {
      console.error('Generation error:', error);
      setGeneratedContent({
        text: "Generation failed. Please try again or refine your prompt.",
        image: null
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetFlow = () => {
    setUserInput('');
    setUserMoods('');
    setParsedMoods([]);
    setRefinedPrompt('');
    setShowRefinedPrompt(false);
    setGeneratedContent(null);
  };

  return (
    <div className="create-experience-page">
      <div className="create-experience-container">
        
        {/* Left Panel - Main Creation Interface */}
        <div className="creation-panel">
          <div className="creation-header">
            <h1>🎨 Create Your Own Experience</h1>
            <p>Turn your wildest ideas into reality with AI</p>
          </div>

          {/* Step 1: Format Selection */}
          <div className="format-selection">
            <h3>Choose Your Format:</h3>
            <select 
              value={selectedFormat} 
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="format-dropdown"
            >
              <option value="">Select format...</option>
              <option value="image-only">🖼️ Image Only</option>
              <option value="text-only">📝 Text Only</option>
              <option value="text-image">📝🖼️ Text + Image</option>
            </select>
          </div>

          {/* Example Prompts */}
          {selectedFormat && !userInput && (
            <div className="example-prompts">
              <h4>✨ See how simple ideas become magical:</h4>
              {examplePrompts.map((example, index) => (
                <div key={index} className="example-item">
                  <div className="example-input">"{example.input}"</div>
                  <div className="example-arrow">→</div>
                  <div className="example-refined">{example.refined}</div>
                </div>
              ))}
            </div>
          )}

          {/* Step 2: User Input */}
          {selectedFormat && (
            <div className="user-input-section">
              <h3>Describe Your Idea (just a few words):</h3>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="e.g., dancing robots, underwater cities, time-traveling cats..."
                className="idea-input"
                maxLength={50}
              />
              
              <h3>Mood/Tone (up to 5, comma-separated):</h3>
              <input
                type="text"
                value={userMoods}
                onChange={(e) => setUserMoods(e.target.value)}
                placeholder="e.g., Funny, Fantasy, Mysterious, Therapeutic, Epic..."
                className="mood-input"
                maxLength={100}
              />
              
              {parsedMoods.length > 0 && (
                <div className="parsed-moods">
                  <span className="moods-label">Selected: </span>
                  {parsedMoods.map((mood, index) => (
                    <span key={index} className="mood-tag">{mood}</span>
                  ))}
                  <span className="mood-counter">({parsedMoods.length}/5)</span>
                </div>
              )}
              
              <button 
                onClick={refinePrompt}
                disabled={!userInput.trim() || isRefining}
                className="refine-button"
              >
                {isRefining ? '🧠 Expanding your idea...' : '✨ Refine with AI'}
              </button>
            </div>
          )}

          {/* Step 3: Refined Prompt Display */}
          {showRefinedPrompt && (
            <div className="refined-prompt-section">
              <h3>🎯 Your Expanded Creative Prompt:</h3>
              <div className="refined-prompt-display">
                <textarea
                  value={refinedPrompt}
                  onChange={(e) => setRefinedPrompt(e.target.value)}
                  className="refined-prompt-text"
                  rows={6}
                />
              </div>
              <div className="prompt-actions">
                <button 
                  onClick={refinePrompt}
                  disabled={isRefining}
                  className="refine-again-button"
                >
                  {isRefining ? '🧠 Refining...' : '🔄 Refine Again'}
                </button>
                <button 
                  onClick={generateContent}
                  disabled={isGenerating}
                  className="generate-button"
                >
                  {isGenerating ? 
                    (selectedFormat === 'image-only' ? '🎨 Painting your vision...' :
                     selectedFormat === 'text-only' ? '📝 Writing your story...' :
                     '🎭 Creating your masterpiece...') :
                    '🚀 Generate Content'
                  }
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Generated Content */}
          {generatedContent && (
            <div className="generated-content-section">
              <h3>🌟 Your Creation:</h3>
              <div className={`generated-content ${generatedContent.text && generatedContent.image ? 'side-by-side' : ''}`}>
                {generatedContent.image && (
                  <div className="generated-image">
                    <h4>�️ Visual:</h4>
                    <img src={generatedContent.image.url} alt="Generated content" />
                  </div>
                )}
                {generatedContent.text && (
                  <div className="generated-text">
                    <h4>� Story:</h4>
                    <p>{generatedContent.text}</p>
                  </div>
                )}
              </div>
              <div className="content-actions">
                <button onClick={generateContent} className="generate-again-button">
                  🎲 Generate Again
                </button>
                <button onClick={resetFlow} className="start-over-button">
                  ✨ Start Over
                </button>
                <button onClick={onReturn} className="return-button">
                  🏠 Return to Hub
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Creativity Principles Summary */}
        <div className="principles-panel">
          <div className="principles-summary">
            <h3>💡 Creativity Principles</h3>
            <div className="principles-list">
              {creativityPrinciples.map((principle, index) => (
                <div key={index} className="principle-item">
                  <div className="principle-number">{index + 1}</div>
                  <div className="principle-content">
                    <div className="principle-title">{principle.title}</div>
                    <div className="principle-summary">{principle.summary}</div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => window.open(`${window.location.origin}${window.location.pathname}?creativity=true`, '_blank')}
              className="learn-more-button"
            >
              📚 Learn More
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateExperiencePage;
