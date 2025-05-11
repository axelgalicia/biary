import type { EncryptedKeyData } from "../common/utils.types";

export interface EncryptedKeyFileData {
  username: string;
  passwordKey: EncryptedKeyData;
  recoveryKey: EncryptedKeyData;
}

export interface GeneratedEncryptedKeyFileData extends EncryptedKeyFileData {
  recoveryCode: string;
}
