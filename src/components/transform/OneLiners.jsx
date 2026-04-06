import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

const OneLiners = ({ selectedComedian, customComedians, onError }) => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [jokes, setJokes] = useState([]);

  const getPrompt = (comedian, topic) => {
    const customComedian = customComedians.find(c => c.id === comedian);
    if (customComedian) {
      return `As ${customComedian.name}, create 3 quick, punchy one-liner jokes about "${topic}". Use your:
1. Signature style: ${customComedian.trainingData.personalityTraits}
2. Speech patterns: ${customComedian.trainingData.speechPatterns}
Keep each joke short and memorable, perfect for social situations.`;
    }
  };

  const handleSubmit = async () => {
    if (!topic.trim() || !selectedComedian) return;
    
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
            content: [{ type: "text", text: getPrompt(selectedComedian, topic) }]
          }]
        })
      });

      if (!response.ok) throw new Error('Failed to generate one-liners');
      
      const data = await response.json();
      setJokes(data.content[0].text.split('\n').filter(joke => joke.trim()));
    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur rounded-lg p-6 h-[600px] flex flex-col">
      <div className="mb-6">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic for your one-liners... (e.g., coffee, dating, technology)"
          className="w-full p-4 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {jokes.map((joke, index) => (
          <div 
            key={index}
            className="mb-4 p-4 bg-blue-50 rounded-lg"
          >
            {joke}
          </div>
        ))}
      </div>

      <button 
        onClick={handleSubmit}
        disabled={loading || !topic.trim() || !selectedComedian}
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-lg py-3 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating One-Liners...
          </>
        ) : (
          <>
            <Send className="mr-2 h-5 w-5" />
            Generate One-Liners! 🎤
          </>
        )}
      </button>
    </div>
  );
};

export default OneLiners;