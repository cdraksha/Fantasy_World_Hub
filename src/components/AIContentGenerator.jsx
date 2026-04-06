import React, { useState } from 'react';

const AIContentGenerator = ({ type, topic, onContentGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateContent = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      let prompt = '';
      
      if (type === 'research-explanation') {
        prompt = `Explain the research paper "${topic}" in simple terms that a newcomer to AI research can understand. Focus on: 1) What the core theory is, 2) Why it matters for AI products, 3) How it applies to real user experiences. Keep it under 150 words and avoid jargon.`;
      } else if (type === 'framework-explanation') {
        prompt = `Explain the "${topic}" framework in simple terms for someone new to product management. Focus on: 1) What problem it solves, 2) How it works step-by-step, 3) Why it's better than traditional approaches. Keep it under 150 words and use concrete examples.`;
      } else if (type === 'ai-first-explanation') {
        prompt = `Explain "${topic}" in AI First thinking for someone new to AI product management. Focus on: 1) What this means in practice, 2) How it differs from traditional approaches, 3) Why it leads to better outcomes. Keep it under 150 words with specific examples.`;
      }

      // Generate text explanation
      const textResponse = await fetch('https://api.segmind.com/v1/gpt-4o', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      if (!textResponse.ok) {
        throw new Error('Failed to generate text explanation');
      }

      const textData = await textResponse.json();
      const explanation = textData.choices[0].message.content;

      // Generate visual diagram
      let imagePrompt = '';
      if (type === 'research-explanation') {
        imagePrompt = `A clean, minimalist diagram illustrating the concept of "${topic}". Use simple shapes, arrows, and labels. Professional infographic style with blue and teal colors. No text, just visual representation of the core concept.`;
      } else if (type === 'framework-explanation') {
        imagePrompt = `A simple flowchart diagram showing the "${topic}" framework process. Clean, professional design with boxes, arrows, and clear visual flow. Blue and teal color scheme. Minimalist infographic style.`;
      } else if (type === 'ai-first-explanation') {
        imagePrompt = `A visual comparison diagram showing "${topic}" concept. Split design showing traditional approach vs AI-first approach. Clean, professional infographic style with blue and teal colors.`;
      }

      const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          negative_prompt: "text, words, letters, cluttered, messy, low quality",
          width: 512,
          height: 512,
          num_inference_steps: 20,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000)
        })
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to generate image');
      }

      const imageData = await imageResponse.json();
      const imageUrl = imageData.image;

      onContentGenerated({
        explanation,
        imageUrl,
        topic
      });

    } catch (err) {
      setError(err.message);
      console.error('Error generating AI content:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="ai-content-generator">
      <button 
        onClick={generateContent} 
        disabled={isGenerating}
        className="generate-content-btn"
      >
        {isGenerating ? 'Generating...' : '🤖 Generate AI Explanation'}
      </button>
      {error && <div className="error-message">Error: {error}</div>}
    </div>
  );
};

export default AIContentGenerator;
