export class DecryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DecryptionError";
  }
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const binString = atob(base64 + padding);
  return Uint8Array.from(binString, (c) => c.charCodeAt(0));
}

async function deriveKeys(secret: string, salt: string) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  const signingKeyBuf = derivedBits.slice(0, 16);
  const encryptionKeyBuf = derivedBits.slice(16, 32);

  const signingKey = await crypto.subtle.importKey(
    "raw",
    signingKeyBuf,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

  const encryptionKey = await crypto.subtle.importKey(
    "raw",
    encryptionKeyBuf,
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );

  return { signingKey, encryptionKey };
}

export async function decryptPayload(
  encryptedToken: string,
  secretKey?: string,
  saltValue?: string
): Promise<unknown> {
  const secret =
    secretKey ||
    process.env.ENCRYPTION_SECRET ||
    process.env.NEXT_PUBLIC_ENCRYPTION_SECRET;
  const salt =
    saltValue ||
    process.env.ENCRYPTION_SALT ||
    process.env.NEXT_PUBLIC_ENCRYPTION_SALT;

  if (!secret || !salt) {
    console.warn(
      "Missing encryption keys (ENCRYPTION_SECRET or ENCRYPTION_SALT). Returning raw token."
    );
    return null;
  }

  try {
    const data = base64UrlToUint8Array(encryptedToken);

    if (data.length < 57) {
      throw new DecryptionError("Token too short");
    }

    const version = data[0];
    if (version !== 0x80) {
      throw new DecryptionError("Unsupported Fernet version");
    }
    // Components
    const iv = data.slice(9, 25);
    const hmac = data.slice(data.length - 32);
    const ciphertext = data.slice(25, data.length - 32);

    const dataToSign = data.slice(0, data.length - 32);

    const { signingKey, encryptionKey } = await deriveKeys(secret, salt);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      signingKey,
      hmac,
      dataToSign
    );

    if (!isValid) {
      throw new DecryptionError("Invalid HMAC signature");
    }

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      encryptionKey,
      ciphertext
    );

    const dec = new TextDecoder();
    const jsonString = dec.decode(decryptedBuffer);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new DecryptionError("Failed to decrypt payload");
  }
}
