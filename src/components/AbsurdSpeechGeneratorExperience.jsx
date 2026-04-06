import React, { useState } from 'react';
import '../styles/absurd-speech-generator.css';

const AbsurdSpeechGeneratorExperience = ({ onStop }) => {
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    toWhom: '',
    occasion: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateContent = async () => {
    if (!formData.toWhom.trim() || !formData.occasion.trim()) {
      alert('Please fill in both fields!');
      return;
    }

    setIsGenerating(true);
    setShowForm(false);
    
    try {
      let generatedText = null;
      let generatedImage = null;

      // Generate absurd speech using Segmind GPT-4
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
              content: `You are a master of absurd, hilariously ridiculous speeches that make people's stomachs ache from laughing. Write SHORT speeches (max 150 words) with completely unexpected, absurd backstories involving animals, bizarre accidents, or impossible situations. Keep the tone natural and conversational - like how someone would actually give a speech, not melodramatic or theatrical. Include simple, natural stage directions occasionally like "(look at Sarah)" or "(pause for effect)" but don't overdo it. The humor should come from the ridiculous content, not over-the-top delivery. Always end with 2-3 genuinely heartfelt, wholesome sentences. Keep it concise but hilarious.`
            },
            {
              role: 'user',
              content: `Write a SHORT absurdly funny speech (max 150 words) for ${formData.toWhom} on the occasion of their ${formData.occasion}. Make it completely ridiculous with unexpected backstories, animal encounters, or bizarre situations, but keep the delivery natural and conversational - like how someone would actually speak at this event. Don't be melodramatic or theatrical. End with genuine heartfelt appreciation. Keep it concise but hilarious.`
            }
          ],
          model: 'gpt-4',
          max_tokens: 200,
          temperature: 0.9
        })
      });

      if (textResponse.ok) {
        const textData = await textResponse.json();
        generatedText = textData.choices[0].message.content;
      }

      // Generate related image using Segmind Nano Banana
      const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          prompt: `Funny speech scene, person giving ridiculous speech at ${formData.occasion}, comedic moment, audience laughing, absurd situation, cartoon style, humorous illustration, speech podium, celebration atmosphere, funny expressions, comedic timing`,
          negative_prompt: 'serious, formal, boring, sad, dark, realistic, professional',
          width: 512,
          height: 512,
          num_inference_steps: 20,
          guidance_scale: 7.5
        })
      });

      if (imageResponse.ok) {
        const imageBlob = await imageResponse.blob();
        generatedImage = {
          url: URL.createObjectURL(imageBlob),
          description: "Absurd speech scene"
        };
      }

      setGeneratedContent({
        text: generatedText,
        image: generatedImage
      });
      
    } catch (error) {
      console.error('Generation error:', error);
      setGeneratedContent({
        text: "Speech generation failed. Please try again!",
        image: null
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedContent && generatedContent.text) {
      navigator.clipboard.writeText(generatedContent.text).then(() => {
        alert('Speech copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  };

  const handleGenerateAnother = () => {
    setGeneratedContent(null);
    setShowForm(true);
    setFormData({ toWhom: '', occasion: '' });
  };

  return (
    <div className="absurd-speech-generator-page">
      <div className="speech-header">
        <h1>🎤 Absurd Speech Generator</h1>
        <p className="speech-subtitle">Create hilariously ridiculous speeches that will make your audience cry from laughter</p>
      </div>

      {showForm && (
        <div className="speech-form">
          <div className="form-container">
            <h2>📝 Speech Details</h2>
            <div className="form-group">
              <label htmlFor="toWhom">To Whom:</label>
              <input
                type="text"
                id="toWhom"
                name="toWhom"
                value={formData.toWhom}
                onChange={handleInputChange}
                placeholder="e.g., Sarah and Mike, Class of 2026, My boss Karen"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="occasion">What's the occasion:</label>
              <input
                type="text"
                id="occasion"
                name="occasion"
                value={formData.occasion}
                onChange={handleInputChange}
                placeholder="e.g., wedding, graduation, retirement, birthday"
                className="form-input"
              />
            </div>
            <button onClick={generateContent} className="generate-button">
              🎭 Generate Absurd Speech
            </button>
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="loading-section">
          <div className="speech-spinner"></div>
          <h2>🎪 Crafting Your Ridiculous Speech...</h2>
          <p>Preparing stomach-ache inducing comedy...</p>
        </div>
      )}

      {generatedContent && (
        <div className="content-display">
          <div className="text-section">
            <div className="speech-text">
              {generatedContent.text}
            </div>
          </div>
          
          {generatedContent.image && (
            <div className="image-section">
              <img 
                src={generatedContent.image.url} 
                alt={generatedContent.image.description}
                className="generated-image"
              />
            </div>
          )}
          
          <div className="action-buttons">
            <button onClick={copyToClipboard} className="copy-clipboard-button">
              📋 Copy Speech to Clipboard
            </button>
            <button onClick={handleGenerateAnother} className="regenerate-button">
              🎤 Generate Another Speech
            </button>
            <button onClick={onStop} className="return-button">
              🏠 Return to Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbsurdSpeechGeneratorExperience;
