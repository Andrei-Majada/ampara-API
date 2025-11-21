import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { About, AboutDocument } from './schemas/about.schema';

@Injectable()
export class AboutService {
  constructor(
    @InjectModel(About.name)
    private readonly aboutModel: Model<AboutDocument>,
  ) {}

  async get(): Promise<About> {
    const doc = await this.aboutModel.findOne().exec();

    if (!doc) {
      throw new NotFoundException('About page not found');
    }

    return doc;
  }
}
