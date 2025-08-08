import { Module } from '@nestjs/common';
import { zoneDBModel } from './schemas/zone.schema';
import { ZoneService } from './zone.service';
import { ZoneResolver } from './zone.resolver';
import { I18nService } from 'src/i18n/i18n.service';
import { LocalizationModule } from 'src/i18n/i18n.module';
import { ZoneSeedService } from './zones.seed';

@Module({
  imports: [zoneDBModel, LocalizationModule],
  controllers: [],
  providers: [ZoneService, ZoneResolver, ZoneSeedService],
  exports: [ZoneSeedService, zoneDBModel, ZoneService],
})
export class ZoneModule {}
