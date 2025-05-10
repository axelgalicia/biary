import crypto from 'node:crypto';
import * as fs from 'node:fs';

// export const encryptFile = (aesKey, inputPath, outputPath) => {
//   const iv = crypto.randomBytes(12);
//   const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);

//   const input = fs.readFileSync(inputPath);
//   const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
//   const tag = cipher.getAuthTag();

//   fs.writeFileSync(outputPath, Buffer.concat([iv, tag, encrypted]));
//   console.log('File encrypted.');
// }

// export const decryptFile = (aesKey, inputPath, outputPath) => {
//   const data = fs.readFileSync(inputPath);
//   const iv = data.slice(0, 12);
//   const tag = data.slice(12, 28);
//   const encrypted = data.slice(28);

//   const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
//   decipher.setAuthTag(tag);

//   const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
//   fs.writeFileSync(outputPath, decrypted);
//   console.log('File decrypted.');
// }
