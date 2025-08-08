import {
  Args,
  Context,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Headers, UseGuards } from '@nestjs/common';
import { LoginInput } from './inputs/loginInput';
import { UserType } from '../user/types/user.type';
import { RegisterResponse } from './types/RegisterResponse';
import { LoginResponse } from './types/LoginResponse';
import { VerifyEmailResponse } from './types/VerifyEmailResponse';
import { VerifyEmailInput } from './inputs/verifyEmail.input';
import { AuthenticationGuard } from './guards/jwt.guard';
import { ChangePasswordResponse } from './types/ChangePasswordResponse';
import { ChangePasswordInput } from './inputs/ChangePassword.input';
import { JwtPayload } from 'src/types/express';
import { PubSub } from 'graphql-subscriptions';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { ForgotPasswordInput } from './inputs/forgotPassword.input';
import { ResetPasswordInput } from './inputs/resetPassword.input';
import { ForgotPasswordResponse } from './types/ForgotPasswordResponse';
import { ResetPasswordResponse } from './types/ResetPasswordResponse';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RefreshTokenResponse } from './types/RefreshTokenResponse';
import { CreateUserInput } from '../user/inputs/ceate-user.Input';
import { EmployeeLoginInput } from './types/employee-login.Input';
import { AuthPasswordService } from './auth.password.service';
const pubSub = new PubSub();

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly authPasswordService: AuthPasswordService,
  ) {}

  @Mutation(() => RegisterResponse)
  register(@Args('input') input: CreateUserInput) {
    return this.authService.register(input);
  }

  @Mutation(() => LoginResponse, { nullable: true }) //() => AuthResponse
  login(@Args('input') input: LoginInput, @Context() context) {
    return this.authService.login(input, context);
  }

  @Mutation(() => VerifyEmailResponse)
  async verifyEmail(@Args('input') input: VerifyEmailInput) {
    return this.authService.verifyEmail(input);
  }

  @Mutation(() => RefreshTokenResponse)
  async refreshToken(
    @Context() context,
    @Headers('x-refresh-token') mobileRefreshToken?: string,
  ): Promise<RefreshTokenResponse> {
    const refreshToken =
      context.req.cookies?.refresh_token || mobileRefreshToken;

    const { access_token } = await this.authService.refreshAccessToken(
      refreshToken,
      context,
    );

    return {
      access_token,
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logout(@CurrentUser() user: UserType, @Context() context) {
    context.res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    console.log({ user });
    await this.authService.incrementTokenVersion(user._id.toString());

    return true;
  }

  @Query(() => UserType, { nullable: true })
  @UseGuards(GqlAuthGuard)
  me(@CurrentUser() user: UserType): UserType {
    return user;
  }

  //   @Query(() => Boolean)
  // isAuthenticated(@Context() context) {
  //   return this.authService.checkAuthentication(context);
  // }

  // @Query(() => Boolean)
  // hasPermission(
  //   @Args('permission', { type: () => String }) permission: string,
  //   @Context() context
  // ) {
  //   return this.authService.hasPermission(permission, context);
  // }

  @Mutation(() => ForgotPasswordResponse)
  async forgotPassword(@Args('input') input: ForgotPasswordInput) {
    return this.authPasswordService.forgotPassword(input);
  }

  @Mutation(() => ResetPasswordResponse)
  async resetPassword(@Args('input') input: ResetPasswordInput) {
    return this.authPasswordService.resetPassword(input);
  }

  @Mutation(() => ChangePasswordResponse)
  @UseGuards(AuthenticationGuard)
  async changePassword(
    @Args('input') input: ChangePasswordInput,
    @CurrentUser() user: JwtPayload,
    @Context() context,
  ) {
    return this.authPasswordService.changePassword(input, user.sub, context);
  }

  @Subscription(() => Boolean, {
    filter: (payload, variables, context) => {
      return (
        payload.forceLogout && payload.userId === context.user._id.toString()
      );
    },
    resolve: (payload) => {
      return payload.forceLogout;
    },
  })
  tokenVersionUpdated(@Context() context) {
    return pubSub.asyncIterableIterator('TOKEN_VERSION_UPDATED');
  }
}
