import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Custom plugin to add server-side API endpoints
function apiPlugin() {
  return {
    name: 'api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/gemini/generate')) {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          try {
            let body = '';
            for await (const chunk of req) {
              body += chunk;
            }
            if (!body) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Empty body' }));
              return;
            }
            const { prompt, canvasState } = JSON.parse(body);

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured in Secrets panel.' }));
              return;
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

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(response.text);
          } catch (error: any) {
            console.error('API Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message || 'An error occurred during Gemini generation' }));
          }
          return;
        }

        if (req.url?.startsWith('/api/gemini/text')) {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          try {
            let body = '';
            for await (const chunk of req) {
              body += chunk;
            }
            if (!body) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Empty body' }));
              return;
            }
            const { prompt, systemInstruction } = JSON.parse(body);

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured in Secrets panel.' }));
              return;
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

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ text: response.text }));
          } catch (error: any) {
            console.error('API Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message || 'An error occurred during Gemini text generation' }));
          }
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
