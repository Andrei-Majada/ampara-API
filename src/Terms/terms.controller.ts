import { Controller, Get } from '@nestjs/common';
import { TermsService } from './terms.service';
import { Terms } from './schemas/terms.schema';

@Controller('terms')
export class TermsController {
  constructor(private readonly termsService: TermsService) {}

  @Get()
  async getTerms(): Promise<Terms> {
    return this.termsService.get();
  }
}
