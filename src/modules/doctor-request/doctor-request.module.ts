import { Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DoctorRequestService } from './doctor-request.service';
import { doctorRequestDBModule } from './schemas/doctor-request.schema';
import { DoctorRequestResolver } from './doctor-request.resolver';
import { APP_GUARD } from '@nestjs/core';
import { GqlThrottlerGuard } from '../../common/guards/GqlThrottlerGuard';

@Module({
  imports: [
    doctorRequestDBModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 5,
        },
      ],
    }),
  ],
  providers: [
    DoctorRequestService,
    DoctorRequestResolver,
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
  ],
  controllers: [],
})
export class DoctorRequestModule {}
