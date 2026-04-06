import { useState, useCallback } from 'react';

const useUselessPowersAssembledContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateUselessPowersAssembledContent = useCallback(async () => {
    const battleScenarios = [
      {
        title: "The Useless League vs Dr. Mild Inconvenience",
        heroes: ["Captain Hindsight", "Bubble Wrap Woman", "Static Sock Man", "Volume Control Guy"],
        villain: "Dr. Mild Inconvenience",
        villainPower: "Makes people slightly uncomfortable"
      },
      {
        title: "Team Pointless vs Professor Awkward Silence",
        heroes: ["The Sneezer", "Backwards Walker", "Lint Collector", "Human GPS"],
        villain: "Professor Awkward Silence",
        villainPower: "Creates 3-second awkward pauses in conversations"
      },
      {
        title: "The Ridiculous Rangers vs Captain Obvious",
        heroes: ["Slow Motion Man", "The Complainer", "Doorknob Turner", "Weather Announcer"],
        villain: "Captain Obvious",
        villainPower: "States things that are already painfully clear"
      },
      {
        title: "Squad Useless vs The Procrastinator",
        heroes: ["Elevator Music Man", "The Yawner", "Shoelace Untier", "Channel Flipper"],
        villain: "The Procrastinator",
        villainPower: "Makes everyone want to do things later"
      },
      {
        title: "The Pointless Patrol vs Dr. Wrong Number",
        heroes: ["Napkin Folder", "The Hiccupper", "Sock Matcher", "Menu Reader"],
        villain: "Dr. Wrong Number",
        villainPower: "Makes people dial incorrect phone numbers"
      },
      {
        title: "Team Trivial vs Professor Papercut",
        heroes: ["The Whistler", "Crumb Collector", "Pen Clicker", "The Yodeler"],
        villain: "Professor Papercut",
        villainPower: "Gives people tiny, annoying papercuts"
      },
      {
        title: "The Useless Avengers vs Captain Spoiler",
        heroes: ["Traffic Light Predictor", "The Snorer", "Dust Bunny Finder", "Expired Coupon Man"],
        villain: "Captain Spoiler",
        villainPower: "Reveals movie endings at inappropriate times"
      },
      {
        title: "Squad Ridiculous vs The Microwave Beeper",
        heroes: ["Sock Static Generator", "The Chronic Apologizer", "Elevator Button Pusher", "The Mumbler"],
        villain: "The Microwave Beeper",
        villainPower: "Makes beeping sounds at random intervals"
      }
    ];

    const selectedScenario = battleScenarios[Math.floor(Math.random() * battleScenarios.length)];

    try {
      setIsGenerating(true);
      setError(null);

      console.log(`🦸 Generating useless superhero battle: ${selectedScenario.title}...`);

      // Generate the comedy story using Segmind GPT-5.2
      const textResponse = await fetch('https://api.segmind.com/v1/gpt-5.2', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "messages": [
            {
              "role": "user",
              "content": [
                {
                  "type": "text",
                  "text": `Write a hilarious 200-word story about "${selectedScenario.title}".

The superhero team consists of: ${selectedScenario.heroes.join(', ')}
The villain is: ${selectedScenario.villain} (power: ${selectedScenario.villainPower})

Make it FUNNY AS F***! This should be a parody of classic superhero team-ups but with completely useless powers. Focus on:
- Absurd "battle" tactics using their pointless abilities
- Comic book style dialogue and dramatic moments
- The heroes trying to coordinate their useless powers
- The villain's equally ridiculous evil plan
- Slapstick comedy and wordplay
- Over-the-top superhero tropes but with mundane powers

Keep it exactly 200 words and make it laugh-out-loud funny!`
                }
              ]
            }
          ]
        })
      });

      if (!textResponse.ok) {
        throw new Error(`Segmind GPT-5.2 API error: ${textResponse.status}`);
      }

      const textResult = await textResponse.json();
      const storyText = textResult.choices?.[0]?.message?.content?.trim() || textResult.message?.content?.trim() || 'Story generation failed';
      
      console.log('✅ Comedy story generated successfully with Segmind GPT-5.2');

      // Generate superhero team battle visualization
      const imagePrompt = `Hilarious comic book style illustration showing ${selectedScenario.heroes.join(', ')} (a team of superheroes with completely useless powers) battling ${selectedScenario.villain} who has the power to ${selectedScenario.villainPower}. The scene should be a parody of classic superhero team battles with absurd, pointless superpowers being used. Comic book art style, bright superhero colors, dynamic action poses, speech bubbles, over-the-top dramatic lighting, but with ridiculous mundane powers. Make it look like a funny superhero comic book panel with exaggerated expressions and silly action sequences.`;

      console.log('🎨 Generating superhero battle visualization...');

      const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          samples: 1,
          scheduler: "DPM++ 2M",
          num_inference_steps: 25,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000),
          img_width: 1024,
          img_height: 1024,
          base64: false
        })
      });

      if (!imageResponse.ok) {
        throw new Error(`Segmind Nano Banana API error: ${imageResponse.status}`);
      }

      const imageBlob = await imageResponse.blob();
      console.log('✅ Superhero battle visualization generated successfully');

      // Check if we got valid responses
      if (!imageBlob || imageBlob.size === 0) {
        throw new Error('Received empty image data');
      }

      // Convert blob to URL
      const imageUrl = URL.createObjectURL(imageBlob);
      console.log('Created image URL:', imageUrl);

      return {
        battleTitle: selectedScenario.title,
        story: storyText,
        image: {
          url: imageUrl,
          prompt: imagePrompt,
          description: `${selectedScenario.title} - Useless superhero team battle`
        }
      };

    } catch (error) {
      console.error('Useless Powers Assembled generation failed:', error);
      
      let errorMessage = 'Failed to generate superhero battle';
      if (error.message.includes('401')) {
        errorMessage = 'API key authentication failed';
      } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded, please try again later';
      } else if (error.message.includes('API error')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = `Network Error: ${error.message}`;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateUselessPowersAssembledContent,
    isGenerating,
    error
  };
};

export default useUselessPowersAssembledContent;
