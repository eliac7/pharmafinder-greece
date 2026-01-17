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
    ["encrypt", "decrypt"]
  );

  return { signingKey, encryptionKey };
}

function uint8ArrayToBase64Url(uint8Array: Uint8Array): string {
  const binString = Array.from(uint8Array, (c) => String.fromCharCode(c)).join(
    ""
  );
  const base64 = btoa(binString);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pad(data: Uint8Array): Uint8Array {
  const blockSize = 16;
  const padding = blockSize - (data.length % blockSize);
  const padded = new Uint8Array(data.length + padding);
  padded.set(data);
  padded.fill(padding, data.length);
  return padded;
}

function unpad(data: Uint8Array): Uint8Array {
  const padLen = data[data.length - 1];
  if (padLen < 1 || padLen > 16) {
    return data;
  }
  for (let i = 0; i < padLen; i++) {
    if (data[data.length - 1 - i] !== padLen) {
      return data;
    }
  }
  return data.slice(0, data.length - padLen);
}

export async function encryptPayload(
  payload: unknown,
  secretKey?: string,
  saltValue?: string
): Promise<string | null> {
  const secret =
    secretKey ||
    process.env.ENCRYPTION_SECRET ||
    process.env.NEXT_PUBLIC_ENCRYPTION_SECRET;
  const salt =
    saltValue ||
    process.env.ENCRYPTION_SALT ||
    process.env.NEXT_PUBLIC_ENCRYPTION_SALT;

  if (!secret || !salt) {
    console.warn("Missing encryption keys. Returning null.");
    return null;
  }

  try {
    const jsonString = JSON.stringify(payload);
    const enc = new TextEncoder();
    const data = enc.encode(jsonString);

    const { signingKey, encryptionKey } = await deriveKeys(secret, salt);

    // IV
    const iv = crypto.getRandomValues(new Uint8Array(16));

    // Timestamp (64-bit Big Endian)
    const timestamp = Math.floor(Date.now() / 1000);
    const timeBuffer = new Uint8Array(8);
    const view = new DataView(timeBuffer.buffer);
    view.setBigUint64(0, BigInt(timestamp), false); // false for BigEndian

    // Encrypt (AES-CBC requires padding)
    const paddedData = pad(data);
    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      encryptionKey,
      paddedData.buffer as BufferSource
    );
    const ciphertext = new Uint8Array(ciphertextBuffer);

    // Assemble parts for signing: Version (0x80) + Timestamp + IV + Ciphertext
    const version = new Uint8Array([0x80]);
    const dataToSignLength =
      version.length + timeBuffer.length + iv.length + ciphertext.length;
    const dataToSign = new Uint8Array(dataToSignLength);

    let offset = 0;
    dataToSign.set(version, offset);
    offset += version.length;
    dataToSign.set(timeBuffer, offset);
    offset += timeBuffer.length;
    dataToSign.set(iv, offset);
    offset += iv.length;
    dataToSign.set(ciphertext, offset);

    // Sign (HMAC)
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      signingKey,
      dataToSign
    );
    const signature = new Uint8Array(signatureBuffer);

    // Final Token: dataToSign + HMAC
    const finalToken = new Uint8Array(dataToSign.length + signature.length);
    finalToken.set(dataToSign);
    finalToken.set(signature, dataToSign.length);

    return uint8ArrayToBase64Url(finalToken);
  } catch (error) {
    console.error("Encryption failed:", error);
    return null;
  }
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

    const unpadded = unpad(new Uint8Array(decryptedBuffer));
    const dec = new TextDecoder();
    const jsonString = dec.decode(unpadded);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new DecryptionError("Failed to decrypt payload");
  }
}
