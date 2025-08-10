import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Specialization,
  SpecializationDocument,
} from './schemas/specialization.schema';
import { CreateSpecializationInput } from './inputs/create-specialization.input';
import { SlugService } from '../../common/slug/slug.service';
import { TranslationService } from '../../i18n/translation.service';
import { GraphQLError } from 'graphql';
import { I18nService } from '../../i18n/i18n.service';

@Injectable()
export class SpecializationService {
  constructor(
    @InjectModel(Specialization.name)
    private specializationModel: Model<SpecializationDocument>,
    private readonly slugService: SlugService,
    private readonly i18n: I18nService,
  ) {}

  async specializations(): Promise<Specialization[]> {
    return this.specializationModel.find();
  }

  async specialization(id: string): Promise<Specialization> {
    const spec = await this.specializationModel.findById(id);
    return spec;
  }

  async findSpecializationByName(name: string): Promise<Specialization> {
    const spec = await this.specializationModel.findOne({ name });
    return spec;
  }

  async createSpecialization(
    input: CreateSpecializationInput,
    language: string,
  ): Promise<Specialization> {
    try {
      const isExistsBefore = await this.specializationModel.findOne({
        [`name.${language}`]: input.name,
      });

      if (isExistsBefore) {
        throw new GraphQLError(
          this.i18n.translate('error.specializationConflict'),
          {
            extensions: {
              code: 'CONFLICT',
              category: 'CONFLICT',
              http: { status: 409 },
            },
          },
        );
      }

      const slug = {
        en: this.slugService.generate(input.name),
        ar: this.slugService.generate(input.name),
      };

      const translatedKeys = TranslationService.createTranslatableDocument({
        obj: input,
        keysToTranslate: ['name'],
      });

      const created = await this.specializationModel.create({
        name: translatedKeys.name,
        slug,
      });
      const plainCreated = created.toObject();

      const createdDoc = TranslationService.retrieveTranslatedDocument({
        obj: plainCreated,
        language,
        translatableKeys: ['name', 'slug'],
      });
      return createdDoc;
    } catch (error) {
      throw error;
    }
  }

  async updateSpecialization(
    id: string,
    input: CreateSpecializationInput,
  ): Promise<Specialization> {
    const name = { en: input.name, ar: input.name };
    const slug = {
      en: this.slugService.generate(input.name),
      ar: this.slugService.generate(input.name),
    };

    const updated = await this.specializationModel.findByIdAndUpdate(
      id,
      { $set: { name, slug } },
      { new: true },
    );

    return updated;
  }

  async deleteSpecialization(id: string): Promise<boolean> {
    const result = await this.specializationModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
