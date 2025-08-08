import { Injectable } from '@nestjs/common';
import * as otpGenerator from 'otp-generator';

interface GenerateOTPOptions {
  expireIn?: number; // in seconds
  length?: number;
}

@Injectable()
export class OtpService {
  generateOTP(options: GenerateOTPOptions): { code: string; expiresAt: Date } {
    const { expireIn = 5, length = 6 } = options;
    const code = otpGenerator.generate(length, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    return {
      code,
      expiresAt: new Date(Date.now() + expireIn * 60 * 1000),
    };
  }

  isExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }
}
