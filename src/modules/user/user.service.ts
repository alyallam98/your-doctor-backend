import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcrypt from 'bcrypt';
import { OtpService } from 'src/common/otp.service';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserInput } from './inputs/update-user.Input';

import { ConfigService } from '@nestjs/config';
import { CreateUserInput } from './inputs/ceate-user.Input';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { RoleService } from '../role/role.service';

@Injectable()
export class UserService {
  private readonly saltRounds: number;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly otpService: OtpService,
    private readonly configService: ConfigService,
    private readonly roleService: RoleService,
  ) {
    this.saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
  }

  async getUsers(): Promise<User[]> {
    const selectFields = '-password -verificationCode -__v';
    return this.userModel.find({}).select(selectFields).lean().exec();
  }

  async getUser(id: string): Promise<UserDocument | null> {
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

  async findUser(payload: Partial<User>): Promise<UserDocument> {
    const userToFind = await this.userModel
      .findOne({
        ...payload,
      })
      .select('-verificationCode -__v')
      .lean();

    return userToFind;
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const isEmailExists = await this.findUser({ email: input.email });
    if (isEmailExists) {
      throw new ConflictException('Email already exists');
    }

    const defaultRole = await this.roleService.getDefaultRole();

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

  async updateUser(
    id: string,
    input: UpdateUserInput,
  ): Promise<UserDocument | null> {
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
