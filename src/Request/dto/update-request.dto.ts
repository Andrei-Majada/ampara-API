import { PartialType } from '@nestjs/mapped-types';
import { CreateRequestDto } from './create-request.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateRequestDto extends PartialType(CreateRequestDto) {
  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'canceled'])
  status?: string;
}
