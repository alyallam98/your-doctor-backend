import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { DoctorRequestService } from './doctor-request.service';
import { doctorRequestDBModule } from './schemas/doctor-request.schema';

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
  providers: [DoctorRequestService],
  controllers: [],
})
export class DoctorRequestModule {}
