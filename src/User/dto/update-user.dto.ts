import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  Matches,
} from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[\d\s()-]{10,20}$/, {
    message: 'Phone must be a valid Brazilian phone number format',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  description?: string;

  // @IsOptional()
  // @Matches(/^\d{11}|\d{14}$/, {
  //   message: 'Document must be a valid CPF (11 digits) or CNPJ (14 digits)',
  // })
  // document?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Birth must be a valid date (YYYY-MM-DD)' })
  birth?: Date;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsEnum(['person', 'mediator', 'helper'], {
    message: 'Profile must be one of: person, mediator, helper',
  })
  profile?: string;
}
