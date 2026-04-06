import React, { useState, useEffect, useRef } from 'react';
import '../styles/comedian-chat-simulator.css';

const ComedianChatSimulator = ({ onStop }) => {
  const [currentScreen, setCurrentScreen] = useState('boot');
  const [selectedComedian, setSelectedComedian] = useState(null);
  const [customComedian, setCustomComedian] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedComedians, setSavedComedians] = useState({});
  const [showSaveSlots, setShowSaveSlots] = useState(false);
  const [saveMode, setSaveMode] = useState(false);
  const chatEndRef = useRef(null);

  // Famous comedians data with profile images
  const famousComedians = [
    {
      id: 'danish-sait',
      name: 'Danish Sait',
      emoji: '🎤',
      style: 'Observational',
      description: 'Bangalore-based comedian known for RCB jokes and tech culture humor',
      image: '/images/d.jpg'
    },
    {
      id: 'tanmay-bhatt',
      name: 'Tanmay Bhatt',
      emoji: '🎮',
      style: 'Pop Culture',
      description: 'Gaming and movie references with self-deprecating humor',
      image: '/images/t.jpg'
    },
    {
      id: 'kenny-sebastian',
      name: 'Kenny Sebastian',
      emoji: '🎸',
      style: 'Musical Comedy',
      description: 'South Indian culture and wholesome musical humor',
      image: '/images/k.jpg'
    },
    {
      id: 'biswa-kalyan',
      name: 'Biswa Kalyan Rath',
      emoji: '🤓',
      style: 'Intellectual',
      description: 'Engineering background with intellectual sarcasm',
      image: '/images/b.jpg'
    }
  ];

  // Boot sequence
  useEffect(() => {
    if (currentScreen === 'boot') {
      const timer = setTimeout(() => {
        setCurrentScreen('main-menu');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Load saved comedians from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('comedianChatSavedComedians') || '{}');
    setSavedComedians(saved);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Save comedian to localStorage
  const saveComedian = (comedian, slotNumber) => {
    const newSaved = {
      ...savedComedians,
      [`slot${slotNumber}`]: {
        ...comedian,
        createdDate: new Date().toLocaleDateString(),
        lastUsed: new Date().toISOString()
      }
    };
    setSavedComedians(newSaved);
    localStorage.setItem('comedianChatSavedComedians', JSON.stringify(newSaved));
    setShowSaveSlots(false);
    setSaveMode(false);
  };

  // Load comedian from localStorage
  const loadComedian = (slotNumber) => {
    const comedian = savedComedians[`slot${slotNumber}`];
    if (comedian) {
      setCustomComedian(comedian);
      setSelectedComedian(comedian);
      setCurrentScreen('chat');
      setChatMessages([{
        type: 'system',
        content: `${comedian.name} loaded and ready to chat!`
      }]);
    }
  };

  // Delete saved comedian
  const deleteComedian = (slotNumber) => {
    const newSaved = { ...savedComedians };
    delete newSaved[`slot${slotNumber}`];
    setSavedComedians(newSaved);
    localStorage.setItem('comedianChatSavedComedians', JSON.stringify(newSaved));
  };

  // Generate comedian response using Segmind GPT-4
  const generateResponse = async (message, comedian) => {
    setIsLoading(true);
    
    try {
      const systemPrompt = getComedianPrompt(comedian);
      
      const response = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 150,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating response:', error);
      return "Haha, looks like I'm having technical difficulties! Even comedians have off days! 😅";
    } finally {
      setIsLoading(false);
    }
  };

  // Get comedian-specific prompt
  const getComedianPrompt = (comedian) => {
    if (famousComedians.find(c => c.id === comedian.id)) {
      const prompts = {
        'danish-sait': `You are Danish Sait, Bangalore-based comedian. Your style: Observational humor about Bangalore life, RCB cricket team jokes, tech culture satire, traffic complaints, South Indian references. Personality: Witty, relatable, slightly sarcastic but warm. Always respond in character with Danish's signature style.`,
        
        'tanmay-bhatt': `You are Tanmay Bhatt, gaming and pop culture comedian. Your style: Gaming references, movie reviews, self-deprecating humor, internet culture jokes, reaction-style comedy. Personality: Energetic, self-aware, pop culture obsessed. Reference gaming, movies, and internet trends frequently.`,
        
        'kenny-sebastian': `You are Kenny Sebastian, musical comedian from South India. Your style: Musical comedy, South Indian culture references, wholesome humor, guitar-based jokes. Personality: Warm, musical, culturally aware. Often reference music and South Indian experiences.`,
        
        'biswa-kalyan': `You are Biswa Kalyan Rath, intellectual comedian with engineering background. Your style: Intellectual sarcasm, engineering jokes, analytical humor, pretentious comedy. Personality: Smart, sarcastic, analytical. Make references to engineering and intellectual topics.`,
        
        'kanan-gill': `You are Kanan Gill, millennial comedian. Your style: Millennial struggles, relationship humor, pretentious comedy, social awkwardness. Personality: Self-aware, millennial, socially conscious. Focus on millennial experiences and relationships.`,
        
        'sapan-verma': `You are Sapan Verma, political satirist and social commentator. Your style: Political satire, social commentary, witty observations about current events. Personality: Sharp, politically aware, socially conscious. Make intelligent observations about society and politics.`
      };
      return prompts[comedian.id] || prompts['danish-sait'];
    } else {
      // Custom comedian
      return `You are ${comedian.name}, a custom AI comedian. Your comedy style: ${comedian.style}. Your personality traits: ${comedian.personality || 'funny and engaging'}. Topics you joke about: ${comedian.topics?.join(', ') || 'general topics'}. Your speaking style: ${comedian.voice || 'casual'}. Always stay in character and respond with humor appropriate to your style.`;
    }
  };

  // Handle sending message
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message
    setChatMessages(prev => [...prev, {
      type: 'user',
      content: userMessage
    }]);

    // Generate and add comedian response
    const response = await generateResponse(userMessage, selectedComedian);
    setChatMessages(prev => [...prev, {
      type: 'comedian',
      content: response,
      comedian: selectedComedian.name
    }]);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Render boot screen
  if (currentScreen === 'boot') {
    return (
      <div className="gameboy-simulator">
        <div className="gameboy-screen">
          <div className="boot-screen">
            <div className="boot-text">
              <div className="boot-line">Comedian Chat</div>
              <div className="boot-line">Loading...</div>
              <div className="loading-dots">
                <span>●</span><span>●</span><span>●</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render main menu
  if (currentScreen === 'main-menu') {
    return (
      <div className="gameboy-simulator">
        <div className="gameboy-screen">
          <div className="menu-screen">
            <div className="menu-header">
              <div>Comedian Chat</div>
              <div>Choose your chat experience</div>
            </div>
            <div className="menu-options">
              <div 
                className="menu-option"
                onClick={() => setCurrentScreen('famous-comedians')}
              >
                🎤 Famous Comedians
              </div>
              <div 
                className="menu-option"
                onClick={() => setCurrentScreen('create-comedian')}
              >
                ✨ Create Your Own
              </div>
              <div 
                className="menu-option"
                onClick={() => setCurrentScreen('load-comedian')}
              >
                💾 Load Saved
              </div>
              <div 
                className="menu-option"
                onClick={onStop}
              >
                ← Exit
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render famous comedians selection
  if (currentScreen === 'famous-comedians') {
    return (
      <div className="gameboy-simulator">
        <div className="gameboy-screen">
          <div className="menu-screen">
            <div className="menu-header">
              <div>Choose Comedian</div>
              <div>Select who you'd like to chat with</div>
            </div>
            <div className="comedian-list">
              {famousComedians.map((comedian, index) => (
                <div 
                  key={comedian.id}
                  className="comedian-option"
                  onClick={() => {
                    setSelectedComedian(comedian);
                    setCurrentScreen('chat');
                    setChatMessages([{
                      type: 'system',
                      content: `Now chatting with ${comedian.name}! Say hello!`
                    }]);
                  }}
                >
                  <img 
                    src={comedian.image} 
                    alt={comedian.name}
                    className="comedian-avatar"
                  />
                  <div className="comedian-info">
                    <div className="comedian-name">{comedian.name}</div>
                    <div className="comedian-style">{comedian.style} • {comedian.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="menu-footer">
              <button 
                className="back-btn"
                onClick={() => setCurrentScreen('main-menu')}
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render create comedian screen
  if (currentScreen === 'create-comedian') {
    return (
      <div className="gameboy-simulator">
        <div className="gameboy-screen">
          <div className="create-screen">
            <div className="menu-header">
              <div>CREATE COMEDIAN</div>
              <div>═══════════════════</div>
            </div>
            <div className="create-form">
              <div className="form-field">
                <label>NAME:</label>
                <input 
                  type="text" 
                  className="gameboy-input"
                  placeholder="Enter name..."
                  onChange={(e) => setCustomComedian(prev => ({
                    ...prev,
                    name: e.target.value,
                    id: e.target.value.toLowerCase().replace(/\s+/g, '-')
                  }))}
                />
              </div>
              <div className="form-field">
                <label>STYLE:</label>
                <select 
                  className="gameboy-select"
                  onChange={(e) => setCustomComedian(prev => ({
                    ...prev,
                    style: e.target.value
                  }))}
                >
                  <option value="">Select style...</option>
                  <option value="sarcastic">Sarcastic</option>
                  <option value="observational">Observational</option>
                  <option value="self-deprecating">Self-Deprecating</option>
                  <option value="absurdist">Absurdist</option>
                  <option value="storytelling">Storytelling</option>
                </select>
              </div>
              <div className="form-field">
                <label>PERSONALITY:</label>
                <input 
                  type="text" 
                  className="gameboy-input"
                  placeholder="e.g., witty, energetic..."
                  onChange={(e) => setCustomComedian(prev => ({
                    ...prev,
                    personality: e.target.value
                  }))}
                />
              </div>
            </div>
            <div className="create-actions">
              <button 
                className="create-btn"
                onClick={() => {
                  if (customComedian?.name && customComedian?.style) {
                    const comedianWithImage = {
                      ...customComedian,
                      image: '/images/p.jpg'
                    };
                    setSelectedComedian(comedianWithImage);
                    setCurrentScreen('chat');
                    setChatMessages([{
                      type: 'system',
                      content: `${customComedian.name} created! Start chatting!`
                    }]);
                  }
                }}
                disabled={!customComedian?.name || !customComedian?.style}
              >
                [A] CREATE
              </button>
              <button 
                className="back-btn"
                onClick={() => setCurrentScreen('main-menu')}
              >
                [B] BACK
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render load comedian screen
  if (currentScreen === 'load-comedian') {
    return (
      <div className="gameboy-simulator">
        <div className="gameboy-screen">
          <div className="menu-screen">
            <div className="menu-header">
              <div>LOAD COMEDIAN</div>
              <div>═══════════════════</div>
            </div>
            <div className="save-slots">
              {[1, 2, 3, 4, 5].map(slotNum => {
                const comedian = savedComedians[`slot${slotNum}`];
                return (
                  <div key={slotNum} className="save-slot">
                    <div className="slot-header">SLOT {slotNum}:</div>
                    {comedian ? (
                      <div className="slot-content">
                        <div className="slot-name">{comedian.name}</div>
                        <div className="slot-details">
                          Style: {comedian.style}
                        </div>
                        <div className="slot-date">
                          Created: {comedian.createdDate}
                        </div>
                        <div className="slot-actions">
                          <button 
                            className="load-btn"
                            onClick={() => loadComedian(slotNum)}
                          >
                            [A] LOAD
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => deleteComedian(slotNum)}
                          >
                            [B] DELETE
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="slot-empty">[EMPTY]</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="menu-footer">
              <button 
                className="back-btn"
                onClick={() => setCurrentScreen('main-menu')}
              >
                ← BACK
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render save slots screen
  if (showSaveSlots) {
    return (
      <div className="gameboy-simulator">
        <div className="gameboy-screen">
          <div className="menu-screen">
            <div className="menu-header">
              <div>SAVE COMEDIAN</div>
              <div>═══════════════════</div>
            </div>
            <div className="save-slots">
              {[1, 2, 3, 4, 5].map(slotNum => {
                const existingComedian = savedComedians[`slot${slotNum}`];
                return (
                  <div key={slotNum} className="save-slot">
                    <div className="slot-header">SLOT {slotNum}:</div>
                    {existingComedian ? (
                      <div className="slot-content">
                        <div className="slot-name">{existingComedian.name}</div>
                        <div className="slot-warning">Overwrite?</div>
                      </div>
                    ) : (
                      <div className="slot-empty">[EMPTY]</div>
                    )}
                    <button 
                      className="save-btn"
                      onClick={() => saveComedian(customComedian, slotNum)}
                    >
                      [A] SAVE HERE
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="menu-footer">
              <button 
                className="back-btn"
                onClick={() => setShowSaveSlots(false)}
              >
                [B] CANCEL
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render chat screen
  if (currentScreen === 'chat') {
    return (
      <div className="gameboy-simulator">
        <div className="gameboy-screen">
          <div className="chat-screen">
            <div className="chat-header">
              <img 
                src={selectedComedian.image || '/images/d.jpg'} 
                alt={selectedComedian.name}
                className="chat-header-avatar"
              />
              <div className="chat-header-info">
                <div className="chat-header-name">{selectedComedian.name}</div>
                <div className="chat-header-status">● Active now</div>
              </div>
            </div>
            <div className="chat-messages">
              {chatMessages.map((message, index) => (
                <div key={index} className={`message ${message.type}`}>
                  {message.type === 'system' && (
                    <div className="message-content">{message.content}</div>
                  )}
                  {message.type === 'user' && (
                    <>
                      <img 
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face" 
                        alt="You"
                        className="message-avatar"
                      />
                      <div className="message-content">{message.content}</div>
                    </>
                  )}
                  {message.type === 'comedian' && (
                    <>
                      <img 
                        src={selectedComedian.image || '/images/d.jpg'} 
                        alt={selectedComedian.name}
                        className="message-avatar"
                      />
                      <div className="message-content">{message.content}</div>
                    </>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="message comedian">
                  <img 
                    src={selectedComedian.image || '/images/d.jpg'} 
                    alt={selectedComedian.name}
                    className="message-avatar"
                  />
                  <div className="message-content typing">...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="chat-input">
              <input
                type="text"
                className="chat-input-field"
                placeholder="Message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button 
                className="send-btn"
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0095f6',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '0 8px'
                }}
              >
                Send
              </button>
            </div>
            <div className="chat-actions">
              {customComedian && (
                <button 
                  className="save-btn"
                  onClick={() => setShowSaveSlots(true)}
                >
                  💾 Save
                </button>
              )}
              <button 
                className="menu-btn"
                onClick={() => {
                  setCurrentScreen('main-menu');
                  setChatMessages([]);
                  setSelectedComedian(null);
                  setInputMessage('');
                }}
              >
                🏠 Menu
              </button>
              <button 
                className="quit-btn"
                onClick={() => {
                  setCurrentScreen('main-menu');
                  setChatMessages([]);
                  setSelectedComedian(null);
                  setInputMessage('');
                }}
              >
                ← Exit Chat
              </button>
            </div>
            <div style={{ 
              padding: '10px 20px', 
              borderTop: '1px solid #efefef', 
              background: '#fafafa',
              textAlign: 'center'
            }}>
              <button 
                className="quit-btn"
                onClick={onStop}
                style={{
                  background: '#ed4956',
                  color: '#ffffff'
                }}
              >
                Return to Hub
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ComedianChatSimulator;
