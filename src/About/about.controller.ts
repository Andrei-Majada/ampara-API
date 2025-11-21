import { Controller, Get } from '@nestjs/common';
import { AboutService } from './about.service';
import { About } from './schemas/about.schema';

@Controller('about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @Get()
  async getAbout(): Promise<About> {
    return this.aboutService.get();
  }
}
