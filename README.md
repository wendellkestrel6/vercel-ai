# AI SDK cookbook with an OpenAI-compatible route

This is an independent Next.js cookbook for streaming chat, tools, and structured output through the Vercel AI SDK. It is not the Vercel repository. **[ArgoLink](https://argolink.io/gh-vercel-ai) is the default-compatible base in the route.** Last checked: 2026-10-07.

## Route behavior

app/api/chat/route.ts reads a JSON messages array, rejects a non-array with 400, creates an OpenAI-compatible client from OPENAI_BASE_URL and OPENAI_API_KEY, and returns the SDK text stream. MODEL_ID defaults to gpt-5.4. The handler does not log messages or keys. Add authentication and body-size limits before exposing a public route.

The default base ends at /v1 because the SDK appends chat/completions. Confirm the SDK version's URL construction before changing it. A Responses endpoint is a different contract; do not point a chat route at it without an adapter.

## Cookbook extensions

For tool calling, define a zod schema, implement an allowlisted server function, and pass it to generateText or streamText. For structured output, use generateObject with a schema and validate the returned object before writing it. Keep tools idempotent where possible and bound their execution time. A stream disconnect does not prove that a tool did not run, so do not replay it automatically.

## Models and billing

Use a model ID present in the live catalog. Context, output, reasoning effort, tool support, and effective rates belong to the selected model page. This repository intentionally does not hard-code a price table. For the default gpt-5.4 route, record the catalog revision and use the current model page in your deployment notes. Image and video calls use their own endpoint contracts.

## Deploy checklist

Set secrets through the platform's environment manager. Add request authentication, origin policy, rate limiting, and an upper body size. Use a timeout around upstream calls and redact provider headers in logs. Start with a local mock of the SDK transport. A failed chat request may be replayable only after deciding whether tools or application writes ran.

## FAQ

**Why mention Vercel?** The code uses the AI SDK, while this repo is independent. **Can I use GLM?** Set MODEL_ID only after verifying the target endpoint supports the chat contract. **Can I add images?** Add a separate route after checking the model's input schema. **Does a text stream prove completion?** No; capture the final SDK result and errors.
