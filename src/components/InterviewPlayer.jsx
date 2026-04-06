import React, { useState, useRef } from 'react';

const InterviewPlayer = ({ video, onGenerateAnother, onStop }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleDownload = () => {
    if (video && video.url) {
      const link = document.createElement('a');
      link.href = video.url;
      link.download = `Emperor_Tiberius_Interview_${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    if (navigator.share && video) {
      try {
        await navigator.share({
          title: 'Interview with Emperor Tiberius Charlie Buchanan - Year 3125',
          text: 'Check out this AI-generated futuristic interview!',
          url: window.location.href
        });
      } catch (error) {
        console.log('Sharing failed:', error);
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="interview-player">
      {/* Header */}
      <div className="player-header">
        <h2>🎬 Interview Complete!</h2>
        <p>Year 3125 - Emperor Tiberius Charlie Buchanan of the Greater Americas</p>
      </div>

      {/* Video Container */}
      <div className="video-container">
        <div className="video-wrapper">
          {video && video.url ? (
            <video
              ref={videoRef}
              src={video.url}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              className="interview-video"
              poster={video.thumbnail}
            />
          ) : video && video.isDemo ? (
            <div className="demo-video-display">
              <div className="demo-header">
                <h3>🎬 Interview Generated Successfully!</h3>
                <p className="demo-message">{video.demoMessage}</p>
              </div>
              
              <div className="demo-characters">
                <div className="character-display">
                  <h4>👩‍💼 Interviewer</h4>
                  {video.characters.interviewer && (
                    <img 
                      src={video.characters.interviewer.url} 
                      alt="AI Generated Interviewer"
                      className="character-image"
                    />
                  )}
                </div>
                
                <div className="character-display">
                  <h4>👑 Emperor Tiberius</h4>
                  {video.characters.emperor && (
                    <img 
                      src={video.characters.emperor.url} 
                      alt="AI Generated Emperor"
                      className="character-image"
                    />
                  )}
                </div>
              </div>
              
              <div className="demo-dialogue">
                <h4>📝 Generated Interview Dialogue:</h4>
                <div className="dialogue-text">
                  {video.interviewContent.dialogue}
                </div>
              </div>
            </div>
          ) : (
            <div className="video-placeholder">
              <div className="placeholder-icon">🎥</div>
              <p>Video ready for playback</p>
            </div>
          )}
          
          {/* Video Overlay Controls */}
          <div className="video-overlay">
            <button 
              className="play-pause-btn"
              onClick={handlePlayPause}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
          </div>
        </div>

        {/* Video Controls */}
        <div className="video-controls">
          <button 
            className="control-btn play-pause"
            onClick={handlePlayPause}
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          
          <div className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          <div 
            className="progress-bar"
            onClick={handleSeek}
          >
            <div 
              className="progress-fill"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Interview Details */}
      <div className="interview-details">
        <div className="detail-card">
          <h3>👑 Emperor Tiberius Charlie Buchanan</h3>
          <p>67 years old, 6th year of reign</p>
          <p>Former Senator from Neo-California</p>
        </div>
        
        <div className="detail-card">
          <h3>🌍 Greater Americas Empire</h3>
          <p>Unified territory from Alaska to Argentina</p>
          <p>Population: 1.2 billion citizens</p>
        </div>
        
        <div className="detail-card">
          <h3>📅 Year 3125 Context</h3>
          <p>Martian Refugee Crisis ongoing</p>
          <p>AI Rights Movement gaining momentum</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="action-btn primary"
          onClick={onStop}
        >
          ← Back to FantasyWorld Hub
        </button>
      </div>

      {/* Generation Info */}
      <div className="generation-info">
        <h3>🤖 Generation Details</h3>
        <div className="info-grid">
          <div className="info-item">
            <strong>Duration:</strong> 30 seconds
          </div>
          <div className="info-item">
            <strong>Format:</strong> Vertical (9:16)
          </div>
          <div className="info-item">
            <strong>Quality:</strong> 1080p HD
          </div>
          <div className="info-item">
            <strong>Generated:</strong> {new Date().toLocaleString()}
          </div>
        </div>
      </div>
      
      {/* Model Attribution */}
      <div className="model-attribution">
        <p>Generated using OpenAI GPT-4 for dialogue, Google Imagen-4 via Segmind API for character images, and Seedance Pro via Segmind API for video</p>
      </div>
    </div>
  );
};

export default InterviewPlayer;
