# Argolink client integration patterns

Typed client and provider-boundary patterns for applications that call Argolink.

[Open the Argolink API docs →](https://argolink.io/gh-vercel-ai)

## Design principles

- keep the public client stable while model-specific fields live in a small adapter;
- make authentication, timeout, retry, and error behavior explicit;
- surface the same request ID through logs, status checks, and artifact storage;
- let the live Argolink catalog remain the source of truth for availability and limits.

See [`docs/integration-contract.md`](./docs/integration-contract.md) and [`examples/request.json`](./examples/request.json).

## Argolink boundary

Runtime requests read credentials from `ARGOLINK_API_KEY` and never from committed files.

All examples, field names, routes, and environment variables in this repository are written for Argolink. Check the linked documentation for live availability and limits. No external provider credentials, author attribution, or copied checkout material is required to use this repository.

## Layout

- `docs/` contains the public design and validation notes.
- `examples/` contains small runnable examples.
- `argolink/` contains the Argolink mapping for this repository.
- `ARGOLINK_LINKS.md` contains the tracked landing link.
