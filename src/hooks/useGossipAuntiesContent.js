import { useState, useCallback } from 'react';

const useGossipAuntiesContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateGossipAuntiesContent = useCallback(async () => {
    const gossipScenarios = [
      {
        title: "The New Tenant Investigation",
        target: "Mysterious new tenant in 4B",
        suspicions: ["Unmarried at 28", "Cooks non-vegetarian", "Male visitors after 8pm", "Wears western clothes"]
      },
      {
        title: "The Startup Son Scandal",
        target: "Sharma aunty's son's business",
        suspicions: ["No fixed office", "Works from home", "Calls it 'digital marketing'", "Parents still paying rent"]
      },
      {
        title: "The Sleeveless Bahu Crisis",
        target: "Mrs. Gupta's daughter-in-law",
        suspicions: ["Wears sleeveless blouses", "Goes to gym", "Doesn't touch mother-in-law's feet", "Orders food online"]
      },
      {
        title: "The Late Night Delivery Mystery",
        target: "Couple in 7A receiving packages",
        suspicions: ["Amazon deliveries at 9pm", "Zomato orders twice a week", "Suspicious looking courier boys", "Too many boxes"]
      },
      {
        title: "The Unmarried Career Woman Probe",
        target: "Working woman in 2C",
        suspicions: ["27 and still single", "Comes home after 7pm", "Wears jeans to work", "Parents don't visit often"]
      },
      {
        title: "The Weekend Party Surveillance",
        target: "Young couple hosting friends",
        suspicions: ["Music after 9pm", "Multiple cars parked", "Laughter heard in corridor", "Ordered pizza for 8 people"]
      },
      {
        title: "The Maid Sharing Controversy",
        target: "New family wanting to share domestic help",
        suspicions: ["Can't afford full-time maid", "Both husband and wife work", "No elderly in-laws at home", "Suspicious financial status"]
      },
      {
        title: "The Gym Membership Gossip",
        target: "Mrs. Patel's sudden fitness journey",
        suspicions: ["Joined expensive gym at 45", "Wearing track pants", "Male trainer", "Husband seems unbothered"]
      },
      {
        title: "The Online Shopping Addiction",
        target: "Constant deliveries to 5B",
        suspicions: ["Daily courier visits", "Multiple shopping apps", "Husband works in IT", "Hiding packages from mother-in-law"]
      },
      {
        title: "The Late Marriage Rishta Rejection",
        target: "Family rejecting 'good proposals'",
        suspicions: ["Daughter is 26", "Too many demands", "Asking for working son-in-law", "Previous engagement broken"]
      }
    ];

    const selectedScenario = gossipScenarios[Math.floor(Math.random() * gossipScenarios.length)];

    try {
      setIsGenerating(true);
      setError(null);

      console.log(`👵 Generating gossip aunties investigation: ${selectedScenario.title}...`);

      // Generate the savage comedy story using Segmind GPT-5.2
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
                  "text": `Write a savage, hilarious 200-word story about "${selectedScenario.title}".

The target: ${selectedScenario.target}
The suspicions: ${selectedScenario.suspicions.join(', ')}

This should be a SAVAGE Indian parody featuring permanently annoyed aunties running a WhatsApp gossip network. Include:
- 5am "walking" surveillance missions
- Voice note investigations with dramatic pauses
- Kitty party emergency meetings
- Gold chains bouncing with excitement
- Phone permanently glued to hand
- "We are only concerned, beta" fake concern
- Tight saree blouse aesthetic
- Sweating, irritated, loudly chewing aunties
- WhatsApp forwarding chaos
- Moral outrage over trivial things
- Rishta/marriage pressure references
- Apartment complex politics

Make it BRUTALLY FUNNY with authentic Indian auntie behavior, WhatsApp culture, and apartment gossip dynamics. Keep it exactly 200 words and absolutely savage!`
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
      
      console.log('✅ Savage gossip story generated successfully with Segmind GPT-5.2');

      // Generate gossip aunties visualization
      const imagePrompt = `Hilarious Indian comedy scene showing a group of permanently annoyed, loud-voiced Indian aunties in tight saree blouses with gold chains bouncing, phones glued to their hands, conducting surveillance in a posh apartment complex. The aunties are sweating, irritated, loudly chewing, with tummies unapologetically peeking out. They're doing "morning walk" surveillance at 5am, whispering dramatically, pointing at apartment windows, taking notes. WhatsApp notifications visible on phones. Authentic Indian apartment complex setting with modern buildings. Comedy illustration style, exaggerated expressions, dramatic lighting, bustling with gossip energy. Make them look like they're running a secret intelligence operation but it's just neighborhood gossip.`;

      console.log('📱 Generating gossip aunties visualization...');

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
      console.log('✅ Gossip aunties visualization generated successfully');

      // Check if we got valid responses
      if (!imageBlob || imageBlob.size === 0) {
        throw new Error('Received empty image data');
      }

      // Convert blob to URL
      const imageUrl = URL.createObjectURL(imageBlob);
      console.log('Created image URL:', imageUrl);

      return {
        gossipTitle: selectedScenario.title,
        story: storyText,
        image: {
          url: imageUrl,
          prompt: imagePrompt,
          description: `${selectedScenario.title} - Gossip Aunties investigation`
        }
      };

    } catch (error) {
      console.error('Gossip Aunties generation failed:', error);
      
      let errorMessage = 'Failed to generate gossip investigation';
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
    generateGossipAuntiesContent,
    isGenerating,
    error
  };
};

export default useGossipAuntiesContent;
