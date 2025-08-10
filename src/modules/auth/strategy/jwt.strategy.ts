import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { User } from '../../../modules/user/schemas/user.schema';
import { UserService } from '../../../modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private userService: UserService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // default: Authorization: Bearer <token>
      ignoreExpiration: false, // this ensures `exp` is checked
      secretOrKey: configService.get('accessSecret'),
    });
  }

  async validate(payload: any): Promise<User> {
    const user = await this.userService.getUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Token has been invalidated');
    }

    return user;
  }
}
