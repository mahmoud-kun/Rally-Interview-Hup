import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {webcrypto, pbkdf2Sync} from 'node:crypto';
const path=new URL('../assets/operations-roster.enc.json',import.meta.url);

test('Published roster is encrypted, structurally valid and does not contain plaintext applicant names',()=>{
 const encrypted=readFileSync(path,'utf8');
 const payload=JSON.parse(encrypted);
 assert.equal(payload.version,1);assert.equal(payload.kdf,'PBKDF2-SHA256');
 assert.equal(payload.cipher,'AES-256-GCM');assert.equal(payload.iterations,310000);
 assert(!encrypted.includes('\"entries\"'));
 assert(!encrypted.includes('\"name\"'));
 assert.match(payload.data,/^[A-Za-z0-9+/=]+$/);
});