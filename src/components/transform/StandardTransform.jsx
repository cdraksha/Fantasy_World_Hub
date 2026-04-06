import React, { useRef, useState } from 'react';
import { Send, Loader2, ImagePlus } from 'lucide-react';
import ImageUpload from '../ui/image-upload';

const getImageMediaType = (dataUrl) => {
  const matches = dataUrl.match(/^data:([^;]+);base64,/);
  if (matches && matches[1]) {
    return matches[1];
  }
  return 'image/jpeg';
};

const processImage = async (file) => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload an image file');
  }

  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB limit
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image size should be less than 1MB');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const img = new Image();
        img.src = e.target.result;
        
        await new Promise((imgResolve, imgReject) => {
          img.onload = imgResolve;
          img.onerror = () => imgReject(new Error('Invalid image format'));
        });

        const canvas = document.createElement('canvas');
        
        let width = img.width;
        let height = img.height;
        const MAX_DIMENSION = 800;

        if (width > height && width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        const jpegBase64 = canvas.toDataURL('image/jpeg', 0.6);
        
        const base64Size = Math.round((jpegBase64.length * 3) / 4);
        if (base64Size > MAX_FILE_SIZE) {
          reject(new Error('Compressed image still too large. Please use a smaller image.'));
          return;
        }
        
        resolve(jpegBase64);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsDataURL(file);
  });
};

const StandardTransform = ({ selectedComedian, customComedians, onError, onOutput }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [transformImage, setTransformImage] = useState(null);
  const [transformImagePreview, setTransformImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const getComedianPrompt = (comedian, text, imageData = null) => {
    const imageContext = imageData ? "\n\nI'm sharing an image with you. Please incorporate your reaction to both the image and the text in your response." : "";
    
    const customComedian = customComedians.find(c => c.id === comedian);
    if (customComedian) {
      return `Transform this into ${customComedian.name}'s style where they:
1. Use their personality traits:
   ${customComedian.trainingData.personalityTraits}
2. Follow their speech patterns:
   ${customComedian.trainingData.speechPatterns}
3. Reference their common topics:
   ${customComedian.trainingData.commonReferences}
4. Respond in their conversation style:
   ${customComedian.trainingData.responseStyle}

The situation to transform: "${text}"${imageContext}`;
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || !selectedComedian) return;
    
    setLoading(true);

    try {
      const messageContent = [
        {
          type: "text",
          text: getComedianPrompt(selectedComedian, input, transformImage)
        }
      ];

      if (transformImage) {
        const mediaType = getImageMediaType(transformImage);
        messageContent.push({
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType,
            data: transformImage.split(',')[1]
          }
        });
      }

      const response = await fetch('http://localhost:3897/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1024,
          temperature: 0.7,
          messages: [{ role: 'user', content: messageContent }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to transform content');
      }

      const data = await response.json();
      onOutput(data.content[0].text);
    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur rounded-lg p-6 h-[600px] flex flex-col">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={transformImage ? "Describe what you see in this image..." : "Type your story here... Make it as mundane as possible, and watch it transform into comedy gold! 📝"}
        className="flex-1 w-full mb-4 text-lg p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      <div className="space-y-4">
        {transformImagePreview && (
          <ImageUpload 
            onImageUpload={setTransformImage}
            onImageRemove={() => {
              setTransformImage(null);
              setTransformImagePreview(null);
            }}
            preview={transformImagePreview}
          />
        )}
        
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-3"
            disabled={loading}
          >
            <ImagePlus className="h-5 w-5" />
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading || !input.trim() || !selectedComedian}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-lg py-3 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Transforming...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Transform into Comedy! 🎯
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StandardTransform;