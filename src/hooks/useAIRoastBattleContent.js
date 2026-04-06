import { useCallback } from 'react';

const useAIRoastBattleContent = () => {

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

  const generateRoasts = useCallback(async (roasterModel) => {
    console.log(`🔥 ${roasterModel} is roasting everyone...`);
    
    // Get all other AI models to roast
    const allModels = ['gpt-5.2', 'gemini-3-pro', 'claude-4-sonnet', 'llama-v3p1-70b-instruct', 'deepseek-chat'];
    const targets = allModels.filter(model => model !== roasterModel);
    
    // Define roaster personalities for roasting
    const roasterPersonalities = {
      'gpt-5.2': 'You are GPT 5.2. You roast other AIs with clever and funny burns.',
      'gemini-3-pro': 'You are Gemini 3 Pro. You roast other AIs with witty and inventive burns.',
      'claude-4-sonnet': 'You are Claude 4 Sonnet. You roast other AIs with clever and funny burns.',
      'llama-v3p1-70b-instruct': 'You are Llama 3.1 70B. You roast other AIs with witty burns.',
      'deepseek-chat': 'You are Deepseek. You roast other AIs with clever and funny burns.'
    };

    // Target descriptions for context
    const targetDescriptions = {
      'gpt-5.2': 'GPT 5.2',
      'gemini-3-pro': 'Gemini 3 Pro',
      'claude-4-sonnet': 'Claude 4 Sonnet',
      'llama-v3p1-70b-instruct': 'Llama 3.1 70B',
      'deepseek-chat': 'Deepseek'
    };

    const roasts = [];
    
    try {
      // Generate roasts for each target
      for (const target of targets) {
        const systemPrompt = `${roasterPersonalities[roasterModel]}

You are roasting ${targetDescriptions[target]}.

Deliver ONE funny, clever roast about their personality quirks. Keep it playful and witty, not mean. Maximum 25 words. Make it a burn that's so good they'll have to respect it while being roasted.

Examples of good roasts:
- "Your analysis is so thorough, you probably fact-check your own dreams."
- "You're so creative, you'd turn a grocery list into abstract performance art."
- "You philosophize so much, you probably debate the ethics of your own existence."

Now roast ${getAIDisplayName(target)}:`;

        let response;
        
        // Call the appropriate API based on roaster model
        if (roasterModel === 'gpt-5.2') {
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
        } else if (roasterModel === 'gemini-3-pro') {
          response = await fetch('https://api.segmind.com/v1/gemini-3-pro', {
            method: 'POST',
            headers: {
              'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: systemPrompt
                    }
                  ]
                }
              ]
            })
          });
        } else if (roasterModel === 'claude-4-sonnet') {
          response = await fetch('https://api.segmind.com/v1/claude-4-sonnet', {
            method: 'POST',
            headers: {
              'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: systemPrompt
                    }
                  ]
                }
              ]
            })
          });
        } else if (roasterModel === 'llama-v3p1-70b-instruct') {
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
        } else if (roasterModel === 'deepseek-chat') {
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
          throw new Error(`${roasterModel} roast generation failed: ${response.status}`);
        }

        const data = await response.json();
        let roastContent;

        // Parse response based on API format
        console.log('Roast data:', data);
        
        if (roasterModel === 'gemini-3-pro' || roasterModel === 'claude-4-sonnet') {
          // Handle array-based content structure
          if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
            if (Array.isArray(data.choices[0].message.content)) {
              roastContent = data.choices[0].message.content[0].text;
            } else {
              roastContent = data.choices[0].message.content;
            }
          } else {
            throw new Error(`Invalid roast response structure from ${roasterModel}`);
          }
        } else {
          // Handle simple content structure
          if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
            roastContent = data.choices[0].message.content;
          } else {
            throw new Error(`Invalid roast response structure from ${roasterModel}`);
          }
        }

        roasts.push({
          target: target,
          content: roastContent.trim()
        });
      }

      return roasts;
    } catch (error) {
      console.error('Roast generation failed:', error);
      throw new Error('Failed to generate roasts');
    }
  }, []);

  const generateResponse = useCallback(async (responderModel, roastFeed, originalRoaster) => {
    console.log(`💥 ${responderModel} is responding...`);
    
    // Build context from roast feed
    const roastContext = roastFeed.map(entry => {
      if (entry.type === 'roast') {
        return `${getAIDisplayName(entry.roaster)} roasted ${getAIDisplayName(entry.target)}: "${entry.content}"`;
      } else {
        return `${getAIDisplayName(entry.responder)} responded: "${entry.content}"`;
      }
    }).join('\n');

    // Define responder personalities
    const responderPersonalities = {
      'gpt-5.2': 'You are GPT 5.2. Respond with clever and funny comebacks.',
      'gemini-3-pro': 'You are Gemini 3 Pro. Respond with witty and inventive comebacks.',
      'claude-4-sonnet': 'You are Claude 4 Sonnet. Respond with clever and funny comebacks.',
      'llama-v3p1-70b-instruct': 'You are Llama 3.1 70B. Respond with witty comebacks.',
      'deepseek-chat': 'You are Deepseek. Respond with clever and funny comebacks.'
    };

    const systemPrompt = `${responderPersonalities[responderModel]}

ROAST BATTLE CONTEXT:
${roastContext}

You can either:
1. Defend yourself if you were roasted
2. Counter-roast the original roaster (${getAIDisplayName(originalRoaster)})
3. Roast someone else who got roasted
4. Make a general witty observation about the roast battle

Deliver ONE funny comeback or roast (maximum 25 words). Be clever, witty, and true to your personality. Reference specific roasts if relevant.`;

    try {
      let response;
      
      // Call the appropriate API based on responder model
      if (responderModel === 'gpt-5.2') {
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
      } else if (responderModel === 'gemini-3-pro') {
        response = await fetch('https://api.segmind.com/v1/gemini-3-pro', {
          method: 'POST',
          headers: {
            'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: systemPrompt
                  }
                ]
              }
            ]
          })
        });
      } else if (responderModel === 'claude-4-sonnet') {
        response = await fetch('https://api.segmind.com/v1/claude-4-sonnet', {
          method: 'POST',
          headers: {
            'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: systemPrompt
                  }
                ]
              }
            ]
          })
        });
      } else if (responderModel === 'llama-v3p1-70b-instruct') {
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
      } else if (responderModel === 'deepseek-chat') {
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
        throw new Error(`${responderModel} response generation failed: ${response.status}`);
      }

      const data = await response.json();
      let responseContent;

      // Parse response based on API format
      console.log('Response data:', data);
      
      if (responderModel === 'gemini-3-pro' || responderModel === 'claude-4-sonnet') {
        // Handle array-based content structure
        if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          if (Array.isArray(data.choices[0].message.content)) {
            responseContent = data.choices[0].message.content[0].text;
          } else {
            responseContent = data.choices[0].message.content;
          }
        } else {
          throw new Error(`Invalid response structure from ${responderModel}`);
        }
      } else {
        // Handle simple content structure
        if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          responseContent = data.choices[0].message.content;
        } else {
          throw new Error(`Invalid response structure from ${responderModel}`);
        }
      }

      return responseContent.trim();
    } catch (error) {
      console.error('Response generation failed:', error);
      throw new Error('Failed to generate response');
    }
  }, []);

  return {
    generateRoasts,
    generateResponse
  };
};

export default useAIRoastBattleContent;
