import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsEnum,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString({ message: 'Phone is required' })
  @Matches(/^\+?[\d\s()-]{10,20}$/, {
    message: 'Phone must be a valid Brazilian phone number format',
  })
  phone: string;

  @IsString()
  @MinLength(6, { message: 'Password must have at least 6 characters' })
  password: string;

  @IsOptional()
  @IsString()
  description?: string;

  // @IsString({ message: 'Document (CPF/CNPJ) is required' })
  // @Matches(/^\d{11}|\d{14}$/, {
  //   message: 'Document must be a valid CPF (11 digits) or CNPJ (14 digits)',
  // })
  // document: string;

  @IsDateString({}, { message: 'Birth must be a valid date (YYYY-MM-DD)' })
  birth: Date;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsEnum(['person', 'mediator', 'helper'], {
    message: 'Profile must be one of: person, mediator, helper',
  })
  profile: string;
}
