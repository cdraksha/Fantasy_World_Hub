import React, { useState, useEffect } from 'react';
import useDiscoverTheVisionContent from '../hooks/useDiscoverTheVisionContent';
import '../styles/discover-the-vision-slideshow.css';

const DiscoverTheVisionSlideshow = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideContent, setSlideContent] = useState({});
  const { generateSlideContent, generateSlideImage, isGenerating, generatingSlide, error } = useDiscoverTheVisionContent();

  const slides = [
    {
      id: 'creativity',
      title: 'Imagine if AI could be as creative as a human mind',
      type: 'image'
    },
    {
      id: 'daydream',
      title: 'AI can make you daydream',
      type: 'image'
    },
    {
      id: 'stories',
      title: 'The ability to tell insane stories',
      type: 'story-card'
    },
    {
      id: 'diversity',
      title: 'Where Every Click Sparks Wonder',
      type: 'categories'
    },
    {
      id: 'welcome',
      title: 'Welcome to FantasyWorld Hub',
      type: 'cta'
    },
    {
      id: 'learn-creativity',
      title: 'Learn How to Be Creative',
      type: 'creativity-cta'
    },
    {
      id: 'create-experience',
      title: 'Create Your Own Experience',
      type: 'create-experience-cta'
    },
    {
      id: 'research-synergy',
      title: '🔬 AI & Creativity Research',
      type: 'research-synergy-cta'
    },
    {
      id: 'learn-more',
      title: 'Learn More About FantasyWorld Hub',
      type: 'learn-more-cta'
    }
  ];

  // Generate content for slides 1-3 when slideshow opens
  useEffect(() => {
    if (isOpen && Object.keys(slideContent).length === 0) {
      generateSlideContent().then(content => {
        setSlideContent(content);
      });
    }
  }, [isOpen, slideContent, generateSlideContent]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (!isOpen) return null;

  const currentSlideData = slides[currentSlide];

  return (
    <div className="slideshow-overlay">
      <div className="slideshow-container">
        {/* Close Button */}
        <button className="slideshow-close" onClick={onClose}>
          ✕
        </button>

        {/* Slide Content */}
        <div className="slide-content">
          {/* Slide 1: Creativity */}
          {currentSlideData.id === 'creativity' && (
            <div className="slide creativity-slide">
              <h1>{currentSlideData.title}</h1>
              {generatingSlide === 'creativity' ? (
                <div className="slide-loading">
                  <div className="creativity-spinner"></div>
                  <p>AI is painting a masterpiece...</p>
                </div>
              ) : slideContent.creativity?.url ? (
                <div className="slide-image-container">
                  <img 
                    src={slideContent.creativity.url} 
                    alt="AI creativity demonstration"
                    className="slide-image"
                  />
                  <div className="regenerate-container">
                    <button 
                      className="regenerate-btn"
                      onClick={async () => {
                        try {
                          const result = await generateSlideImage('creativity');
                          setSlideContent(prev => ({
                            ...prev,
                            creativity: result
                          }));
                        } catch (error) {
                          console.error('Failed to generate creativity image:', error);
                        }
                      }}
                    >
                      🔄 Create Another Masterpiece
                    </button>
                  </div>
                </div>
              ) : (
                <div className="slide-generate">
                  <p className="generate-description">✨ Witness AI paint a masterpiece before your eyes ✨</p>
                  <div className="generate-container">
                    <button 
                      className="generate-btn"
                      onClick={async () => {
                        try {
                          const result = await generateSlideImage('creativity');
                          setSlideContent(prev => ({
                            ...prev,
                            creativity: result
                          }));
                        } catch (error) {
                          console.error('Failed to generate creativity image:', error);
                        }
                      }}
                    >
                      🎨 Generate Magic
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Slide 2: AI Daydreaming */}
          {currentSlideData.id === 'daydream' && (
            <div className="slide daydream-slide">
              <h1>{currentSlideData.title}</h1>
              {generatingSlide === 'daydream' ? (
                <div className="slide-loading">
                  <div className="daydream-spinner"></div>
                  <p>Crafting a dreamy fantasy world...</p>
                </div>
              ) : slideContent.daydream?.url ? (
                <div className="slide-image-container">
                  <img 
                    src={slideContent.daydream.url} 
                    alt="AI daydream fantasy"
                    className="slide-image"
                  />
                  <div className="regenerate-container">
                    <button 
                      className="regenerate-btn"
                      onClick={async () => {
                        try {
                          const result = await generateSlideImage('daydream');
                          setSlideContent(prev => ({
                            ...prev,
                            daydream: result
                          }));
                        } catch (error) {
                          console.error('Failed to generate daydream image:', error);
                        }
                      }}
                    >
                      🌟 Dream Again
                    </button>
                  </div>
                </div>
              ) : (
                <div className="slide-generate">
                  <p className="generate-description">🌙 Step into a world beyond imagination 🌙</p>
                  <div className="generate-container">
                    <button 
                      className="generate-btn"
                      onClick={async () => {
                        try {
                          const result = await generateSlideImage('daydream');
                          setSlideContent(prev => ({
                            ...prev,
                            daydream: result
                          }));
                        } catch (error) {
                          console.error('Failed to generate daydream image:', error);
                        }
                      }}
                    >
                      🏰 Unleash Dreams
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Slide 3: Story Telling */}
          {currentSlideData.id === 'stories' && (
            <div className="slide stories-slide">
              <h1>{currentSlideData.title}</h1>
              {generatingSlide === 'story' ? (
                <div className="slide-loading">
                  <div className="story-spinner"></div>
                  <p>Weaving an incredible story...</p>
                </div>
              ) : slideContent.story?.url ? (
                <div className="story-card">
                  <div className="story-text">
                    <p>{slideContent.story.text}</p>
                  </div>
                  <div className="story-image">
                    <img 
                      src={slideContent.story.url} 
                      alt="Story visualization"
                    />
                    <div className="regenerate-container">
                      <button 
                        className="regenerate-btn"
                        onClick={async () => {
                          try {
                            const result = await generateSlideImage('story');
                            setSlideContent(prev => ({
                              ...prev,
                              story: {
                                ...prev.story,
                                url: result.url
                              }
                            }));
                          } catch (error) {
                            console.error('Failed to generate story image:', error);
                          }
                        }}
                      >
                        🎬 Reimagine Scene
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="slide-generate">
                  <p className="generate-description">🚀 Bring this epic tale to life with stunning visuals 🚀</p>
                  <div className="story-preview">
                    <p className="story-text-preview">{slideContent.story?.text}</p>
                  </div>
                  <div className="generate-container">
                    <button 
                      className="generate-btn"
                      onClick={async () => {
                        try {
                          const result = await generateSlideImage('story');
                          setSlideContent(prev => ({
                            ...prev,
                            story: {
                              ...prev.story,
                              url: result.url
                            }
                          }));
                        } catch (error) {
                          console.error('Failed to generate story image:', error);
                        }
                      }}
                    >
                      ⚡ Visualize Epic
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Slide 4: Experience Diversity */}
          {currentSlideData.id === 'diversity' && (
            <div className="slide diversity-slide">
              <h1>{currentSlideData.title}</h1>
              <div className="categories-grid">
                <div className="category-box mythology">
                  <h3>Mythology ⚡</h3>
                  <div className="experience-list">
                    <span>Epic Dharmic Legends</span>
                    <span>Ancient Conversations</span>
                    <span>Mind Bending Hindu</span>
                  </div>
                </div>
                <div className="category-box comedy">
                  <h3>Comedy 😂</h3>
                  <div className="experience-list">
                    <span>Gossip Aunties</span>
                    <span>Dad Jokes Comedians</span>
                    <span>Useless Powers</span>
                  </div>
                </div>
                <div className="category-box scifi">
                  <h3>Sci-Fi 🚀</h3>
                  <div className="experience-list">
                    <span>Space Wars</span>
                    <span>Orbital Megastructures</span>
                    <span>Future Memories</span>
                  </div>
                </div>
                <div className="category-box reality">
                  <h3>Reality-Bending 🌀</h3>
                  <div className="experience-list">
                    <span>Impossible Coexistence</span>
                    <span>Dream Architecture</span>
                    <span>Portal Dimensions</span>
                  </div>
                </div>
              </div>
              <div className="diversity-footer">
                <p>50+ Unique Experiences Across All Genres</p>
              </div>
            </div>
          )}

          {/* Slide 5: Welcome CTA */}
          {currentSlideData.id === 'welcome' && (
            <div className="slide welcome-slide">
              <h1>{currentSlideData.title}</h1>
              <div className="welcome-content">
                <p className="tagline">Your imagination, amplified by AI</p>
                <button className="enter-hub-btn" onClick={() => {
                  const experienceHubHeading = document.querySelector('.experience-hub-heading');
                  if (experienceHubHeading) {
                    experienceHubHeading.scrollIntoView({ behavior: 'smooth' });
                  }
                }}>
                  Enter the Hub
                </button>
              </div>
            </div>
          )}

          {/* Slide 6: Learn Creativity CTA */}
          {currentSlideData.id === 'learn-creativity' && (
            <div className="slide creativity-cta-slide">
              <h1>{currentSlideData.title}</h1>
              <div className="creativity-cta-content">
                <p className="creativity-tagline">Discover the 5 Universal Principles Behind Creative Genius</p>
                <button className="learn-creativity-btn" onClick={() => {
                  window.open(`${window.location.origin}${window.location.pathname}?creativity=true`, '_blank');
                }}>
                  💡 Start Learning
                </button>
              </div>
            </div>
          )}

          {/* Slide 7: Create Experience CTA */}
          {currentSlideData.id === 'create-experience' && (
            <div className="slide create-experience-cta-slide">
              <h1>{currentSlideData.title}</h1>
              <div className="create-experience-cta-content">
                <p className="create-experience-tagline">Turn Your Wildest Ideas into Reality with AI</p>
                <button className="create-experience-btn" onClick={() => {
                  window.open(`${window.location.origin}${window.location.pathname}?create=true`, '_blank');
                }}>
                  🎨 Start Creating
                </button>
              </div>
            </div>
          )}


          {/* Slide 8: Research Synergy CTA */}
          {currentSlideData.id === 'research-synergy' && (
            <div className="slide research-synergy-cta-slide">
              <h1>{currentSlideData.title}</h1>
              <div className="research-synergy-cta-content">
                <p className="research-synergy-tagline">Discover how our 70+ AI experiences align with foundational computational creativity research.</p>
                <button className="research-synergy-btn" onClick={() => {
                  window.open(`${window.location.origin}${window.location.pathname}?research-synergy=true`, '_blank');
                }}>
                  📊 View Research Synergy Map
                </button>
              </div>
            </div>
          )}

          {/* Slide 9: Learn More CTA */}
          {currentSlideData.id === 'learn-more' && (
            <div className="slide learn-more-cta-slide">
              <h1>{currentSlideData.title}</h1>
              <div className="learn-more-cta-content">
                <p className="learn-more-tagline">Discover the Vision Behind the Magic</p>
                <button className="learn-more-slideshow-btn" onClick={() => {
                  window.open(`${window.location.origin}${window.location.pathname}?experience=about`, '_blank');
                }}>
                  <span className="btn-icon">🌟</span>
                  <span className="btn-text">Learn more about FantasyWorldHub and its creator</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="slide-navigation">
          <button 
            className="nav-btn prev" 
            onClick={prevSlide}
            disabled={currentSlide === 0}
          >
            ←
          </button>
          
          <div className="slide-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${currentSlide === index ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
          
          <button 
            className="nav-btn next" 
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscoverTheVisionSlideshow;
