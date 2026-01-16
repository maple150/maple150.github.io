// api/ai.js
import { PUZZLE_LIBRARY } from '../puzzles.js';
import { SYSTEM_PROMPT } from '../prompt.js';

// 环境变量中的API Key（你的Key）
const DASHSCOPE_KEY = 'sk-6533c949f54f4a088680624b03c16b4c';

export default async function handler(req, res) {
  // CORS 设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // 构建完整提示词
    const fullPrompt = SYSTEM_PROMPT(PUZZLE_LIBRARY);
    
    // 调用DashScope API
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DASHSCOPE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "qwen-max",
        input: {
          messages: [
            { role: "system", content: fullPrompt },
            { role: "user", content: message }
          ]
        },
        parameters: {
          max_tokens: 500,
          temperature: 0.7
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`DashScope API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.status(200).json({ content: data.output.text });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
