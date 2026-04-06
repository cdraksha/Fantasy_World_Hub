import { useState, useCallback } from 'react';
import axios from 'axios';

const useDuoverseContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateDuoverseContent = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const scenarios = [
        {
          decision: "Choosing to take the stairs instead of the elevator at work",
          splitStory: "At the third floor, she met a stranger who changed everything. In one reality, they discussed marine biology - in another, they talked about competitive eating.",
          earth1: {
            description: "Marine biologist discovering bioluminescent creatures in deep ocean trenches",
            prompt: "Professional marine biologist in diving gear underwater discovering glowing bioluminescent deep-sea creatures, research submarine in background, scientific equipment, underwater photography style"
          },
          earth2: {
            description: "Championship hot dog eating competitor at Nathan's Famous contest",
            prompt: "Professional competitive eater at hot dog eating championship, crowd cheering, multiple hot dogs, competitive eating contest atmosphere, sports photography style"
          },
          beforePrompt: "Young professional woman hesitating in office lobby, looking thoughtfully between elevator and staircase, contemplative expression, business attire, moment of uncertainty, modern office building"
        },
        {
          decision: "Deciding to answer a wrong-number phone call late at night",
          splitStory: "The voice spoke of distant mountains and ancient traditions. One path led to solitude among yaks - another to crowds cheering for culinary feats.",
          earth1: {
            description: "Nomadic yak herder living in Tibetan highlands",
            prompt: "Nomadic yak herder in traditional Tibetan clothing tending to yak herd in high mountain valleys, prayer flags, snow-capped peaks, documentary photography style"
          },
          earth2: {
            description: "Professional whistler performing with symphony orchestra",
            prompt: "Professional whistler in formal concert attire performing solo with full symphony orchestra, concert hall, spotlight, classical music performance"
          },
          beforePrompt: "Person in pajamas staring at ringing phone on bedside table at night, contemplative expression, hand hovering over phone, moment of hesitation, apartment bedroom, late night atmosphere"
        },
        {
          decision: "Choosing to pet a stray cat or walk past it on the street",
          splitStory: "The cat's eyes held ancient wisdom and modern chaos. One glance led to lighthouse solitude - another to circus spotlights.",
          earth1: {
            description: "Lighthouse keeper on remote Scottish island",
            prompt: "Lighthouse keeper in weathered coat maintaining lighthouse on rocky Scottish island, stormy seas, dramatic cliffs, maritime photography style"
          },
          earth2: {
            description: "Professional circus acrobat performing aerial silk routines",
            prompt: "Professional circus acrobat performing aerial silk routine high above circus crowd, colorful spotlights, dramatic poses, circus performance photography"
          },
          beforePrompt: "Person pausing on city street at dusk, looking down thoughtfully at stray cat, contemplative expression, hand slightly extended but hesitating, urban setting, moment of uncertainty"
        },
        {
          decision: "Choosing to order coffee or tea at a new café",
          splitStory: "The barista's recommendation changed the trajectory of existence. One sip led to Arctic winds - another to underground rhythms.",
          earth1: {
            description: "Arctic researcher studying polar bears in the wild",
            prompt: "Arctic researcher in heavy winter gear observing polar bears in snowy landscape, research equipment, ice formations, wildlife photography style"
          },
          earth2: {
            description: "Underground DJ spinning at secret warehouse rave",
            prompt: "DJ with headphones spinning records at underground warehouse rave, laser lights, dancing crowd, electronic music scene, nightlife photography"
          },
          beforePrompt: "Person standing at café counter, thoughtfully studying menu board with furrowed brow, contemplative expression, barista waiting patiently, cozy café atmosphere, moment of indecision"
        },
        {
          decision: "Choosing to take a different route home to avoid traffic",
          splitStory: "The detour passed a mysterious shop window display. One glimpse sparked oceanic adventures - another ignited culinary flames.",
          earth1: {
            description: "Professional pearl diver in tropical waters",
            prompt: "Professional pearl diver in traditional gear diving for pearls in crystal clear tropical waters, coral reefs, underwater scene, aquatic photography"
          },
          earth2: {
            description: "Michelin-starred chef specializing in molecular gastronomy",
            prompt: "Michelin-starred chef in pristine kitchen creating molecular gastronomy dishes with scientific equipment, artistic food presentation, culinary art photography"
          },
          beforePrompt: "Person in car at traffic intersection, staring thoughtfully at GPS showing alternate route, contemplative expression, hand hovering over steering wheel, city traffic, evening commute, moment of hesitation"
        },
        {
          decision: "Choosing to sit in a different seat on the train",
          splitStory: "The passenger beside them carried stories of distant lands. One conversation led to mountain peaks - another to ocean depths.",
          earth1: {
            description: "Professional mountain climber scaling Himalayan peaks",
            prompt: "Professional mountain climber in climbing gear scaling steep Himalayan peak, snow-covered mountains, climbing equipment, extreme sports photography"
          },
          earth2: {
            description: "Submarine engineer working on deep-sea exploration vessels",
            prompt: "Submarine engineer in technical uniform working inside advanced submarine control room, deep ocean visible through porthole, high-tech equipment"
          },
          beforePrompt: "Person standing in train aisle, contemplatively looking at two available seats, thoughtful expression, weighing options, other passengers in background, train interior, moment of indecision"
        },
        {
          decision: "Choosing to attend a random community event or stay home",
          splitStory: "At the event, a stranger mentioned their unusual hobby. One path led to desert solitude - another to stage spotlights.",
          earth1: {
            description: "Cactus farmer in Arizona desert cultivating rare species",
            prompt: "Cactus farmer in wide-brimmed hat tending to rare cactus species in Arizona desert, greenhouse, specialized tools, agricultural photography"
          },
          earth2: {
            description: "Professional mime artist performing in European street festivals",
            prompt: "Professional mime artist in classic white face paint and striped shirt performing for crowd at European street festival, expressive poses, street performance"
          },
          beforePrompt: "Person standing in front of community bulletin board, thoughtfully reading event flyer, contemplative expression, hand on chin, residential neighborhood, evening lighting, moment of uncertainty"
        },
        {
          decision: "Choosing to help a stranger with directions or pretend not to notice",
          splitStory: "The stranger's gratitude opened unexpected doors. One led to ancient crafts - another to modern spectacles.",
          earth1: {
            description: "Traditional blacksmith forging ceremonial swords",
            prompt: "Traditional blacksmith in leather apron working at forge creating ceremonial swords, sparks flying, ancient tools, craftsmanship photography"
          },
          earth2: {
            description: "Professional drone racing pilot competing in international championships",
            prompt: "Professional drone racing pilot with VR goggles controlling racing drone at high-speed championship, futuristic racing course, technology sports photography"
          },
          beforePrompt: "Person walking on city street, noticing confused tourist with map in the distance, contemplative expression, slowing down, moment of hesitation about whether to help, urban setting"
        }
      ];

      const selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];

      // Generate three images
      const beforeImageResponse = await axios.post(
        'http://localhost:3001/api/segmind/nano-banana',
        {
          prompt: selectedScenario.beforePrompt,
          negative_prompt: 'blurry, low quality, distorted, unrealistic',
          aspect_ratio: '16:9'
        },
        {
          headers: { 'Content-Type': 'application/json' },
          responseType: 'blob',
          timeout: 120000
        }
      );

      const earth1ImageResponse = await axios.post(
        'http://localhost:3001/api/segmind/nano-banana',
        {
          prompt: selectedScenario.earth1.prompt,
          negative_prompt: 'blurry, low quality, distorted, unrealistic',
          aspect_ratio: '16:9'
        },
        {
          headers: { 'Content-Type': 'application/json' },
          responseType: 'blob',
          timeout: 120000
        }
      );

      const earth2ImageResponse = await axios.post(
        'http://localhost:3001/api/segmind/nano-banana',
        {
          prompt: selectedScenario.earth2.prompt,
          negative_prompt: 'blurry, low quality, distorted, unrealistic',
          aspect_ratio: '16:9'
        },
        {
          headers: { 'Content-Type': 'application/json' },
          responseType: 'blob',
          timeout: 120000
        }
      );

      const beforeImageBlob = beforeImageResponse.data;
      const earth1ImageBlob = earth1ImageResponse.data;
      const earth2ImageBlob = earth2ImageResponse.data;

      const beforeImageUrl = URL.createObjectURL(beforeImageBlob);
      const earth1ImageUrl = URL.createObjectURL(earth1ImageBlob);
      const earth2ImageUrl = URL.createObjectURL(earth2ImageBlob);

      return {
        decision: selectedScenario.decision,
        splitStory: selectedScenario.splitStory,
        beforeImage: {
          url: beforeImageUrl,
          prompt: selectedScenario.beforePrompt
        },
        earth1: {
          description: selectedScenario.earth1.description,
          image: {
            url: earth1ImageUrl,
            prompt: selectedScenario.earth1.prompt
          }
        },
        earth2: {
          description: selectedScenario.earth2.description,
          image: {
            url: earth2ImageUrl,
            prompt: selectedScenario.earth2.prompt
          }
        }
      };

    } catch (error) {
      console.error('Error generating duoverse content:', error);
      setError('Failed to generate duoverse scenario. Please try again.');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateDuoverseContent,
    isGenerating,
    error
  };
};

export default useDuoverseContent;
