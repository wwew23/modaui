import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3005; // Port changed to 3005

app.use(express.json());

// Proxy route for Gemini API
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, canvasState } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in Secrets panel.' });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = `You are "Satori Design Assistant", an elite conversion rate optimization expert and UI designer. 
Your goal is to parse the user's styling, content, or structural request and return the updated canvas design state along with a design comment.

The input is a list of blocks/elements representing a page design. Here is the structure of an element:
{
  "id": string,
  "type": "text" | "button" | "image" | "video" | "input" | "container" | "card" | "badge",
  "content": string, 
  "imageUrl"?: string, 
  "price"?: string,
  "stock"?: string,
  "style"?: {
    "backgroundColor"?: string,
    "color"?: string,
    "fontSize"?: string,
    "fontWeight"?: string,
    "borderRadius"?: string,
    "padding"?: string,
  }
}

Respond ONLY with a JSON object in the following format:
{
  "updatedCanvasState": [ ... array of updated elements ... ],
  "assistantMessage": "Conversational reply explaining what you changed and why from a UX perspective (1-2 sentences in Chinese)."
}

When performing changes:
- If the user asks for a price change, item name change, or styling colors, modify the corresponding elements in the array.
- If the user asks for something that doesn't exist (e.g., 'Add a badge showing limited edition'), create a new element with a unique random ID and append it (or place it at an appropriate index, e.g. above button or below header).
- Be extremely precise with styling, values, and translations. Keep your conversational reply supportive, concise, and in standard professional Chinese.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Current Canvas Elements:\n${JSON.stringify(canvasState, null, 2)}\n\nUser request:\n${prompt}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json"
      }
    });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(response.text);
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'An error occurred during Gemini generation' });
  }
});

app.post('/api/gemini/text', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in Secrets panel.' });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'An error occurred during Gemini text generation' });
  }
});

// Serve frontend build static files in production
app.use(express.static(path.join(__dirname, 'dist')));

// Serve index.html for any remaining routes to handle SPA router mapping
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Full-Stack Express server started on http://0.0.0.0:${port}`);
});
