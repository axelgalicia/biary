import { setupEncryptedKeyFileData } from "@key/key";

console.log('Biory App v0.0.1')

const setupEncryptedKeyFileDataExe = async () => {
  await setupEncryptedKeyFileData(
    'sabrine',
    'password',
  );
};

setupEncryptedKeyFileDataExe();