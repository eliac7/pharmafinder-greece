import crypto, { Cipher, Decipher } from "crypto";

const algorithm = "aes-256-ctr";

interface EncryptedData {
  iv: string;
  content: string;
}

export const encrypt = (text: string, secretKey: string): EncryptedData => {
  const keyBuffer = Buffer.from(secretKey, "hex");
  const iv = crypto.randomBytes(16);
  const cipher: Cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);

  try {
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return {
      iv: iv.toString("hex"),
      content: encrypted.toString("hex"),
    };
  } catch (error) {
    console.error("Error during encryption:", error);
    throw error;
  }
};

export const decrypt = (hash: EncryptedData, secretKey: string): string => {
  const keyBuffer = Buffer.from(secretKey, "hex");
  const ivBuffer = Buffer.from(hash.iv, "hex");

  try {
    const decipher: Decipher = crypto.createDecipheriv(
      algorithm,
      keyBuffer,
      ivBuffer,
    );
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(hash.content, "hex")),
      decipher.final(),
    ]);

    return decrypted.toString();
  } catch (error) {
    console.error("Error during decryption:", error);
    throw error;
  }
};
