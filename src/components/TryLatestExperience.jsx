import React, { useState } from 'react';
import { getLatestExperience } from '../data/experiences';
import { getExperienceHook, hasContentHook } from '../hooks/useExperienceContentHooks';
import '../styles/discover-the-vision-slideshow.css';

const TryLatestExperience = ({ onNavigateToHub }) => {
  const [experienceContent, setExperienceContent] = useState('');
  const [isEnteringExperience, setIsEnteringExperience] = useState(false);
  const latestExperience = getLatestExperience();
  
  // Call hooks at component level, not inside functions
  const ExperienceHook = getExperienceHook(latestExperience?.id);
  const hookResult = ExperienceHook ? ExperienceHook() : null;
  
  // Use hook's state if available, otherwise use local state
  const isGenerating = hookResult?.isGenerating || false;
  const error = hookResult?.error || null;

  const generateExperience = async () => {
    try {
      console.log('Generating experience for:', latestExperience.id);
      console.log('Has content hook:', hasContentHook(latestExperience.id));
      console.log('Hook result:', hookResult);
      
      if (hasContentHook(latestExperience.id) && hookResult) {
        // Use real API for experiences that have hooks
        const generateFunctionName = Object.keys(hookResult).find(key => 
          key.startsWith('generate') && typeof hookResult[key] === 'function'
        );
        
        console.log('Found generate function:', generateFunctionName);
        
        if (generateFunctionName) {
          console.log('Calling generate function...');
          const content = await hookResult[generateFunctionName]();
          console.log('Generated content:', content);
          setExperienceContent(content);
        } else {
          console.log('No generate function found, available functions:', Object.keys(hookResult));
        }
      } else {
        console.log('Using fallback content generation');
        // Fallback for experiences without hooks
        if (latestExperience.contentType === 'Interactive Simulation') {
          setExperienceContent(
            <div style={{textAlign: 'center'}}>
              <h3 style={{color: '#00c851', marginBottom: '20px'}}>🎮 Interactive Experience Ready!</h3>
              <p style={{marginBottom: '20px', lineHeight: '1.6'}}>
                {latestExperience.description}
              </p>
              <div style={{
                background: 'rgba(0, 200, 81, 0.1)',
                border: '1px solid rgba(0, 200, 81, 0.3)',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                <p style={{margin: '0', fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.9)'}}>
                  "{latestExperience.example}"
                </p>
              </div>
              <p style={{color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem'}}>
                Click "Enter Experience" below to start your interactive journey!
              </p>
            </div>
          );
        } else {
          setExperienceContent(`Generated content for ${latestExperience.title}: ${latestExperience.example}`);
        }
      }
    } catch (err) {
      console.error('Generation failed:', err);
      setExperienceContent(`Error: ${err.message}`);
    }
  };

  const generateAgain = async () => {
    setExperienceContent('');
    await generateExperience();
  };

  if (!latestExperience) {
    return null;
  }

  return (
    <div className="slideshow-container">
      <div className="slide-content" style={{maxHeight: '1000px', overflow: 'auto', scrollbarWidth: 'thin'}}>
        <div className="slide">
          {!experienceContent && !isGenerating && (
            <div className="slide-generate">
              <h1>Try out the latest creation</h1>
              <div className="generate-description" style={{textAlign: 'center'}}>
                {latestExperience.icon} {latestExperience.title.includes(' - New and Improved') ? 
                  <>
                    {latestExperience.title.replace(' - New and Improved', '')}<br/>
                    <span style={{display: 'block', marginTop: '5px'}}>New and Improved</span>
                  </> : 
                  latestExperience.title
                }
              </div>
              <p style={{color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '80px', maxWidth: '600px'}}>
                {latestExperience.description}
              </p>
              <button 
                className="generate-btn"
                onClick={generateExperience}
              >
                Try it now
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="slide-generate">
              <h1>Generating {latestExperience.title}...</h1>
              <div className="slide-loading">
                <div className="creativity-spinner"></div>
                <p>Creating your {latestExperience.contentType.toLowerCase()} experience...</p>
              </div>
            </div>
          )}

          {experienceContent && (
            <div className="slide-generate">
              <h1 style={{textAlign: 'center'}}>✨ {latestExperience.title.includes(' - New and Improved') ? 
                <>
                  {latestExperience.title.replace(' - New and Improved', '')}<br/>
                  <span style={{display: 'block', marginTop: '5px', fontSize: '0.8em'}}>New and Improved</span>
                </> : 
                latestExperience.title
              }</h1>
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '15px',
                padding: '20px',
                margin: '30px auto -30px auto',
                maxWidth: '600px',
                color: '#e2e8f0',
                lineHeight: '1.6',
                fontSize: '1rem'
              }}>
                {experienceContent && typeof experienceContent === 'object' && experienceContent.video ? (
                  <div style={{textAlign: 'center'}}>
                    <p style={{marginBottom: '15px'}}>{experienceContent.text || experienceContent.sceneDescription || experienceContent.description}</p>
                    <video 
                      src={experienceContent.video.url} 
                      controls 
                      loop 
                      muted
                      style={{width: '100%', maxWidth: '400px', borderRadius: '10px'}}
                    />
                  </div>
                ) : experienceContent && typeof experienceContent === 'object' && experienceContent.image ? (
                  <div>
                    {/* Handle Graveyard Chronicles Text + Image format */}
                    {experienceContent.name && experienceContent.lifeStory ? (
                      <div>
                        <div style={{marginBottom: '20px', textAlign: 'center'}}>
                          <h3 style={{color: '#d4af37', margin: '0 0 5px 0'}}>{experienceContent.name}</h3>
                          <div style={{color: 'rgba(255, 255, 255, 0.8)', marginBottom: '10px'}}>
                            {experienceContent.birthYear} - {experienceContent.deathYear}
                          </div>
                          {experienceContent.epitaph && (
                            <div style={{fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '15px'}}>
                              "{experienceContent.epitaph}"
                            </div>
                          )}
                        </div>
                        <p style={{marginBottom: '20px', lineHeight: '1.6'}}>{experienceContent.lifeStory}</p>
                        <img 
                          src={experienceContent.image.url} 
                          alt={experienceContent.image.description}
                          style={{width: '100%', maxWidth: '400px', borderRadius: '10px'}}
                        />
                      </div>
                    ) : experienceContent.scenario && experienceContent.teacherType ? (
                      <div>
                        <div style={{marginBottom: '20px', textAlign: 'center'}}>
                          <h3 style={{color: '#ff9a56', margin: '0 0 10px 0'}}>{experienceContent.teacherType}</h3>
                        </div>
                        <p style={{marginBottom: '20px', lineHeight: '1.6', textAlign: 'left'}}>{experienceContent.scenario}</p>
                        <img 
                          src={experienceContent.image.url} 
                          alt={experienceContent.image.description}
                          style={{width: '100%', maxWidth: '400px', borderRadius: '10px'}}
                        />
                      </div>
                    ) : experienceContent.story && experienceContent.image ? (
                      <div>
                        <div style={{marginBottom: '20px', textAlign: 'center'}}>
                          {experienceContent.title && (
                            <h3 style={{color: '#ff6b35', margin: '0 0 5px 0'}}>{experienceContent.title}</h3>
                          )}
                          {experienceContent.era && (
                            <div style={{color: 'rgba(255, 255, 255, 0.8)', marginBottom: '10px'}}>
                              {experienceContent.era} - {experienceContent.location}
                            </div>
                          )}
                        </div>
                        <p style={{marginBottom: '20px', lineHeight: '1.6', textAlign: 'left'}}>{experienceContent.story}</p>
                        <img 
                          src={experienceContent.image.url} 
                          alt={experienceContent.title || 'Futuristic Siege'}
                          style={{width: '100%', maxWidth: '400px', borderRadius: '10px'}}
                        />
                      </div>
                    ) : (
                      <div>
                        <p style={{marginBottom: '15px'}}>{experienceContent.text || experienceContent.description}</p>
                        <img 
                          src={experienceContent.image.url} 
                          alt={experienceContent.text || experienceContent.description}
                          style={{width: '100%', maxWidth: '400px', borderRadius: '10px'}}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  experienceContent
                )}
              </div>
              <div style={{display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '15px'}}>
                {latestExperience.contentType === 'Interactive Simulation' ? (
                  <>
                    <button 
                      className="generate-btn"
                      onClick={() => {
                        setIsEnteringExperience(true);
                        // Add small delay to show spinner before opening
                        setTimeout(() => {
                          window.open(`/?experience=${latestExperience.id}`, '_blank');
                          setIsEnteringExperience(false);
                        }, 500);
                      }}
                      disabled={isEnteringExperience}
                      style={{fontSize: '0.9rem', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px'}}
                    >
                      {isEnteringExperience ? (
                        <>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                          Entering...
                        </>
                      ) : (
                        'Enter Experience'
                      )}
                    </button>
                    <button 
                      className="enter-hub-btn"
                      onClick={onNavigateToHub}
                      style={{fontSize: '0.9rem', padding: '12px 24px'}}
                    >
                      Check out the Experience Hub
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="regenerate-btn"
                      onClick={generateAgain}
                      style={{fontSize: '0.9rem', padding: '12px 24px'}}
                    >
                      Generate again
                    </button>
                    <button 
                      className="enter-hub-btn"
                      onClick={onNavigateToHub}
                      style={{fontSize: '0.9rem', padding: '12px 24px'}}
                    >
                      Check out the Experience Hub
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TryLatestExperience;
