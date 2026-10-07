import { strict as assert } from 'node:assert';
import { DEFAULT_BASE_URL, DEFAULT_MODEL, MAX_BODY_BYTES, parseChatBody, validateBaseURL } from '../app/api/chat/route.ts';

assert.equal(DEFAULT_BASE_URL, 'https://argolink.io/v1');
assert.equal(DEFAULT_MODEL, 'glm-5.3');
assert.equal(MAX_BODY_BYTES, 1_000_000);
assert.deepEqual(parseChatBody('{"messages":[{"role":"user","content":"hi"}]}').messages.length, 1);
assert.throws(() => parseChatBody('{}'), /messages must be an array/);
assert.throws(() => parseChatBody('{"messages":[]}'), /1 to 100/);
assert.equal(validateBaseURL('https://argolink.io/v1'), 'https://argolink.io/v1');
assert.throws(() => validateBaseURL('http://example.com/v1'), /HTTPS/);
assert.equal(validateBaseURL('http://127.0.0.1:4000/v1'), 'http://127.0.0.1:4000/v1');
