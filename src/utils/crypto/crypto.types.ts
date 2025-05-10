export interface EncryptedKeyParams {
  encryptedKey: string;
  salt: string;
  iv: string;
  tag: string;
  version: number;
}