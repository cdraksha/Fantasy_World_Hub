import { useCallback } from 'react';

const useFunnyAIChatboxContent = () => {

  // Helper function to get AI display names
  const getAIDisplayName = (model) => {
    const names = {
      'gpt-5.2': 'GPT 5.2',
      'gemini-3-pro': 'Gemini 3 Pro',
      'claude-4-sonnet': 'Claude 4 Sonnet',
      'llama-v3p1-70b-instruct': 'Llama 3.1 70B',
      'deepseek-chat': 'Deepseek'
    };
    return names[model] || model;
  };

  const generateInitialPrompt = useCallback(async () => {
    console.log('🎯 Generating conversation starter prompt...');
    
    const promptIdeas = [
      "Should aliens prefer pizza or tacos?",
      "What's the most useless superpower that's actually useful?",
      "What if gravity was optional on weekends?",
      "Why do socks disappear in the dryer?",
      "Are hot dogs sandwiches?",
      "What will humans evolve into next?",
      "What do AIs dream about?",
      "Which came first: chicken, egg, or grocery store?",
      "Why do cats act like they own everything?",
      "Do household objects have secret lives?"
    ];

    const randomPrompt = promptIdeas[Math.floor(Math.random() * promptIdeas.length)];
    return randomPrompt;
  }, []);

  const generateAIResponse = useCallback(async (aiModel, conversation) => {
    console.log(`🤖 Generating ${aiModel} response...`);
    
    // Build conversation context
    const conversationContext = conversation.map(msg => {
      if (msg.type === 'prompt') {
        return `TOPIC: ${msg.content}`;
      } else if (msg.type === 'ai_response') {
        const aiName = getAIDisplayName(msg.aiModel);
        return `${aiName}: ${msg.content}`;
      }
      return '';
    }).join('\n\n');

    // Get the last speaker for context
    const lastMessage = conversation[conversation.length - 1];
    const lastSpeaker = lastMessage?.type === 'ai_response' ? getAIDisplayName(lastMessage.aiModel) : null;

    // Define AI personalities
    const personalities = {
      'gpt-5.2': 'You are GPT 5.2 (The Analyst) - respond with ONE funny sentence that analyzes the topic with data and logic but in a witty way.',
      'gemini-3-pro': 'You are Gemini 3 Pro (The Creative) - respond with ONE funny sentence that takes a wild, imaginative, artistic angle on the topic.',
      'claude-4-sonnet': 'You are Claude 4 Sonnet (The Philosopher) - respond with ONE funny sentence that considers deep philosophical implications in an amusing way.',
      'llama-v3p1-70b-instruct': 'You are Llama 3.1 70B (The Contrarian) - respond with ONE funny, sarcastic sentence that challenges or pokes fun at the topic.',
      'deepseek-chat': 'You are Deepseek (The Mystic) - respond with ONE funny sentence that makes an unexpected, profound connection that surprises everyone.'
    };

    const currentAIName = getAIDisplayName(aiModel);
    
    let responseInstruction = '';
    if (lastSpeaker && lastSpeaker !== currentAIName) {
      responseInstruction = `You are responding to ${lastSpeaker}. Address them by name and react to their comment. `;
    }

    const systemPrompt = `${personalities[aiModel]}

CONVERSATION SO FAR:
${conversationContext}

${responseInstruction}Respond with EXACTLY ONE funny sentence (maximum 20 words). Be hilarious and true to your personality. ${lastSpeaker ? `Reference ${lastSpeaker} if responding to them.` : ''} No explanations, just one witty line.`;

    try {
      let response;
      
      if (aiModel === 'gpt-5.2') {
        response = await fetch('https://api.segmind.com/v1/gpt-5.2', {
          method: 'POST',
          headers: {
            'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: systemPrompt
              }
            ]
          })
        });
      } else if (aiModel === 'gemini-3-pro') {
        response = await fetch('https://api.segmind.com/v1/gemini-3-pro', {
          method: 'POST',
          headers: {
            'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: {
              system_instruction: {
                parts: {
                  text: personalities[aiModel]
                }
              },
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `Respond to this conversation:\n\n${conversationContext}\n\nKeep it funny and engaging, around 50-100 words.`
                    }
                  ]
                }
              ]
            }
          })
        });
      } else if (aiModel === 'claude-4-sonnet') {
        response = await fetch('https://api.segmind.com/v1/claude-4-sonnet', {
          method: 'POST',
          headers: {
            'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instruction: personalities[aiModel],
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `Respond to this conversation:\n\n${conversationContext}\n\nKeep it funny and engaging, around 50-100 words.`
                  }
                ]
              }
            ]
          })
        });
      } else if (aiModel === 'llama-v3p1-70b-instruct') {
        response = await fetch('https://api.segmind.com/v1/llama-v3p1-70b-instruct', {
          method: 'POST',
          headers: {
            'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: systemPrompt
              }
            ]
          })
        });
      } else if (aiModel === 'deepseek-chat') {
        response = await fetch('https://api.segmind.com/v1/deepseek-chat', {
          method: 'POST',
          headers: {
            'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: systemPrompt
              }
            ]
          })
        });
      }

      if (!response.ok) {
        throw new Error(`${aiModel} response failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse response based on AI model format
      let content = '';
      if (aiModel === 'gemini-3-pro') {
        content = data.candidates?.[0]?.content?.parts?.[0]?.text || data.response || 'No response generated';
      } else if (aiModel === 'claude-4-sonnet') {
        content = data.content?.[0]?.text || data.response || 'No response generated';
      } else {
        // GPT-5.2, Grok, Deepseek format
        content = data.choices?.[0]?.message?.content || data.response || 'No response generated';
      }

      return content;
    } catch (error) {
      console.error(`${aiModel} response generation failed:`, error);
      throw new Error(`Failed to generate ${aiModel} response`);
    }
  }, []);

  return {
    generateInitialPrompt,
    generateAIResponse
  };
};

export default useFunnyAIChatboxContent;
