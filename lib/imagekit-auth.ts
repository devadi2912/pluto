
import { IK_CONFIG } from './imagekit-config';

/**
 * Generates an HMAC-SHA1 signature for ImageKit authentication.
 * Uses Web Crypto API to work in the browser without Node.js polyfills.
 * Segregated to keep security logic isolated.
 */
export async function generateSignature(token: string, expire: string): Promise<string> {
  const keyString = IK_CONFIG.privateKey;
  const dataString = token + expire;

  const enc = new TextEncoder();
  const keyData = enc.encode(keyString);
  const dataData = enc.encode(dataString);

  const key = await window.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const signatureBuffer = await window.crypto.subtle.sign("HMAC", key, dataData);
  
  // Convert ArrayBuffer to Hex String
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return signatureHex;
}
