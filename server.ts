import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Support JSON payloads up to 10MB (for database context snapshots)
app.use(express.json({ limit: '10mb' }));

// Server-side GoogleGenAI initialization with required user-agent header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Groq configuration constants (key loaded from environment or secured runtime fallback)
const GROQ_DEFAULT_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

// Health & Status endpoint
app.get('/api/ai/status', (_req: Request, res: Response) => {
  res.json({
    geminiAvailable: !!process.env.GEMINI_API_KEY,
    groqAvailable: !!GROQ_DEFAULT_KEY,
    defaultModel: 'openai/gpt-oss-120b',
    supportedGroqModels: [
      { id: 'openai/gpt-oss-120b', name: 'OpenAI GPT-OSS 120B', tag: 'Flagship Intelligence (Recommended)' },
      { id: 'openai/gpt-oss-20b', name: 'OpenAI GPT-OSS 20B', tag: 'High Speed & Reasoning' },
      { id: 'openai/gpt-oss-safeguard-20b', name: 'OpenAI GPT-OSS Safeguard 20B', tag: 'Policy & Guard Rails' },
      { id: 'qwen/qwen3.8-27b', name: 'Alibaba Cloud Qwen 3.8 27B', tag: 'Multilingual & Code' },
      { id: 'canopylabs/orpheus-v1-english', name: 'Canopy Labs Orpheus v1 (English)', tag: 'English Specialist' },
      { id: 'canopylabs/orpheus-arabic-saudi', name: 'Canopy Labs Orpheus (Arabic)', tag: 'Arabic Specialist' },
      { id: 'meta-llama/llama-prompt-guard-2-86m', name: 'Meta Prompt Guard 86M', tag: 'Prompt Guard' },
      { id: 'meta-llama/llama-prompt-guard-2-22m', name: 'Meta Prompt Guard 22M', tag: 'Fast Guard' },
      { id: 'allam-2-7b', name: 'Allam 2 7B', tag: 'Lightweight' },
    ],
    supportedGeminiModels: [
      { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', tag: 'General Tasks (Default)' },
      { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite', tag: 'Fast Tasks' },
      { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', tag: 'Complex Tasks & Audits' },
    ],
    timestamp: new Date().toISOString(),
  });
});

// Dynamic Groq Models list from Groq API
app.get('/api/ai/groq/models', async (_req: Request, res: Response) => {
  try {
    const apiKey = process.env.GROQ_API_KEY || GROQ_DEFAULT_KEY;
    const response = await fetch(`${GROQ_BASE_URL}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Groq error: ${errText}` });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch Groq models' });
  }
});

// Main AI Chat & Agent endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages = [],
      provider = 'groq',
      model = 'openai/gpt-oss-120b',
      systemInstruction = '',
      databaseContext = null,
      groqConfig = {},
      openaiConfig = {},
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Prepare full enriched system instruction with godown context if provided
    let fullSystemInstruction = systemInstruction || 'You are an intelligent LPG godown assistant.';
    if (databaseContext) {
      fullSystemInstruction += `\n\n--- LIVE GODOWN DATABASE SNAPSHOT ---\n` +
        `Current Time: ${new Date().toISOString()}\n` +
        `Business Profile: ${JSON.stringify(databaseContext.business || {})}\n` +
        `Current Inventory Stock:\n${JSON.stringify(databaseContext.inventorySummary || [])}\n` +
        `Customers & Overdue Dues:\n${JSON.stringify(databaseContext.customersSummary || [])}\n` +
        `Suppliers & Payables:\n${JSON.stringify(databaseContext.suppliersSummary || [])}\n` +
        `Financial & Cashbook Balances:\n${JSON.stringify(databaseContext.accountsSummary || {})}\n` +
        `Today's Sales & Activity:\n${JSON.stringify(databaseContext.recentSales || [])}\n` +
        `BERC Benchmark Reference Prices:\n${JSON.stringify(databaseContext.bercPrices || [])}\n` +
        `----------------------------------------\n` +
        `Instructions:\n` +
        `1. Use the live snapshot above to answer accurately about stocks, customer dues, supplier balances, and finances.\n` +
        `2. Always use Bangladesh Taka (৳ / BDT) and local conventions.\n` +
        `3. When taking actions requested by user (e.g. sell cylinders, record payment, adjust stock, add expense, receive empties, register customer), provide a friendly response explaining the action AND output a single JSON code block enclosed in \`\`\`json:action ... \`\`\` at the end.\n`;
    }

    // 1. Google Gemini Provider
    if (provider === 'gemini') {
      const ai = getGeminiClient();

      // Format messages into Gemini format
      // Note: in @google/genai, user turn is 'user', assistant turn is 'model'
      const geminiContents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || '' }],
      }));

      // Select model with automatic fallback if overloaded
      const validGeminiModels = ['gemini-3.5-flash', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite'];
      let targetModel = validGeminiModels.includes(model) ? model : 'gemini-3.5-flash';

      let response;
      try {
        response = await ai.models.generateContent({
          model: targetModel,
          contents: geminiContents,
          config: {
            systemInstruction: fullSystemInstruction,
            temperature: 0.3,
          },
        });
      } catch (firstErr: any) {
        const errMsg = String(firstErr?.message || '');
        if (errMsg.includes('503') || errMsg.includes('demand') || errMsg.includes('UNAVAILABLE') || errMsg.includes('429')) {
          const fallbackModel = targetModel === 'gemini-3.1-flash-lite' ? 'gemini-3.5-flash' : 'gemini-3.1-flash-lite';
          console.warn(`Model ${targetModel} busy (${errMsg}), falling back to ${fallbackModel}...`);
          targetModel = fallbackModel;
          response = await ai.models.generateContent({
            model: fallbackModel,
            contents: geminiContents,
            config: {
              systemInstruction: fullSystemInstruction,
              temperature: 0.3,
            },
          });
        } else {
          throw firstErr;
        }
      }

      const replyText = response.text || '';
      return res.json({
        reply: replyText,
        provider: 'gemini',
        model: targetModel,
      });
    }

    // 2. Groq Ultra-Fast LPU Provider (openai/gpt-oss-120b, openai/gpt-oss-20b, qwen, etc.)
    if (provider === 'groq') {
      const apiKey = groqConfig?.apiKey || process.env.GROQ_API_KEY || GROQ_DEFAULT_KEY;
      const targetModel = groqConfig?.model || model || 'openai/gpt-oss-120b';

      if (!apiKey) {
        return res.status(400).json({
          error: 'Groq API Key is missing. Please configure GROQ_API_KEY in the server or in Settings > AI Agent.',
        });
      }

      const groqMessages = [
        { role: 'system', content: fullSystemInstruction },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content || '',
        })),
      ];

      const groqRes = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages: groqMessages,
          temperature: 0.3,
        }),
      });

      if (!groqRes.ok) {
        const errorBody = await groqRes.text();
        return res.status(groqRes.status).json({
          error: `Groq error (${groqRes.status}): ${errorBody}`,
        });
      }

      const groqData = await groqRes.json();
      const replyText = groqData.choices?.[0]?.message?.content || '';

      return res.json({
        reply: replyText,
        provider: 'groq',
        model: targetModel,
      });
    }

    // 3. OpenAI Compatible Provider (ChatGPT, Ollama, DeepSeek, LocalAI, etc.)
    if (provider === 'openai') {
      const baseUrl = (openaiConfig?.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
      const apiKey = openaiConfig?.apiKey || process.env.OPENAI_API_KEY || '';
      const targetModel = openaiConfig?.model || 'gpt-4o-mini';

      if (!apiKey && !baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')) {
        return res.status(400).json({
          error: 'OpenAI API Key is missing. Please provide your API Key in Settings > AI Agent & LLM Provider.',
        });
      }

      const openAiMessages = [
        { role: 'system', content: fullSystemInstruction },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content || '',
        })),
      ];

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const openAiRes = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: targetModel,
          messages: openAiMessages,
          temperature: 0.3,
        }),
      });

      if (!openAiRes.ok) {
        const errorBody = await openAiRes.text();
        return res.status(openAiRes.status).json({
          error: `OpenAI provider returned error (${openAiRes.status}): ${errorBody}`,
        });
      }

      const openAiData = await openAiRes.json();
      const replyText = openAiData.choices?.[0]?.message?.content || '';

      return res.json({
        reply: replyText,
        provider: 'openai',
        model: targetModel,
      });
    }

    return res.status(400).json({ error: `Unsupported provider: ${provider}` });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error while processing AI request.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
const setupFrontend = async () => {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
};

setupFrontend().then(() => {
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`LIONS LPG MANAGER Server running on port ${PORT} (isProduction: ${isProduction})`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
