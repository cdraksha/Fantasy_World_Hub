import React, { useState, useEffect } from 'react';
import useOvertonWindowCareersContent from '../hooks/useOvertonWindowCareersContent';
import '../styles/overton-window-careers.css';

const POSITION_META = {
  left3:  { zone: 'zone-extreme-left',   zoneLabel: 'Extreme Left',   posTag: '← Left 3',  },
  left2:  { zone: 'zone-distant-left',   zoneLabel: 'Distant Left',   posTag: '← Left 2',  },
  left1:  { zone: 'zone-adjacent-left',  zoneLabel: 'Adjacent Left',  posTag: '← Left 1',  },
  middle: { zone: 'zone-current',        zoneLabel: 'Current Reality', posTag: '★ Middle',  },
  right1: { zone: 'zone-adjacent-right', zoneLabel: 'Mirror of L1',   posTag: 'Right 1 →', },
  right2: { zone: 'zone-distant-right',  zoneLabel: 'Mirror of L2',   posTag: 'Right 2 →', },
  right3: { zone: 'zone-extreme-right',  zoneLabel: 'Mirror of L3',   posTag: 'Right 3 →', },
};

const OvertonWindowCareersPage = ({ onReturn }) => {
  const [generatedContent, setGeneratedContent] = useState(null);
  const { generateOvertonWindowCareers, isGenerating } = useOvertonWindowCareersContent();

  const generate = async () => {
    setGeneratedContent(null);
    try {
      const result = await generateOvertonWindowCareers();
      setGeneratedContent(result);
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  useEffect(() => {
    generate();
  }, []);

  const positions = ['left3', 'left2', 'left1', 'middle', 'right1', 'right2', 'right3'];

  return (
    <div className="overton-page">
      <button className="overton-return-btn" onClick={onReturn}>
        ← Return to Hub
      </button>

      <div className="overton-header">
        <h1>🪟 Overton Window — Parallel Universe Careers</h1>
        <p>
          Every choice creates a parallel universe. The middle is your current reality. <br />
          Left side explores nearby and distant alternatives. Right side shows their exact opposites.
        </p>
      </div>

      {isGenerating && (
        <div className="overton-loading">
          <div className="overton-spinner"></div>
          <h2>Scanning parallel universes...</h2>
          <p>GPT-4 is mapping career paths. 7 images generating simultaneously.</p>
        </div>
      )}

      {generatedContent && !isGenerating && (
        <>
          <div className="overton-window-label">
            {positions.map(pos => (
              <span key={pos} className={`window-zone ${POSITION_META[pos].zone}`}>
                {POSITION_META[pos].zoneLabel}
              </span>
            ))}
          </div>

          <div className="overton-axis">
            <span className="axis-label">← Opposite extreme</span>
            <div className="axis-line"></div>
            <span className="axis-label">Opposite extreme →</span>
          </div>

          <div className="overton-strip">
            {positions.map(pos => {
              const career = generatedContent.careers[pos];
              const imgUrl = generatedContent.images[pos];
              const isMiddle = pos === 'middle';
              return (
                <div key={pos} className={`career-card ${isMiddle ? 'middle-card' : ''}`}>
                  <div className="career-universe">{POSITION_META[pos].zoneLabel}</div>
                  <div className="career-img-wrap">
                    {imgUrl
                      ? <img src={imgUrl} alt={career.label} />
                      : <div className="career-img-placeholder">🌌</div>
                    }
                  </div>
                  <div className="career-label">{career.label}</div>
                  <div className="position-tag">{POSITION_META[pos].posTag}</div>
                </div>
              );
            })}
          </div>

          <div className="overton-actions">
            <button className="overton-generate-btn" onClick={generate}>
              🔀 Generate New Universe
            </button>
            <button className="overton-return-hub-btn" onClick={onReturn}>
              🏠 Return to Hub
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OvertonWindowCareersPage;
