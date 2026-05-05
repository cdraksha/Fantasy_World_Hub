import { useState, useCallback } from 'react';
import axios from 'axios';

const GPT4_URL = 'https://api.segmind.com/v1/gpt-4';
const IMG_URL  = 'https://api.segmind.com/v1/nano-banana';
const API_KEY  = () => import.meta.env.VITE_SEGMIND_API_KEY;

const STYLE_PREFIXES = {
  anime            : 'Japanese anime illustration, expressive characters, dramatic composition, manga panel art, bold linework',
  'amar-chitra-katha': 'Amar Chitra Katha Indian comic book style, bold black outlines, flat vivid colours, classic Indian illustration, sequential art'
};

const FALLBACK_COMICS = [
  {
    title  : 'The Pharaoh Who Ordered Pizza',
    style  : 'anime',
    setting: 'Ancient Egypt, 1340 BC',
    panels : [
      {
        caption   : 'Pharaoh Khamuntet the Confused receives a mysterious glowing scroll from the heavens.',
        dialogue  : '"A message from Ra himself... it says... extra cheese?"',
        imagePrompt: 'Egyptian pharaoh in golden headdress on ornate throne holding a glowing futuristic receipt scroll, servants and priests confused around him, grand pyramid interior with torches, hieroglyphics on walls'
      },
      {
        caption   : 'A chariot shaped like a giant pizza box descends from the storm clouds.',
        dialogue  : 'Delivery God: "Order #40,003 for Pharaoh? That will be twelve thousand camels."',
        imagePrompt: 'Massive golden pizza box shaped flying vehicle descending from dramatic storm clouds over Egyptian desert, terrified Egyptian soldiers below, sand swirling everywhere'
      },
      {
        caption   : 'The pizza is revealed. It is the size of the Great Pyramid.',
        dialogue  : '"...This is not what I ordered."',
        imagePrompt: 'Colossal pizza the exact size of the Great Pyramid sitting in the Egyptian desert beside the actual pyramids, tiny pharaoh at the base looking up in disbelief, dramatic sunset sky'
      },
      {
        caption   : 'The giant pizza begins to speak. It has the voice of a very serious cow.',
        dialogue  : 'Pizza: "MOOOOO. Thou hast 30 minutes to finish me or the Nile reverses."',
        imagePrompt: 'Monstrous living pizza with glowing cow eyes and a golden pharaoh crown on top of a pyramid, hovering above the Nile river, ancient Egyptians fleeing in boats below, lightning in background'
      },
      {
        caption   : 'The pizza peels off its crust. Underneath is another pharaoh. The real pharaoh was the pizza all along.',
        dialogue  : 'Pizza-Pharaoh: "I HAVE ALWAYS BEEN PIZZA. EGYPT IS CHEESE."',
        imagePrompt: 'Giant terrifying pizza-human hybrid wearing pharaoh headdress standing inside a pyramid, body made of melting cheese and pizza slices with googly eyes, tiny screaming Egyptians running away, the original pharaoh has become a breadstick on the floor'
      }
    ],
    wakeUpText: 'The Pizza-Pharaoh leans slowly towards you. Its cheese eyes stare directly into yours. "You are also pizza," it whispers. "You have always been pizza."'
  },
  {
    title  : 'Sir Ranjit and the Rocket Horse',
    style  : 'amar-chitra-katha',
    setting: 'Rajputana, India, 1247 AD',
    panels : [
      {
        caption   : 'Brave warrior Ranjit Singh polishes his sword when his horse begins to float two feet off the ground.',
        dialogue  : 'Horse: "Sir Ranjit. I have been waiting twelve years to tell you something."',
        imagePrompt: 'Heroic Rajput warrior in traditional armour and turban staring in shock at his decorated horse floating above a palace courtyard, colourful Rajputana palace with flags and domes in background, other soldiers looking baffled'
      },
      {
        caption   : 'The horse reveals two large rocket boosters from beneath its saddle.',
        dialogue  : '"I am not a horse. I have never been a horse. Please hold on."',
        imagePrompt: 'Rajput horse transforming to reveal giant rocket boosters with traditional Indian patterns and tassels, warrior clinging to its back, launching skyward from palace courtyard with huge flames and smoke, people running below'
      },
      {
        caption   : 'They land on the moon. There is a small dhaba selling chai.',
        dialogue  : 'Moon Dhaba Man: "Ek cutting chai? You look tired from your journey, bhai."',
        imagePrompt: 'Cheerful old Indian man serving chai from a small wooden dhaba stall on the grey moon surface, Earth visible large in the dark sky above, Rajput warrior sitting on a lunar rock drinking tea, rocket horse parked nearby'
      },
      {
        caption   : 'A giant space dragon arrives. It is wearing spectacles and carrying a very large stack of textbooks.',
        dialogue  : 'Dragon: "Excuse me. Is this Moon B? I am late for my Sanskrit exam."',
        imagePrompt: 'Enormous friendly space dragon wearing round reading glasses carrying a huge stack of ancient textbooks floating in space near the moon, confused Rajput warrior watching it pass, Saturn visible in background'
      },
      {
        caption   : 'The dragon opens its mouth. Inside is another Ranjit. Inside that Ranjit is another dragon with another Ranjit. Forever.',
        dialogue  : 'Dragon: "Ah yes. I collect these. I currently have 7,412 of you."',
        imagePrompt: 'Inside open dragon mouth is a miniature world with a tiny Rajput warrior, inside that warrior is another tiny dragon with another warrior, repeating infinitely smaller and smaller into darkness, surreal fractal tunnel of alternating warriors and dragons, each with the same confused expression'
      }
    ],
    wakeUpText: 'The 7,412th Ranjit stops. He looks up through all the layers. He looks directly at you. He has always known you were watching.'
  }
];

const useDreamComicContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError]               = useState(null);
  const [progress, setProgress]         = useState({ current: 0, total: 5 });

  const generateContent = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setProgress({ current: 0, total: 5 });

    try {
      let storyData;

      try {
        const gptRes = await fetch(GPT4_URL, {
          method : 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY() },
          body   : JSON.stringify({
            model      : 'gpt-4',
            max_tokens : 900,
            temperature: 1.3,
            messages   : [
              {
                role   : 'system',
                content: 'You are a dream sequence writer who creates bizarre, surreal 5-panel comic strip dreams. Your stories are set in random historical or futuristic time periods (Ancient Egypt, Feudal Japan, Year 3500, Prehistoric Earth, Medieval India, Viking Age, Ancient Rome, etc.). Stories start with a slightly odd but normal premise, escalate into complete absurdity by panel 3, and end with something so unhinged it physically jolts the dreamer awake. Randomly choose art style: "anime" (dramatic Japanese manga) or "amar-chitra-katha" (classic bold Indian comic art). Return ONLY valid compact JSON with no markdown.'
              },
              {
                role   : 'user',
                content: 'Create a 5-panel dream comic. Start odd, escalate to absurd, end completely unhinged. Return: {"title":"<comic title>","style":"anime" or "amar-chitra-katha","setting":"<time period and year>","panels":[{"caption":"<narrator text>","dialogue":"<character speech>","imagePrompt":"<visual scene description only, no art style words, 30-50 words>"}x5],"wakeUpText":"<the jarring final line that wakes the dreamer, 1-2 sentences>"}'
              }
            ]
          })
        });

        if (gptRes.ok) {
          const gptJson = await gptRes.json();
          storyData = JSON.parse(
            gptJson.choices[0].message.content.replace(/```json|```/g, '').trim()
          );
        }
      } catch {
        // GPT-4 failed — use fallback
      }

      if (!storyData || !storyData.panels || storyData.panels.length < 5) {
        storyData = FALLBACK_COMICS[Math.floor(Math.random() * FALLBACK_COMICS.length)];
      }

      const stylePrefix = STYLE_PREFIXES[storyData.style] || STYLE_PREFIXES.anime;
      const panelsWithImages = [];

      for (let i = 0; i < storyData.panels.length; i++) {
        setProgress({ current: i + 1, total: storyData.panels.length });
        const panel = storyData.panels[i];

        const imgRes = await axios.post(
          IMG_URL,
          {
            prompt              : `${stylePrefix}, comic book panel, ${panel.imagePrompt}`,
            samples             : 1,
            scheduler           : 'DPM++ 2M',
            num_inference_steps : 25,
            guidance_scale      : 7.5,
            seed                : Math.floor(Math.random() * 1000000),
            img_width           : 1024,
            img_height          : 1024,
            base64              : false
          },
          {
            headers     : { 'x-api-key': API_KEY(), 'Content-Type': 'application/json' },
            responseType: 'blob',
            timeout     : 60000
          }
        );

        panelsWithImages.push({
          caption  : panel.caption,
          dialogue : panel.dialogue,
          imageUrl : URL.createObjectURL(imgRes.data)
        });
      }

      return {
        title      : storyData.title,
        style      : storyData.style,
        setting    : storyData.setting,
        panels     : panelsWithImages,
        wakeUpText : storyData.wakeUpText
      };

    } catch (err) {
      console.error('Dream comic generation failed:', err);
      setError(err.message || 'Generation failed');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateContent, isGenerating, error, progress };
};

export default useDreamComicContent;
