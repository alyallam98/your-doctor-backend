import { Injectable, Logger } from '@nestjs/common';

import { ZoneService } from './zone.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ZoneSeedService {
  private readonly logger = new Logger(ZoneSeedService.name);

  constructor(private readonly zoneService: ZoneService) {}

  async seedDefaultZones() {
    const filePathG = path.join(
      process.cwd(),
      'src/modules/zone/constants/governorates.json',
    );
    const filePathC = path.join(
      process.cwd(),
      'src/modules/zone/constants/cities.json',
    );
    const fileContentG = fs.readFileSync(filePathG, 'utf-8');
    const fileContentC = fs.readFileSync(filePathC, 'utf-8');
    const governorates = JSON.parse(fileContentG);
    const cities = JSON.parse(fileContentC);

    for (const governorate of governorates) {
      const existingZone = await this.zoneService.findByName(
        governorate.name.en.toLowerCase(),
      );

      if (!existingZone) {
        const zone = await this.zoneService.create({
          name: governorate.name,
          slug: governorate.slug,
        });
        this.logger.log(`Seeded default role: ${zone.name}`);
      }
    }

    this.logger.log(`Finished Seeding  zones`);

    this.logger.log(`Start seeding sub zones`);

    for (const cityGroup of cities) {
      const existingZone = await this.zoneService.findByName(
        cityGroup.governorate.toLowerCase(),
      );

      if (existingZone) {
        for (const city of cityGroup.cities) {
          const zone = await this.zoneService.create({
            name: city.name,
            slug: city.slug,
            parentId: existingZone._id as string,
          });

          this.logger.log(
            `Seeded city: ${zone.name} (under governorate: ${cityGroup.governorate})`,
          );
        }
      } else {
        this.logger.warn(`Governorate not found: ${cityGroup.governorate}`);
      }
    }
  }
}
