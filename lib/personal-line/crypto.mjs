// Shared by the browser and Mac. The relay never receives this encryption key.
const bytes = (text) => Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
const encode = (data) => btoa(Array.from(new Uint8Array(data), b => String.fromCharCode(b)).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export function newKey() { return encode(crypto.getRandomValues(new Uint8Array(32))); }
export function encodePairing(value) { return 'nightos-line-v1.' + encode(new TextEncoder().encode(JSON.stringify(value))); }
export function decodePairing(code) {
  if (!code.startsWith('nightos-line-v1.') || code.length > 4096) throw new Error('invalid_pairing');
  return JSON.parse(new TextDecoder().decode(bytes(code.slice(16))));
}
async function key(raw) {
  const value = bytes(raw);
  if (value.length !== 32) throw new Error('invalid_key');
  return crypto.subtle.importKey('raw', value, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
/** @param {string} raw @param {string} context @param {unknown} value */
export async function seal(raw, context, value) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({name:'AES-GCM', iv, additionalData:new TextEncoder().encode('nightos-line-v1:' + context)}, await key(raw), new TextEncoder().encode(JSON.stringify(value)));
  return encode(iv) + '.' + encode(ciphertext);
}
/** @param {string} raw @param {string} context @param {string} value */
export async function open(raw, context, value) {
  const parts = value.split('.');
  if (parts.length !== 2 || bytes(parts[0]).length !== 12) throw new Error('invalid_ciphertext');
  const plaintext = await crypto.subtle.decrypt({name:'AES-GCM', iv:bytes(parts[0]), additionalData:new TextEncoder().encode('nightos-line-v1:' + context)}, await key(raw), bytes(parts[1]));
  return JSON.parse(new TextDecoder().decode(plaintext));
}
