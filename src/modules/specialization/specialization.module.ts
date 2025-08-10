import { Module } from '@nestjs/common';
import { SpecializationService } from './specialization.service';
import { SpecializationResolver } from './specialization.resolver';
import { LocalizationModule } from '../../i18n/i18n.module';
import { SpecializationSeedService } from './specializations.seed';
import { specializationDBModel } from './schemas/specialization.schema';

@Module({
  imports: [specializationDBModel, LocalizationModule],
  providers: [
    SpecializationService,
    SpecializationResolver,
    SpecializationSeedService,
  ],
  exports: [
    SpecializationService,
    SpecializationSeedService,
    specializationDBModel,
  ],
})
export class SpecializationModule {}
