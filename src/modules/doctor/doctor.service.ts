import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcrypt from 'bcrypt';
import { UpdateDoctorInput } from './inputs/update-doctor.Input';

import { ConfigService } from '@nestjs/config';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { RoleService } from '../role/role.service';
import { Doctor } from './schemas/doctor.schema';
import { CreateDoctorInput } from './inputs/create-doctor.Input';
import { OtpService } from '../../common/otp.service';

@Injectable()
export class DoctorService {
  private readonly saltRounds: number;

  constructor(
    @InjectModel(Doctor.name) private readonly userModel: Model<Doctor>,
    private readonly otpService: OtpService,
    private readonly configService: ConfigService,
    private readonly roleService: RoleService,
  ) {
    this.saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
  }

  async getDoctors(): Promise<Doctor[]> {
    const selectFields = '-password -verificationCode -__v';
    return this.userModel.find({}).select(selectFields).lean().exec();
  }

  async getDoctor(id: string): Promise<Doctor | null> {
    const user = await this.userModel
      .findById(id)
      .select('-password -verificationCode -__v')
      .populate({
        path: 'role',
        populate: {
          path: 'permissions',
          model: 'Permission',
        },
      })
      .lean();

    return user;
  }

  async findDoctor(payload: Partial<Doctor>): Promise<Doctor> {
    const userToFind = await this.userModel
      .findOne({
        ...payload,
      })
      .select('-verificationCode -__v')
      .lean();

    return userToFind;
  }

  async createDoctor(input: CreateDoctorInput): Promise<Doctor> {
    const isEmailExists = await this.findDoctor({ username: input.username });
    if (isEmailExists) {
      throw new ConflictException('Email already exists');
    }

    const defaultRole = await this.roleService.findOne('doctor');

    if (!defaultRole) {
      throw new InternalServerErrorException('Default role not found');
    }

    // Hash password with enhanced security
    const hashedPassword = await bcrypt.hash(input.password, this.saltRounds);

    // Generate OTP
    const { code, expiresAt } = this.otpService.generateOTP({});

    const userData = {
      ...input,
      password: hashedPassword,
      verificationCode: { code, expiresAt },
      status: UserStatus.PENDING_VERIFICATION,
      tokenVersion: 0,
      role: defaultRole._id,
    };

    const newUser = await this.userModel.create(userData);

    return newUser;
  }

  async updateDoctor(
    input: UpdateDoctorInput,
    id: string,
  ): Promise<Doctor | null> {
    const userToUpdate = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          ...input,
        },
        {
          new: true,
        },
      )
      .select('-password -verificationCode -__v')
      .lean();
    return userToUpdate;
  }
}
