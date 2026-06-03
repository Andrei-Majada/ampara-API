import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TermsController } from './terms.controller';
import { TermsService } from './terms.service';
import { Terms, TermsSchema } from './schemas/terms.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Terms.name, schema: TermsSchema }]),
  ],
  controllers: [TermsController],
  providers: [TermsService],
  exports: [TermsService],
})
export class TermsModule {}
