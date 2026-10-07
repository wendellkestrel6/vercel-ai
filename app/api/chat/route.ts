import { timingSafeEqual } from 'node:crypto';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool, type ModelMessage } from 'ai';
import { z } from 'zod';

export const runtime = 'nodejs';
export const MAX_BODY_BYTES = 1_000_000;
export const DEFAULT_BASE_URL = 'https://argolink.io/v1';
export const DEFAULT_MODEL = 'glm-5.3';

export function validateBaseURL(value: string): string {
  const url = new URL(value);
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) throw new Error('OPENAI_BASE_URL must use HTTPS');
  return url.toString().replace(/\/$/, '');
}

export function parseChatBody(raw: string): { messages: unknown[] } {
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    throw new Error('request body must be valid JSON');
  }
  if (!body || typeof body !== 'object' || !Array.isArray((body as { messages?: unknown }).messages)) throw new Error('messages must be an array');
  const messages = (body as { messages: unknown[] }).messages;
  if (messages.length === 0 || messages.length > 100) throw new Error('messages must contain 1 to 100 items');
  return { messages };
}

function authorized(request: Request): boolean {
  const expected = process.env.CHAT_PROXY_TOKEN;
  if (!expected) return true;
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function errorResponse(message: string, status: number): Response {
  return Response.json({ error: { message, type: 'invalid_request' } }, { status });
}

export async function POST(request: Request): Promise<Response> {
  if (!authorized(request)) return errorResponse('authentication failed', 401);
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) return errorResponse('request body exceeds the 1 MB limit', 413);
  let raw: string;
  try {
    raw = await request.text();
    if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) return errorResponse('request body exceeds the 1 MB limit', 413);
    const { messages } = parseChatBody(raw);
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return errorResponse('upstream credential is not configured', 500);
    const baseURL = validateBaseURL(process.env.OPENAI_BASE_URL ?? DEFAULT_BASE_URL);
    const model = process.env.MODEL_ID ?? DEFAULT_MODEL;
    const openai = createOpenAI({ baseURL, apiKey });
    const result = streamText({
      model: openai(model),
      messages: messages as ModelMessage[],
      tools: {
        lookupLocal: tool({
          description: 'Return a deterministic fixture value; replace with a reviewed read-only data source.',
          inputSchema: z.object({ query: z.string().min(1).max(200) }),
          execute: async ({ query }) => ({ query, result: 'fixture result' }),
        }),
      },
    });
    return result.toTextStreamResponse({ headers: { 'X-Model-ID': model } });
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith('request body') || error.message.startsWith('messages'))) return errorResponse(error.message, 400);
    if (error instanceof Error && error.message.includes('OPENAI_BASE_URL')) return errorResponse(error.message, 500);
    return errorResponse('upstream request could not be started', 502);
  }
}
