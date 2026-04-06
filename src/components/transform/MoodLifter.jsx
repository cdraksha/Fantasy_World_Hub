import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

const MoodLifter = ({ selectedComedian, customComedians, onError }) => {
  const [situation, setSituation] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const getPrompt = (comedian, situation) => {
    const customComedian = customComedians.find(c => c.id === comedian);
    if (customComedian) {
      return `As ${customComedian.name}, transform this frustrating or negative situation into something humorous. Use your:
1. Personality: ${customComedian.trainingData.personalityTraits}
2. Style: ${customComedian.trainingData.speechPatterns}
3. References: ${customComedian.trainingData.commonReferences}

Situation: "${situation}"

Provide:
1. The Lighter Side: A humorous perspective on the situation
2. Story Potential: How this could become a funny story later
3. Plot Twist: An unexpected positive or amusing outcome`;
    }
  };

  const handleSubmit = async () => {
    if (!situation.trim() || !selectedComedian) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3897/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1024,
          temperature: 0.7,
          messages: [{
            role: 'user',
            content: [{ type: "text", text: getPrompt(selectedComedian, situation) }]
          }]
        })
      });

      if (!response.ok) throw new Error('Failed to generate response');
      
      const data = await response.json();
      setResponse(data.content[0].text);
    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur rounded-lg p-6 h-[600px] flex flex-col">
      <div className="mb-6">
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="Describe the frustrating situation you'd like to turn into humor..."
          className="w-full p-4 text-lg border rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {response && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </div>

      <button 
        onClick={handleSubmit}
        disabled={loading || !situation.trim() || !selectedComedian}
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-lg py-3 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Finding the Funny Side...
          </>
        ) : (
          <>
            <Send className="mr-2 h-5 w-5" />
            Transform to Funny! 😊
          </>
        )}
      </button>
    </div>
  );
};

export default MoodLifter;