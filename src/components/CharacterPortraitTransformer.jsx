import React, { useState, useRef } from 'react';
import useCharacterPortraitTransformer from '../hooks/useCharacterPortraitTransformer';
import '../styles/character-portrait-transformer.css';

const CharacterPortraitTransformer = ({ onStop }) => {
  const [selectedTheme, setSelectedTheme] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [transformedContent, setTransformedContent] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('upload'); // 'upload', 'processing', 'result'
  
  const fileInputRef = useRef(null);
  const { transformPortrait, isLoading, themes: themeData } = useCharacterPortraitTransformer();

  // Convert themes object to array for UI rendering
  const themes = Object.entries(themeData).map(([id, data]) => ({
    id,
    name: data.name,
    description: data.description
  }));

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (JPG, PNG, etc.)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file size must be less than 10MB');
        return;
      }

      setUploadedImage(file);
      setError(null);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImageUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setUploadedImage(file);
        setError(null);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImageUrl(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please upload a valid image file');
      }
    }
  };

  const validateAndTransform = async () => {
    if (!uploadedImage || !selectedTheme) {
      setError('Please upload an image and select a theme');
      return;
    }

    setError(null);
    setStep('processing');

    try {
      const result = await transformPortrait(uploadedImage, selectedTheme);
      setTransformedContent(result);
      setStep('result');
    } catch (err) {
      setError(err.message);
      setStep('upload');
    }
  };

  const resetExperience = () => {
    setSelectedTheme('');
    setUploadedImage(null);
    setUploadedImageUrl(null);
    setTransformedContent(null);
    setError(null);
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (step === 'processing' || isLoading) {
    return (
      <div className="character-transformer-container">
        <div className="transformer-loading">
          <div className="portrait-spinner"></div>
          <h2>Transforming Your Portrait...</h2>
          <p>Analyzing image and generating {themes.find(t => t.id === selectedTheme)?.name} transformation...</p>
        </div>
      </div>
    );
  }

  if (step === 'result' && transformedContent) {
    return (
      <div className="character-transformer-container">
        {/* Header */}
        <div className="transformer-header">
          <h1>🎭 Character Portrait Transformer</h1>
          <p>Your {transformedContent.theme} Transformation</p>
        </div>

        {/* Main Content - Side by Side */}
        <div className="transformer-main-content">
          {/* Transformed Image */}
          <div className="transformer-image-panel">
            <div className="image-container">
              {transformedContent.transformedImage ? (
                <img 
                  src={transformedContent.transformedImage.url} 
                  alt={transformedContent.transformedImage.description}
                  className="transformed-image"
                />
              ) : (
                <div className="image-placeholder">
                  <div className="placeholder-icon">🎭</div>
                  <p>Transformed Portrait</p>
                </div>
              )}
            </div>
            
            <div className="image-caption">
              <p>{transformedContent.transformedImage?.description}</p>
            </div>
          </div>

          {/* Story Panel */}
          <div className="transformer-story-panel">
            <div className="story-header">
              <h2>Your {transformedContent.theme} Story</h2>
            </div>
            
            <div className="story-content">
              <p>{transformedContent.story}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="transformer-actions">
          <button onClick={resetExperience} className="transformer-btn primary">
            🔄 Transform New Image
          </button>
          <button onClick={onStop} className="transformer-btn secondary">
            ← Back to FantasyWorld Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4o, Segmind Nano Banana, and GPT-4</p>
        </div>
      </div>
    );
  }

  return (
    <div className="character-transformer-container">
      {/* Header */}
      <div className="transformer-header">
        <h1>🎭 Character Portrait Transformer</h1>
        <p>Upload your photo and transform into legendary characters</p>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <h2>Step 1: Upload Your Image</h2>
        
        <div 
          className={`upload-area ${uploadedImageUrl ? 'has-image' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploadedImageUrl ? (
            <div className="uploaded-preview">
              <img src={uploadedImageUrl} alt="Uploaded" className="preview-image" />
              <div className="upload-overlay">
                <p>Click to change image</p>
              </div>
            </div>
          ) : (
            <div className="upload-prompt">
              <div className="upload-icon">📸</div>
              <h3>Drop your image here or click to browse</h3>
              <p>Upload a photo containing people to transform</p>
              <p className="file-info">Supports JPG, PNG • Max 10MB</p>
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* Theme Selection */}
      <div className="theme-section">
        <h2>Step 2: Choose Your Character Theme</h2>
        
        <div className="theme-grid">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`theme-card ${selectedTheme === theme.id ? 'selected' : ''}`}
              onClick={() => setSelectedTheme(theme.id)}
            >
              <h3>{theme.name}</h3>
              <p>{theme.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* Transform Button */}
      <div className="transform-section">
        <button 
          onClick={validateAndTransform}
          disabled={!uploadedImage || !selectedTheme || isLoading}
          className="transform-btn"
        >
          {isLoading ? 'Processing...' : '✨ Transform Portrait'}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="transformer-actions">
        <button onClick={onStop} className="transformer-btn secondary">
          ← Back to FantasyWorld Hub
        </button>
      </div>
    </div>
  );
};

export default CharacterPortraitTransformer;
