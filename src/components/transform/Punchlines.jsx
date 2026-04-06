import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

const Punchlines = ({ selectedComedian, customComedians, onError }) => {
  const [setup, setSetup] = useState('');
  const [loading, setLoading] = useState(false);
  const [punchlines, setPunchlines] = useState([]);

  const getPrompt = (comedian, setup) => {
    const customComedian = customComedians.find(c => c.id === comedian);
    if (customComedian) {
      return `As ${customComedian.name}, generate 3 different punchlines for this joke setup, ranging from mild to wild. Use your:
1. Personality: ${customComedian.trainingData.personalityTraits}
2. Speech style: ${customComedian.trainingData.speechPatterns}
3. References: ${customComedian.trainingData.commonReferences}

Joke setup: "${setup}"

Generate three punchlines labeled:
1. Mild: [family-friendly version]
2. Medium: [slightly edgy version]
3. Wild: [most comedic version]`;
    }
  };

  const handleSubmit = async () => {
    if (!setup.trim() || !selectedComedian) return;
    
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
            content: [{ type: "text", text: getPrompt(selectedComedian, setup) }]
          }]
        })
      });

      if (!response.ok) throw new Error('Failed to generate punchlines');
      
      const data = await response.json();
      setPunchlines(data.content[0].text.split('\n').filter(line => line.trim()));
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
          value={setup}
          onChange={(e) => setSetup(e.target.value)}
          placeholder="Enter your joke setup... (e.g., Why did the chicken cross the road?)"
          className="w-full p-4 text-lg border rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {punchlines.map((punchline, index) => (
          <div 
            key={index}
            className="p-4 bg-blue-50 rounded-lg"
          >
            <p className="whitespace-pre-wrap">{punchline}</p>
          </div>
        ))}
      </div>

      <button 
        onClick={handleSubmit}
        disabled={loading || !setup.trim() || !selectedComedian}
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-lg py-3 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating Punchlines...
          </>
        ) : (
          <>
            <Send className="mr-2 h-5 w-5" />
            Generate Punchlines! 🎭
          </>
        )}
      </button>
    </div>
  );
};

export default Punchlines;