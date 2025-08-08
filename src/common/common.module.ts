import { Global, Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { SlugService } from './slug/slug.service';
// import { BasePaginationService } from './pagination.service';

@Global()
@Module({
  // providers: [BasePaginationService, OtpService],
  // exports: [BasePaginationService, OtpService],
  providers: [OtpService, SlugService],
  exports: [OtpService, SlugService],
})
export class CommonModule {}
