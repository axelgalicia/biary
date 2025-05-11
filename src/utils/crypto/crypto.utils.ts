/**
 * @file crypto.utils.ts
 * @description Utility functions for cryptographic operations, including AES encryption/decryption and Argon2 key derivation.
 */

import argon2 from "argon2";
import crypto, { type BinaryLike } from "node:crypto";

import {
  AES_256_GCM_ALGORITHM,
  AES_IV_SIZE,
  AES_TAG_SIZE,
  ARGON2_HASH_LENGTH,
  HEX_ENCODING,
  SALT_SIZE,
} from "./crypto.constants";

import type { EncryptedKeyData } from "../../types";
import { AES_KEY_SIZE } from "../../constants";

/**
 * Generates a buffer of random bytes of the specified size.
 *
 * @param size - The number of random bytes to generate.
 * @returns A Buffer containing the random bytes.
 */
export const getRandomBytes = (size: number): Buffer => {
  return crypto.randomBytes(size);
};

/**
 * Converts a Buffer to a hexadecimal string.
 *
 * @param buffer - The Buffer to convert.
 * @returns A string representing the hexadecimal encoding of the buffer.
 */
export const convertToHex = (buffer: Buffer): string => {
  return buffer.toString(HEX_ENCODING);
};

/**
 * Generates an encrypted AES key using a password.
 *
 * @param password - The password used to derive the encryption key.
 * @returns A promise that resolves to the encrypted key parameters.
 */
export const generateEncryptedKeyData = async (
  password: string
): Promise<EncryptedKeyData> => {
  const aesKey = getRandomBytes(AES_KEY_SIZE);
  const salt = getRandomBytes(SALT_SIZE);

  const derivedKey = await argon2.hash(password, {
    salt,
    type: argon2.argon2id,
    hashLength: ARGON2_HASH_LENGTH,
    raw: true,
  });

  const iv = getRandomBytes(AES_IV_SIZE);
  const cipher = crypto.createCipheriv(AES_256_GCM_ALGORITHM, derivedKey, iv);
  const encryptedKey = Buffer.concat([cipher.update(aesKey), cipher.final()]);
  const tag = cipher.getAuthTag();

  const encryptedKeyData: EncryptedKeyData = {
    encryptedKey: encryptedKey.toString(HEX_ENCODING),
    salt: salt.toString(HEX_ENCODING),
    iv: iv.toString(HEX_ENCODING),
    tag: tag.toString(HEX_ENCODING),
  };

  return encryptedKeyData;
};

/**
 * Decrypts an encrypted AES key using a password and key parameters.
 *
 * @param password - The password used to derive the decryption key.
 * @param keyData - The parameters containing the encrypted key, salt, IV, and tag.
 * @returns A promise that resolves to the decrypted AES key as a Buffer.
 */
export const decryptKeyData = async (
  password: string,
  keyData: EncryptedKeyData
): Promise<Buffer> => {
  const { encryptedKey, salt, iv, tag } = keyData;

  const derivedKey = await argon2.hash(password, {
    salt: Buffer.from(salt, HEX_ENCODING),
    type: argon2.argon2id,
    hashLength: ARGON2_HASH_LENGTH,
    raw: true,
  });

  const decipher = crypto.createDecipheriv(
    AES_256_GCM_ALGORITHM,
    derivedKey,
    Buffer.from(iv, HEX_ENCODING)
  );

  decipher.setAuthTag(Buffer.from(tag, HEX_ENCODING));

  const decryptedKey = Buffer.concat([
    decipher.update(Buffer.from(encryptedKey, HEX_ENCODING)),
    decipher.final(),
  ]);

  return decryptedKey;
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
): Buffer => {
  const iv = getRandomBytes(AES_IV_SIZE);
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
export const decrypt = (aesKey: string, data: Buffer): Buffer => {
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
