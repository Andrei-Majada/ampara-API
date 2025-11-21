import { IsMongoId } from 'class-validator';

export class AcceptSupporterDto {
  @IsMongoId()
  supporterId: string;
}
