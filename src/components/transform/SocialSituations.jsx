import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const SocialSituations = ({ selectedComedian, customComedians, onError }) => {
  const [situation, setSituation] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState('party');
  const [response, setResponse] = useState(null);

  const contextPrompts = {
    party: "at a party or social gathering",
    work: "in a work environment or meeting",
    dating: "during a date or romantic situation",
    family: "at a family gathering"
  };

  const getPrompt = (comedian, situation, context) => {
    const customComedian = customComedians.find(c => c.id === comedian);
    if (customComedian) {
      return `As ${customComedian.name}, provide quick-witted responses and observations for this social situation ${contextPrompts[context]}. Use your:
1. Personality: ${customComedian.trainingData.personalityTraits}
2. Style: ${customComedian.trainingData.speechPatterns}

Situation: "${situation}"

Provide:
1. A quick reaction
2. A funny observation
3. A story hook or callback if relevant`;
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
            content: [{ type: "text", text: getPrompt(selectedComedian, situation, context) }]
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
      <Tabs value={context} onValueChange={setContext} className="flex-1">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="party">Party</TabsTrigger>
          <TabsTrigger value="work">Work</TabsTrigger>
          <TabsTrigger value="dating">Dating</TabsTrigger>
          <TabsTrigger value="family">Family</TabsTrigger>
        </TabsList>

        <div className="space-y-4 flex-1">
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder={`Describe the ${context} situation...`}
            className="w-full p-4 text-lg border rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {response && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="whitespace-pre-wrap">{response}</p>
            </div>
          )}
        </div>
      </Tabs>

      <button 
        onClick={handleSubmit}
        disabled={loading || !situation.trim() || !selectedComedian}
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-lg py-3 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating Response...
          </>
        ) : (
          <>
            <Send className="mr-2 h-5 w-5" />
            Get Funny Responses! 🎉
          </>
        )}
      </button>
    </div>
  );
};

export default SocialSituations;