import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Zone } from './schemas/zone.schema';
import { CreateZoneInput } from './inputs/zone.input';
import { GraphQLError } from 'graphql';
import { I18nService } from 'src/i18n/i18n.service';
import { SlugService } from 'src/common/slug/slug.service';
import { TranslationService } from 'src/i18n/translation.service';
import { ZoneFilterInput } from './inputs/zone-filter.input';
import { ZonePaginationResponse } from './types/zone-pagination-response.type';

@Injectable()
export class ZoneService {
  constructor(
    @InjectModel(Zone.name) private zoneModel: Model<Zone>,
    private i18n: I18nService,
    private slugService: SlugService,
  ) {}

  async create(
    createZoneInput: CreateZoneInput & {
      slug?: any;
    },
    language?: string,
  ): Promise<Zone> {
    const { name, parentId } = createZoneInput;

    const isExistsBefore = await this.zoneModel.findOne({
      [`name.${language}`]: name,
    });
    if (isExistsBefore) {
      console.log({ isExistsBefore });
      throw new GraphQLError(this.i18n.translate('error.zoneConflict'), {
        extensions: {
          code: 'CONFLICT',
          category: 'CONFLICT',
          http: { status: 409 },
        },
      });
    }

    if (parentId) {
      const parentZone = await this.zoneModel.findById(parentId);
      if (!parentZone) {
        throw new BadRequestException('Parent zone not found');
      }
    }

    const slug =
      typeof name == 'string'
        ? {
            en: this.slugService.generate(name),
            ar: this.slugService.generate(name),
          }
        : createZoneInput.slug;

    const zone = new this.zoneModel({
      name: typeof name == 'string' ? { en: name, ar: name } : name,
      slug,
      parentId: parentId ? new Types.ObjectId(parentId) : null,
    });

    await zone.save();
    await zone.populate('parentId');
    const plainCreated = zone.toObject();

    if (plainCreated.parentId) {
      plainCreated.parentId = TranslationService.retrieveTranslatedDocument({
        obj: plainCreated.parentId,
        language,
        translatableKeys: ['name', 'slug'],
      });
    }

    const createdDoc = TranslationService.retrieveTranslatedDocument({
      obj: plainCreated,
      language,
      translatableKeys: ['name', 'slug'],
    });

    return createdDoc;
  }

  async findAll(
    filter: ZoneFilterInput,
    language: string,
    page = 1,
    limit = 20,
  ): Promise<ZonePaginationResponse> {
    const query: Record<string, any> = {
      parentId: null,
    };

    if (filter?.active !== undefined) {
      query.active = filter?.active;
    }

    if (filter?.name) {
      query[`name.${language || 'en'}`] = {
        $regex: filter.name,
        $options: 'i',
      };
    }

    const skip = (page - 1) * limit;

    const [zones, total] = await Promise.all([
      this.zoneModel.find(query).skip(skip).limit(limit).lean().exec(),
      this.zoneModel.countDocuments(query).exec(),
    ]);

    console.log(typeof zones[0]._id, zones[0]._id);

    const translatedZones = TranslationService.retrieveTranslatedDocuments({
      items: zones,
      language,
      translatableKeys: ['name', 'slug'],
    });

    console.log(typeof translatedZones[0]._id, translatedZones[0]._id);

    const lastPage = Math.ceil(total / limit);
    const currentPage = page > lastPage ? lastPage : page;

    return {
      data: translatedZones,
      paginationDetails: {
        total,
        itemsPerPage: limit,
        currentPage,
        lastPage,
        currentPageItemsCount: zones.length,
        hasMorePages: currentPage < lastPage,
      },
    };
  }

  async findById(id: string, language: string): Promise<Zone> {
    const zone = await this.zoneModel
      .findById(id)
      .populate('parentId')
      .populate('children')
      .lean()
      .exec();

    if (zone.parentId) {
      zone.parentId = TranslationService.retrieveTranslatedDocument({
        obj: zone.parentId,
        language,
        translatableKeys: ['name', 'slug'],
      });
    }

    if (zone.children?.length) {
      zone.children = TranslationService.retrieveTranslatedDocuments({
        items: zone.children,
        language,
        translatableKeys: ['name', 'slug'],
      });
    }

    return TranslationService.retrieveTranslatedDocument({
      obj: zone,
      language,
      translatableKeys: ['name', 'slug'],
    });
  }
  async findByName(name: string): Promise<Zone> {
    const zone = await this.zoneModel
      .findOne({
        'name.en': new RegExp(`^${name}$`, 'i'),
      })
      .lean()
      .exec();

    return zone;
  }

  //   async findChildren(parentId: string): Promise<Zone[]> {
  //     if (!Types.ObjectId.isValid(parentId)) {
  //       throw new BadRequestException('Invalid parent ID');
  //     }

  //     return this.zoneModel.find({ parentId }).populate('parentId').exec();
  //   }

  //   async findRootZones(): Promise<Zone[]> {
  //     return this.zoneModel.find({ parentId: null }).populate('parentId').exec();
  //   }

  //   async update(
  //     id: string,
  //     updateData: Partial<CreateZoneInput>,
  //   ): Promise<Zone> {
  //     if (!Types.ObjectId.isValid(id)) {
  //       throw new BadRequestException('Invalid zone ID');
  //     }

  //     // Validate parent exists if provided
  //     if (updateData.parentId) {
  //       const parentZone = await this.zoneModel.findById(updateData.parentId);
  //       if (!parentZone) {
  //         throw new BadRequestException('Parent zone not found');
  //       }

  //       // Prevent circular reference
  //       if (updateData.parentId === id) {
  //         throw new BadRequestException('Zone cannot be its own parent');
  //       }
  //     }

  //     const updatePayload: any = {};
  //     if (updateData.name) {
  //       updatePayload.name = { en: updateData.name, ar: updateData.name };
  //     }
  //     if (updateData.active !== undefined) {
  //       updatePayload.active = updateData.active;
  //     }
  //     if (updateData.parentId !== undefined) {
  //       updatePayload.parentId = updateData.parentId
  //         ? new Types.ObjectId(updateData.parentId)
  //         : null;
  //     }

  //     const zone = await this.zoneModel
  //       .findByIdAndUpdate(id, updatePayload, { new: true })
  //       .populate('parentId')
  //       .exec();

  //     if (!zone) {
  //       throw new NotFoundException('Zone not found');
  //     }

  //     return zone;
  //   }

  //   async delete(id: string): Promise<boolean> {
  //     if (!Types.ObjectId.isValid(id)) {
  //       throw new BadRequestException('Invalid zone ID');
  //     }

  //     // Check if zone has children
  //     const childrenCount = await this.zoneModel.countDocuments({ parentId: id });
  //     if (childrenCount > 0) {
  //       throw new BadRequestException(
  //         'Cannot delete zone with children. Delete children first.',
  //       );
  //     }

  //     const result = await this.zoneModel.findByIdAndDelete(id);
  //     return !!result;
  //   }
}
