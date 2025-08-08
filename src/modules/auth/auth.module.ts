import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserDBModule } from '../user/schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';

import { EmailModule } from '../../common/email/email.module';
import { UserModule } from '../user/user.module';
import { OtpModule } from 'src/common/otp.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RoleModule } from '../role/role.module';

import { AuthPasswordService } from './auth.password.service';
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule,
    UserDBModule,
    EmailModule,
    UserModule,
    OtpModule,
    RoleModule,
  ],
  providers: [AuthResolver, AuthService, JwtStrategy, AuthPasswordService],
})
export class AuthModule {}
