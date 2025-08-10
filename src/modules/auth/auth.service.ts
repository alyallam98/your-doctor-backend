import { ConflictException, Injectable } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginInput } from './inputs/loginInput';
import { RegisterInput } from './inputs/registerInput';
import { EmailService } from '../../common/email/email.service';
import { ConfigService } from '@nestjs/config';
import { GraphQLError } from 'graphql';
import { ERROR_CODES } from 'src/common/constants/errorsCodes';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessages';
import { VerifyEmailInput } from './inputs/verifyEmail.input';

import { PubSub } from 'graphql-subscriptions';

import { CreateUserInput } from '../user/inputs/ceate-user.Input';
import { OtpService } from '../../common/otp.service';
const pubSub = new PubSub();

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
  ) {}

  async register(input: CreateUserInput) {
    const isUserExists = await this.userService.findUser({
      email: input.email,
    });

    if (isUserExists) {
      throw new ConflictException('User already exists');
    }

    const createdUser = await this.userService.createUser({
      email: input.email,
      password: input.password,
      name: input.name,
    });

    // await this.emailService.sendOtpByEmail(
    //   createdUser.email,
    //   createdUser.verificationCode.code,
    // );

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
      verificationToken:
        process.env.NODE_ENV === 'development'
          ? createdUser.verificationCode.code
          : null,
    };
  }

  async login(input: LoginInput, context) {
    const { email, password } = input;
    const clientType = context.req.headers['client-type'] || 'Web';

    const isUserExists = await this.userService.findUser({
      email,
    });
    //{ select: '_id email password isActive deletedAt' } This reduces database load. // ✅ Fetch only necessary fields

    if (!isUserExists) {
      throw new GraphQLError(ERROR_MESSAGES.INVALID_CREDENTIALS, {
        extensions: {
          code: ERROR_CODES.AUTH.UNAUTHORIZED, //
          http: { status: 401 },
        },
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      isUserExists.password,
    );

    if (!isPasswordValid) {
      throw new GraphQLError(ERROR_MESSAGES.INVALID_CREDENTIALS, {
        extensions: {
          code: ERROR_CODES.AUTH.UNAUTHORIZED, //
          http: { status: 401 },
        },
      });
    }

    // if (!isUserExists.isVerified) {
    //   throw new GraphQLError(ERROR_MESSAGES.UNVERIFIED_USER, {
    //     extensions: {
    //       code: ERROR_CODES.AUTH.FORBIDDEN, //
    //       http: { status: 403 },
    //     },
    //   });
    // }
    // if (isUserExists.deletedAt) {
    //   throw new GraphQLError(ERROR_MESSAGES.DELETED_USER, {
    //     extensions: {
    //       code: ERROR_CODES.AUTH.FORBIDDEN, //
    //       http: { status: 403 },
    //     },
    //   });
    // }
    // if (!isUserExists.isActive) {
    //   throw new GraphQLError(ERROR_MESSAGES.INACTIVE_USER, {
    //     extensions: {
    //       code: ERROR_CODES.AUTH.FORBIDDEN,
    //       http: { status: 403 },
    //     },
    //   });
    // }

    const accessTokenPayload = {
      sub: isUserExists._id.toString(),
      email: isUserExists.email,
      tokenVersion: isUserExists.tokenVersion,
    };
    const refreshTokenPayload = {
      sub: isUserExists._id.toString(),
      email: isUserExists.email,
      tokenVersion: isUserExists.tokenVersion,
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

    return response;
  }

  async refreshAccessToken(refreshToken: string, context: any) {
    if (!refreshToken) {
      throw new GraphQLError('Refresh token not provided', {
        extensions: {
          code: ERROR_CODES.AUTH.UNAUTHORIZED,
          http: { status: 401 },
        },
      });
    }

    let payload;
    try {
      // Verify refresh token
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('refreshSecret'),
      });
    } catch (error) {
      throw new GraphQLError('Invalid or expired refresh token', {
        extensions: {
          code: ERROR_CODES.AUTH.UNAUTHORIZED,
          http: { status: 401 },
        },
      });
    }

    // Get user and validate token version
    const user = await this.userService.getUser(payload.sub);
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      throw new GraphQLError('Token version mismatch', {
        extensions: {
          code: ERROR_CODES.AUTH.UNAUTHORIZED,
          http: { status: 401 },
        },
      });
    }

    // Check user status
    // if (!user.isVerified || user.deletedAt || !user.isActive) {
    //   throw new GraphQLError('User account is not active', {
    //     extensions: {
    //       code: ERROR_CODES.AUTH.FORBIDDEN,
    //       http: { status: 403 },
    //     },
    //   });
    // }

    const accessTokenPayload = {
      sub: user._id.toString(),
      email: user.email,
      tokenVersion: user.tokenVersion,
    };

    const newAccessToken = this.jwtService.sign(accessTokenPayload, {
      secret: this.configService.get('accessSecret'),
      expiresIn: this.configService.get('accessExpiration'),
    });

    const response = { access_token: newAccessToken };

    return response;
  }

  async incrementTokenVersion(userId: string) {
    await this.userService.updateUser(userId.toString(), {
      // @ts-ignore
      $inc: { tokenVersion: 1 },
    });
  }

  async verifyEmail(input: VerifyEmailInput) {
    const isUserExists = await this.userService.findUser({
      email: input.email,
    });

    if (!isUserExists) {
      throw new GraphQLError(ERROR_MESSAGES.USER_NOTFOUND, {
        extensions: {
          code: ERROR_CODES.USER.NOT_FOUND,
          http: { status: 404 },
        },
      });
    }
    if (isUserExists.isVerified) {
      return {
        message: 'verified',
        success: true,
      };
    }

    const isCodeExpires = this.otpService.isExpired(
      isUserExists.verificationCode.expiresAt,
    );
    if (isCodeExpires || isUserExists.verificationCode.code !== input.code) {
      throw new GraphQLError('invalid code or expire', {
        extensions: {
          code: ERROR_CODES.VALIDATION.INVALID_INPUT,
          http: { status: 400 },
        },
      });
    }

    await this.userService.updateUser(isUserExists._id.toString(), {
      // @ts-ignore
      isVerified: true,
      verificationCode: null,
    });

    return { success: true, message: 'verified done' };
  }
}
