import { Injectable, Logger } from '@nestjs/common';

import * as fs from 'fs';
import * as path from 'path';
import { Model } from 'mongoose';
import {
  Specialization,
  SpecializationDocument,
} from './schemas/specialization.schema';
import { SlugService } from '../../common/slug/slug.service';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SpecializationSeedService {
  private readonly logger = new Logger(SpecializationSeedService.name);
  constructor(
    @InjectModel(Specialization.name)
    private specializationModel: Model<SpecializationDocument>,
    private readonly slugService: SlugService,
  ) {}

  async seedDefaultSpecializations() {
    const filePath = path.join(
      process.cwd(),
      'src/modules/specialization/constants/specializations.json',
    );

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const specializations = JSON.parse(fileContent);

    for (const specialization of specializations) {
      const inExists = await this.specializationModel.findOne({
        [`name.en`]: specialization.name.en.toLocaleLowerCase(),
      });

      if (!inExists) {
        const slug = {
          en: this.slugService.generate(specialization.name.en),
          ar: this.slugService.generate(specialization.name.ar),
        };
        const newSpecialization = await this.specializationModel.create({
          name: specialization.name,
          slug: slug,
        });

        this.logger.log(
          `Seeded default specialization: ${newSpecialization.name.en} = ${newSpecialization.slug.ar}`,
        );
      }
    }
  }
}
