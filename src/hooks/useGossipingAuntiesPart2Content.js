import { useState, useCallback } from 'react';

const useGossipingAuntiesPart2Content = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateGossipingAuntiesPart2Content = useCallback(async () => {
    const videoScenarios = [
      {
        description: "Angry aunties gossiping about bahu's work schedule during morning surveillance walk.",
        prompt: "A dynamic medium shot of three permanently annoyed Indian aunties in colorful sarees with tight blouses and gold chains bouncing, walking quickly through a modern apartment complex corridor at 5am, phones glued to their hands, gesturing dramatically while whispering about their daughter-in-law's work schedule, sweating and irritated expressions, morning surveillance mission, natural apartment lighting"
      },
      {
        description: "Emergency kitty party meeting about new tenant's suspicious cooking smells.",
        prompt: "A wide shot of four loud-voiced Indian aunties in tight saree blouses sitting around a small table with tea cups, gold chains bouncing as they lean in dramatically, phones on table buzzing with WhatsApp notifications, gesturing wildly while discussing suspicious non-vegetarian cooking smells from new tenant, afternoon kitty party setting, dramatic expressions"
      },
      {
        description: "WhatsApp voice note recording session about unmarried neighbor's late visitors.",
        prompt: "A close-up shot of two sweating Indian aunties in colorful sarees holding phones close to their mouths, recording dramatic WhatsApp voice notes about their unmarried neighbor's male visitors after 8pm, gold jewelry bouncing, irritated expressions, loudly chewing while talking, apartment balcony setting with evening light"
      },
      {
        description: "Surveillance operation watching delivery boys at suspicious apartment.",
        prompt: "A medium shot of three Indian aunties in tight saree blouses hiding behind pillars in apartment complex, phones ready to record, gold chains glinting, watching delivery boys carry packages to suspicious apartment, whispering dramatically about online shopping addiction, morning surveillance mission, sneaky expressions"
      },
      {
        description: "Dramatic reaction to seeing bahu wearing western clothes to work.",
        prompt: "A dynamic shot of two permanently annoyed Indian aunties in colorful sarees gasping dramatically while pointing at their daughter-in-law walking to work in jeans and sleeveless top, gold chains bouncing with shock, phones immediately coming out to record evidence, sweating with moral outrage, apartment complex entrance setting"
      },
      {
        description: "Morning walking group discussing startup son's suspicious business.",
        prompt: "A tracking shot of four Indian aunties in exercise sarees walking briskly through apartment complex, phones in hand, gold chains bouncing, loudly discussing their neighbor's son's 'digital marketing' startup with no office, gesturing wildly about suspicious income, 5am morning light, surveillance walk mission"
      },
      {
        description: "Emergency WhatsApp group video call about gym membership scandal.",
        prompt: "A medium shot of three Indian aunties in tight saree blouses sitting with phones propped up for video call, gold jewelry bouncing as they gesture dramatically about their neighbor's suspicious gym membership at age 45, sweating with excitement, afternoon gossip session, multiple phone screens visible"
      },
      {
        description: "Investigating late night party sounds with dramatic eavesdropping.",
        prompt: "A close-up shot of two Indian aunties in colorful sarees pressing ears against apartment door, phones ready to record evidence, gold chains dangling, sweating with concentration while listening to party sounds, whispering dramatically about music after 9pm, evening surveillance operation"
      },
      {
        description: "Kitty party crisis meeting about rejected marriage proposals.",
        prompt: "A wide shot of five Indian aunties in tight saree blouses sitting in circle with tea and snacks, phones buzzing constantly, gold chains bouncing as they gesture wildly about family rejecting 'good proposals' for their 26-year-old daughter, dramatic expressions of moral outrage, afternoon emergency meeting"
      },
      {
        description: "Morning surveillance briefing about maid sharing controversy.",
        prompt: "A medium shot of three permanently annoyed Indian aunties in exercise sarees standing in apartment complex courtyard, phones displaying WhatsApp messages, gold jewelry glinting in morning sun, loudly discussing suspicious family wanting to share domestic help, gesturing about financial status investigation, 5am briefing session"
      }
    ];

    const selectedScenario = videoScenarios[Math.floor(Math.random() * videoScenarios.length)];

    try {
      setIsGenerating(true);
      setError(null);

      console.log(`🎬 Generating gossiping aunties video: ${selectedScenario.description}...`);

      // Generate video using Segmind LTX-2-19B-T2V
      const videoResponse = await fetch('https://api.segmind.com/v1/ltx-2-19b-t2v', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: selectedScenario.prompt,
          negative_prompt: "blurry, low quality, still frame, frames, watermark, overlay, titles, has blurbox, has subtitles, western clothing, modern dress, inappropriate clothing",
          width: 720,
          height: 1280,
          num_frames: 121,
          fps: 24,
          seed: Math.floor(Math.random() * 1000000000),
          guidance_scale: 4
        })
      });

      if (!videoResponse.ok) {
        throw new Error(`Segmind LTX-2-19B-T2V API error: ${videoResponse.status}`);
      }

      // LTX-2-19B-T2V returns video file directly, not JSON
      const videoBlob = await videoResponse.blob();
      console.log('✅ Gossiping aunties video generated successfully');

      // Check if we got valid video response
      if (!videoBlob || videoBlob.size === 0) {
        throw new Error('Received empty video data');
      }

      // Convert blob to URL
      const videoUrl = URL.createObjectURL(videoBlob);
      console.log('Created video URL:', videoUrl);

      return {
        sceneDescription: selectedScenario.description,
        video: {
          url: videoUrl,
          prompt: selectedScenario.prompt,
          description: `Gossiping Aunties Part 2 - ${selectedScenario.description}`,
          thumbnail: null
        }
      };

    } catch (error) {
      console.error('Gossiping Aunties Part 2 generation failed:', error);
      
      let errorMessage = 'Failed to generate gossip video';
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
    generateGossipingAuntiesPart2Content,
    isGenerating,
    error
  };
};

export default useGossipingAuntiesPart2Content;
