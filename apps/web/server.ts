import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini API
  const geminiApiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (geminiApiKey) {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // API endpoint to customize or explain a code template
  app.post('/api/gemini/customize', async (req, res) => {
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured or the key is missing. Please review Secrets in Settings.'
      });
    }

    try {
      const { language, fileName, currentContent, userInstructions, action } = req.body;

      if (!language || !fileName || !currentContent) {
        return res.status(400).json({ error: 'Missing required parameters: language, fileName, currentContent' });
      }

      let systemInstruction = 'You are an elite software architect and systems programmer specializing in polyglot app development and deployment.';
      let prompt = '';

      if (action === 'explain') {
        prompt = `You are a helper designed to explain code. Analyze the following code for a file named "${fileName}" written in "${language}".
Provide a concise, extremely high-quality explanation focusing on:
1. What the code does.
2. Key structural components (e.g. server setup, endpoints).
3. Any important performance or safety aspects.

Keep the response concise, using clean Markdown formatting with clear bullet points. Do not mention system-internal or directory details unless necessary.

File Content:
\`\`\`${language}
${currentContent}
\`\`\``;
      } else {
        // action === 'customize'
        systemInstruction = `You are an elite code generator. You MUST return ONLY the updated code content. Do NOT include any markdown code blocks, explanation text, or other wrappers. Just output the completely raw code of the updated file. Ensure strict syntax and best practices for the language "${language}".`;
        prompt = `The user wants to modify a file named "${fileName}" written in "${language}".
Current File Content:
${currentContent}

User request for customization:
${userInstructions || 'Refactor and improve the styling/patterns.'}

Task: Update the content of this file to fulfill the user's request. Maintain the main framework and variables but inject the requested changes seamlessly. Output the raw updated code only. No explanations, no markdown triple backticks. Just the code immediately starting with the first line.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.1, // low temperature for precise code generation
        }
      });

      const resultText = response.text || '';
      res.json({ output: resultText.trim() });
    } catch (err: any) {
      console.error('Gemini call failed:', err);
      res.status(500).json({ error: err.message || 'An error occurred while interacting with Gemini.' });
    }
  });

  // Serve static files / Vite SPA router
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In dev mode, mount Vite as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = 3005;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
