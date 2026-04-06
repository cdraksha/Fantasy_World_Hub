import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Loader2, Plus, Sparkles, X } from 'lucide-react';

const DEFAULT_IMAGE = '/images/picachu.jpg';

// ImageUpload component with default image support
const ImageUpload = ({ onImageUpload, onImageRemove, preview, fileInputRef, className = "" }) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />
      
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
        {preview ? (
          <div className="relative inline-block">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-48 rounded-lg object-cover mx-auto"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onImageRemove();
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center space-y-2"
          >
            <img 
              src={DEFAULT_IMAGE}
              alt="Default comedian image"
              className="max-h-48 rounded-lg object-cover mx-auto mb-2"
            />
            <div className="p-2 bg-blue-50 rounded-full">
              <Plus className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600">Drop your comedian's photo here</p>
            <p className="text-xs text-gray-400">or click to upload</p>
          </div>
        )}
      </div>
    </div>
  );
};

export function CustomComedianForm({ onAddComedian }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    adjectives: '',
    emoji: '',
    image: '',
    info: '',
    trainingData: {
      personalityTraits: '',
      speechPatterns: '',
      commonReferences: '',
      responseStyle: ''
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      adjectives: '',
      emoji: '',
      image: '',
      info: '',
      trainingData: {
        personalityTraits: '',
        speechPatterns: '',
        commonReferences: '',
        responseStyle: ''
      }
    });
    setImagePreview(null);
  };

  const handleImageUpload = (imageData) => {
    setFormData(prev => ({
      ...prev,
      image: imageData
    }));
    setImagePreview(imageData);
  };

  const handleAutofill = async () => {
    if (!formData.name.trim()) {
      alert("Please enter the comedian's name first!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3897/api/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1024,
          temperature: 0.7,
          messages: [{
            role: 'user',
            content: `Generate comedian profile data for "${formData.name}" ${formData.adjectives ? `who is ${formData.adjectives}` : ''}.
            Create a profile that matches their comedy style and presence.

            Return the response in this exact JSON format:
            {
              "info": "2-3 sentence bio highlighting their comedy style and background",
              "emoji": "Single emoji that best represents their style",
              "trainingData": {
                "personalityTraits": "3-4 key personality traits and characteristics",
                "speechPatterns": "3-4 unique speaking styles and verbal habits",
                "commonReferences": "3-4 topics and cultural references they often use",
                "responseStyle": "3-4 ways they typically react to situations"
              }
            }`
          }]
        })
      });

      if (!response.ok) throw new Error('Failed to generate profile');

      const data = await response.json();
      const parsedData = JSON.parse(data.content[0].text);

      setFormData(prev => ({
        ...prev,
        emoji: parsedData.emoji || prev.emoji,
        info: parsedData.info,
        trainingData: parsedData.trainingData
      }));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newComedian = {
      ...formData,
      id: formData.name.toLowerCase().replace(/\s+/g, '-'),
      emoji: formData.emoji || '🎭',
      image: formData.image || DEFAULT_IMAGE
    };
    
    onAddComedian(newComedian);
    setShowForm(false);
    resetForm();
  };

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg p-4 flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        <Plus className="h-5 w-5" />
        Create Your Comedian
      </button>

      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Your Own Comedian</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Comedian's name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Describe with Adjectives</label>
                <input
                  type="text"
                  value={formData.adjectives}
                  onChange={(e) => setFormData({...formData, adjectives: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., sarcastic, witty, observational"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Emoji (Optional)</label>
              <input
                type="text"
                value={formData.emoji}
                onChange={(e) => setFormData({...formData, emoji: e.target.value})}
                className="w-full p-2 border rounded-lg"
                placeholder="🎭"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Photo (Optional)</label>
              <ImageUpload
                onImageUpload={handleImageUpload}
                onImageRemove={() => {
                  setFormData(prev => ({...prev, image: ''}));
                  setImagePreview(null);
                }}
                preview={imagePreview}
                fileInputRef={fileInputRef}
              />
            </div>

            {/* Auto-fill Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAutofill}
                disabled={loading || !formData.name.trim()}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
                Auto-fill with AI
              </button>
            </div>

            {/* Brief Info */}
            <div>
              <label className="block text-sm font-medium mb-1">Brief Info</label>
              <textarea
                value={formData.info}
                onChange={(e) => setFormData({...formData, info: e.target.value})}
                className="w-full p-2 border rounded-lg h-24"
                placeholder="A brief description of the comedian's style and background..."
                required
              />
            </div>

            {/* Training Data */}
            <div className="space-y-4">
              <h3 className="font-medium">Training Data</h3>
              {Object.entries(formData.trainingData).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">
                    {key.split(/(?=[A-Z])/).join(' ')}
                  </label>
                  <textarea
                    value={value}
                    onChange={(e) => setFormData({
                      ...formData,
                      trainingData: {
                        ...formData.trainingData,
                        [key]: e.target.value
                      }
                    })}
                    className="w-full p-2 border rounded-lg h-24"
                    placeholder={`Enter ${key.split(/(?=[A-Z])/).join(' ').toLowerCase()}...`}
                    required
                  />
                </div>
              ))}
            </div>

            {/* Footer Buttons */}
            <DialogFooter>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg ml-2"
              >
                Create Comedian
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CustomComedianForm;