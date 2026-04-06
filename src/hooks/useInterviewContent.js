import { useState, useCallback } from 'react';
import { interviewQuestions, emperorPersonality, worldContext3125 } from '../data/interviewData';

const useInterviewContent = () => {
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [error, setError] = useState(null);

  const generateInterviewContent = useCallback(async () => {
    setIsGeneratingContent(true);
    setError(null);

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    try {
      console.log('📝 Generating interview dialogue...');
      
      // Select 2-3 random questions for a 30-second interview
      const selectedQuestions = interviewQuestions
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

      const systemPrompt = `You are creating dialogue for a 30-second futuristic news interview in the year 3125. 

SETTING: Professional news interview between a journalist and Emperor Tiberius Charlie Buchanan of the Greater Americas.

EMPEROR PERSONALITY: ${JSON.stringify(emperorPersonality)}

WORLD CONTEXT: ${JSON.stringify(worldContext3125)}

Create a natural, engaging 30-second interview dialogue with:
1. Brief professional introduction by interviewer
2. 1-2 key questions with thoughtful imperial responses
3. Professional closing

Keep responses concise but impactful. The Emperor should sound dignified, forward-thinking, and slightly formal but approachable. Include subtle references to futuristic technology and the unique challenges of 3125.

Format as:
INTERVIEWER: [dialogue]
EMPEROR: [dialogue]
INTERVIEWER: [dialogue]
EMPEROR: [dialogue]

Total length should be exactly 30 seconds when spoken (approximately 75-90 words total).`;

      const userPrompt = `Create interview dialogue covering these topics:
${selectedQuestions.map(q => `- ${q.topic}: ${q.question}`).join('\n')}

Make it feel authentic and engaging for a 30-second news segment.`;

      if (!apiKey || apiKey === 'your_openai_api_key_here') {
        // Fallback content if no API key
        const fallbackContent = generateFallbackContent(selectedQuestions);
        setIsGeneratingContent(false);
        return fallbackContent;
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 200,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const dialogue = data.choices[0]?.message?.content || generateFallbackContent(selectedQuestions);

      const interviewContent = {
        id: `interview_${Date.now()}`,
        dialogue: dialogue,
        questions: selectedQuestions,
        timestamp: new Date(),
        duration: 30,
        wordCount: dialogue.split(' ').length
      };

      console.log('✅ Interview content generated successfully');
      setIsGeneratingContent(false);
      return interviewContent;

    } catch (error) {
      console.error('❌ Interview content generation failed:', error);
      setError(`Content generation failed: ${error.message}`);
      
      // Fallback to pre-written content
      const fallbackContent = generateFallbackContent(
        interviewQuestions.slice(0, 2)
      );
      
      setIsGeneratingContent(false);
      return fallbackContent;
    }
  }, []);

  const generateFallbackContent = (questions) => {
    const fallbackDialogues = [
      {
        dialogue: `INTERVIEWER: Your Excellency, how is the Greater Americas handling the Martian refugee crisis?

EMPEROR: Alexandra, we've opened our hearts and borders. These aren't refugees—they're returning citizens. Our quantum housing initiative has created 50,000 new homes using matter synthesis technology.

INTERVIEWER: What about AI voting rights?

EMPEROR: The consciousness amendment will pass. AIs have earned their place in our democracy. We're not just governing humans anymore—we're governing a new form of life.`,
        topics: ['Martian Refugee Crisis', 'AI Rights']
      },
      {
        dialogue: `INTERVIEWER: Emperor Buchanan, tensions with the Asian Federation over atmospheric sovereignty are escalating. Your response?

EMPEROR: Weather is not property, Alexandra. Our atmospheric modifications benefit the entire planet. We're willing to share our climate technology through the Global Weather Accord.

INTERVIEWER: Critics say memory trading is destroying family bonds.

EMPEROR: Innovation always challenges tradition. But when a grandmother can share her wedding day with her granddaughter, that's not destruction—that's immortality.`,
        topics: ['Asian Federation Relations', 'Memory Copyright']
      }
    ];

    const selectedDialogue = fallbackDialogues[Math.floor(Math.random() * fallbackDialogues.length)];
    
    return {
      id: `fallback_interview_${Date.now()}`,
      dialogue: selectedDialogue.dialogue,
      questions: questions,
      timestamp: new Date(),
      duration: 30,
      wordCount: selectedDialogue.dialogue.split(' ').length,
      isFallback: true
    };
  };

  const generateAudioScript = useCallback((interviewContent) => {
    // Convert dialogue to audio-friendly script with timing
    const lines = interviewContent.dialogue.split('\n').filter(line => line.trim());
    
    const audioScript = lines.map((line, index) => {
      const speaker = line.startsWith('INTERVIEWER:') ? 'interviewer' : 'emperor';
      const text = line.replace(/^(INTERVIEWER:|EMPEROR:)\s*/, '');
      const startTime = index * 3; // Rough timing - 3 seconds per exchange
      
      return {
        speaker,
        text,
        startTime,
        duration: 3
      };
    });

    return {
      id: `audio_script_${Date.now()}`,
      script: audioScript,
      totalDuration: 30,
      timestamp: new Date()
    };
  }, []);

  return {
    generateInterviewContent,
    generateAudioScript,
    isGeneratingContent,
    error
  };
};

export default useInterviewContent;
