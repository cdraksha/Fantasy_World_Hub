import { useState, useCallback } from 'react';
import axios from 'axios';

const useFuturisticGlassesContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateFuturisticGlassesContent = useCallback(async () => {
    const glassesPrompts = [
      // Tony Stark Style HUD Glasses
      "EPIC FUTURISTIC GLASSES: Tony Stark-style smart glasses with holographic HUD display showing threat analysis, building schematics, and targeting systems. The glasses have sleek titanium frames with glowing blue arc reactor-powered lenses. Holographic interface elements float in front of the wearer's vision - enemy weak points highlighted in red, structural analysis of buildings in wireframe, probability percentages floating above objects. The lenses show advanced targeting reticles, biometric scanners, and real-time data streams. Photorealistic close-up shot showing the intricate details of the frames, glowing circuits, and transparent holographic overlays. Cinematic lighting with blue tech glow, ultra-high detail, 8K resolution.",

      "EPIC FUTURISTIC GLASSES: Advanced smart glasses displaying impossible new colors beyond human perception - ultraviolet rainbows, infrared heat signatures as beautiful art, and electromagnetic spectrum visualization. The lenses shimmer with prismatic effects showing colors that don't exist in nature. The frames are made of metamaterial that bends light in impossible ways. Through the lenses, you can see a world painted in impossible hues - trees glowing in colors between blue and green that have no name, people's auras in shades beyond imagination, buildings radiating thermal beauty in artistic patterns. The glasses themselves pulse with these impossible colors. Surreal artistic visualization of enhanced color perception, dreamlike atmosphere.",

      // X-Men Cyclops Style Energy Beam Glasses
      "EPIC FUTURISTIC GLASSES: Cyclops-style energy beam glasses with ruby quartz lenses that focus devastating optic blasts. The glasses have a sleek visor design with geometric red crystal lenses that glow with contained energy. Visible energy beams shooting from the lenses - precise laser cutting through metal, controlled heat rays, and variable power settings from gentle warming to building demolition. The frames have energy regulators, power level displays, and targeting systems. Multiple beam modes visible - focused cutting beam, wide area blast, and precision targeting dots. The lenses show swirling energy patterns and power buildup effects. Dramatic action shot with energy beams in motion, dynamic lighting effects.",

      // Emotion and Mind Reading Glasses
      "EPIC FUTURISTIC GLASSES: Emotion-detection smart glasses that visualize people's feelings as colored auras and floating emotional data. The glasses have neural interface technology with brain-wave sensors built into the temples. Through the lenses, people are surrounded by swirling colored auras - red for anger, blue for sadness, gold for happiness, purple for love, green for envy. Floating text displays show emotional states, stress levels, and truthfulness indicators. The frames have micro-sensors and neural processors. The lenses show empathy mapping, mood analysis, and psychological profiling overlays. Ethereal visualization of human emotions made visible, mystical atmosphere with glowing auras.",

      // Time Vision and Memory Replay Glasses
      "EPIC FUTURISTIC GLASSES: Time-vision glasses that show 'ghosts' of past events and can record/replay memories as holograms. The lenses have temporal sensors that detect chronoton particles and time distortions. Through the glasses, you can see transparent overlays of historical events - ghostly figures from the past walking through the same space, important moments replaying like holograms. The frames have temporal processors and memory storage units. Holographic recordings of memories float in the air, showing past conversations and events. The lenses shimmer with temporal energy and show time-stream visualizations. Mystical time-travel aesthetic with ghostly overlays and temporal effects.",

      // Molecular and X-Ray Vision Glasses
      "EPIC FUTURISTIC GLASSES: X-ray and molecular analysis glasses that reveal the atomic structure of objects and see through solid matter. The lenses use quantum sensors and particle detectors to visualize matter at the molecular level. Through the glasses, solid objects become transparent wireframes showing internal structures, hidden compartments, and molecular compositions. People appear as anatomical models with organs, bones, and circulatory systems visible. The frames have quantum processors and particle analyzers. Floating molecular diagrams show chemical compositions and atomic structures. Scientific visualization with wireframe overlays, anatomical details, and molecular models floating in space.",

      // Probability and Future Prediction Glasses
      "EPIC FUTURISTIC GLASSES: Probability-calculation glasses that show percentage chances floating above decisions and predict future outcomes. The lenses use quantum computing and probability algorithms to analyze infinite possible futures. Floating percentage numbers appear above every choice - 73% chance of success, 12% probability of failure, 85% likelihood of positive outcome. Branching timeline visualizations show possible future paths. The frames have quantum processors and predictive AI systems. Through the lenses, you see probability clouds, decision trees, and future scenario projections. Sci-fi interface with floating statistics, branching timelines, and predictive overlays.",

      // Language Translation and Communication Glasses
      "EPIC FUTURISTIC GLASSES: Universal translator glasses with real-time subtitle display and telepathic communication capabilities. The lenses have advanced language processing and neural interface technology. Floating subtitles appear when people speak in foreign languages, showing instant translations in your preferred language. The frames have neural transmitters for thought-to-text communication. Holographic text bubbles show translated conversations, cultural context notes, and communication enhancement features. The glasses can also display sign language translations and emotional subtext. Multicultural communication visualization with floating text, translation overlays, and telepathic interface elements.",

      // Dream Recording and Visualization Glasses
      "EPIC FUTURISTIC GLASSES: Dream-recording glasses that capture and visualize dreams, thoughts, and imagination as holographic movies. The frames have neural interface technology with dream-state sensors and memory processors. Swirling holographic projections show dream sequences, fantastical imagery, and subconscious visualizations floating in the air. The lenses display REM sleep patterns, dream analysis, and imagination enhancement features. Surreal dream imagery - flying through clouds, impossible architectures, mythical creatures - all projected as holograms. The glasses can record, edit, and share dreams as visual experiences. Dreamlike aesthetic with floating surreal imagery and consciousness visualization.",

      // Reality Augmentation and Physics Manipulation Glasses
      "EPIC FUTURISTIC GLASSES: Reality-augmentation glasses that overlay digital enhancements onto the physical world and manipulate physics laws. The lenses use advanced AR technology and quantum field manipulators. Through the glasses, the real world is enhanced with digital elements - virtual objects that can be touched, gravity-defying platforms, and physics-bending effects. Floating digital interfaces allow manipulation of real-world physics - adjusting gravity, changing material properties, and creating impossible structures. The frames have reality processors and quantum field generators. Holographic tools and digital overlays blend seamlessly with physical reality. Mind-bending visualization of augmented reality taken to impossible extremes.",

      // Superhuman Enhancement and Power Amplification Glasses
      "EPIC FUTURISTIC GLASSES: Power-amplification glasses that enhance human abilities and grant superhuman vision capabilities. The lenses use bio-enhancement technology and neural amplifiers. Enhanced vision modes include telescopic zoom showing details miles away, microscopic vision revealing cellular structures, night vision with perfect clarity, and electromagnetic spectrum visualization. The frames have bio-sensors and power amplifiers that enhance reflexes, reaction time, and cognitive processing. Through the lenses, you see enhanced reality with superhuman clarity, speed, and perception. Multiple vision modes can be layered simultaneously. Superhero aesthetic with enhanced visual effects and power-up visualizations."
    ];

    const selectedPrompt = glassesPrompts[Math.floor(Math.random() * glassesPrompts.length)];

    // Enhanced prompt for epic visual quality
    const enhancedPrompt = `${selectedPrompt}

Style: Epic sci-fi concept art, Tony Stark Iron Man aesthetic, photorealistic 3D rendering with intricate technological details, vibrant tech colors with HDR effects, dramatic lighting with glowing elements, detailed textures on frames and lenses, holographic particle effects, cinematic depth of field, 8K ultra-high resolution, Marvel movie quality CGI, futuristic product design, dramatic shadows and tech lighting showcasing advanced optics, close-up hero shot emphasizing the glasses' sophisticated technology.`;

    try {
      setIsGenerating(true);
      setError(null);

      console.log('🕶️ Generating Futuristic Glasses with enhanced prompt...');

      const response = await axios.post('https://api.segmind.com/v1/nano-banana', {
        prompt: enhancedPrompt,
        samples: 1,
        scheduler: "DPM++ 2M",
        num_inference_steps: 25,
        guidance_scale: 7.5,
        seed: Math.floor(Math.random() * 1000000),
        img_width: 1024,
        img_height: 1024,
        base64: false
      }, {
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'blob',
        timeout: 120000
      });

      console.log('✅ Futuristic Glasses generated successfully');
      console.log('Response data type:', typeof response.data);
      console.log('Response data size:', response.data.size);

      // Check if we got a valid blob
      if (!response.data || response.data.size === 0) {
        throw new Error('Received empty image data');
      }

      // Convert blob to URL
      const imageUrl = URL.createObjectURL(response.data);
      console.log('Created image URL:', imageUrl);
      
      // Create descriptions matching the prompts
      const descriptions = [
        "Tony Stark-style smart glasses with holographic HUD displaying threat analysis and targeting systems",
        "Advanced glasses revealing impossible new colors beyond human perception and electromagnetic spectrum",
        "Cyclops-style energy beam glasses with ruby quartz lenses focusing devastating optic blasts",
        "Emotion-detection glasses visualizing people's feelings as colored auras and floating emotional data",
        "Time-vision glasses showing ghostly overlays of past events and holographic memory recordings",
        "X-ray and molecular analysis glasses revealing atomic structures and seeing through solid matter",
        "Probability-calculation glasses showing percentage chances floating above decisions and future predictions",
        "Universal translator glasses with real-time subtitles and telepathic communication capabilities",
        "Dream-recording glasses capturing and visualizing dreams as holographic movies and imagination",
        "Reality-augmentation glasses overlaying digital enhancements and manipulating physics laws",
        "Power-amplification glasses enhancing human abilities and granting superhuman vision capabilities"
      ];

      // Match description to the selected prompt
      const promptIndex = glassesPrompts.indexOf(selectedPrompt);
      const description = descriptions[promptIndex] || "Advanced futuristic glasses with impossible technological capabilities";

      return {
        description,
        image: {
          url: imageUrl,
          prompt: selectedPrompt,
          description: "Futuristic Glasses - Tony Stark-inspired advanced eyewear technology"
        }
      };

    } catch (error) {
      console.error('Futuristic Glasses generation failed:', error);
      
      let errorMessage = 'Failed to generate futuristic glasses';
      if (error.response?.status === 401) {
        errorMessage = 'API key authentication failed';
      } else if (error.response?.status === 429) {
        errorMessage = 'Rate limit exceeded, please try again later';
      } else if (error.response?.status) {
        errorMessage = `API Error: Status ${error.response.status}`;
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
    generateFuturisticGlassesContent,
    isGenerating,
    error
  };
};

export default useFuturisticGlassesContent;
