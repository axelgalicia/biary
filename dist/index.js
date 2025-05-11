"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/key/key.ts
var fs = __toESM(require("fs"));
var import_node_path = __toESM(require("path"));

// src/constants.ts
var AES_KEY_SIZE = 32;

// src/utils/crypto/crypto.constants.ts
var AES_256_GCM_ALGORITHM = "aes-256-gcm";
var AES_IV_SIZE = 12;
var SALT_SIZE = 16;
var ARGON2_HASH_LENGTH = 32;
var HEX_ENCODING = "hex";

// src/utils/crypto/crypto.utils.ts
var import_argon2 = __toESM(require("argon2"));
var import_node_crypto = __toESM(require("crypto"));
var getRandomBytes = (size) => {
  return import_node_crypto.default.randomBytes(size);
};
var convertToHex = (buffer) => {
  return buffer.toString(HEX_ENCODING);
};
var generateEncryptedKeyData = async (password) => {
  const aesKey = getRandomBytes(AES_KEY_SIZE);
  const salt = getRandomBytes(SALT_SIZE);
  const derivedKey = await import_argon2.default.hash(password, {
    salt,
    type: import_argon2.default.argon2id,
    hashLength: ARGON2_HASH_LENGTH,
    raw: true
  });
  const iv = getRandomBytes(AES_IV_SIZE);
  const cipher = import_node_crypto.default.createCipheriv(AES_256_GCM_ALGORITHM, derivedKey, iv);
  const encryptedKey = Buffer.concat([cipher.update(aesKey), cipher.final()]);
  const tag = cipher.getAuthTag();
  const encryptedKeyData = {
    encryptedKey: encryptedKey.toString(HEX_ENCODING),
    salt: salt.toString(HEX_ENCODING),
    iv: iv.toString(HEX_ENCODING),
    tag: tag.toString(HEX_ENCODING)
  };
  return encryptedKeyData;
};

// src/key/key-constants.ts
var VAULT_DIR_NAME = ".vault";
var KEY_FILE_EXTENSION = ".json";
var KEY_FILE_PREFIX_NAME = "biory-key";

// src/key/key.ts
var VAULT_DIR = import_node_path.default.join(__dirname, "../", VAULT_DIR_NAME);
var getKeyFilePathByUsername = (username) => {
  const fileName = `${username}-${KEY_FILE_PREFIX_NAME}${KEY_FILE_EXTENSION}`;
  return import_node_path.default.join(VAULT_DIR, fileName);
};
var createVaultDirectoryIfRequired = () => {
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR);
    console.log(`Biory App: Vault directory created at ${VAULT_DIR}`);
  }
};
var generateRecoveryCodeString = () => {
  const randomBytes = getRandomBytes(AES_KEY_SIZE);
  return convertToHex(randomBytes);
};
var setupEncryptedKeyFileData = async (username, password) => {
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
  const encryptedKeyFileData = {
    username,
    passwordKey,
    recoveryKey
  };
  fs.writeFileSync(keyFilePath, JSON.stringify(encryptedKeyFileData, null, 2));
  console.log(`Biory key saved: ${keyFilePath}`);
  return {
    ...encryptedKeyFileData,
    recoveryCode: recoveryCodeHex
  };
};

// src/index.ts
console.log("Biory App v0.0.1");
var setupEncryptedKeyFileDataExe = async () => {
  await setupEncryptedKeyFileData(
    "sabrine",
    "password"
  );
};
setupEncryptedKeyFileDataExe();
//# sourceMappingURL=index.js.map