import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Terms, TermsDocument } from './schemas/terms.schema';

@Injectable()
export class TermsService {
  constructor(
    @InjectModel(Terms.name)
    private readonly termsModel: Model<TermsDocument>,
  ) {}

  async get(): Promise<Terms> {
    const doc = await this.termsModel.findOne().exec();

    if (!doc) {
      throw new NotFoundException('Terms of use not found');
    }

    return doc;
  }
}
