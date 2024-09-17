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
    return JSON.parse(str);
  }

  // Mã hóa chuỗi
  encrypt(plainText: string, secret: string): string {
    return CryptoJS.AES.encrypt(plainText, secret).toString();
  }

  // Giải mã chuỗi
  decrypt(cipherText: string, secret: string): string {
    const bytes = CryptoJS.AES.decrypt(cipherText, secret);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Mã hóa object
  encryptObj(obj: object, secret: string): string {
    return this.encrypt(this.objectToString(obj), secret);
  }

  // Giải mã object
  decryptObj<T>(cipherText: string, secret: string): T {
    try {
      return this.stringToObject<T>(this.decrypt(cipherText, secret));
    } catch (error) {
      ErrorHelper.BadRequestException('Invalid token');
    }
  }

  // Kiểm tra token có hết hạn không
  expiresCheck(
    token: string,
    secret: string,
    timeDiff: number = 0,
  ): { isExpired: boolean; payload: any } {
    const payload = this.decryptObj<any>(token, secret);
    const isExpired = Date.now() + timeDiff > payload?.expires;
    return { isExpired, payload };
  }
}
