import { useState } from 'react';

const useAbsurdSpeechGeneratorContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateAbsurdSpeechGeneratorContent = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      let generatedText = null;
      let generatedImage = null;

      // Generate sample absurd speech
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
              content: 'You are a master of absurd, hilariously ridiculous speeches. Write a sample speech with completely unexpected, absurd backstories. Keep the tone natural and conversational - like how someone would actually give a speech, not melodramatic. The humor should come from the ridiculous content, not over-the-top delivery. End with 2-3 genuinely heartfelt sentences.'
            },
            {
              role: 'user',
              content: 'Write a sample absurdly funny speech for a random occasion. Make it completely ridiculous with unexpected backstories and bizarre situations, but keep the delivery natural and conversational. Don\'t be melodramatic. End with genuine heartfelt appreciation.'
            }
          ],
          model: 'gpt-4',
          max_tokens: 300,
          temperature: 0.9
        })
      });

      if (textResponse.ok) {
        const textData = await textResponse.json();
        generatedText = textData.choices[0].message.content;
      }

      // Generate related image
      const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          prompt: 'Funny speech scene, person giving ridiculous speech, comedic moment, audience laughing hysterically, absurd situation, cartoon style, humorous illustration, speech podium, celebration atmosphere, funny expressions, comedic timing, microphone',
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

      return {
        text: generatedText,
        image: generatedImage
      };
      
    } catch (err) {
      console.error('Absurd speech generation error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateAbsurdSpeechGeneratorContent,
    isGenerating,
    error
  };
};

export default useAbsurdSpeechGeneratorContent;
