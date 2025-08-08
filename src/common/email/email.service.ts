import { Injectable, Inject } from '@nestjs/common';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(
    @Inject('NODEMAILER_TRANSPORTER') private transporter: Transporter,
  ) {}

  async sendEmail(to: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: 'Test Email from NestJS',
        text: 'This is a plain text email body',
        html: '<b>This is an HTML email body</b>',
      });
      console.log('Email sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
  async sendOtpByEmail(to: string, code: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: 'Test Email from NestJS',
        text: `Verification Code`,
        html: `This is a OTP ${code} use it to verify you account`,
      });
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
