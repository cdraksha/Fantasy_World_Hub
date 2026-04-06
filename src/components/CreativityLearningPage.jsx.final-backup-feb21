import React, { useState, useEffect } from 'react';
import '../styles/creativity-learning.css';
const CreativityLearningPage = ({ onReturn }) => {
  const [generatedContent, setGeneratedContent] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [userPrompts, setUserPrompts] = useState({});
  const [isRefining, setIsRefining] = useState({});

  // Context and final refinement states
  const [userContext, setUserContext] = useState('');
  const [contextSubmitted, setContextSubmitted] = useState(false);
  const [finalRefinedIdea, setFinalRefinedIdea] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [finalGeneratedContent, setFinalGeneratedContent] = useState(null);
  const [isRefiningFinalIdea, setIsRefiningFinalIdea] = useState(false);
  const [isGeneratingFinalContent, setIsGeneratingFinalContent] = useState(false);
  const [isGeneratingSeeds, setIsGeneratingSeeds] = useState({});
  const [videoCountdown, setVideoCountdown] = useState(0);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [bannedWords, setBannedWords] = useState([]);
  const [isGeneratingBannedWords, setIsGeneratingBannedWords] = useState(false);
  const [approvedPrinciples, setApprovedPrinciples] = useState(new Set());
  const [isAutoGenerating, setIsAutoGenerating] = useState({});

  // Auto-generate banned words on component mount
  useEffect(() => {
    generateBannedWords();
  }, []);
  
  // Try It Out section states
  const [adjacentSeeds, setAdjacentSeeds] = useState({});
  const [culturalDetails, setCulturalDetails] = useState({});
  const [showDontTellSentence, setShowDontTellSentence] = useState({});
  const [goldilocksSetting, setGoldilocksSetting] = useState({});

  // Domain seeds for Adjacent Possible
  const domainSeeds = [
    // Abstract concepts
    'how queues work at a government office', 'the way light behaves underwater', 'the silence between musical notes',
    'how rumors spread in small towns', 'the physics of a perfect handshake', 'the architecture of dreams',
    'how trust builds between strangers', 'the geometry of laughter', 'the economics of birthday wishes',
    
    // Physical/tangible things
    'street food vendor negotiation tactics', 'the way cats choose their sleeping spots', 'origami folding patterns',
    'how plants compete for sunlight', 'the ritual of making morning tea', 'bicycle repair shop conversations',
    'the dance of traffic at rush hour', 'how spices blend in a curry', 'the mechanics of a perfect hug'
  ];

  const generateAdjacentSeeds = async (principleId) => {
    setIsGeneratingSeeds(prev => ({ ...prev, [principleId]: true }));
    try {
      const response = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Generate 2 funny, relatable concepts that could create unexpected connections with the user\'s situation. These should be everyday things that could lead to creative combinations when mixed with their context. Make them simple, accessible, and potentially humorous when combined. Return as JSON: {"concept1": "description", "concept2": "description"}'
            },
            {
              role: 'user',
              content: `The user is working on: "${userContext}". Generate 2 concepts that could create funny or unexpected connections with this situation. Think about what everyday things could combine with their context in creative ways.`
            }
          ],
          model: 'gpt-4',
          max_tokens: 100,
          temperature: 0.8
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        try {
          const seeds = JSON.parse(data.choices[0].message.content);
          setAdjacentSeeds(prev => ({
            ...prev,
            [principleId]: {
              domain1: seeds.concept1,
              domain2: seeds.concept2
            }
          }));
        } catch (parseError) {
          // Fallback to simple familiar concepts
          const fallbackConcepts = [
            'coffee shop meeting rules', 'elevator small talk patterns', 'grocery store checkout psychology',
            'parking lot navigation logic', 'waiting room magazine selection', 'restaurant menu decision process'
          ];
          const concept1 = fallbackConcepts[Math.floor(Math.random() * fallbackConcepts.length)];
          let concept2 = fallbackConcepts[Math.floor(Math.random() * fallbackConcepts.length)];
          while (concept2 === concept1) {
            concept2 = fallbackConcepts[Math.floor(Math.random() * fallbackConcepts.length)];
          }
          
          setAdjacentSeeds(prev => ({
            ...prev,
            [principleId]: {
              domain1: concept1,
              domain2: concept2
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error generating adjacent seeds:', error);
      // Fallback to simple familiar concepts
      const fallbackConcepts = [
        'coffee shop meeting rules', 'elevator small talk patterns', 'grocery store checkout psychology',
        'parking lot navigation logic', 'waiting room magazine selection', 'restaurant menu decision process'
      ];
      const concept1 = fallbackConcepts[Math.floor(Math.random() * fallbackConcepts.length)];
      let concept2 = fallbackConcepts[Math.floor(Math.random() * fallbackConcepts.length)];
      while (concept2 === concept1) {
        concept2 = fallbackConcepts[Math.floor(Math.random() * fallbackConcepts.length)];
      }
      
      setAdjacentSeeds(prev => ({
        ...prev,
        [principleId]: {
          domain1: concept1,
          domain2: concept2
        }
      }));
    } finally {
      setIsGeneratingSeeds(prev => ({ ...prev, [principleId]: false }));
    }
  };

  // Auto-generate content for a principle using AI
  const autoGenerateContent = async (principleId) => {
    if (!userContext.trim()) return;
    
    setIsAutoGenerating(prev => ({ ...prev, [principleId]: true }));
    try {
      const principle = principles.find(p => p.id === principleId);
      const response = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a creativity expert helping users apply the "${principle.title}" principle. Generate content that demonstrates this principle applied to their specific situation. Be creative, engaging, and follow the principle's core concepts. Keep your response to 3-4 sentences maximum - be concise and impactful.`
            },
            {
              role: 'user',
              content: `User's situation: "${userContext}". Generate content that applies the ${principle.title} principle to this situation. Make it creative and specific to their context. Limit to 3-4 sentences maximum.`
            }
          ],
          model: 'gpt-4',
          max_tokens: 80,
          temperature: 0.8
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const generatedContent = data.choices[0].message.content;
        
        setUserPrompts(prev => ({
          ...prev,
          [principleId]: generatedContent
        }));
      }
    } catch (error) {
      console.error('Auto-generation error:', error);
    } finally {
      setIsAutoGenerating(prev => ({ ...prev, [principleId]: false }));
    }
  };

  const generateBannedWords = async () => {
    setIsGeneratingBannedWords(true);
    try {
      const response = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Generate 8-10 words that are commonly used in "telling" rather than "showing" in creative writing. These should be words that explain emotions or states directly rather than demonstrating them through action or sensory details. Return as JSON array: ["word1", "word2", "word3", ...]'
            },
            {
              role: 'user',
              content: 'Generate banned words for a "Show Don\'t Tell" writing exercise. Focus on words that tell the reader what to feel instead of showing through action, dialogue, or sensory details.'
            }
          ],
          model: 'gpt-4',
          max_tokens: 100,
          temperature: 0.8
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        try {
          const words = JSON.parse(data.choices[0].message.content);
          setBannedWords(words);
        } catch (parseError) {
          // Fallback to default banned words
          setBannedWords(['felt', 'seemed', 'was', 'clearly', 'obviously', 'beautiful', 'terrible', 'overwhelming', 'emotional']);
        }
      }
    } catch (error) {
      console.error('Error generating banned words:', error);
      // Fallback to default banned words
      setBannedWords(['felt', 'seemed', 'was', 'clearly', 'obviously', 'beautiful', 'terrible', 'overwhelming', 'emotional']);
    } finally {
      setIsGeneratingBannedWords(false);
    }
  };

  const principles = [
    {
      id: 'adjacent-possible',
      title: 'The "Adjacent Possible" Principle',
      icon: '🔗',
      type: 'text-image',
      explanation: '🤯 WATCH THIS: What happens when you combine two things that have NEVER been combined before?',
      example: 'Twitter = SMS texting + Internet = Mind blown! Suddenly everyone could text the entire world.',
      pattern: '✨ Your superpower: Find connections no one else has seen',
      buttonText: 'Generate New Combination'
    },
    {
      id: 'cultural-specificity',
      title: 'Cultural Specificity Beats Generic',
      icon: '🇮🇳',
      type: 'text-image',
      explanation: '🎯 SECRET INGREDIENT: The weirdest, most specific thing you know becomes your creative superpower!',
      example: 'Pixar didn\'t make "generic family movie" - they made "Mexican Day of the Dead family movie" and EVERYONE cried!',
      pattern: '🔥 Your superpower: Use your weirdest, most specific experiences',
      buttonText: 'Generate New Cultural Moment'
    },
    {
      id: 'show-dont-tell',
      title: 'The "Show Don\'t Tell" Mastery',
      icon: '🎭',
      type: 'text-only',
      explanation: '⚡ MIND TRICK: Don\'t tell them it\'s scary - make them JUMP! Don\'t explain funny - make them LAUGH!',
      example: 'Horror movies could say "this is frightening" OR they could make you spill your popcorn. Which works better?',
      pattern: '💫 Your superpower: Make people FEEL it, don\'t just tell them about it',
      buttonText: 'Generate New Writing Example'
    },
    {
      id: 'iteration-instinct',
      title: 'The Iteration Instinct',
      icon: '�',
      type: 'text-image',
      explanation: '🔄 PERFECTION THROUGH REPETITION: Your masterpiece is hiding in version 47!',
      example: 'Instagram = Started as check-in app "Burbn" = Kept refining until they focused only on photos = Billion-dollar idea!',
      pattern: '🎯 Your superpower: Every version gets you closer to perfection',
      buttonText: 'Generate New Iteration Example'
    },
    {
      id: 'goldilocks-complexity',
      title: 'The "Goldilocks Zone" of Complexity',
      icon: '⚖️',
      type: 'text-image',
      explanation: '⚖️ THE GOLDILOCKS ZONE: Not too simple (boring!), not too complex (brain explosion!), but juuuust right!',
      example: 'iPhone = Rocket science hidden behind "swipe to unlock" = Grandmas and tech nerds both happy!',
      pattern: '🎪 Your superpower: Make the complex feel simple, make the simple feel magical',
      buttonText: 'Generate New Complexity Example'
    }
  ];
  const refinePrompt = async (principleId) => {
    const userPrompt = userPrompts[principleId];
    if (!userPrompt || !userPrompt.trim()) return;
    
    setIsRefining(prev => ({ ...prev, [principleId]: true }));
    try {
      const response = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an English writing expert. Refine the user\'s text by improving grammar, structure, and making it more vivid and exaggerated while keeping the EXACT same core idea and content. Do not change what they wrote - just make it sound better and more dramatic. Return only the refined text.'
            },
            {
              role: 'user',
              content: `Refine this text by improving the English, structure, and making it more exaggerated/dramatic: "${userPrompt}". Keep the same idea but make it sound better.`
            }
          ],
          model: 'gpt-4',
          max_tokens: 200,
          temperature: 0.7
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const refinedPrompt = data.choices[0].message.content;
        
        // Update the user's prompt with the refined version
        setUserPrompts(prev => ({
          ...prev,
          [principleId]: refinedPrompt
        }));
      }
    } catch (error) {
      console.error('Refinement error:', error);
    } finally {
      setIsRefining(prev => ({ ...prev, [principleId]: false }));
    }
  };

  // Check if all approved principles have content
  const checkApprovedPrinciplesCompleted = () => {
    return Array.from(approvedPrinciples).every(id => userPrompts[id]?.trim());
  };

  // Check if all Try It Out sections are completed
  const checkAllTryItOutsCompleted = () => {
    const principleIds = ['adjacent-possible', 'cultural-specificity', 'show-dont-tell', 'iteration-instinct', 'goldilocks-complexity'];
    return principleIds.every(id => userPrompts[id]?.trim());
  };

  // Refine the original user context using approved principles
  const refineOriginalIdea = async () => {
    if (!userContext.trim() || approvedPrinciples.size === 0) return;

    setIsRefiningFinalIdea(true);
    try {
      const approvedPrinciplesList = principles.filter(p => approvedPrinciples.has(p.id));
      const principleDescriptions = approvedPrinciplesList.map(p => 
        `${p.title}: ${userPrompts[p.id] || p.description}`
      ).join('\n\n');

      const response = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a creativity expert. Take the user\'s original idea and transform it using the approved creativity principles. Create a refined, more creative version that incorporates all the approved principles. Keep it very concise and impactful - maximum 3-4 sentences only.'
            },
            {
              role: 'user',
              content: `Original idea: "${userContext}"\n\nApproved principles to apply:\n${principleDescriptions}\n\nCreate a refined, more creative version of this idea that incorporates these principles. Make it vivid, engaging, and creative while staying true to the original concept. Maximum 3-4 sentences only.`
            }
          ],
          model: 'gpt-4',
          max_tokens: 100,
          temperature: 0.8
        })
      });

      if (response.ok) {
        const data = await response.json();
        const refinedIdea = data.choices[0].message.content;
        setFinalRefinedIdea(refinedIdea);
      }
    } catch (error) {
      console.error('Refinement error:', error);
    } finally {
      setIsRefiningFinalIdea(false);
    }
  };

  const generateFinalContent = async (format) => {
    if (!finalRefinedIdea.trim()) return;
    
    setSelectedFormat(format);
    setIsGeneratingFinalContent(true);
    setFinalGeneratedContent(null);

    try {
      // First, generate a detailed image prompt based on the creative thought and principles
      const approvedPrinciplesList = principles.filter(p => approvedPrinciples.has(p.id));
      const principleDescriptions = approvedPrinciplesList.map(p => 
        `${p.title}: ${userPrompts[p.id] || p.description}`
      ).join('\n\n');

      const imagePromptResponse = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert at creating detailed image generation prompts. Take the creative concept and principles and create a comprehensive, detailed prompt for image generation. Include visual details, style, composition, lighting, and atmosphere. Make it a full paragraph with rich descriptive language.'
            },
            {
              role: 'user',
              content: `Creative concept: "${finalRefinedIdea}"\n\nPrinciples applied:\n${principleDescriptions}\n\nCreate a detailed, comprehensive image generation prompt that captures this creative concept visually. Include specific visual details, artistic style, composition, lighting, colors, and atmosphere. Make it a full descriptive paragraph.`
            }
          ],
          model: 'gpt-4',
          max_tokens: 200,
          temperature: 0.8
        })
      });

      let imagePrompt = finalRefinedIdea; // fallback
      if (imagePromptResponse.ok) {
        const imagePromptData = await imagePromptResponse.json();
        imagePrompt = imagePromptData.choices[0].message.content;
      }

      if (format === 'image') {
        // Generate image using the detailed prompt
        const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
          },
          body: JSON.stringify({
            prompt: imagePrompt,
            width: 1024,
            height: 1024,
            num_inference_steps: 20,
            guidance_scale: 7.5,
            seed: Math.floor(Math.random() * 1000000)
          })
        });

        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob();
          const imageUrl = URL.createObjectURL(imageBlob);
          setFinalGeneratedContent({ image: { url: imageUrl } });
        }
      } else if (format === 'text-image') {
        // Generate both text and image
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
                content: 'You are a creative writer. Expand on the given creative idea to create a detailed, engaging description. Make it vivid and immersive.'
              },
              {
                role: 'user',
                content: `Creative idea: "${finalRefinedIdea}"\n\nExpand this into a detailed, engaging description that brings this creative concept to life. Make it vivid, immersive, and compelling.`
              }
            ],
            model: 'gpt-4',
            max_tokens: 200,
            temperature: 0.8
          })
        });

        const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
          },
          body: JSON.stringify({
            prompt: imagePrompt,
            width: 1024,
            height: 1024,
            num_inference_steps: 20,
            guidance_scale: 7.5,
            seed: Math.floor(Math.random() * 1000000)
          })
        });

        if (textResponse.ok && imageResponse.ok) {
          const textData = await textResponse.json();
          const imageBlob = await imageResponse.blob();
          const imageUrl = URL.createObjectURL(imageBlob);
          
          setFinalGeneratedContent({
            text: textData.choices[0].message.content,
            image: { url: imageUrl }
          });
        }
      } else if (format === 'image-video') {
        // Start countdown immediately for video generation
        setIsVideoGenerating(true);
        setVideoCountdown(115);
        
        // Start countdown timer - store in a ref or state that can be accessed later
        const countdownInterval = setInterval(() => {
          setVideoCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              setIsVideoGenerating(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        // Generate image first, then video
        const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
          },
          body: JSON.stringify({
            prompt: imagePrompt,
            width: 1024,
            height: 1024,
            num_inference_steps: 20,
            guidance_scale: 7.5,
            seed: Math.floor(Math.random() * 1000000)
          })
        });
        
        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob();
          const imageUrl = URL.createObjectURL(imageBlob);
          
          // Convert blob to base64 for video API
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Image = reader.result.split(',')[1];
            
            try {
              const videoResponse = await fetch('https://api.segmind.com/v1/ltx-2-19b-i2v', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
                },
                body: JSON.stringify({
                  prompt: imagePrompt,
                  image: base64Image,
                  width: 1024,
                  height: 1024,
                  num_frames: 25,
                  fps: 8,
                  seed: Math.floor(Math.random() * 1000000),
                  guidance_scale: 7.5
                })
              });
              
              // Clear countdown when video is ready
              clearInterval(countdownInterval);
              setIsVideoGenerating(false);
              setVideoCountdown(0);
              
              if (videoResponse.ok) {
                const videoBlob = await videoResponse.blob();
                const videoUrl = URL.createObjectURL(videoBlob);
                setFinalGeneratedContent({
                  image: { url: imageUrl },
                  video: { url: videoUrl }
                });
              } else {
                console.error('Video generation failed:', videoResponse.status, videoResponse.statusText);
                const errorText = await videoResponse.text();
                console.error('Video error details:', errorText);
                // Still show the image even if video fails
                setFinalGeneratedContent({
                  image: { url: imageUrl },
                  error: 'Video generation failed, but image was created successfully'
                });
              }
            } catch (error) {
              console.error('Video generation error:', error);
              clearInterval(countdownInterval);
              setIsVideoGenerating(false);
              setVideoCountdown(0);
              setFinalGeneratedContent({
                image: { url: imageUrl },
                error: 'Video generation failed, but image was created successfully'
              });
            }
          };
          reader.readAsDataURL(imageBlob);
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGeneratingFinalContent(false);
    }
  };

  // Auto-trigger refinement when all Try It Outs are completed
  React.useEffect(() => {
    if (checkAllTryItOutsCompleted() && !finalRefinedIdea && !isRefiningFinalIdea) {
      refineOriginalIdea();
    }
  }, [userPrompts]);
  const generateContent = async (principleId) => {
    console.log(`Starting generation for principle: ${principleId}`);
    setLoadingStates(prev => ({ ...prev, [principleId]: true }));

    try {
      const principle = principles.find(p => p.id === principleId);
      console.log(`Found principle:`, principle);
      let generatedText = null;
      let generatedImage = null;
      // Generate text content using Segmind GPT-4
      if (principle.type === 'text-only' || principle.type === 'text-image') {
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
                content: `Generate a WILD, CRAZY creative example for "${principle.title}". Use this EXACT theme: ${principle.id === 'adjacent-possible' ? 'Astronauts learning Bharatanatyam dance on the moon with Earth glowing in background' : principle.id === 'cultural-specificity' ? 'Japanese tea ceremony happening inside a crowded Mumbai local train during rush hour' : principle.id === 'goldilocks-complexity' ? 'iPhone interface that hides rocket science behind simple swipe gestures' : 'Mind-blowing impossible combination'}. Keep under 50 words. Return only the example text.`
              },
              {
                role: 'user', 
                content: `Create an insane, unexpected example for: ${principle.pattern}`
              }
            ],
            model: 'gpt-4',
            max_tokens: 75,
            temperature: 0.8
          })
        });
        if (!textResponse.ok) {
          throw new Error(`Text generation failed: ${textResponse.status}`);
        }
        const textData = await textResponse.json();
        generatedText = textData.choices[0].message.content;
      }
      // Generate image content using Segmind Nano Banana
      if (principle.type === 'image-only' || principle.type === 'text-image') {
        console.log(`Attempting image generation for ${principleId}...`);

        try {
          const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
            },
            body: JSON.stringify({
              prompt: `WILD, IMPOSSIBLE mashup: ${principle.id === 'adjacent-possible' ? 'Astronauts in space suits learning Bharatanatyam dance on the moon surface with Earth glowing in background, classical Indian dance poses in zero gravity' : principle.id === 'cultural-specificity' ? 'Japanese tea ceremony happening inside a crowded Mumbai local train during rush hour, traditional kimono and tea set amid Indian commuters' : principle.id === 'goldilocks-complexity' ? 'iPhone interface that hides rocket science behind simple swipe gestures, showing both the simple UI and complex engineering underneath' : 'Completely unexpected, surreal, mind-blowing combination'}. Vibrant, artistic, fantastical, detailed.`,
              negative_prompt: 'boring, predictable, normal, text, words, letters, ugly, blurry, low quality',
              width: 512,
              height: 512,
              num_inference_steps: 20,
              guidance_scale: 7.5
            })
          });
          console.log(`Image response status: ${imageResponse.status}`);
          console.log(`Image response headers:`, imageResponse.headers);
          if (!imageResponse.ok) {
            const errorText = await imageResponse.text();
            console.error(`Image generation failed with status ${imageResponse.status}:`, errorText);
            throw new Error(`Image generation failed: ${imageResponse.status} - ${errorText}`);
          }
          const imageBlob = await imageResponse.blob();
          console.log(`Image blob size: ${imageBlob.size} bytes, type: ${imageBlob.type}`);

          generatedImage = {
            url: URL.createObjectURL(imageBlob),
            description: `Visual example of ${principle.title}`
          };

          console.log(`Image generated successfully for ${principleId}`);
        } catch (imageError) {
          console.error(`Image generation error for ${principleId}:`, imageError);
          // Continue without image if image generation fails
          generatedImage = null;
        }
      }

      setGeneratedContent(prev => ({
        ...prev,
        [principleId]: {
          text: generatedText,
          image: generatedImage
        }
      }));

    } catch (error) {
      console.error(`Failed to generate content for ${principleId}:`, error);
      console.error(`Full error details:`, error.message, error.stack);
      // Set error state or show user-friendly message
      setGeneratedContent(prev => ({
        ...prev,
        [principleId]: {
          text: `Failed to generate content for ${principleId}. Error: ${error.message}`,
          image: null
        }
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [principleId]: false }));
    }
  };
  const renderGenerationBox = (principle) => {
    const content = generatedContent[principle.id];
    const isLoading = loadingStates[principle.id];
    return (
      <div className="generation-box">
        <p className="example-output-label">Example output of {principle.title}</p>
        {principle.type === 'text-only' ? (
          <div className="text-only-content">
            {isLoading ? (
              <div className="loading-spinner">Generating example...</div>
            ) : content ? (
              <div className="generated-text">{content.text}</div>
            ) : (
              <div className="placeholder-text">Click to generate writing example</div>
            )}
          </div>
        ) : principle.type === 'image-only' ? (
          <div className="image-only-content">
            {isLoading ? (
              <div className="loading-spinner">Generating image...</div>
            ) : content && content.image ? (
              <img src={content.image.url} alt="Generated visual example" className="generated-image" />
            ) : (
              <div className="placeholder-image">Click to generate visual example</div>
            )}
          </div>
        ) : (
          <div className="text-image-content">
            <div className="image-with-overlay">
              {isLoading ? (
                <div className="loading-spinner">Generating content...</div>
              ) : content && content.image ? (
                <>
                  <img src={content.image.url} alt="Generated visual" className="generated-image" />
                  {content.text && (
                    <div className="text-overlay">
                      <div className="generated-text">{content.text}</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="placeholder-image">Generated content will appear here</div>
              )}
            </div>
          </div>
        )}

        <button 
          className="generate-button"
          onClick={() => generateContent(principle.id)}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : principle.buttonText}
        </button>
      </div>
    );
  };
  return (
    <div className="creativity-learning-page">
      <div className="creativity-header">
        <h1>Learn how to be creative using AI</h1>
        <h2> The Five Universal Creativity Principles </h2>
        <p className="flow-explanation">Learn creativity by using what's actually on your mind. We'll guide you through the 5 principles below and have AI transform your thoughts in the most fun, creative way possible.</p>
      </div>

      {!contextSubmitted ? (
        <div className="context-entry">
          <p>What's something on your mind?</p>
          <textarea
            value={userContext}
            onChange={(e) => setUserContext(e.target.value)}
            placeholder="traffic was a bitch today...or my brother annoyed the crap out of me"
            rows={2}
          />
          <button
            onClick={() => {
              if (userContext.trim()) {
                setContextSubmitted(true);
              }
            }}
            disabled={!userContext.trim()}
          >
            Start here →
          </button>
        </div>
      ) : (
        <div className="context-reminder">
          <p> Your starting point: "{userContext}"</p>
        </div>
      )}

      <div className="principles-container">
        {principles.map((principle, index) => (
          <div key={principle.id} id={`principle-${principle.id}`} className={`unified-principle-box ${index % 2 === 1 ? 'reverse-layout' : ''}`}>

            {/* Content side */}
            <div className="principle-content">
              <h2>{index + 1}. {principle.title} {principle.icon}</h2>

              {index === 0 && (
                <>
                  <p><strong>Creativity happens when you connect ideas from different domains:</strong></p>
                  <ul>
                    <li>Take concepts from unrelated fields and merge them</li>
                    <li>Look for unexpected intersections between familiar things</li>
                    <li>Combine elements that don't normally go together</li>
                    <li>Find bridges between disparate worlds of knowledge</li>
                  </ul>
                  <p className="fun-fact"><strong>Fun Fact:</strong> Netflix combined video rental (Blockbuster) with subscription services (gym memberships) and streaming technology (YouTube) to create something entirely new.</p>
                  <div className="pattern-box"><strong>Pattern:</strong> Creativity emerges from combining familiar elements in unfamiliar ways</div>

                  {/* Try It Out Section */}
                  <div className="try-it-out-section">
                    <h4>🎯 Try it out!</h4>
                    
                    {!adjacentSeeds[principle.id] && !isGeneratingSeeds[principle.id] ? (
                      <div className="seeds-generator">
                        <p>Get your random ingredient to combine with your situation:</p>
                        <button 
                          onClick={() => generateAdjacentSeeds(principle.id)}
                          className="generate-seeds-button"
                        >
                          🎲 Get My Ingredient
                        </button>
                      </div>
                    ) : isGeneratingSeeds[principle.id] ? (
                      <div className="seeds-loading">
                        <div className="loading-spinner">Generating your random ingredient...</div>
                      </div>
                    ) : (
                      <div className="domain-seeds">
                        <div className="seeds-display">
                          <div className="seed-item">
                            <span className="seed-label">Your situation:</span>
                            <span className="seed-text">"{userContext}"</span>
                          </div>
                          <div className="seed-connector">+</div>
                          <div className="seed-item">
                            <span className="seed-label">Random element:</span>
                            <span className="seed-text">"{adjacentSeeds[principle.id].domain1}"</span>
                          </div>
                        </div>
                        
                        <p className="instruction-text">Combine your situation with this random element. Don't explain why they go together — just describe what exists at their intersection.</p>
                        
                        <textarea
                          value={userPrompts[principle.id] || ''}
                          onChange={(e) => setUserPrompts(prev => ({
                            ...prev,
                            [principle.id]: e.target.value
                          }))}
                          placeholder="Describe what exists at the intersection of these two domains..."
                          className="user-prompt-input"
                          rows={4}
                        />
                        
                        <button 
                          onClick={() => generateAdjacentSeeds(principle.id)}
                          className="reshuffle-button"
                        >
                          🔄 New Ingredients
                        </button>
                      </div>
                    )}

                    <div className="prompt-actions">
                      <button 
                        className={`ok-button ${approvedPrinciples.has(principle.id) ? 'approved' : ''}`}
                        onClick={() => {
                          setApprovedPrinciples(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(principle.id)) {
                              newSet.delete(principle.id);
                            } else {
                              newSet.add(principle.id);
                            }
                            return newSet;
                          });
                        }}
                        disabled={!userPrompts[principle.id]?.trim()}
                      >
                        {approvedPrinciples.has(principle.id) ? '✓ Approved' : 'OK'}
                      </button>
                      <button 
                        onClick={() => refinePrompt(principle.id)}
                        disabled={!userPrompts[principle.id]?.trim() || isRefining[principle.id]}
                        className="refine-button"
                      >
                        {isRefining[principle.id] ? 'Refining...' : '✨ Refine'}
                      </button>
                      <button 
                        onClick={() => autoGenerateContent(principle.id)}
                        disabled={!userContext.trim() || isAutoGenerating[principle.id]}
                        className="auto-generate-button"
                      >
                        {isAutoGenerating[principle.id] ? 'Generating...' : '🤖 Auto Generate'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {index === 1 && (
                <>
                  <p><strong>The most powerful creative work is deeply rooted in particular contexts:</strong></p>
                  <ul>
                    <li>Draw from your specific cultural background and experiences</li>
                    <li>Use precise details rather than broad generalizations</li>
                    <li>Reference shared memories and common experiences within communities</li>
                    <li>Embrace what makes your perspective unique rather than universal</li>
                  </ul>
                  <p className="fun-fact"><strong>Fun Fact:</strong> Pixar's "Coco" succeeded globally because it was deeply specific to Mexican Day of the Dead traditions, not because it tried to appeal to everyone generically.</p>
                  <div className="pattern-box"><strong>Pattern:</strong> Specificity creates universality - the more specific, the more relatable</div>

                  {/* Try It Out Section */}
                  <div className="try-it-out-section">
                    <h4>🎯 Try it out!</h4>
                    
                    <div className="cultural-single-phase">
                      <p><strong>What's one detail about "{userContext}" that an outsider would need explained?</strong></p>
                      <textarea
                        value={userPrompts[principle.id] || ''}
                        onChange={(e) => setUserPrompts(prev => ({
                          ...prev,
                          [principle.id]: e.target.value
                        }))}
                        placeholder="What specific aspect of your situation would confuse someone from outside your context..."
                        className="user-prompt-input"
                        rows={4}
                      />
                      
                      <p className="load-bearing-instruction">
                        <strong>Remember:</strong> Build your solution so this cultural detail is the engine that makes your approach to "{userContext}" work. 
                        If you removed this detail, your solution would stop working.
                      </p>
                    </div>

                    <div className="prompt-actions">
                      <button 
                        className={`ok-button ${approvedPrinciples.has(principle.id) ? 'approved' : ''}`}
                        onClick={() => {
                          setApprovedPrinciples(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(principle.id)) {
                              newSet.delete(principle.id);
                            } else {
                              newSet.add(principle.id);
                            }
                            return newSet;
                          });
                        }}
                        disabled={!userPrompts[principle.id]?.trim()}
                      >
                        {approvedPrinciples.has(principle.id) ? '✓ Approved' : 'OK'}
                      </button>
                      <button 
                        onClick={() => refinePrompt(principle.id)}
                        disabled={!userPrompts[principle.id]?.trim() || isRefining[principle.id]}
                        className="refine-button"
                      >
                        {isRefining[principle.id] ? 'Refining...' : '✨ Refine'}
                      </button>
                      <button 
                        onClick={() => autoGenerateContent(principle.id)}
                        disabled={!userContext.trim() || isAutoGenerating[principle.id]}
                        className="auto-generate-button"
                      >
                        {isAutoGenerating[principle.id] ? 'Generating...' : '🤖 Auto Generate'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {index === 2 && (
                <>
                  <p><strong>Great creative work demonstrates rather than explains:</strong></p>
                  <ul>
                    <li>Let the audience discover meaning through experience</li>
                    <li>Avoid heavy-handed messaging or obvious themes</li>
                    <li>Trust your audience to understand without explicit instruction</li>
                    <li>Create natural flow rather than structured presentations</li>
                  </ul>
                  <p className="fun-fact"><strong>Fun Fact:</strong> The movie "WALL-E" never explicitly mentions environmental destruction or consumerism, but shows a robot cleaning up Earth while humans live on a spaceship, letting viewers draw their own conclusions.</p>
                  <div className="pattern-box"><strong>Pattern:</strong> Subtlety is more powerful than directness</div>

                  {/* Try It Out Section */}
                  <div className="try-it-out-section">
                    <h4>🎯 Try it out!</h4>
                    
                    {!showDontTellSentence[principle.id] ? (
                      <div className="flat-sentence-starter">
                        <p><strong>Start with this deliberately flat, telling sentence:</strong></p>
                        <div className="flat-sentence">
                          "{userContext} was frustrating and overwhelming."
                        </div>
                        <p className="rewrite-instruction">
                          Rewrite this so the reader feels the frustration and overwhelm — without using the words 
                          "frustrating," "overwhelming," or any synonym of either.
                        </p>
                        <button 
                          onClick={() => setShowDontTellSentence(prev => ({
                            ...prev,
                            [principle.id]: `${userContext} was frustrating and overwhelming.`
                          }))}
                          className="start-rewrite-button"
                        >
                          Start Rewriting →
                        </button>
                      </div>
                    ) : (
                      <div className="word-ban-system">
                        <div className="original-sentence">
                          <p><strong>Original:</strong> "{showDontTellSentence[principle.id]}"</p>
                        </div>
                        
                        <div className="banned-words">
                          <div className="banned-words-header">
                            <p><strong>⚠️ Banned Words:</strong></p>
                            <button 
                              onClick={generateBannedWords}
                              disabled={isGeneratingBannedWords}
                              className="generate-banned-words-button"
                            >
                              {isGeneratingBannedWords ? 'Generating...' : '🔄 New Words'}
                            </button>
                          </div>
                          <div className="word-tags">
                            {isGeneratingBannedWords ? (
                              <div className="loading-banned-words">
                                <span className="loading-text">Generating banned words...</span>
                              </div>
                            ) : bannedWords.length > 0 ? (
                              bannedWords.map(word => (
                                <span key={word} className="banned-word">{word}</span>
                              ))
                            ) : (
                              <div className="loading-banned-words">
                                <span className="loading-text">Loading banned words...</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <small>If you use flagged words, you'll get a warning!</small>

                        <textarea
                          value={userPrompts[principle.id] || ''}
                          onChange={(e) => {
                            const text = e.target.value;
                            const foundBanned = bannedWords.filter(word => 
                              text.toLowerCase().includes(word.toLowerCase())
                            );
                            
                            setUserPrompts(prev => ({
                              ...prev,
                              [principle.id]: text,
                              [`${principle.id}_bannedFound`]: foundBanned
                            }));
                          }}
                          placeholder="Rewrite to show, not tell. Describe only what a camera would see..."
                          className="user-prompt-input"
                          rows={4}
                        />
                        
                        {userPrompts[`${principle.id}_bannedFound`] && userPrompts[`${principle.id}_bannedFound`].length > 0 && (
                          <div className="word-warning">
                            ⚠️ You used banned words: {userPrompts[`${principle.id}_bannedFound`].join(', ')}. Show us instead!
                          </div>
                        )}
                        
                        <button 
                          onClick={() => {
                            setShowDontTellSentence(prev => ({
                              ...prev,
                              [principle.id]: ''
                            }));
                            setUserPrompts(prev => ({
                              ...prev,
                              [principle.id]: '',
                              [`${principle.id}_bannedFound`]: []
                            }));
                          }}
                          className="change-sentence-button"
                        >
                          ← Try Different Sentence
                        </button>
                      </div>
                    )}

                    <div className="prompt-actions">
                      <button 
                        className={`ok-button ${approvedPrinciples.has(principle.id) ? 'approved' : ''}`}
                        onClick={() => {
                          setApprovedPrinciples(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(principle.id)) {
                              newSet.delete(principle.id);
                            } else {
                              newSet.add(principle.id);
                            }
                            return newSet;
                          });
                        }}
                        disabled={!userPrompts[principle.id]?.trim()}
                      >
                        {approvedPrinciples.has(principle.id) ? '✓ Approved' : 'OK'}
                      </button>
                      <button 
                        onClick={() => refinePrompt(principle.id)}
                        disabled={!userPrompts[principle.id]?.trim() || isRefining[principle.id]}
                        className="refine-button"
                      >
                        {isRefining[principle.id] ? 'Refining...' : '✨ Refine'}
                      </button>
                      <button 
                        onClick={() => autoGenerateContent(principle.id)}
                        disabled={!userContext.trim() || isAutoGenerating[principle.id]}
                        className="auto-generate-button"
                      >
                        {isAutoGenerating[principle.id] ? 'Generating...' : '🤖 Auto Generate'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {index === 3 && (
                <>
                  <p><strong>Great creative work comes from trying, failing, and trying again:</strong></p>
                  <ul>
                    <li>Your first idea is rarely your best idea</li>
                    <li>Each version teaches you something new</li>
                    <li>Small changes can make huge differences</li>
                    <li>Keep tweaking until it feels just right</li>
                  </ul>
                  <p className="fun-fact"><strong>Fun Fact:</strong> Instagram started as a check-in app called Burbn, but the founders kept refining it until they focused only on photo-sharing - which became a billion-dollar idea.</p>
                  <div className="pattern-box"><strong>Pattern:</strong> Every version gets you closer to the perfect solution</div>

                  {/* Try It Out Section */}
                  <div className="try-it-out-section">
                    <h4>🎯 Try it out!</h4>
                    
                    <p className="instruction-text">Write your solution for "{userContext}" - focus on showing how iteration and refinement would improve it.</p>
                    
                    <textarea
                      value={userPrompts[principle.id] || ''}
                      onChange={(e) => setUserPrompts(prev => ({
                        ...prev,
                        [principle.id]: e.target.value
                      }))}
                      placeholder={`Describe your iterative approach to solving "${userContext}". Show how you'd refine and improve through multiple versions...`}
                      className="user-prompt-input"
                      rows={4}
                    />

                    <div className="prompt-actions">
                      <button 
                        className={`ok-button ${approvedPrinciples.has(principle.id) ? 'approved' : ''}`}
                        onClick={() => {
                          setApprovedPrinciples(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(principle.id)) {
                              newSet.delete(principle.id);
                            } else {
                              newSet.add(principle.id);
                            }
                            return newSet;
                          });
                        }}
                        disabled={!userPrompts[principle.id]?.trim()}
                      >
                        {approvedPrinciples.has(principle.id) ? '✓ Approved' : 'OK'}
                      </button>
                      <button 
                        onClick={() => refinePrompt(principle.id)}
                        disabled={!userPrompts[principle.id]?.trim() || isRefining[principle.id]}
                        className="refine-button"
                      >
                        {isRefining[principle.id] ? 'Refining...' : '✨ Refine'}
                      </button>
                      <button 
                        onClick={() => autoGenerateContent(principle.id)}
                        disabled={!userContext.trim() || isAutoGenerating[principle.id]}
                        className="auto-generate-button"
                      >
                        {isAutoGenerating[principle.id] ? 'Generating...' : '🤖 Auto Generate'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {index === 4 && (
                <>
                  <p><strong>Great creative work finds the perfect balance of complexity:</strong></p>
                  <ul>
                    <li>Complex enough to engage and intrigue the audience</li>
                    <li>Simple enough to be accessible and understandable</li>
                    <li>Specific enough to feel authentic and real</li>
                    <li>Universal enough to connect with diverse people</li>
                  </ul>
                  <p className="fun-fact"><strong>Fun Fact:</strong> Apple's iPhone interface has thousands of complex functions hidden behind simple, intuitive gestures - sophisticated enough for power users, simple enough for grandparents.</p>
                  <div className="pattern-box"><strong>Pattern:</strong> Creativity thrives in the sweet spot between simple and complex</div>

                  {/* Try It Out Section */}
                  <div className="try-it-out-section">
                    <h4>🎯 Try it out!</h4>
                    
                    <div className="goldilocks-system">
                      <div className="complexity-examples">
                        <div className="example-card too-simple">
                          <h5>😴 Too Simple</h5>
                          <p>"Just ignore it and move on."</p>
                          <small>One line, nothing surprising, immediately forgettable</small>
                        </div>
                        
                        <div className="example-card too-complex">
                          <h5>🤯 Too Complex</h5>
                          <p>"Genetically engineer silk worms to produce fabric that changes color based on the wearer's emotional state while simultaneously launching a startup that uses AI to predict optimal solutions based on astrological charts and family WhatsApp group sentiment analysis integrated with quantum computing and blockchain verification systems."</p>
                          <small>Impressive on paper, exhausting in person</small>
                        </div>
                      </div>
                      
                      <div className="complexity-slider-container">
                        <label>Where should your idea live?</label>
                        <div className="slider-wrapper">
                          <span className="slider-label">Simple</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={goldilocksSetting[principle.id] || 50}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              setGoldilocksSetting(prev => ({
                                ...prev,
                                [principle.id]: value
                              }));
                            }}
                            className="complexity-slider"
                          />
                          <span className="slider-label">Complex</span>
                        </div>
                        <div className="slider-feedback">
                          {goldilocksSetting[principle.id] <= 30 && (
                            <p>📝 Write it so a 5-year-old would try it</p>
                          )}
                          {goldilocksSetting[principle.id] > 30 && goldilocksSetting[principle.id] < 70 && (
                            <p>🎯 Write it so both a 5-year-old and NASA engineers argue about it</p>
                          )}
                          {goldilocksSetting[principle.id] >= 70 && (
                            <p>🧠 Write it so NASA engineers would be impressed</p>
                          )}
                        </div>
                      </div>

                      <textarea
                        value={userPrompts[principle.id] || ''}
                        onChange={(e) => setUserPrompts(prev => ({
                          ...prev,
                          [principle.id]: e.target.value
                        }))}
                        placeholder={
                          goldilocksSetting[principle.id] <= 30 
                            ? "Write it so a 5-year-old would try it..."
                            : goldilocksSetting[principle.id] >= 70
                            ? "Write it so NASA engineers would be impressed..."
                            : "Write it so both a 5-year-old and NASA engineers argue about it..."
                        }
                        className="user-prompt-input goldilocks-input"
                        rows={4}
                      />
                      
                      <div className="goldilocks-target">
                        <p><strong>🎪 The Goldilocks Target:</strong> "So both of them argue about it" - complexity that creates productive tension.</p>
                      </div>
                    </div>

                    <div className="prompt-actions">
                      <button 
                        className={`ok-button ${approvedPrinciples.has(principle.id) ? 'approved' : ''}`}
                        onClick={() => {
                          setApprovedPrinciples(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(principle.id)) {
                              newSet.delete(principle.id);
                            } else {
                              newSet.add(principle.id);
                            }
                            return newSet;
                          });
                        }}
                        disabled={!userPrompts[principle.id]?.trim()}
                      >
                        {approvedPrinciples.has(principle.id) ? '✓ Approved' : 'OK'}
                      </button>
                      <button 
                        onClick={() => refinePrompt(principle.id)}
                        disabled={!userPrompts[principle.id]?.trim() || isRefining[principle.id]}
                        className="refine-button"
                      >
                        {isRefining[principle.id] ? 'Refining...' : '✨ Refine'}
                      </button>
                      <button 
                        onClick={() => autoGenerateContent(principle.id)}
                        disabled={!userContext.trim() || isAutoGenerating[principle.id]}
                        className="auto-generate-button"
                      >
                        {isAutoGenerating[principle.id] ? 'Generating...' : '🤖 Auto Generate'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* Generation side */}
            <div className="principle-generation">
              {renderGenerationBox(principle)}
            </div>

          </div>
        ))}
      </div>
      {/* Creative Generation Box - Always Show After Context */}
      <div className="creative-generation-box">
        <h2>🎨 Here is how AI has made your thought more creative...</h2>
        
        <div className="principle-previews">
          {principles.filter(principle => approvedPrinciples.has(principle.id) || userPrompts[principle.id]).map((principle, index) => (
            <div key={principle.id} className="principle-preview">
              <p>
                <strong>{index + 1}. Based on {principle.title}:</strong> 
                {userPrompts[principle.id] ? userPrompts[principle.id] : `This is what I will create from your input "${userContext || 'your thoughts'}" using ${principle.title.toLowerCase()} principles.`}
              </p>
              <div className="preview-actions">
                <button 
                  className={`ok-button ${approvedPrinciples.has(principle.id) ? 'approved' : ''}`}
                  onClick={() => {
                    setApprovedPrinciples(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(principle.id)) {
                        newSet.delete(principle.id);
                      } else {
                        newSet.add(principle.id);
                      }
                      return newSet;
                    });
                  }}
                >
                  {approvedPrinciples.has(principle.id) ? '✓ Approved' : 'OK'}
                </button>
                <button 
                  className="refine-button"
                  onClick={() => {
                    // Scroll back to this principle for refinement
                    const principleElement = document.getElementById(`principle-${principle.id}`);
                    if (principleElement) {
                      principleElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                >
                  Refine
                </button>
              </div>
            </div>
          ))}
        </div>

        {approvedPrinciples.size > 0 && !finalRefinedIdea && (
          <div className="refine-thought-section">
            <button 
              onClick={() => refineOriginalIdea()}
              disabled={isRefiningFinalIdea}
              className="refine-thought-button"
            >
              {isRefiningFinalIdea ? 'Creating creative thought...' : '✨ Create Creative Thought'}
            </button>
          </div>
        )}

        {approvedPrinciples.size === 0 && (
          <div className="approval-reminder">
            <p>👆 Click "OK" on the principles above to approve them for generation</p>
          </div>
        )}

        {approvedPrinciples.size > 0 && (
          <div className="creative-thought-display">
            <div className="before-after-section">
              <h4>Here is your creative thought (before and after)</h4>
              <div className="before-after-content">
                <div className="before-section">
                  <strong>Before:</strong> {userContext || 'Your original thought'}
                </div>
                {finalRefinedIdea && (
                  <div className="after-section">
                    <strong>After:</strong> {finalRefinedIdea}
                  </div>
                )}
              </div>
              {!finalRefinedIdea && (
                <button
                  onClick={() => refineOriginalIdea()}
                  disabled={isRefiningFinalIdea}
                  className="create-thought-button"
                >
                  {isRefiningFinalIdea ? 'Creating creative thought...' : '✨ Create Creative Thought'}
                </button>
              )}
            </div>

            {finalRefinedIdea && (
              <div className="generation-controls">
                <div className="format-dropdown-section">
                  <label htmlFor="format-select">Generate:</label>
                  <select 
                    id="format-select"
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="format-dropdown"
                  >
                    <option value="">Select format...</option>
                    <option value="image">🖼️ Image</option>
                    <option value="text-image">📝🖼️ Image + Text</option>
                    <option value="image-video">🎬 Image → Video</option>
                  </select>
                </div>

                {selectedFormat && (
                  <button 
                    onClick={() => generateFinalContent(selectedFormat)}
                    disabled={isGeneratingFinalContent}
                    className="generate-final-button"
                  >
                    {isGeneratingFinalContent ? 'Generating...' : '🎨 Generate'}
                  </button>
                )}
                
                {(isGeneratingFinalContent || isVideoGenerating) && selectedFormat === 'image-video' && (
                  <div className="video-countdown">
                    <h4>🎬 Generating Video...</h4>
                    <div className="countdown-display">
                      <div className="countdown-timer">
                        {videoCountdown > 0 ? `${Math.floor(videoCountdown / 60)}:${(videoCountdown % 60).toString().padStart(2, '0')}` : '1:55'}
                      </div>
                      <div className="countdown-text">
                        Video generation in progress... ({videoCountdown > 0 ? videoCountdown : 115}s remaining)
                      </div>
                      <div className="countdown-progress">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${videoCountdown > 0 ? ((115 - videoCountdown) / 115) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {selectedFormat && finalGeneratedContent && (
          <div className="final-generated-content">
            <h3>✨ Your Creative Transformation Complete!</h3>
            
            {finalGeneratedContent.text && (
              <div className="final-text-content">
                <h4>📝 Enhanced Description:</h4>
                <p>{finalGeneratedContent.text}</p>
              </div>
            )}
            
            {finalGeneratedContent.image && (
              <div className="final-image-content">
                <h4>🖼️ Visual Representation:</h4>
                <img src={finalGeneratedContent.image.url} alt="Your creative idea visualized" />
              </div>
            )}
            
            {finalGeneratedContent.video && (
              <div className="final-video-content">
                <h4>🎬 Animated Vision:</h4>
                <video src={finalGeneratedContent.video.url} controls />
              </div>
            )}
            
            {isVideoGenerating && (
              <div className="video-countdown">
                <h4>🎬 Generating Video...</h4>
                <div className="countdown-display">
                  <div className="countdown-timer">
                    {Math.floor(videoCountdown / 60)}:{(videoCountdown % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="countdown-text">
                    Video generation in progress... ({videoCountdown}s remaining)
                  </div>
                  <div className="countdown-progress">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${((115 - videoCountdown) / 115) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="final-actions">
              <button 
                onClick={() => {
                  setSelectedFormat('');
                  setFinalGeneratedContent(null);
                }}
                className="try-different-format-button"
              >
                Try Different Format
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Create Your Own Experience CTA */}
      <div className="create-your-own-cta">
        <div className="cta-content">
          <h3>🚀 Ready to Create?</h3>
          <p>Now that you've mastered the art of creativity, it's time to unleash your imagination and create your own unique experiences!</p>
          <button 
            className="create-experience-button"
            onClick={() => window.open(`${window.location.origin}${window.location.pathname}?create=true`, '_blank')}
          >
            🎨 Create Your Own Experience
          </button>
        </div>
      </div>
      
      <div className="creativity-footer">
        <button className="return-button" onClick={onReturn}>
          Return to FantasyWorld Hub
        </button>
      </div>
    </div>
  );
};
export default CreativityLearningPage;