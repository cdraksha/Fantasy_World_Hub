import React, { useState, useEffect } from 'react';
import InterviewLoadingScreen from './InterviewLoadingScreen';
import InterviewPlayer from './InterviewPlayer';
import useVideoGeneration from '../hooks/useVideoGeneration';
import useInterviewContent from '../hooks/useInterviewContent';
import '../styles/interview.css';

const InterviewGenerator = ({ onStop }) => {
  const [generationState, setGenerationState] = useState('idle'); // idle, loading, completed, error
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const { 
    generateInterviewerImage, 
    generateEmperorImage, 
    generateFinalVideo,
    isGenerating,
    error: videoError 
  } = useVideoGeneration();

  const { 
    generateInterviewContent, 
    isGeneratingContent,
    error: contentError 
  } = useInterviewContent();

  // Auto-start generation when component mounts
  useEffect(() => {
    if (generationState === 'idle') {
      startGeneration();
    }
  }, []);

  const startGeneration = async () => {
    setGenerationState('loading');
    setStartTime(Date.now());
    setProgress(0);

    try {
      // Step 1: Generate interview content (10% - 20%)
      setCurrentStep('Creating interview dialogue...');
      setProgress(10);
      const interviewContent = await generateInterviewContent();
      setProgress(20);

      // Step 2: Generate interviewer character (20% - 40%)
      setCurrentStep('Generating interviewer character...');
      const interviewerImage = await generateInterviewerImage();
      setProgress(40);

      // Step 3: Generate emperor character (40% - 60%)
      setCurrentStep('Generating Emperor Tiberius...');
      const emperorImage = await generateEmperorImage();
      setProgress(60);

      // Step 4: Generate final interview video (60% - 100%)
      setCurrentStep('Creating emperor interview video...');
      setProgress(70);
      const finalVideo = await generateFinalVideo({
        interviewContent,
        interviewerImage,
        emperorImage
      });
      setProgress(100);

      // Complete
      setGeneratedVideo(finalVideo);
      setGenerationState('completed');
      setCurrentStep('Interview ready!');

    } catch (error) {
      console.error('Interview generation failed:', error);
      setGenerationState('error');
      setCurrentStep('Generation failed. Please try again.');
    }
  };

  const handleRetry = () => {
    setGenerationState('idle');
    setGeneratedVideo(null);
    setProgress(0);
    setCurrentStep('');
    startGeneration();
  };

  const handleGenerateAnother = () => {
    setGenerationState('idle');
    setGeneratedVideo(null);
    setProgress(0);
    setCurrentStep('');
    startGeneration();
  };

  // Calculate elapsed time
  const getElapsedTime = () => {
    if (!startTime) return '0:00';
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="interview-generator-container">
      {/* Header */}
      <div className="interview-header">
        <h1>🎥 Imaginary Interviews</h1>
        <h2>Year 3125 - Imperial Interview</h2>
        <p>Generating exclusive interview with Emperor Tiberius Charlie Buchanan</p>
      </div>

      {/* Main Content */}
      {generationState === 'loading' && (
        <InterviewLoadingScreen 
          currentStep={currentStep}
          progress={progress}
          elapsedTime={getElapsedTime()}
          estimatedTotal="8-10 minutes"
        />
      )}

      {generationState === 'completed' && generatedVideo && (
        <InterviewPlayer 
          video={generatedVideo}
          onGenerateAnother={handleGenerateAnother}
          onStop={onStop}
        />
      )}

      {generationState === 'error' && (
        <div className="interview-error">
          <div className="error-content">
            <h3>⚠️ Generation Failed</h3>
            <p>We encountered an issue generating your interview.</p>
            <p className="error-details">{videoError || contentError || 'Unknown error occurred'}</p>
            <button className="retry-button" onClick={handleRetry}>
              🔄 Try Again
            </button>
          </div>
        </div>
      )}

      {/* Background Elements */}
      <div className="futuristic-background">
        <div className="hologram-grid"></div>
        <div className="energy-particles"></div>
      </div>
    </div>
  );
};

export default InterviewGenerator;
