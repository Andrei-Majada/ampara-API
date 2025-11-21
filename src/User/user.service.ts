/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function generateHash(value: string): string {
  return crypto.createHash('sha256').update(normalize(value)).digest('hex');
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const findUser = await this.userModel
      .findOne({ email: createUserDto.email })
      .exec();

    if (findUser) {
      throw new NotFoundException(
        'User with this email or document already exists.',
      );
    }
    const createdUser = new this.userModel(createUserDto);
    createdUser.emailHash = generateHash(createUserDto.email);
    createdUser.phoneHash = generateHash(createUserDto.phone);
    return await createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOneById(id: string): Promise<User | null> {
    let user: User | null = null;

    if (isValidObjectId(id)) {
      user = await this.userModel.findById(id).exec();
      if (user) return user;
    }

    return null;
  }

  async findOne(info: string): Promise<User | null> {
    let user: User | null = null;

    const emailHash = generateHash(info);
    user = await this.userModel.findOne({ emailHash }).exec();
    if (user) return user;

    const phoneHash = generateHash(info);
    user = await this.userModel.findOne({ phoneHash }).exec();
    if (user) return user;

    return null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const emailHash = generateHash(email);
    return this.userModel.findOne({ emailHash }).exec();
  }

  async findByPhone(phone: string): Promise<User | null> {
    const phoneHash = generateHash(phone);
    return this.userModel.findOne({ phoneHash }).exec();
  }

  async findByEmailForAuth(email: string): Promise<User | null> {
    const emailHash = generateHash(email);
    return this.userModel.findOne({ emailHash }).select('+password').exec();
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const updateData: any = { ...dto };

    const updated = await this.userModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
        context: 'query',
      })
      .exec();

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated;
  }

  async updatePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    if (!currentPassword || !newPassword) {
      throw new BadRequestException(
        'Current password and new password are required',
      );
    }

    const user = await this.userModel.findById(id).select('+password').exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException('User does not have a password set');
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password as string,
    );

    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`User not found`);
    }
  }
}
