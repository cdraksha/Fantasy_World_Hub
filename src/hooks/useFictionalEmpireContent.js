import { useState, useCallback } from 'react';
import axios from 'axios';

const useFictionalEmpireContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateFictionalEmpireContent = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const empires = [
        {
          name: "The Thalassocratic Empire of Maridonia",
          backstory: "Flourishing between 847-1203 CE in the Mediterranean archipelago now known as the Cyclades, the Maridonian Empire controlled maritime trade routes connecting Europe, Africa, and Asia. Founded by the merchant-navigator Alexios Maridonis, who unified the scattered island city-states through a revolutionary system of shared naval defense and commercial law. The Maridonians developed advanced shipbuilding techniques, creating vessels capable of carrying 300 tons of cargo across treacherous waters. Their capital, Thalassopolis, was built on a natural harbor so deep that ships could dock directly at multi-story warehouses carved into cliffsides. The empire's wealth came from monopolizing the trade in rare purple dye extracted from local sea snails, silk from the East, and amber from the North. Their unique governmental system, the 'Council of Tides,' rotated leadership among the major islands based on seasonal trade patterns. The Maridonians established trading posts from Crimea to Morocco, and their distinctive blue-sailed ships were recognized in every major port. The empire declined after the Fourth Crusade disrupted their trade networks, and their final stronghold fell to Venetian forces in 1203. Today, only scattered ruins and ancient harbor installations hint at their former maritime dominance.",
          imagePrompt: "Ancient Mediterranean maritime empire with massive stone harbor installations, multi-story clifftop warehouses, blue-sailed merchant ships, terraced island city overlooking deep natural harbor, classical architecture with maritime motifs, ancient dock systems, realistic historical setting"
        },
        {
          name: "The Highland Kingdom of Vorthakia",
          backstory: "Established in the remote Carpathian highlands between 1156-1389 CE, the Kingdom of Vorthakia controlled crucial mountain passes connecting Central Europe with the Byzantine Empire. Founded by the warlord Vratislav the Iron-Handed, who united warring Slavic tribes through a combination of military prowess and innovative agricultural techniques adapted to high-altitude farming. The Vorthakians developed sophisticated terraced farming systems and were among the first to use windmills for grain processing in mountainous terrain. Their capital, Vysokograd, was built into a natural mountain fortress, with buildings carved directly into cliff faces and connected by a network of tunnels and bridges spanning deep gorges. The kingdom's wealth came from controlling silver mines and taxing merchant caravans traveling the treacherous mountain routes. They developed a unique feudal system where land ownership was tied to military engineering duties - maintaining the complex network of mountain roads, bridges, and fortifications. The Vorthakians were renowned for their heavy cavalry and siege warfare expertise. The kingdom fell to Ottoman expansion in 1389, but their mountain fortresses held out for decades. Archaeological evidence of their sophisticated hydraulic systems and cliff-carved architecture can still be found throughout the region.",
          imagePrompt: "Medieval mountain kingdom with cliff-carved stone buildings, terraced hillside farms, mountain fortress city built into rocky peaks, stone bridges spanning gorges, windmills on mountain ridges, realistic medieval architecture, Carpathian mountain setting"
        },
        {
          name: "The Riverine Confederation of Potamia",
          backstory: "Flourishing along the fertile river deltas of what is now the Danube region from 892-1241 CE, the Potamian Confederation was a unique alliance of river-trading city-states that controlled inland waterway commerce across Eastern Europe. Founded when flooding displaced several Slavic settlements, forcing them to adapt to a semi-aquatic lifestyle. The Potamians became master hydraulic engineers, developing sophisticated systems of canals, locks, and floating markets that could adapt to seasonal flood cycles. Their settlements were built on artificial islands and stilted platforms, connected by an intricate network of waterways and floating bridges. The confederation's wealth came from controlling river trade between the Black Sea and Central Europe, particularly in furs, honey, amber, and grain. They developed innovative boat designs including shallow-draft vessels that could navigate both rivers and coastal waters. Their governance system, the 'Assembly of Currents,' made decisions based on the seasonal migration patterns of their floating population. The Potamians were skilled diplomats, maintaining neutrality between competing empires through strategic marriages and trade agreements. The confederation dissolved during the Mongol invasions when their river-based defenses proved inadequate against land-based cavalry. Remnants of their canal systems and artificial islands can still be traced in modern river surveys.",
          imagePrompt: "Medieval river confederation with stilted wooden buildings over water, floating markets, canal networks, artificial islands connected by bridges, shallow-draft river boats, realistic medieval waterway settlement, Eastern European river delta setting"
        },
        {
          name: "The Desert Sultanate of Qadesh",
          backstory: "Dominating the trans-Saharan trade routes from 1034-1312 CE, the Sultanate of Qadesh controlled a vast network of oasis cities stretching across what is now the central Sahara. Founded by the Berber chieftain Amellal ibn Tafrawt, who united nomadic tribes through innovative water management and caravan protection services. The Qadeshis developed revolutionary techniques for desert agriculture, creating underground irrigation systems that could sustain large populations in seemingly barren landscapes. Their capital, Bir al-Muluk, was built around a massive natural spring and became the most important stop on caravan routes between North and West Africa. The sultanate's wealth came from taxing gold, salt, and slave caravans, while also controlling the trade in rare desert minerals and medicinal plants. They established a sophisticated postal system using trained desert hawks and maintained detailed maps of seasonal water sources across thousands of miles of desert. The Qadeshi military consisted of elite camel cavalry and specialized desert scouts who could navigate by stars and wind patterns. Their society was organized around the 'Circle of Wells' - a council representing different oasis communities. The sultanate declined due to Portuguese coastal trade routes that bypassed the desert, and was finally absorbed by the Mali Empire in 1312.",
          imagePrompt: "Ancient desert sultanate with sandstone architecture, oasis city with palm trees, camel caravans, underground irrigation channels, desert fortress walls, realistic Middle Eastern architecture, Saharan setting with sand dunes"
        },
        {
          name: "The Steppe Khanate of Altyngol",
          backstory: "Ruling the vast grasslands between the Caspian Sea and Lake Baikal from 1187-1368 CE, the Altyngol Khanate was a nomadic empire that perfected the art of mobile governance across the Eurasian steppes. Founded by Khan Boroldai the Far-Rider, who united scattered Turkic and Mongolic tribes through a revolutionary system of seasonal assemblies and shared grazing rights. The Altyngols developed sophisticated techniques for managing massive herds across thousands of miles, including portable corrals and mobile veterinary practices. Their 'capital' was actually a moving city of elaborate yurts that could house 50,000 people and relocate entirely within three days. The khanate's wealth came from controlling the northern silk road routes and breeding superior warhorses that were prized from China to Europe. They established a complex system of message relay stations using trained eagles and maintained detailed oral histories of weather patterns and grazing cycles spanning centuries. The Altyngol military was renowned for their mounted archery and siege tactics adapted for steppe warfare. Their society was organized around the 'Great Circle' - seasonal gatherings where tribal representatives made decisions for the coming year. The khanate fragmented during the rise of the Golden Horde, with various tribes scattering across Central Asia.",
          imagePrompt: "Nomadic steppe empire with elaborate yurts, mounted warriors on horseback, vast grassland plains, portable structures, horse herds, realistic Central Asian steppe setting, traditional nomadic architecture"
        },
        {
          name: "The Forest Republic of Sylvandria",
          backstory: "Established in the dense woodlands of what is now southern Germany and eastern France from 1098-1347 CE, the Republic of Sylvandria was a unique confederation of forest communities that developed sustainable woodland management centuries ahead of their time. Founded when Benedictine monks fleeing Viking raids joined with local Germanic tribes to create protected forest settlements. The Sylvandrians developed revolutionary forestry techniques, including selective logging, controlled burning, and the cultivation of specific tree species for different purposes. Their settlements were built entirely from wood using advanced joinery techniques that required no nails or metal fasteners. The republic's wealth came from trading high-quality timber, medicinal herbs, and trained hunting birds throughout medieval Europe. They established the first known forest conservation laws and maintained detailed records of wildlife populations and seasonal patterns. Their governance system, the 'Council of Groves,' rotated leadership among different forest communities based on ecological expertise. The Sylvandrian military consisted of expert archers and forest scouts who could move unseen through any woodland terrain. Their society was organized around sustainable principles, with strict quotas on resource extraction and mandatory reforestation. The republic declined during the Black Death when trade networks collapsed, and was finally absorbed by expanding German principalities in 1347.",
          imagePrompt: "Medieval forest republic with wooden architecture built among tall trees, sustainable forestry practices, tree-house settlements, wooden bridges between trees, forest paths, realistic medieval woodland setting, Germanic forest environment"
        },
        {
          name: "The Island Principality of Thalassinia",
          backstory: "Flourishing in the Aegean Sea from 1204-1453 CE, the Principality of Thalassinia was a maritime trading state that controlled a strategic archipelago between the Byzantine Empire and Venetian territories. Founded by the Crusader knight Geoffroy de Montfort, who was granted the islands after the Fourth Crusade and married into the local Greek nobility. The Thalassinians developed a unique hybrid culture blending Western feudalism with Byzantine administrative practices and local maritime traditions. Their economy was built on controlling sea routes, providing safe harbor for merchant vessels, and producing high-quality sea salt and dried fish. The principality's capital, Portus Regalis, featured innovative harbor engineering including artificial breakwaters and a sophisticated lighthouse system. They maintained neutrality between competing powers through skilled diplomacy and strategic marriages, while their small but elite navy protected merchant convoys from pirates. The Thalassinian government operated as a constitutional monarchy with power shared between the Prince, a council of island representatives, and the merchant guilds. Their society was remarkably cosmopolitan, with Greek, Latin, and Arabic all serving as official languages. The principality fell to Ottoman expansion in 1453, but many noble families fled to Venice, taking their maritime expertise with them.",
          imagePrompt: "Medieval island principality with stone harbor fortifications, lighthouse, merchant ships in protected harbor, terraced hillside town, Byzantine-influenced architecture, realistic Mediterranean island setting"
        },
        {
          name: "The Merchant Republic of Aureliopolis",
          backstory: "Dominating Black Sea trade from 1261-1475 CE, the Republic of Aureliopolis was a wealthy city-state built on the ruins of an ancient Greek colony in what is now coastal Bulgaria. Founded by a consortium of Genoese merchants and Byzantine refugees after the recapture of Constantinople, who established a new commercial hub to compete with Venetian dominance. The Aurelians developed innovative banking practices, including the first known system of international letters of credit and maritime insurance policies. Their city was renowned for its massive commercial harbor, capable of accommodating over 200 ships simultaneously, and its sophisticated warehouse district with climate-controlled storage for different types of goods. The republic's wealth came from facilitating trade between Europe, Asia, and the Middle East, while also controlling local production of grain, wine, and precious metals from nearby mines. Their government was a plutocratic republic where voting rights were tied to commercial investment, and the Doge was elected from among the wealthiest merchant families. The Aurelian navy consisted of heavily armed merchant galleys that could defend trade convoys while carrying cargo. Their society was highly cosmopolitan, with quarters for Greek, Italian, Armenian, and Jewish merchants. The republic fell to Ottoman expansion in 1475, but many merchant families relocated to establish trading houses throughout Europe.",
          imagePrompt: "Medieval merchant republic with massive commercial harbor, multi-story warehouses, merchant galleys, cosmopolitan trading city, Byzantine-influenced architecture mixed with Italian elements, realistic Black Sea coastal setting"
        }
      ];

      // Add one more realistic empire to complete the set
      empires.push({
        name: "The Alpine Confederation of Montanara",
        backstory: "Controlling the crucial Alpine passes between Italy and Central Europe from 1178-1415 CE, the Confederation of Montanara was an alliance of mountain communities that developed into a sophisticated trading and military power. Founded when local communities banded together to resist both Imperial and Papal taxation, establishing their own system of collective governance. The Montanarans became master engineers, building an extensive network of mountain roads, bridges, and way-stations that made previously impassable routes accessible year-round. Their economy was built on controlling transit fees, providing guide services, and trading in high-altitude products like cheese, wool, and medicinal alpine herbs. The confederation's capital, Altavilla, was carved into a mountain face and featured innovative engineering including heated underground passages and sophisticated water management systems. They maintained independence through a combination of military prowess - their crossbow militia were legendary - and diplomatic skill, playing competing powers against each other. The Montanaran government operated as a direct democracy with representatives from each valley community meeting seasonally to make collective decisions. Their society valued self-reliance and mutual aid, with elaborate systems for sharing resources during harsh winters. The confederation was gradually absorbed by the expanding Swiss Confederacy in 1415, but their engineering techniques influenced Alpine construction for centuries.",
        imagePrompt: "Medieval Alpine confederation with mountain fortress towns, stone bridges spanning gorges, terraced mountain agriculture, crossbow militia, realistic Alpine architecture, snow-capped peaks, mountain pass settlements"
      });

      const selectedEmpire = empires[Math.floor(Math.random() * empires.length)];

      // Generate the image
      const imageResponse = await axios.post(
        'http://localhost:3001/api/segmind/nano-banana',
        {
          prompt: selectedEmpire.imagePrompt,
          negative_prompt: 'blurry, low quality, boring, generic, modern city, realistic photography, plain, simple, small scale',
          aspect_ratio: '16:9'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          responseType: 'blob',
          timeout: 120000
        }
      );

      const imageBlob = imageResponse.data;
      const imageUrl = URL.createObjectURL(imageBlob);

      return {
        name: selectedEmpire.name,
        backstory: selectedEmpire.backstory,
        image: {
          url: imageUrl,
          prompt: selectedEmpire.imagePrompt
        }
      };

    } catch (error) {
      console.error('Error generating fictional empire content:', error);
      setError('Failed to generate fictional empire. Please try again.');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateFictionalEmpireContent,
    isGenerating,
    error
  };
};

export default useFictionalEmpireContent;
