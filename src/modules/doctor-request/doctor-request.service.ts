import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateDoctorRequestInput } from './inputs/create-doctor-request.input';
import { Model } from 'mongoose';
import {
  DoctorRequest,
  DoctorRequestDocument,
} from './schemas/doctor-request.schema';
import { UpdateDoctorRequestInput } from './inputs/udpate-doctor-request.input';
import { TranslationService } from 'src/i18n/translation.service';

@Injectable()
export class DoctorRequestService {
  constructor(
    @InjectModel(DoctorRequest.name)
    private readonly doctorRequestModel: Model<DoctorRequestDocument>,
  ) {}

  async doctorRequests(
    page = 1,
    limit = 20,
    language: string,
  ): Promise<{
    data: DoctorRequest[];
    paginationDetails: {
      total: number;
      itemsPerPage: number;
      currentPage: number;
      lastPage: number;
      currentPageItemsCount: number;
      hasMorePages: boolean;
    };
  }> {
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      this.doctorRequestModel
        .find()
        .populate('specialization')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),

      this.doctorRequestModel.countDocuments().exec(),
    ]);

    const translatedRequests = requests.map((req) => ({
      ...req,
      specialization: TranslationService.retrieveTranslatedDocument({
        obj: req.specialization,
        language,
        translatableKeys: ['name', 'slug'],
      }),
    }));

    const lastPage = Math.ceil(total / limit);
    const currentPage = page > lastPage ? lastPage : page;

    return {
      data: translatedRequests,
      paginationDetails: {
        total,
        itemsPerPage: limit,
        currentPage,
        lastPage,
        currentPageItemsCount: requests.length,
        hasMorePages: currentPage < lastPage,
      },
    };
  }

  async doctorRequest(id: string, language: string): Promise<DoctorRequest> {
    const doc = await this.doctorRequestModel
      .findById(id)
      .populate('specialization')
      .lean();

    doc.specialization = TranslationService.retrieveTranslatedDocument({
      obj: doc.specialization,
      language,
    });

    return doc;
  }

  async createDoctorRequest(input: CreateDoctorRequestInput): Promise<Boolean> {
    const newDoc = await this.doctorRequestModel.create(input);
    return !!newDoc;
  }

  async updateDoctorRequest(
    id: string,
    input: UpdateDoctorRequestInput,
  ): Promise<boolean> {
    const updated = await this.doctorRequestModel.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Doctor request not found');
    return true;
  }

  async deleteDoctorRequest(id: string): Promise<boolean> {
    const result = await this.doctorRequestModel.findByIdAndDelete(id);
    return !!result;
  }
}
