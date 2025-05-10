import * as fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { UTF8_ENCODING } from "../crypto/crypto.constants";
import type { EncryptedKeyParams } from "../crypto/crypto.types";
import { decryptKey, generateEncryptedKey } from "../crypto/crypto.utils";
import { KEY_FILE_NAME, VAULT_DIR_NAME } from "./key-constants";

// Define __filename and __dirname for ES module environments
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VAULT_DIR = path.join(__dirname, "../../../", VAULT_DIR_NAME);
const KEY_FILE = path.join(VAULT_DIR, KEY_FILE_NAME);

const createVaultDirectoryIfRequired = (): void => {
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR);
  }
};

export const setupEncryptedKeyFile = async (
  password: string,
  keyVersion: number
): Promise<EncryptedKeyParams> => {
  createVaultDirectoryIfRequired();

  const encryptedKeyParams = await generateEncryptedKey(password, keyVersion);

  fs.writeFileSync(KEY_FILE, JSON.stringify(encryptedKeyParams, null, 2));

  return encryptedKeyParams;
};

export const unlockEncryptedKey = async (
  password: string
): Promise<Buffer<ArrayBuffer>> => {
  const keyFileContent = fs.readFileSync(KEY_FILE, UTF8_ENCODING);
  const keyParams: EncryptedKeyParams = JSON.parse(keyFileContent);

  return decryptKey(password, keyParams);
};
