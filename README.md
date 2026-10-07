# AI SDK cookbook with an OpenAI-compatible chat route

This independent Next.js route demonstrates streamed chat, an allowlisted read-only tool, request validation, and a model selected from environment configuration. It is not the Vercel repository. **[ArgoLink](https://argolink.io/gh-vercel-ai) is the default-compatible base in the route.** Checked 2026-10-07.

## Contract of `POST /api/chat`

[`app/api/chat/route.ts`](app/api/chat/route.ts) runs on Node.js and:

1. optionally authenticates `Authorization: Bearer …` against `CHAT_PROXY_TOKEN` using a constant-time comparison;
2. rejects a declared or actual body above 1 MB before parsing;
3. parses a JSON object with 1–100 `messages` items;
4. creates `@ai-sdk/openai` with `OPENAI_BASE_URL` (default `https://argolink.io/v1`) and `OPENAI_API_KEY`;
5. selects `MODEL_ID` (default `glm-5.3`, a live catalog model on `/v1/chat/completions`);
6. exposes only the local `lookupLocal` Zod tool and returns the AI SDK text stream with an `X-Model-ID` header.

The route does not log messages or keys, does not accept a caller-supplied model, and does not add retries. The tool is a deterministic fixture; replace it with a reviewed read-only data source before exposing the route. Add a stronger application authorization policy, origin checks, rate limits, and upstream timeout controls at the deployment boundary.

## Why this is a chat route

`@ai-sdk/openai` appends the OpenAI Chat Completions contract to the configured base. The checked ArgoLink catalog records `glm-5.3` and `glm-5.2` on `POST /v1/chat/completions`, each with a 1,000,000-token context and 128,000-token maximum output. GLM 5.3 lists reasoning `low`, `high`, `max`; GLM 5.2 lists `high`, `max`. A Responses-only model such as GPT-6 Sol must use an adapter and endpoint that support Responses; pointing this chat route at it is a contract error.

The live model list and model page decide tools, streaming, structured output, image input, reasoning aliases, usage fields, and effective rates. Do not infer them from the AI SDK interface. Image generation/editing and asynchronous video need separate routes, parameters, status values, and billing units.

## Configuration

```bash
export OPENAI_API_KEY='replace-with-a-development-key'
export OPENAI_BASE_URL='https://argolink.io/v1'
export MODEL_ID='glm-5.3'
# Optional caller gate for a shared deployment:
export CHAT_PROXY_TOKEN='replace-with-a-local-client-token'
```

The provider base must use HTTPS, except for `localhost`/`127.0.0.1` development mocks. The key belongs in the platform secret manager or an ignored environment file. Never put a real key, signed media URL, or full production prompt in the repository.

## Cookbook extensions

For a real tool, keep the Zod schema narrow, validate authorization inside the function, bound execution time, and classify side effects. For structured output, use the AI SDK's object-generation API with a schema and validate before writing state. A stream disconnect does not prove a tool did not run; retain request IDs and reconcile before replaying. Do not let a client send arbitrary `tools` or `model` fields through this route.

## Run and verify

```bash
npm install
npm run check
npm test
```

The tests import the route helpers offline and cover JSON/message validation, body limits, base URL policy, and the live default model. `npm run check` uses the current TypeScript declarations. No provider request is made. A deployment smoke test should use a local mock transport first, then a small approved canary with a budget and redacted telemetry.

## Failure handling

The route returns 400 for malformed JSON or message counts, 401 for a configured caller-token mismatch, 413 for an oversized body, 500 for missing credentials or an invalid base URL, and 502 when the upstream call cannot be started. It does not expose SDK exception strings to the client. A timeout after a tool-bearing request may have caused a side effect; inspect the request/response ID before retrying.

## Sources

[AI SDK OpenAI provider](https://ai-sdk.dev/providers/ai-sdk-providers/openai) · [ArgoLink model list](https://argolink.io/v1/models) · [ArgoLink model pages](https://argolink.io/en/models) · [Next.js route handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
