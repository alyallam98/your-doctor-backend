import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { EmailService } from 'src/common/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChangePasswordInput } from './inputs/ChangePassword.input';
import * as bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
import { ERROR_CODES } from 'src/common/constants/errorsCodes';
import { PubSub } from 'graphql-subscriptions';
import { ForgotPasswordInput } from './inputs/forgotPassword.input';
import { ResetPasswordInput } from './inputs/resetPassword.input';
import { OtpService } from '../../common/otp.service';

const pubSub = new PubSub();

@Injectable()
export class AuthPasswordService {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
  ) {}

  async changePassword(input: ChangePasswordInput, userId: string, context) {
    const clientType = context.req.headers['client-type'] || 'Web';

    const user = await this.userService.getUser(userId);
    const isValid = await bcrypt.compare(input.oldPassword, user.password);
    if (!isValid) {
      throw new GraphQLError('old password is wrong', {
        extensions: {
          code: ERROR_CODES.VALIDATION.INVALID_INPUT,
          http: { status: 400 },
        },
      });
    }

    if (input.oldPassword === input.newPassword) {
      throw new GraphQLError('cannot enter new password as old password', {
        extensions: {
          code: ERROR_CODES.VALIDATION.INVALID_INPUT,
          http: { status: 400 },
        },
      });
    }

    const hashPassword = await bcrypt.hash(input.newPassword, 8);

    const userToUpdate = await this.userService.updateUser(userId.toString(), {
      password: hashPassword,
      // @ts-ignore
      $inc: { tokenVersion: 1 },
    });

    const accessTokenPayload = {
      sub: userToUpdate._id.toString(),
      email: userToUpdate.email,
      tokenVersion: userToUpdate.tokenVersion,
    };
    const refreshTokenPayload = {
      sub: userToUpdate._id.toString(),
      email: userToUpdate.email,
      tokenVersion: userToUpdate.tokenVersion,
    };

    const access_token = this.jwtService.sign(accessTokenPayload, {
      secret: this.configService.get('accessSecret'),
      expiresIn: this.configService.get('accessExpiration'),
    });
    const refresh_token = this.jwtService.sign(refreshTokenPayload, {
      secret: this.configService.get('refreshSecret'),
      expiresIn: this.configService.get('refreshExpiration'),
    });

    const response = { access_token };

    if (clientType === 'Web') {
      context.res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    if (clientType === 'Mobile') {
      response['refresh_token'] = refresh_token;
    }

    pubSub.publish('TOKEN_VERSION_UPDATED', {
      forceLogout: true,
      userId: userToUpdate._id.toString(),
    });

    return response;
  }

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await this.userService.findUser({
      email: input.email,
    });

    if (!user || user.deletedAt) {
      // Respond with success anyway to prevent user enumeration
      return { message: 'If this email exists, a reset code was sent.' };
    }

    const { code, expiresAt } = this.otpService.generateOTP({
      length: 6,
      expireIn: 5,
    });
    user.verificationCode = { code, expiresAt };
    await this.userService.updateUser(user._id.toString(), {
      // @ts-ignore
      verificationCode: {
        code,
        expiresAt,
      },
    });
    await this.emailService.sendOtpByEmail(user.email, code);
    return { message: 'Reset code sent to your email.' };
  }

  async resetPassword(input: ResetPasswordInput) {
    const user = await this.userService.findUser({
      email: input.email,
    });

    if (!user || user.deletedAt) {
      throw new GraphQLError('Invalid email or code.', {
        extensions: { code: 'INVALID_INPUT', http: { status: 400 } },
      });
    }

    if (
      !user.verificationCode ||
      this.otpService.isExpired(user.verificationCode.expiresAt) ||
      user.verificationCode.code !== input.code
    ) {
      throw new GraphQLError('Invalid or expired code.', {
        extensions: { code: 'INVALID_CODE', http: { status: 400 } },
      });
    }

    const hashPassword = await bcrypt.hash(input.newPassword, 8);
    // @ts-ignore
    await this.userService.updateUser({
      id: user._id.toString(),
      input: {
        password: hashPassword,
        verificationCode: null,
      },
    });

    return { message: 'Password has been reset successfully.' };
  }
}
