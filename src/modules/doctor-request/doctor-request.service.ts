import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateDoctorRequestInput } from './inputs/create-doctor-request.input';
import { Model } from 'mongoose';
import {
  DoctorRequest,
  DoctorRequestDocument,
} from './schemas/doctor-request.schema';
import { UpdateDoctorRequestInput } from './inputs/udpate-doctor-request.input';

@Injectable()
export class DoctorRequestService {
  constructor(
    @InjectModel(DoctorRequest.name)
    private readonly doctorRequestModel: Model<DoctorRequestDocument>,
  ) {}

  async doctorRequests(): Promise<DoctorRequest[]> {
    return this.doctorRequestModel.find().populate('Specialization').lean();
  }

  async doctorRequest(id: string): Promise<DoctorRequest> {
    const doc = await this.doctorRequestModel
      .findById(id)
      .populate('Specialization')
      .lean();
    return doc;
  }

  async createDoctorRequest(
    input: CreateDoctorRequestInput,
  ): Promise<DoctorRequest> {
    const newDoc = await this.doctorRequestModel.create(input);
    return newDoc;
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
