/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Request, RequestDocument } from './schemas/request.schema';
import { User, UserDocument } from '../User/schemas/user.schema';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import {
  RequestHelperSummaryDto,
  RequestViewDto,
} from './dto/request-view.dto';
import { RequestHelperViewDto } from './dto/request-helper-view.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(Request.name)
    private readonly supportRequestModel: Model<RequestDocument>,
    @InjectModel(Request.name)
    private readonly requestModel: Model<RequestDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(userId: string, dto: CreateRequestDto): Promise<Request> {
    const count = await this.supportRequestModel.countDocuments({
      userId: new Types.ObjectId(userId),
    });

    if (count >= 3) {
      throw new BadRequestException(
        'You have reached the maximum number of support requests (3).',
      );
    }

    const created = await this.supportRequestModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
    });

    return created;
  }

  async findAll(): Promise<Request[]> {
    return this.supportRequestModel.find().exec();
  }

  async findOne(id: string): Promise<Request> {
    const doc = await this.supportRequestModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException('Support request not found');
    }
    return doc;
  }

  async findByUser(userId: string): Promise<Request[]> {
    return this.supportRequestModel
      .find({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  async update(id: string, dto: UpdateRequestDto): Promise<Request> {
    const updated = await this.supportRequestModel
      .findByIdAndUpdate(
        id,
        { $set: dto },
        {
          new: true,
          runValidators: true,
          context: 'query',
        },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Support request not found');
    }

    return updated;
  }

  async addAvailableSupporter(
    requestId: string,
    helperUserId: string,
  ): Promise<void> {
    if (!isValidObjectId(requestId)) {
      throw new BadRequestException('Invalid request id');
    }

    if (!isValidObjectId(helperUserId)) {
      throw new BadRequestException('Invalid helper id');
    }

    const request = await this.supportRequestModel.findById(requestId).exec();

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    const helperUser = await this.userModel.findById(helperUserId).exec();
    if (!helperUser || helperUser.profile !== 'helper') {
      throw new ForbiddenException(
        'Only users with helper profile can offer support.',
      );
    }

    if (request.userId.toString() === helperUserId) {
      throw new BadRequestException(
        'You cannot register as supporter of your own request',
      );
    }

    const alreadyAdded = request.availableSupporters.some(
      (s) => s.helperId.toString() === helperUserId,
    );

    if (alreadyAdded) {
      return;
    }

    request.status = 'in_progress';

    request.availableSupporters.push({
      helperId: new Types.ObjectId(helperUserId),
    });

    await request.save();
  }

  async findActive(): Promise<Request[]> {
    return this.requestModel
      .find({
        status: { $in: ['pending', 'in_progress'] },
      })
      .exec();
  }

  private calculateAge(birth?: Date | null): number | null {
    if (!birth) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  private async buildRequestView(
    reqDoc: RequestDocument | (Request & { _id: any }),
  ): Promise<RequestViewDto> {
    const userId = reqDoc.userId;

    const user = await this.userModel.findById(userId).lean();

    const totalRequests = await this.requestModel.countDocuments({
      userId: userId,
      status: 'in_progress',
      helpers: { $elemMatch: {} },
    });

    const userSummary = {
      name: user?.name ?? null,
      city: user?.city ?? null,
      state: user?.state ?? null,
      age: this.calculateAge(user?.birth ?? null),
      totalRequests,
    };

    const availableSupporters = reqDoc.availableSupporters || [];
    const helperIds = availableSupporters.map((s) => s.helperId.toString());

    let helpersDetails: RequestHelperSummaryDto[] = [];

    if (helperIds.length > 0) {
      const helpersUsers = await this.userModel
        .find({ _id: { $in: helperIds } })
        .lean();

      const helpersMap = new Map(
        helpersUsers.map((u) => [u._id.toString(), u]),
      );

      helpersDetails = await Promise.all(
        helperIds.map(async (helperId) => {
          const helperUser = helpersMap.get(helperId);

          const totalHelpOffered = await this.requestModel.countDocuments({
            'availableSupporters.helperId': new Types.ObjectId(helperId),
          });

          return {
            helperId,
            name: helperUser?.name ?? null,
            city: helperUser?.city ?? null,
            state: helperUser?.state ?? null,
            totalHelpOffered,
          };
        }),
      );
    }

    return {
      _id: reqDoc._id.toString(),
      userId: userId.toString(),
      user: userSummary,
      userMessage: reqDoc.userMessage,
      status: reqDoc.status,
      helpers: reqDoc.helpers,
      availableSupporters: helpersDetails,
    };
  }

  async findActiveForMediator(): Promise<RequestViewDto[]> {
    const docs = await this.requestModel
      .find({
        status: { $in: ['pending', 'in_progress'] },
      })
      .exec();

    return Promise.all(docs.map((doc) => this.buildRequestView(doc)));
  }

  async findOneForMediator(id: string): Promise<RequestViewDto> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid request id');
    }

    const doc = await this.requestModel.findById(id).exec();

    if (!doc) {
      throw new NotFoundException('Request not found');
    }

    return this.buildRequestView(doc);
  }

  async findActiveForHelper(): Promise<RequestHelperViewDto[]> {
    const docs = await this.requestModel
      .find({
        status: { $in: ['pending', 'in_progress'] },
      })
      .exec();

    return docs.map((doc) => ({
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      userMessage: doc.userMessage,
      status: doc.status,
    }));
  }

  async findOneForHelper(id: string): Promise<RequestHelperViewDto> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid request id');
    }

    const doc = await this.requestModel.findById(id).exec();

    if (!doc) {
      throw new NotFoundException('Request not found');
    }

    return {
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      userMessage: doc.userMessage,
      status: doc.status,
    };
  }

  async acceptSupporter(
    requestId: string,
    supporterUserId: string,
  ): Promise<Request> {
    if (!isValidObjectId(requestId)) {
      throw new BadRequestException('Invalid request id');
    }

    if (!isValidObjectId(supporterUserId)) {
      throw new BadRequestException('Invalid supporter id');
    }

    const reqDoc = await this.requestModel.findById(requestId).exec();

    if (!reqDoc) {
      throw new NotFoundException('Request not found');
    }

    const supporterObjectId = new Types.ObjectId(supporterUserId);

    const isInAvailable = reqDoc.availableSupporters.some(
      (s) => s.helperId.toString() === supporterObjectId.toString(),
    );

    if (!isInAvailable) {
      throw new BadRequestException(
        'This supporter is not in the availableSupporters list for this request',
      );
    }

    const alreadyInHelpers = reqDoc.helpers.some(
      (h) => h.helperId.toString() === supporterObjectId.toString(),
    );

    if (!alreadyInHelpers) {
      reqDoc.helpers.push({ helperId: supporterObjectId });
    }

    await reqDoc.save();

    return reqDoc;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.supportRequestModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new NotFoundException('Support request not found');
    }
  }
}
