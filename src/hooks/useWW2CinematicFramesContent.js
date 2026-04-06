import { useState, useCallback } from 'react';
import axios from 'axios';

const useWW2CinematicFramesContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateWW2CinematicFramesContent = useCallback(async () => {
    const prompt = `Generate a World War 2 cinematic frame scenario featuring a single powerful moment from the global war.

    Create a JSON object with these fields:
    - description: A short 1-2 sentence description of the cinematic moment (20-40 words)
    - imagePrompt: Detailed prompt for generating the Dunkirk-inspired cinematic frame

    WW2 CINEMATIC FRAMES CONCEPT:
    - Single powerful moments from World War 2 across ALL global theaters
    - Dunkirk-inspired cinematic composition and lighting
    - Human drama and emotion in wartime
    - Movie-quality visual storytelling
    - Focus on people looking up, dramatic perspectives, atmospheric tension

    GLOBAL THEATERS TO COVER:
    
    PACIFIC THEATER:
    - Pearl Harbor attack - sailors looking up at incoming planes
    - Iwo Jima - Marines on beach with flag raising in background
    - Midway - Pilots in cockpit during dogfight
    - Philippines - Soldiers in jungle looking up at Japanese planes
    - Guadalcanal - Troops on landing craft approaching shore
    - Kamikaze attacks - Sailors on deck watching incoming planes
    - Burma - British/Indian troops in monsoon conditions
    - Wake Island - Defenders looking up at bombing raid

    EUROPEAN THEATER:
    - Dunkirk evacuation - Soldiers on beach looking up at Stukas
    - London Blitz - Civilians in shelter looking up at searchlights
    - D-Day Normandy - Troops in landing craft approaching beach
    - Battle of Britain - RAF pilots scrambling to planes
    - Stalingrad - Soviet soldiers in ruins looking up at planes
    - Berlin bombing - German civilians in bunker
    - Market Garden - Paratroopers looking up at transport planes
    - Monte Cassino - Allied troops looking up at monastery

    AFRICAN THEATER:
    - El Alamein - British tanks in desert with planes overhead
    - Tobruk siege - Australian troops looking up at Stukas
    - Operation Torch - American troops landing in North Africa
    - Desert warfare - Afrika Korps looking up at RAF planes

    EASTERN FRONT:
    - Operation Barbarossa - German troops advancing with air support
    - Siege of Leningrad - Civilians looking up during bombing
    - Kursk tank battle - Tank crews with aerial combat overhead
    - Warsaw Ghetto uprising - Resistance fighters with planes above

    ASIAN THEATER:
    - Burma Railway - POWs working while planes pass overhead
    - Singapore fall - British troops surrendering
    - Hong Kong defense - Garrison looking up at Japanese attack
    - Dutch East Indies - Naval battle with aircraft

    DESCRIPTION STYLE:
    - Cinematic and dramatic tone
    - Emphasize the human element and emotion
    - Mention specific theater/location and moment
    - Make it feel like a movie scene
    - Keep it short and impactful (1-2 sentences max)

    IMAGE PROMPT REQUIREMENTS:
    - Dunkirk-style cinematic composition with dramatic lighting
    - People clearly visible looking upward or in dramatic poses
    - Period-accurate uniforms, equipment, and vehicles
    - Atmospheric effects - smoke, clouds, dramatic sky, explosions
    - Wide cinematic shots showing scale and context
    - Golden hour lighting or dramatic storm/battle lighting
    - Movie poster quality, professional war film cinematography
    - Emphasis on human faces and emotions
    - Realistic historical details and accuracy
    - Christopher Nolan aesthetic - practical effects, dramatic angles

    EXAMPLE SCENARIOS:
    - American Marines on Iwo Jima beach looking up at Japanese Zeros strafing
    - British soldiers at Dunkirk evacuation looking up at incoming Stuka dive bombers
    - Soviet defenders in Stalingrad ruins watching German planes overhead
    - RAF pilots running to Spitfires during Battle of Britain scramble
    - Australian troops in North Africa desert looking up at dogfight above

    Return ONLY a valid JSON object with both fields filled.`;

    try {
      setIsGenerating(true);
      setError(null);

      // Generate scenario content
      const scenarioResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master of cinematic war storytelling who creates powerful single moments from World War 2 across all global theaters. Generate Dunkirk-inspired scenes with dramatic human emotion, focusing on soldiers, sailors, pilots, and civilians in wartime. Cover Pacific, European, African, and Asian theaters equally. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.9
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          
            'Content-Type': 'application/json'
        }
      });

      const contentText = scenarioResponse.data.choices[0].message.content.trim();
      
      // Extract JSON from response
      let jsonText = contentText;
      if (jsonText.includes('```json')) {
        jsonText = jsonText.split('```json')[1].split('```')[0];
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.split('```')[1];
      }
      
      // Find first complete JSON object
      const firstBrace = jsonText.indexOf('{');
      if (firstBrace > -1) {
        jsonText = jsonText.substring(firstBrace);
        let braceCount = 0;
        let firstObjectEnd = -1;
        for (let i = 0; i < jsonText.length; i++) {
          if (jsonText[i] === '{') braceCount++;
          if (jsonText[i] === '}') braceCount--;
          if (braceCount === 0 && jsonText[i] === '}') {
            firstObjectEnd = i;
            break;
          }
        }
        if (firstObjectEnd > -1) {
          jsonText = jsonText.substring(0, firstObjectEnd + 1);
        }
      }
      
      // Clean up JSON
      jsonText = jsonText
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .trim();
      
      console.log('Cleaned WW2 cinematic frames JSON:', jsonText);
      
      let scenarioData;
      try {
        scenarioData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse scenario JSON');
      }

      // Generate image
      const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;

      console.log('🎬 Generating WW2 cinematic frame image...');

      const imageResponse = await axios.post(
        'https://api.segmind.com/v1/nano-banana',
        {
          prompt: scenarioData.imagePrompt,
          samples: 1,
          scheduler: "DPM++ 2M",
          num_inference_steps: 25,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000),
          img_width: 1024,
          img_height: 1024,
          base64: false
        },
        {
          headers: {
            'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json'
          },
          responseType: 'blob',
          timeout: 60000
        }
      );

      const imageUrl = URL.createObjectURL(imageResponse.data);
      
      console.log('✅ WW2 cinematic frames content generated successfully');
      
      return {
        description: scenarioData.description,
        image: {
          url: imageUrl,
          prompt: scenarioData.imagePrompt
        }
      };

    } catch (error) {
      console.error('WW2 cinematic frames content generation failed:', error);
      setError('Failed to generate WW2 cinematic frames content');
      throw new Error('Failed to generate WW2 cinematic frames content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateWW2CinematicFramesContent,
    isGenerating,
    error
  };
};

export default useWW2CinematicFramesContent;
