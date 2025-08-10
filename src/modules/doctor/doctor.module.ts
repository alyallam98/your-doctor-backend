import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorResolver } from './doctor.resolver';
import { doctorDBModule } from './schemas/doctor.schema';
import { CommonModule } from '../../common/common.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [doctorDBModule, CommonModule, RoleModule],
  providers: [DoctorResolver, DoctorService],
  exports: [DoctorService],
})
export class DoctorModule {}
