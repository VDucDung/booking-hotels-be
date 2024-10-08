import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { ErrorHelper } from 'src/common/helpers';

@Injectable()
export class CryptoService {
  // Chuyển object sang string
  private objectToString(obj: object): string {
    return JSON.stringify(obj);
  }

  // Chuyển string sang object
  private stringToObject<T>(str: string): T {
    try {
      return JSON.parse(str);
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error('Failed to parse JSON');
    }
  }

  // Mã hóa chuỗi
  encrypt(plainText: string, secret: string): string {
    return CryptoJS.AES.encrypt(plainText, secret).toString();
  }

  // Giải mã chuỗi
  decrypt(cipherText: string, secret: string): string {
    const bytes = CryptoJS.AES.decrypt(cipherText, secret);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedText) {
      throw new Error('Decryption failed or resulted in an empty string');
    }

    return decryptedText;
  }

  // Mã hóa object
  encryptObj(obj: object, secret: string): string {
    return this.encrypt(this.objectToString(obj), secret);
  }

  // Giải mã object
  decryptObj<T>(cipherText: string, secret: string): T {
    try {
      const decryptedText = this.decrypt(cipherText, secret);

      if (!decryptedText) {
        throw new Error('Decrypted text is empty');
      }
      return this.stringToObject<T>(decryptedText as string);
    } catch (error) {
      console.error('Decryption or parsing error:', error);
      ErrorHelper.BadRequestException('Invalid token');
    }
  }

  // Kiểm tra token có hết hạn không
  expiresCheck(
    token: string,
    secret: string,
    timeDiff: number = 0,
  ): { isExpired: boolean; payload: any } {
    try {
      const { isExpired, payload } = this._expiresCheck(
        token,
        secret,
        timeDiff,
      );
      return { isExpired, payload };
    } catch (error) {
      throw error;
    }
  }

  private _expiresCheck(
    token: string,
    secret: string,
    timeDiff: number = 0,
  ): { isExpired: boolean; payload: any } {
    const payload = this.decryptObj<any>(token, secret);
    const isExpired = Date.now() + timeDiff > payload?.expires;
    return { isExpired, payload };
  }
}
