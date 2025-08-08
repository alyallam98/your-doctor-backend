import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserDBModule } from './schemas/user.schema';
import { CommonModule } from 'src/common/common.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [UserDBModule, CommonModule, RoleModule],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
