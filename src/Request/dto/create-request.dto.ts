import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class HelperInfoDto {
  @IsMongoId()
  helperId: string;

  @IsString()
  @IsNotEmpty()
  helperName: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsInt()
  @Min(0)
  supportProvidedCount: number;
}

export class CreateRequestDto {
  @IsString()
  @IsNotEmpty()
  userMessage: string;

  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'canceled'])
  status?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HelperInfoDto)
  helpers?: HelperInfoDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HelperInfoDto)
  availableSupporters?: HelperInfoDto[];
}
