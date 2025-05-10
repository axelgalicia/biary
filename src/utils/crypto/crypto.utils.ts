import argon2 from "argon2";
import crypto, { type BinaryLike } from "node:crypto";

import {
  AES_256_GCM_ALGORITHM,
  AES_IV_SIZE,
  AES_KEY_SIZE,
  AES_TAG_SIZE,
  ARGON2_HASH_LENGTH,
  HEX_ENCODING,
  SALT_SIZE,
} from "./crypto.constants";
import type { EncryptedKeyParams } from "./crypto.types";

/**
 * Generates an encrypted AES key using a password and key version.
 * 
 * @param password - The password used to derive the encryption key.
 * @param keyVersion - The version of the key.
 * @returns A promise that resolves to the encrypted key parameters.
 */
export const generateEncryptedKey = async (
  password: string,
  keyVersion: number
): Promise<EncryptedKeyParams> => {
  // Generate a new AES key
  const aesKey = crypto.randomBytes(AES_KEY_SIZE);
  const salt = crypto.randomBytes(SALT_SIZE);

  // Derive key from password using Argon2
  const derivedKey = await argon2.hash(password, {
    salt,
    type: argon2.argon2id,
    hashLength: ARGON2_HASH_LENGTH,
    raw: true,
  });

  // Encrypt AES key with derivedKey
  const iv = crypto.randomBytes(AES_IV_SIZE);
  const cipher = crypto.createCipheriv(AES_256_GCM_ALGORITHM, derivedKey, iv);
  const encryptedKey = Buffer.concat([cipher.update(aesKey), cipher.final()]);
  const tag = cipher.getAuthTag();

  const encryptedKeyParams: EncryptedKeyParams = {
    encryptedKey: encryptedKey.toString(HEX_ENCODING),
    salt: salt.toString(HEX_ENCODING),
    iv: iv.toString(HEX_ENCODING),
    tag: tag.toString(HEX_ENCODING),
    version: keyVersion,
  };

  return encryptedKeyParams;
};

/**
 * Decrypts an encrypted AES key using a password and key parameters.
 * 
 * @param password - The password used to derive the decryption key.
 * @param keyParams - The parameters containing the encrypted key, salt, IV, and tag.
 * @returns A promise that resolves to the decrypted AES key as a Buffer.
 */
export const decryptKey = async (
  password: string,
  keyParams: EncryptedKeyParams
): Promise<Buffer<ArrayBuffer>> => {
  const salt = Buffer.from(keyParams.salt, HEX_ENCODING);

  const derivedKey = await argon2.hash(password, {
    salt,
    type: argon2.argon2id,
    hashLength: ARGON2_HASH_LENGTH,
    raw: true,
  });

  const decipher = crypto.createDecipheriv(
    AES_256_GCM_ALGORITHM,
    derivedKey,
    Buffer.from(keyParams.iv, HEX_ENCODING)
  );

  decipher.setAuthTag(Buffer.from(keyParams.tag, HEX_ENCODING));

  const decryptedKey = Buffer.concat([
    decipher.update(Buffer.from(keyParams.encryptedKey, HEX_ENCODING)),
    decipher.final(),
  ]);

  return decryptedKey; // Use this AES key to encrypt/decrypt files
};

/**
 * Encrypts data using an AES key.
 * 
 * @param aesKey - The AES key used for encryption.
 * @param data - The data to be encrypted.
 * @returns A Buffer containing the IV, authentication tag, and encrypted data.
 */
export const encrypt = (
  aesKey: string,
  data: BinaryLike
): Buffer<ArrayBuffer> => {
  const iv = crypto.randomBytes(AES_IV_SIZE);
  const cipher = crypto.createCipheriv(AES_256_GCM_ALGORITHM, aesKey, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]);
};

/**
 * Decrypts data using an AES key.
 * 
 * @param aesKey - The AES key used for decryption.
 * @param data - The Buffer containing the IV, authentication tag, and encrypted data.
 * @returns A Buffer containing the decrypted data.
 */
export const decrypt = (aesKey: string, data: Buffer<ArrayBuffer>) => {
  const iv = data.subarray(0, AES_IV_SIZE);
  const tag = data.subarray(AES_IV_SIZE, AES_IV_SIZE + AES_TAG_SIZE);
  const encrypted = data.subarray(AES_IV_SIZE + AES_TAG_SIZE);

  const decipher = crypto.createDecipheriv(AES_256_GCM_ALGORITHM, aesKey, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted;
};
