import { useState } from 'react';
import axios from 'axios';

const useUselessPowersContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const uselessPowerConcepts = [
    {
      title: "The Donkey Whisperer",
      story: "Marcus discovered his superpower at age 23 during a petting zoo incident. He can communicate telepathically with donkeys, but only donkeys. Not horses, not mules - just donkeys. The conversations are disappointingly mundane. 'I'm hungry,' says every donkey. 'The hay is okay,' reports another. Marcus tried joining the circus, but it turns out donkey commentary isn't much of an act. He briefly considered becoming a donkey therapist, but donkeys don't have complex emotional issues - they mostly just want better hay and fewer children pulling their ears. His girlfriend left him after he spent their anniversary dinner having a deep conversation with a donkey named Gerald about the philosophical implications of being stubborn. Marcus now works at a donkey sanctuary, where he's finally found his calling: translating donkey complaints to the staff. 'Gerald says the new hay is too dry,' he reports daily. It's not glamorous, but at least someone appreciates his gift.",
      imagePrompt: "A man in a superhero costume having a serious conversation with a donkey in a field, comic book style, funny and absurd"
    },
    {
      title: "Captain Perfect Timing (For Traffic Lights)",
      story: "Sarah's superpower manifested during her morning commute. She can make any traffic light turn green, but only when she's exactly 50 feet away and traveling at precisely 23 mph. This incredibly specific ability has made her the most punctual person in the city, but also the most frustrated. She's tried explaining her power to friends, but they don't understand the mathematical precision required. 'Just make the light green!' they shout from the passenger seat. But Sarah knows it doesn't work that way. She's attempted to monetize her gift by offering 'guaranteed green light rides' but the liability insurance was astronomical after several accidents involving people trying to maintain exactly 23 mph. Her dating life suffered when potential partners got carsick from her constant speed adjustments. Sarah now works as a driving instructor, where her obsession with precise speeds is finally considered a virtue rather than a neurosis. Her students think she's just really good at timing.",
      imagePrompt: "A woman in a cape standing exactly 50 feet from a traffic light, holding a speedometer showing 23 mph, superhero comic style"
    },
    {
      title: "The Elevator DJ",
      story: "Gerald's power activated during his first day at a corporate job. Whenever he enters an elevator alone, it automatically plays smooth jazz, but only when he's running late for something important. The music is always perfectly curated - Miles Davis for quarterly reviews, John Coltrane for job interviews, and Kenny G for first dates (which explains why he's still single). Gerald tried to harness this power for good by becoming a professional elevator musician, but the power only works when he's genuinely stressed about being late. He attempted to fake urgency, but the elevator could sense his deception and played polka instead. His coworkers now avoid sharing elevators with him because they know if smooth jazz starts playing, Gerald is about to burst into the meeting sweating and apologizing. He's considered therapy for his chronic lateness, but honestly, the elevator jazz is the only thing that keeps him calm during his daily panic attacks about punctuality.",
      imagePrompt: "A nervous man in a business suit alone in an elevator with musical notes floating around, smooth jazz instruments appearing magically, comic book art"
    },
    {
      title: "Sock Telekinesis Specialist",
      story: "Jennifer can move socks with her mind, but only socks, and only when they're dirty. Clean socks remain completely immune to her psychic abilities. She discovered this during laundry day when a particularly smelly gym sock flew across the room and smacked her roommate in the face. Jennifer initially thought she could revolutionize the laundry industry, but her power has severe limitations. The socks must be genuinely dirty - not just worn once, but properly funky. She can't control where they go, only that they move. Her apartment became a chaos zone of flying dirty socks until she learned to contain her emotions. Dating became impossible after a romantic dinner was interrupted by her date's dirty sock launching itself from his gym bag into the soup. Jennifer now works from home as a freelance writer, where her only audience for sock-related incidents is her cat, who has learned to duck whenever Jennifer gets frustrated with her editor.",
      imagePrompt: "A woman concentrating intensely while dirty socks float chaotically around her apartment, psychic energy waves, comic book style"
    },
    {
      title: "The Human Microwave Timer",
      story: "Dave's superpower is knowing exactly when any microwave will finish heating food, but only for microwaves he's never used before. He can sense the precise moment - down to the second - when that leftover pizza will be perfectly heated, but only in unfamiliar kitchens. His own microwave at home remains a mystery to him. Dave tried to monetize this by offering 'perfect reheating services' but the business model was flawed - he could only help each customer once. After that, their microwave became familiar and his power stopped working. He briefly worked at an appliance store, impressing customers with his uncanny ability to predict heating times, but was fired for spending too much time in the break room 'testing' his abilities on other people's lunches. Dave now works as a traveling food critic, where his power actually comes in handy for the first (and only) time he visits each restaurant's kitchen. The chefs think he's just really experienced with commercial microwaves.",
      imagePrompt: "A man standing in front of multiple microwaves with a timer floating above his head, surrounded by perfectly heated food, superhero comic style"
    },
    {
      title: "Professor Paperclip Magnetism",
      story: "Linda can attract paperclips with her fingertips, but only paperclips, and only the standard silver ones. Colored paperclips, staples, and other office supplies remain unaffected. She discovered this power during a particularly boring board meeting when paperclips from around the conference table began sliding toward her hands. Linda thought she could become a superhero, but fighting crime with paperclip magnetism proved challenging. Her first attempt at stopping a bank robbery ended with her accidentally creating a paperclip sculpture while the robbers escaped. She tried working as a magician, but audiences were unimpressed by paperclip tricks. Her power is strongest when she's bored, which means important meetings now feature paperclip tornadoes swirling around her seat. Linda's coworkers have learned to use plastic clips around her. She's found her calling as an office organizer, where her ability to locate every paperclip in a building is surprisingly valuable, even if it's completely useless for everything else.",
      imagePrompt: "A woman in business attire with paperclips magnetically attracted to her hands, forming swirling patterns, office setting, comic book art"
    },
    {
      title: "The Sneeze Predictor",
      story: "Tom can predict exactly when someone will sneeze, but only 3.7 seconds before it happens. This incredibly specific precognitive ability has made him the most prepared person for blessing people, but also the most annoying. 'Bless you,' he says, causing people to look confused until they inevitably sneeze moments later. Tom tried to use his power for medical purposes, thinking he could predict allergic reactions, but 3.7 seconds isn't enough warning for anything useful. He briefly worked as a photographer, perfectly timing shots to avoid sneeze-ruined photos, but clients found his countdown ('Sneeze in 3... 2... 1...') more distracting than helpful. His dating life suffered when he started blessing his dates preemptively, making them think he was either psychic or crazy. Tom now works at a tissue factory, where his ability to predict peak sneeze moments has made him the most efficient tissue distributor in company history. His coworkers think he just has really good timing.",
      imagePrompt: "A man pointing at people who are about to sneeze, with a countdown timer floating above his head, comic book style illustration"
    },
    {
      title: "Captain Expired Coupon Detection",
      story: "Rachel's superpower allows her to instantly identify expired coupons just by looking at them, even from across a room. She can sense the exact moment a coupon expires, feeling a small psychic ping when it becomes worthless. Rachel thought this could revolutionize retail, but stores weren't interested in hiring someone whose only skill was telling customers their discounts were invalid. She tried working as a coupon consultant, but her services were only needed for about thirty seconds per client. Her power became a curse at grocery stores, where she'd involuntarily announce expired coupons to strangers, earning her the nickname 'Coupon Karen.' Her friends stopped shopping with her after she ruined several trips by pointing out their expired deals. Rachel now works for a coupon printing company, where her ability to quality-check expiration dates has prevented numerous customer service disasters. It's not glamorous, but at least she's saving people from checkout embarrassment.",
      imagePrompt: "A woman with glowing eyes examining coupons that are highlighted in red (expired) and green (valid), surrounded by shopping receipts, comic style"
    },
    {
      title: "The WiFi Password Psychic",
      story: "Kevin can psychically determine any WiFi password, but only for networks with fewer than 3 connected devices. Popular networks with multiple users remain completely impenetrable to his abilities. He discovered this power during a coffee shop visit when he suddenly knew the password was 'coffee123' - but only because he was the sole customer. Kevin tried to become a tech consultant, but his power was useless for businesses and homes with multiple users. He briefly considered a career in cybersecurity, but explaining that his abilities only worked on lonely networks wasn't impressive to potential employers. His power is strongest in rural areas and unpopular cafes, making him the king of dead-zone internet access. Kevin now works as a traveling blogger, where his ability to connect to obscure WiFi networks in remote locations has given him a unique niche. His followers think he's just really good at guessing passwords, not knowing his success rate plummets in populated areas.",
      imagePrompt: "A man with his hand on his forehead concentrating on WiFi signals floating around him, with password text appearing in thought bubbles, tech comic style"
    },
    {
      title: "Master of Perfectly Ripe Bananas",
      story: "Angela can sense the exact moment when any banana reaches perfect ripeness, but her power only works within a 12-foot radius and she can't control the timing. She feels a gentle mental chime when bananas hit their peak, which lasts approximately 47 minutes before they start going bad. Angela tried to revolutionize the grocery industry with her gift, but store managers weren't interested in hiring someone who could only help with banana timing. She attempted to start a premium banana delivery service, but the logistics of maintaining perfect ripeness during transport proved impossible. Her power became a burden at home when she'd wake up at 3 AM sensing that the kitchen bananas had reached perfection. Her roommates grew tired of her midnight banana announcements. Angela now works at a smoothie shop, where her ability to identify peak banana moments has made their smoothies legendary. Customers don't know why their drinks taste better here, but Angela's perfectly timed banana selection is the secret ingredient.",
      imagePrompt: "A woman surrounded by bananas with a glowing aura, some bananas highlighted in golden light (perfect ripeness), fruit market setting, comic book art"
    }
  ];

  const generateUselessPowersContent = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const selectedPower = uselessPowerConcepts[Math.floor(Math.random() * uselessPowerConcepts.length)];

      // Generate the image using direct Segmind API like other image-only experiences
      const imageResponse = await axios.post(
        'https://api.segmind.com/v1/nano-banana',
        {
          prompt: selectedPower.imagePrompt,
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
          timeout: 120000
        }
      );

      const imageBlob = imageResponse.data;
      const imageUrl = URL.createObjectURL(imageBlob);

      return {
        title: selectedPower.title,
        story: selectedPower.story,
        image: {
          url: imageUrl,
          prompt: selectedPower.imagePrompt
        }
      };

    } catch (error) {
      console.error('Error generating useless powers content:', error);
      setError('Failed to generate useless power. Please try again.');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateUselessPowersContent,
    isGenerating,
    error
  };
};

export default useUselessPowersContent;
