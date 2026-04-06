import React, { useState } from 'react';
import '../styles/hydrokinetic-part1.css';

const HydrokineticPart1Page = ({ onReturn }) => {
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateContent = async () => {
    
    setIsGenerating(true);
    setGeneratedContent(null);
    
    try {
      let generatedText = null;
      let generatedImage = null;

      // Generate descriptive text using GPT-4
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
              content: 'Generate a short 1-2 sentence description of someone using hydrokinetic water manipulation powers. Keep it under 30 words, epic and cinematic like a movie scene. Focus on the visual spectacle of water control abilities.'
            },
            {
              role: 'user',
              content: `Create a brief, cinematic description of hydrokinetic water powers in action. Make it mystical and inspired by water manipulation abilities.`
            }
          ],
          model: 'gpt-4',
          max_tokens: 50,
          temperature: 0.8
        })
      });

      if (textResponse.ok) {
        const textData = await textResponse.json();
        generatedText = textData.choices[0].message.content;
      }

      // Generate image using Nano Banana
      const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          prompt: `Hydrokinetic water manipulation powers, mystical water control abilities, person wielding water powers, flowing water streams, aquatic magic, oceanic energy, crystal clear water, bioluminescent water effects, temple of the sea atmosphere, Pokémon Ranger inspired, magical water bending, serene yet powerful, ethereal water spirits, cinematic lighting, highly detailed, fantasy art style`,
          negative_prompt: 'blurry, low quality, dark, muddy water, pollution, ugly, distorted, text, watermark, simple, boring',
          width: 768,
          height: 512,
          num_inference_steps: 25,
          guidance_scale: 7.5
        })
      });

      if (imageResponse.ok) {
        const imageBlob = await imageResponse.blob();
        generatedImage = {
          url: URL.createObjectURL(imageBlob),
          description: "Hydrokinetic abilities visualization"
        };
      }

      setGeneratedContent({
        text: generatedText,
        image: generatedImage
      });
      
    } catch (error) {
      console.error('Generation error:', error);
      setGeneratedContent({
        text: "Generation failed. Please try again with a different scenario.",
        image: null
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate content on mount
  React.useEffect(() => {
    if (!generatedContent && !isGenerating) {
      generateContent();
    }
  }, []);

  return (
    <div className="hydrokinetic-part1-page">
      <div className="hydrokinetic-header">
        <h1>🌊 Hydrokinetic Abilities - Part 1</h1>
        <p className="hydrokinetic-subtitle">Discover the mystical power of water manipulation</p>
      </div>

      {/* Loading state */}
      {isGenerating && (
        <div className="loading-section">
          <div className="water-spinner"></div>
          <h2>🌊 Channeling Hydrokinetic Powers...</h2>
          <p>Ancient water spirits are awakening...</p>
        </div>
      )}

      {generatedContent && (
        <div className="content-display">
          {generatedContent.text && (
            <div className="text-content">
              <p>{generatedContent.text}</p>
            </div>
          )}
          
          {generatedContent.image && (
            <div className="image-content">
              <img src={generatedContent.image.url} alt="Hydrokinetic abilities" />
            </div>
          )}
          
          <div className="action-buttons">
            <button onClick={generateContent} className="regenerate-button">
              🔄 Generate New Vision
            </button>
            <button onClick={onReturn} className="return-button">
              🏠 Return to Hub
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default HydrokineticPart1Page;
