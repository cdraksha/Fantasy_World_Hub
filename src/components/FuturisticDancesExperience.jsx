import React, { useState, useEffect } from 'react';
import useFuturisticDancesContent from '../hooks/useFuturisticDancesContent';
import '../styles/futuristic-dances.css';

const FuturisticDancesExperience = ({ onStop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentDescription, setCurrentDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generationHistory, setGenerationHistory] = useState([]);

  const { generateFuturisticDance } = useFuturisticDancesContent();

  // Auto-generate first dance on load
  useEffect(() => {
    const generateInitialDance = async () => {
      try {
        const result = await generateFuturisticDance();
        setCurrentImage(result.imageUrl);
        setCurrentDescription(result.description);
        setGenerationHistory([{
          id: Date.now(),
          imageUrl: result.imageUrl,
          description: result.description,
          timestamp: new Date()
        }]);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    generateInitialDance();
  }, [generateFuturisticDance]);

  const handleGenerateNewDance = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generateFuturisticDance();
      
      setCurrentImage(result.imageUrl);
      setCurrentDescription(result.description);
      
      // Add to history
      setGenerationHistory(prev => [{
        id: Date.now(),
        imageUrl: result.imageUrl,
        description: result.description,
        timestamp: new Date()
      }, ...prev.slice(0, 4)]); // Keep last 5 generations
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHistoryClick = (item) => {
    setCurrentImage(item.imageUrl);
    setCurrentDescription(item.description);
  };

  if (isLoading) {
    return (
      <div className="futuristic-dances-container">
        <div className="dance-loading">
          <div className="dance-spinner"></div>
          <p>Initializing dance matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="futuristic-dances-container">
      {/* Header */}
      <div className="dance-header">
        <h1>💃 Futuristic Dances</h1>
        <p>Explore AI-generated dance styles from tomorrow's world</p>
      </div>

      {/* Main Content */}
      <div className="dance-main-content">
        {/* Image Display */}
        <div className="dance-image-section">
          {currentImage ? (
            <div className="dance-image-container">
              <img 
                src={currentImage} 
                alt="Futuristic Dance" 
                className="dance-image"
              />
              <div className="dance-image-overlay">
                <div className="dance-description">
                  {currentDescription}
                </div>
              </div>
            </div>
          ) : (
            <div className="dance-placeholder">
              <div className="dance-placeholder-icon">💃</div>
              <p>Generate your first futuristic dance to begin</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="dance-controls">
          <button 
            onClick={handleGenerateNewDance}
            disabled={isGenerating}
            className="generate-dance-btn"
          >
            {isGenerating ? (
              <>
                <div className="btn-spinner"></div>
                Choreographing...
              </>
            ) : (
              <>
                🎭 Generate New Dance
              </>
            )}
          </button>

          {error && (
            <div className="dance-error">
              <p>⚠️ {error}</p>
              <button onClick={() => setError(null)} className="dismiss-error-btn">
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Generation History */}
      {generationHistory.length > 0 && (
        <div className="dance-history-section">
          <h3>Recent Dances</h3>
          <div className="dance-history-grid">
            {generationHistory.map((item) => (
              <div 
                key={item.id}
                onClick={() => handleHistoryClick(item)}
                className="dance-history-item"
              >
                <img 
                  src={item.imageUrl} 
                  alt="Dance History" 
                  className="history-thumbnail"
                />
                <div className="history-overlay">
                  <span className="history-description">
                    {item.description.substring(0, 50)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="dance-bottom-controls">
        <button onClick={onStop} className="return-hub-btn">
          ← Return to FantasyWorld Hub
        </button>
      </div>
    </div>
  );
};

export default FuturisticDancesExperience;
