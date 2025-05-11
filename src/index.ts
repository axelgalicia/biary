import { setupEncryptedKeyFileData } from "@key/key";

console.log('Biory App v0.0.1 (Beta)')

const setupEncryptedKeyFileDataExe = async () => {
  await setupEncryptedKeyFileData(
    'testuser',
    'password',
  );
};

setupEncryptedKeyFileDataExe();