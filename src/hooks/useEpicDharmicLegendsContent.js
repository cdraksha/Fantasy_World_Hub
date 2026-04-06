import { useState, useCallback } from 'react';
import axios from 'axios';

const useEpicDharmicLegendsContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateEpicDharmicLegend = useCallback(async () => {
    const legendPrompts = [
      // Krishna Legends - EPIC DETAILED
      "EPIC MASTERPIECE: Krishna lifting Mount Govardhan - Hyper-detailed portrait of divine child Krishna with luminous blue skin like precious sapphire, wearing an elaborate golden crown with peacock feathers, intricate filigree work, precious gems catching divine light. His face shows serene confidence with perfectly sculpted features, large lotus-petal eyes with divine compassion, subtle smile of infinite wisdom. Ornate golden jewelry with detailed engravings, sacred thread across chest, silk dhoti with gold brocade patterns. One finger effortlessly supports massive mountain with ancient temples, carved stone details, lush vegetation. Thousands of villagers below with individual facial expressions of awe and devotion, traditional clothing with intricate embroidery, women in colorful sarees with gold borders, children with wonder-filled eyes. Dramatic lighting with golden divine aura, storm clouds above contrasting with peaceful sanctuary below. Museum-quality Indian miniature painting style with Renaissance realism.",

      "EPIC MASTERPIECE: Nataraja Shiva's cosmic dance - Hyper-detailed four-armed Shiva in perfect Tandava pose within magnificent ring of flames. Each flame individually rendered with golden-orange gradients and divine energy. Shiva's face shows transcendent bliss with perfectly sculpted features, third eye blazing with cosmic fire, matted hair flowing with Ganga river depicted as crystalline water with lotus petals. Elaborate jewelry with precious gems, serpents as ornaments with detailed scales and ruby eyes, sacred ash marks in perfect geometric patterns. One hand holds damaru drum with intricate carvings, another in blessing mudra. Foot crushes demon Apasmara with detailed muscular form. Background shows cosmic universe with swirling galaxies, stars, nebulae in deep blues and purples. Traditional Indian art meets photorealistic detail.",

      // Hanuman Legends - EPIC DETAILED
      "EPIC MASTERPIECE: Hanuman's leap to Lanka - Colossal Hanuman with magnificent golden-orange fur, each hair individually detailed, muscular form with perfect anatomical proportions, wearing ornate dhoti with gold borders and sacred thread with gem-studded details. His face shows unwavering devotion with large expressive eyes filled with determination, perfectly sculpted features, devotional tilaka marks in intricate patterns. Massive gada (mace) with detailed metalwork and divine inscriptions. Tail streaming like a golden banner with individual fur strands visible. Below: vast turquoise ocean with mythical sea creatures - detailed scales on fish, serpents with jeweled eyes, waves with foam and spray. Distance shows golden Lanka with towering palaces, intricate architecture, domes and spires with precious gem inlays. Sky filled with dramatic clouds in golden hour lighting, divine aura surrounding Hanuman. Museum-quality traditional Indian art with photorealistic detail.",

      "EPIC MASTERPIECE: Hanuman reveals Rama-Sita in heart - Hanuman kneeling in perfect devotion pose, his chest opened like blooming lotus petals revealing miniature divine court within. Rama with perfect blue skin, elaborate crown with peacock feathers, holding ornate bow with gold inlays, wearing silk dhoti with intricate brocade. Sita in magnificent red and gold saree with detailed embroidery, precious jewelry with rubies and pearls, serene expression of divine grace. Lakshmana in warrior pose with detailed armor. Hanuman's face shows tears of pure devotion, hands in perfect anjali mudra, orange fur with individual strands, devotional marks in sacred geometry. Background shows elaborate temple with carved pillars, lotus motifs, divine light rays emanating from heart-shrine. Traditional miniature painting meets Renaissance realism.",

      // Durga Legends - EPIC DETAILED  
      "EPIC MASTERPIECE: Durga battles Mahishasura - Eight-armed Goddess Durga with perfect divine beauty, each arm wielding ornately detailed weapons - trident with silver inlays, sword with jeweled hilt, golden discus with sacred mantras, bow with pearl decorations, conch with coral details, mace with diamond studs. Riding magnificent lion with golden mane, fierce expression, powerful muscles. Durga wears flowing red and gold sarees with intricate brocade patterns, elaborate crown with precious gems, jewelry with detailed filigree work. Her face shows divine fury mixed with infinite compassion, perfectly sculpted features, large lotus eyes blazing with cosmic fire. Mahishasura as massive buffalo with human torso emerging, detailed muscular form, fierce expression, dark energy aura. Cosmic battlefield with swirling energy, divine light rays, traditional Indian art with museum-quality detail.",

      // Ganesha Legends
      "Lord Ganesha writing the Mahabharata as sage Vyasa dictates, using his broken tusk as a pen. Show Ganesha in his elephant-headed form with elaborate crown and jewelry, seated cross-legged with palm leaf manuscripts spread before him, his broken tusk in his trunk being used as a writing instrument. Sage Vyasa should be shown seated nearby in meditation pose, with divine inspiration flowing between them as golden light. Include intricate details of ancient Sanskrit text on the palm leaves, traditional oil lamps providing warm lighting, and the scholarly atmosphere of an ancient ashram with scrolls, books, and sacred symbols around them.",

      // Vishnu Legends
      "Lord Vishnu's Kurma (turtle) avatar supporting Mount Mandara during the churning of the cosmic ocean (Samudra Manthan). Show the massive cosmic turtle Vishnu in the churning ocean, with the golden Mount Mandara on his shell being used as a churning rod. The serpent Vasuki should be wrapped around the mountain as a rope, with Devas (gods) on one side and Asuras (demons) on the other, all pulling in cosmic tug-of-war. Include the emergence of divine treasures from the ocean - Lakshmi, Kamadhenu cow, Kalpa tree, and the pot of amrita (nectar of immortality). The scene should show cosmic scale with divine beings, elaborate traditional clothing, and celestial light effects.",

      // Rama Legends
      "Lord Rama's coronation in Ayodhya after returning from 14 years of exile. Show Rama and Sita seated on golden thrones in the magnificent royal court of Ayodhya, with Rama being crowned by sage Vasishtha while Hanuman, Lakshmana, Bharata, and Shatrughna stand nearby. The scene should show thousands of citizens celebrating with flower petals falling from the sky, elaborate palace architecture with carved pillars and domes, and divine light blessing the ceremony. Include intricate details of royal regalia, silk clothing with gold embroidery, traditional jewelry, and the expressions of joy and devotion on everyone's faces.",

      // Lakshmi Legends
      "Goddess Lakshmi emerging from the cosmic ocean during Samudra Manthan, seated on a lotus flower. Show the radiant goddess rising from the churning cosmic waters on a magnificent pink lotus, with four arms holding lotus flowers and showering gold coins. She should be adorned in the finest silk sarees with intricate gold embroidery, elaborate jewelry including crown, necklaces, and armlets, with her long dark hair flowing. Two elephants on either side should be performing abhisheka (sacred bath) with golden pots. The background should show the cosmic ocean with divine light, other emerging treasures, and gods and demons witnessing this miraculous birth.",

      // Saraswati Legends
      "Goddess Saraswati creating the universe through divine music and knowledge. Show the elegant goddess in pure white sarees seated on a white lotus or swan, playing the veena (stringed instrument) with musical notes transforming into stars, planets, and galaxies around her. Her four arms should hold the veena, sacred books (Vedas), a rosary, and a water pot. Include intricate details of the musical instrument with carved peacocks, the flowing white garments with subtle silver embroidery, and the serene expression of divine wisdom. The cosmic background should show the birth of creation through sound and knowledge, with Sanskrit mantras flowing as golden light."
    ];

    const selectedPrompt = legendPrompts[Math.floor(Math.random() * legendPrompts.length)];

    // Enhanced prompt for epic visual quality
    const enhancedPrompt = `${selectedPrompt}

Style: Epic modern digital art, cinematic fantasy concept art, dramatic lighting with volumetric rays, photorealistic 3D rendering, vibrant colors with HDR effects, dynamic composition, epic fantasy game art style, detailed textures and materials, atmospheric effects, lens flares, particle effects, cinematic depth of field, 8K ultra-high resolution, AAA video game quality, Marvel/DC comic book epic scenes, fantasy movie poster style, dramatic shadows and highlights, modern CGI quality.`;

    try {
      setIsGenerating(true);
      setError(null);

      console.log('🎨 Generating Epic Dharmic Legend with enhanced prompt...');

      const response = await axios.post('https://api.segmind.com/v1/nano-banana', {
        prompt: enhancedPrompt
      }, {
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json'
        },
        responseType: 'blob'
      });

      console.log('✅ Epic Dharmic Legend generated successfully');
      console.log('Response data type:', typeof response.data);
      console.log('Response data size:', response.data.size);

      // Check if we got a valid blob
      if (!response.data || response.data.size === 0) {
        throw new Error('Received empty image data');
      }

      // Convert blob to URL
      const imageUrl = URL.createObjectURL(response.data);
      console.log('Created image URL:', imageUrl);
      
      // Create a short description for the legend
      const legendDescriptions = [
        "Krishna lifts Mount Govardhan to protect villagers from Indra's wrath",
        "Shiva performs the cosmic dance of creation and destruction", 
        "Hanuman leaps across the ocean in devotion to Rama",
        "Hanuman reveals Rama and Sita dwelling within his heart",
        "Durga battles the buffalo demon Mahishasura in cosmic warfare",
        "Ganesha writes the Mahabharata using his broken tusk as pen",
        "Vishnu as Kurma supports Mount Mandara during ocean churning",
        "Rama's divine coronation after returning from 14 years of exile",
        "Lakshmi emerges from the cosmic ocean on a lotus flower",
        "Saraswati creates the universe through divine music and knowledge"
      ];

      // Match description to the selected prompt
      const promptIndex = legendPrompts.indexOf(selectedPrompt);
      const legendDescription = legendDescriptions[promptIndex] || "Epic moment from Dharmic mythology brought to life";

      return {
        legendDescription,
        image: {
          url: imageUrl,
          prompt: selectedPrompt,
          description: "Epic Dharmic Legend - Divine mythology brought to life"
        }
      };

    } catch (error) {
      console.error('Epic Dharmic Legend generation failed:', error);
      
      let errorMessage = 'Failed to generate epic legend';
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
    generateEpicDharmicLegend,
    isGenerating,
    error
  };
};

export default useEpicDharmicLegendsContent;
