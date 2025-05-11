/**
 * Functions for managing encrypted key files in the Biory application.
 * This module provides functionality to create, store, and retrieve encrypted key files,
 * as well as generate recovery codes and manage the vault directory.
 */

import * as fs from "node:fs";
import path from "node:path";
import { AES_KEY_SIZE } from "../constants";
import type { EncryptedKeyData } from "../types";
import { UTF8_ENCODING } from "../utils/crypto/crypto.constants";
import {
  convertToHex,
  decryptKeyData,
  generateEncryptedKeyData,
  getRandomBytes,
} from "../utils/crypto/crypto.utils";
import {
  KEY_FILE_EXTENSION,
  KEY_FILE_PREFIX_NAME,
  VAULT_DIR_NAME,
} from "./key-constants";
import type {
  EncryptedKeyFileData,
  GeneratedEncryptedKeyFileData,
} from "./key.types";

const VAULT_DIR = path.join(__dirname, "../", VAULT_DIR_NAME);

/**
 * Constructs the file path for a user's key file based on their username.
 *
 * @param username - The username associated with the key file.
 * @returns The full file path to the user's key file.
 */
const getKeyFilePathByUsername = (username: string): string => {
  const fileName = `${username}-${KEY_FILE_PREFIX_NAME}${KEY_FILE_EXTENSION}`;
  return path.join(VAULT_DIR, fileName);
};

/**
 * Ensures the vault directory exists, creating it if necessary.
 *
 * If the directory does not exist, it will be created and a log message will be displayed.
 */
const createVaultDirectoryIfRequired = (): void => {
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR);
    console.log(`Biory App: Vault directory created at ${VAULT_DIR}`);
  }
};

/**
 * Generates a random recovery code as a hexadecimal string.
 *
 * The recovery code is generated using random bytes of size AES_KEY_SIZE.
 * @returns A hexadecimal string representing the recovery code.
 */
const generateRecoveryCodeString = (): string => {
  const randomBytes = getRandomBytes(AES_KEY_SIZE);
  return convertToHex(randomBytes);
};

/**
 * Sets up an encrypted key file for a user, storing their password and recovery key.
 *
 * This function creates the vault directory if required, generates encrypted key data
 * for the user's password and a recovery code, and saves the data to a file.
 *
 * @param username - The username for which the key file is being created.
 * @param password - The password to encrypt and store in the key file.
 * @returns The generated encrypted key file data, including the recovery code, or null if the file already exists.
 */
export const setupEncryptedKeyFileData = async (
  username: string,
  password: string
): Promise<GeneratedEncryptedKeyFileData | null> => {
  createVaultDirectoryIfRequired();

  const passwordKey = await generateEncryptedKeyData(password);
  const recoveryCodeHex = generateRecoveryCodeString();
  const recoveryKey = await generateEncryptedKeyData(recoveryCodeHex);

  const keyFilePath = getKeyFilePathByUsername(username);

  if (fs.existsSync(keyFilePath)) {
    console.log(
      `Biory key file already exists: ${keyFilePath}, delete existing file to create a new one.`
    );
    return null;
  }

  const encryptedKeyFileData: EncryptedKeyFileData = {
    username,
    passwordKey,
    recoveryKey,
  };

  fs.writeFileSync(keyFilePath, JSON.stringify(encryptedKeyFileData, null, 2));

  console.log(`Biory key saved: ${keyFilePath}`);

  return {
    ...encryptedKeyFileData,
    recoveryCode: recoveryCodeHex,
  } as GeneratedEncryptedKeyFileData;
};

/**
 * Unlocks and decrypts the encrypted key data for a user using their password.
 *
 * This function reads the user's key file, parses the encrypted key data,
 * and decrypts it using the provided password.
 *
 * @param username - The username associated with the key file.
 * @param password - The password used to decrypt the key data.
 * @returns A buffer containing the decrypted key data.
 */
export const unlockEncryptedKey = async (
  username: string,
  password: string
): Promise<Buffer<ArrayBuffer>> => {
  const keyFilePath = getKeyFilePathByUsername(username);
  const keyFileContent = fs.readFileSync(keyFilePath, UTF8_ENCODING);
  const encryptedKeyData: EncryptedKeyData = JSON.parse(keyFileContent);

  return decryptKeyData(password, encryptedKeyData);
};
