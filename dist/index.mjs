var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// src/utils/common/utils.constants.ts
var AES_KEY_SIZE;
var init_utils_constants = __esm({
  "src/utils/common/utils.constants.ts"() {
    "use strict";
    AES_KEY_SIZE = 32;
  }
});

// src/utils/crypto/crypto.constants.ts
var AES_256_GCM_ALGORITHM, AES_IV_SIZE, SALT_SIZE, ARGON2_HASH_LENGTH, HEX_ENCODING;
var init_crypto_constants = __esm({
  "src/utils/crypto/crypto.constants.ts"() {
    "use strict";
    AES_256_GCM_ALGORITHM = "aes-256-gcm";
    AES_IV_SIZE = 12;
    SALT_SIZE = 16;
    ARGON2_HASH_LENGTH = 32;
    HEX_ENCODING = "hex";
  }
});

// src/utils/crypto/crypto.utils.ts
import argon2 from "argon2";
import crypto from "node:crypto";
var getRandomBytes, convertToHex, generateEncryptedKeyData;
var init_crypto_utils = __esm({
  "src/utils/crypto/crypto.utils.ts"() {
    "use strict";
    init_crypto_constants();
    init_utils_constants();
    getRandomBytes = (size) => {
      return crypto.randomBytes(size);
    };
    convertToHex = (buffer) => {
      return buffer.toString(HEX_ENCODING);
    };
    generateEncryptedKeyData = async (password) => {
      const aesKey = getRandomBytes(AES_KEY_SIZE);
      const salt = getRandomBytes(SALT_SIZE);
      const derivedKey = await argon2.hash(password, {
        salt,
        type: argon2.argon2id,
        hashLength: ARGON2_HASH_LENGTH,
        raw: true
      });
      const iv = getRandomBytes(AES_IV_SIZE);
      const cipher = crypto.createCipheriv(AES_256_GCM_ALGORITHM, derivedKey, iv);
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
  }
});

// src/utils/key/key-constants.ts
var VAULT_DIR_NAME, KEY_FILE_EXTENSION, KEY_FILE_PREFIX_NAME;
var init_key_constants = __esm({
  "src/utils/key/key-constants.ts"() {
    "use strict";
    VAULT_DIR_NAME = ".vault";
    KEY_FILE_EXTENSION = ".json";
    KEY_FILE_PREFIX_NAME = "biory-key";
  }
});

// src/utils/key/key.utils.ts
import * as fs from "node:fs";
import path from "node:path";
var VAULT_DIR, getKeyFilePathByUsername, createVaultDirectoryIfRequired, generateRecoveryCodeString, setupEncryptedKeyFileData;
var init_key_utils = __esm({
  "src/utils/key/key.utils.ts"() {
    "use strict";
    init_utils_constants();
    init_crypto_constants();
    init_crypto_utils();
    init_key_constants();
    VAULT_DIR = path.join(__dirname, "../", VAULT_DIR_NAME);
    getKeyFilePathByUsername = (username) => {
      const fileName = `${username}-${KEY_FILE_PREFIX_NAME}${KEY_FILE_EXTENSION}`;
      return path.join(VAULT_DIR, fileName);
    };
    createVaultDirectoryIfRequired = () => {
      if (!fs.existsSync(VAULT_DIR)) {
        fs.mkdirSync(VAULT_DIR);
      }
      console.log(`Biory App: Vault directory created at ${VAULT_DIR}`);
    };
    generateRecoveryCodeString = () => {
      const randomBytes = getRandomBytes(AES_KEY_SIZE);
      return convertToHex(randomBytes);
    };
    setupEncryptedKeyFileData = async (username, password) => {
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
  }
});

// src/index.ts
var require_index = __commonJS({
  "src/index.ts"() {
    init_key_utils();
    console.log("Biory App v0.0.1");
    var setupEncryptedKeyFileDataExe = async () => {
      await setupEncryptedKeyFileData(
        "axel",
        "password"
      );
    };
    setupEncryptedKeyFileDataExe();
  }
});
export default require_index();
//# sourceMappingURL=index.mjs.map