import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAvailableExperiences } from '../data/experiences';
import '../styles/references.css';

const ReferencesPage = () => {
  const [searchParams] = useSearchParams();
  const targetExperience = searchParams.get('experience');
  // Use same order as App.jsx - no sorting, just use the natural order from getAvailableExperiences()
  const experiences = getAvailableExperiences();

  useEffect(() => {
    // Auto-scroll to target experience if specified
    if (targetExperience) {
      const element = document.getElementById(targetExperience);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          element.classList.add('highlighted');
          // Remove highlight after 3 seconds
          setTimeout(() => {
            element.classList.remove('highlighted');
          }, 3000);
        }, 100);
      }
    }
  }, [targetExperience]);

  return (
    <div className="references-container">
      {/* Header */}
      <div className="references-header">
        <h1>📚 FantasyWorld Hub References</h1>
        <p>Comprehensive guide to all immersive experiences ({experiences.length} total)</p>
        <a href="/" className="back-to-hub">← Back to FantasyWorld Hub</a>
      </div>


      {/* Experience Definitions */}
      <div className="experiences-definitions">
        <h2>Experience Definitions</h2>
        
        {experiences.map(({ id, title, icon, contentType, description, example, modelsUsed, status }) => (
          <div 
            key={id} 
            id={id} 
            className={`experience-definition ${status}`}
          >
            <div className="definition-header">
              <div className="definition-title">
                <span className="definition-icon">{icon}</span>
                <h3>{title}</h3>
              </div>
              <div className="definition-meta">
                <span className="content-type-tag">{contentType}</span>
                {status === 'coming-soon' && <span className="status-badge">Coming Soon</span>}
              </div>
            </div>
            
            <div className="definition-content">
              <p className="definition-description">{description}</p>
              <div className="definition-example">
                <strong>Example:</strong> <em>{example}</em>
              </div>
              {modelsUsed && (
                <div className="definition-models">
                  <strong>Models used for this experience:</strong> {modelsUsed}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="references-footer">
        <p>FantasyWorld Hub - Where daydreams become reality through immersive experiences</p>
        <p>This reference guide is automatically updated when new experiences are added.</p>
      </div>
    </div>
  );
};

export default ReferencesPage;
