import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// OpenAI Chat Completions Proxy
app.post('/api/openai/chat', async (req, res) => {
  try {
    const { model, messages, max_tokens, temperature } = req.body;
    
    // Check if API key exists
    if (!process.env.VITE_OPENAI_API_KEY) {
      console.error('OpenAI API key not found in environment variables');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }
    
    console.log('Making OpenAI API request...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'gpt-4',
        messages,
        max_tokens: max_tokens || 150,
        temperature: temperature || 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Chat proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// OpenAI Image Generation Proxy
app.post('/api/openai/images', async (req, res) => {
  try {
    const { model, prompt, n, size, quality } = req.body;
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'dall-e-3',
        prompt,
        n: n || 1,
        size: size || '1024x1024',
        quality: quality || 'standard'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DALL-E API error:', response.status, errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Image generation proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Image upload endpoint for Character Portrait Transformer
app.post('/api/upload-image', async (req, res) => {
  try {
    const { imageData, fileName } = req.body;
    const buffer = Buffer.from(imageData.split(',')[1], 'base64');
    
    // Upload to ImgBB (free image hosting service)
    const FormData = (await import('form-data')).default;
    const form = new FormData();
    form.append('image', buffer.toString('base64'));
    
    const imgbbResponse = await fetch('https://api.imgbb.com/1/upload?key=46c28e4ac4e877b0a4b1e1e4d0b2d0f8', {
      method: 'POST',
      body: form
    });
    
    if (!imgbbResponse.ok) {
      throw new Error(`ImgBB upload failed: ${imgbbResponse.status}`);
    }
    
    const imgbbData = await imgbbResponse.json();
    
    if (!imgbbData.success) {
      throw new Error('ImgBB upload failed');
    }
    
    // Return the publicly accessible URL
    res.json({ url: imgbbData.data.url });
  } catch (error) {
    console.error('Image upload error:', error);
    // Fallback to local storage if ImgBB fails
    try {
      const { imageData, fileName } = req.body;
      const buffer = Buffer.from(imageData.split(',')[1], 'base64');
      const tempFileName = `temp_${Date.now()}_${fileName}`;
      const fs = await import('fs');
      const path = await import('path');
      
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      
      const filePath = path.join(tempDir, tempFileName);
      fs.writeFileSync(filePath, buffer);
      
      res.json({ url: `http://localhost:3001/temp/${tempFileName}`, fallback: true });
    } catch (fallbackError) {
      res.status(500).json({ error: fallbackError.message });
    }
  }
});

// Serve temp images
app.use('/temp', express.static('temp'));

// Segmind Nano Banana Pro API Proxy (for Character Portrait Transformer)
app.post('/api/segmind/nano-banana-pro', async (req, res) => {
  try {
    const response = await fetch('https://api.segmind.com/v1/nano-banana-pro', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.VITE_SEGMIND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Segmind Nano Banana Pro API error:', response.status, errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const buffer = await response.buffer();
    res.set('Content-Type', 'image/jpeg');
    res.send(buffer);
  } catch (error) {
    console.error('Segmind Nano Banana Pro proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Segmind API Proxy (for other experiences)
app.post('/api/segmind/nano-banana', async (req, res) => {
  try {
    const response = await fetch('https://api.segmind.com/v1/nano-banana', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.VITE_SEGMIND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Segmind API error:', response.status, errorText);
      return res.status(response.status).json({ error: errorText });
    }

    // Segmind returns binary image data
    const buffer = await response.buffer();
    res.set('Content-Type', 'image/jpeg');
    res.send(buffer);
  } catch (error) {
    console.error('Segmind proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 FantasyWorld Hub API Server running on http://localhost:${port}`);
  console.log(`📡 Proxying OpenAI and Segmind API calls`);
});
