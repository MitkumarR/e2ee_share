// Create a new file: src/utils/crypto.js

// Helper to convert a string to an ArrayBuffer
const strToBuffer = (str) => {
    return new TextEncoder().encode(str);
};

// Helper to convert an ArrayBuffer to a Base64 string
export const bufferToBase64 = (buffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

// Generates a secure, random 32-byte secret for the URL fragment
export const generateLinkSecret = () => {
    const randomBytes = window.crypto.getRandomValues(new Uint8Array(32));
    return bufferToBase64(randomBytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''); // URL-safe Base64
};

// Derives a key-wrapping key from the link secret using SHA-256
const deriveWrappingKey = async (secret) => {
  const secretBuffer = strToBuffer(secret);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', secretBuffer);
  return await window.crypto.subtle.importKey('raw', hashBuffer, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
};

// Encrypts (wraps) the file's AES key using the derived wrapping key
export const wrapFileKey = async (fileKey, linkSecret) => {
    const wrappingKey = await deriveWrappingKey(linkSecret);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Export the raw file key to be wrapped
    const rawFileKey = await window.crypto.subtle.exportKey('raw', fileKey);

    const wrappedKeyBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        wrappingKey,
        rawFileKey
    );

    const ivAndCiphertext = new Uint8Array(iv.length + wrappedKeyBuffer.byteLength);
    ivAndCiphertext.set(iv);
    ivAndCiphertext.set(new Uint8Array(wrappedKeyBuffer), iv.length);

    return bufferToBase64(ivAndCiphertext);
};