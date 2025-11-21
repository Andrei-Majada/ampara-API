/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  NotFoundException,
  BadRequestException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from 'src/Auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  private readonly userModel: any;
  constructor(private readonly usersService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    const findUser = await this.usersService.findByEmail(createUserDto.email);
    const userWithPhone = await this.usersService.findByPhone(
      createUserDto.phone,
    );

    if (findUser) {
      throw new NotFoundException(`User with this email already exists.`);
    } else if (userWithPhone) {
      throw new NotFoundException(`User with this phone already exists.`);
    }
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException(`User not found.`);
    }

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const currentUser = await this.usersService.findOneById(id);
    if (!currentUser) {
      throw new NotFoundException('User not found.');
    }

    if (updateUserDto.email && updateUserDto.email !== currentUser.email) {
      const userWithEmail = await this.usersService.findByEmail(
        updateUserDto.email,
      );

      if (
        userWithEmail &&
        userWithEmail._id.toString() !== currentUser._id.toString()
      ) {
        throw new BadRequestException('Email already in use by another user.');
      }
    }

    if (updateUserDto.phone && updateUserDto.phone !== currentUser.phone) {
      const userWithPhone = await this.usersService.findByPhone(
        updateUserDto.phone,
      );

      if (
        userWithPhone &&
        userWithPhone._id.toString() !== currentUser._id.toString()
      ) {
        throw new BadRequestException('Phone already in use by another user.');
      }
    }

    // if (
    //   updateUserDto.document &&
    //   updateUserDto.document !== currentUser.document
    // ) {
    //   const userWithDocument = await this.usersService.findByDocument(
    //     updateUserDto.document,
    //   );

    //   if (
    //     userWithDocument &&
    //     userWithDocument._id.toString() !== currentUser._id.toString()
    //   ) {
    //     throw new BadRequestException(
    //       'Document already in use by another user.',
    //     );
    //   }
    // }

    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-password/:id')
  async updatePassword(
    @Param('id') id: string,
    @Body() dto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    const currentUser = await this.usersService.findOneById(id);
    if (!currentUser) {
      throw new NotFoundException('User not found.');
    } else {
      if (dto.newPassword !== dto.confirmNewPassword) {
        throw new BadRequestException(
          'New password and confirmation do not match',
        );
      }

      await this.usersService.updatePassword(
        id,
        dto.currentPassword,
        dto.newPassword,
      );
    }

    return { message: 'Password updated successfully' };
  }
}
