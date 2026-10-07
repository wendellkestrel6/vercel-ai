import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
const openai = createOpenAI({ baseURL: process.env.OPENAI_BASE_URL ?? 'https://argolink.io/v1', apiKey: process.env.OPENAI_API_KEY });
export async function POST(req: Request) {
  const { messages } = await req.json();
  if (!Array.isArray(messages)) return new Response('messages must be an array', { status: 400 });
  const result = streamText({ model: openai(process.env.MODEL_ID ?? 'gpt-5.4'), messages });
  return result.toTextStreamResponse();
}
