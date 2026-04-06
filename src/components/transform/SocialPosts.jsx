import React, { useState } from 'react';
import { Send, Loader2, Twitter, Instagram } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const SocialPosts = ({ selectedComedian, customComedians, onError }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState('twitter');
  const [generatedContent, setGeneratedContent] = useState(null);

  const platformPrompts = {
    twitter: "Create a witty tweet (max 280 characters) with relevant hashtags",
    instagram: "Create an engaging Instagram caption with emojis and hashtags",
  };

  const getPrompt = (comedian, text, platform) => {
    const customComedian = customComedians.find(c => c.id === comedian);
    if (customComedian) {
      return `As ${customComedian.name}, transform this content for ${platform}. ${platformPrompts[platform]}.
Use your unique style:
1. Personality: ${customComedian.trainingData.personalityTraits}
2. Speech patterns: ${customComedian.trainingData.speechPatterns}
3. References: ${customComedian.trainingData.commonReferences}

Content to transform: "${text}"`;
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() || !selectedComedian) return;
    
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
            content: [{ type: "text", text: getPrompt(selectedComedian, content, platform) }]
          }]
        })
      });

      if (!response.ok) throw new Error('Failed to generate social post');
      
      const data = await response.json();
      setGeneratedContent(data.content[0].text);
    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newPlatform) => {
    setPlatform(newPlatform);
    setGeneratedContent(null);
    setContent('');
    setLoading(false);
  };

  return (
    <div className="bg-white/90 backdrop-blur rounded-lg p-6 h-[600px] flex flex-col">
      <Tabs value={platform} onValueChange={handleTabChange} className="flex-1">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="twitter" className="flex items-center gap-2">
            <Twitter className="w-4 h-4" />
            Twitter
          </TabsTrigger>
          <TabsTrigger value="instagram" className="flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            Instagram
          </TabsTrigger>
        </TabsList>

        <div className="space-y-4 flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What would you like to post on ${platform}?`}
            className="w-full p-4 text-lg border rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {generatedContent && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Generated {platform} Post:</h3>
              <p className="whitespace-pre-wrap">{generatedContent}</p>
            </div>
          )}
        </div>
      </Tabs>

      <button 
        onClick={handleSubmit}
        disabled={loading || !content.trim() || !selectedComedian}
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-lg py-3 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Creating Post...
          </>
        ) : (
          <>
            <Send className="mr-2 h-5 w-5" />
            Create {platform} Post! 📱
          </>
        )}
      </button>
    </div>
  );
};

export default SocialPosts;