import { setupEncryptedKeyFileData } from "@key-utils/key.utils";

console.log('Biory App v0.0.1')

const setupEncryptedKeyFileDataExe = async () => {
  await setupEncryptedKeyFileData(
    'axel',
    'password',
  );
};

setupEncryptedKeyFileDataExe();