/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequestsService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Request } from './schemas/request.schema';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { RequestViewDto } from './dto/request-view.dto';
import { RequestHelperViewDto } from './dto/request-helper-view.dto';
import { AcceptSupporterDto } from './dto/accept-supporter.dto';

@UseGuards(JwtAuthGuard)
@Controller('request')
export class RequestsController {
  constructor(private readonly RequestsService: RequestsService) {}

  @Post()
  async create(
    @Req() req: any,
    @Body() dto: CreateRequestDto,
  ): Promise<Request> {
    const userId = req.user.userId;
    return this.RequestsService.create(userId, dto);
  }

  @Post('offer-support/:id')
  async addAvailableSupporter(
    @Param('id') requestId: string,
    @Req() req: any,
  ): Promise<{ message: string }> {
    const helperUserId = req.user.userId;

    await this.RequestsService.addAvailableSupporter(requestId, helperUserId);

    return {
      message:
        'Obrigada por se disponibilizar para oferecer amparo. Sua ajuda faz diferença.',
    };
  }

  @Post('accept-supporter/:id')
  async acceptSupporter(
    @Param('id') requestId: string,
    @Body() body: AcceptSupporterDto,
    @Req() req: any,
  ): Promise<{ message: string }> {
    const user = req.user;

    if (!user || user.profile !== 'mediator') {
      throw new ForbiddenException(
        'Only mediator users can accept supporters for a request',
      );
    }

    await this.RequestsService.acceptSupporter(requestId, body.supporterId);

    return {
      message: 'Ajuda foi aceita para este pedido.',
    };
  }

  @Get()
  async findAll(): Promise<Request[]> {
    return await this.RequestsService.findAll();
  }

  @Get('user')
  async findByUser(@Req() req: any): Promise<Request[]> {
    const user = req.user;
    return this.RequestsService.findByUser(user.userId);
  }

  @Get('mediator/active')
  async findMediatorActiveRequests(@Req() req: any): Promise<RequestViewDto[]> {
    const user = req.user;

    if (!user || user.profile !== 'mediator') {
      throw new ForbiddenException(
        'Only mediator users can access this resource',
      );
    }

    return this.RequestsService.findActiveForMediator();
  }

  @Get('helper/active')
  async findHelperActiveRequests(@Req() req: any): Promise<RequestViewDto[]> {
    const user = req.user;

    if (!user || user.profile !== 'mediator') {
      throw new ForbiddenException(
        'Only mediator users can access this resource',
      );
    }

    return this.RequestsService.findActiveForMediator();
  }

  @Get('mediator/:id')
  async findOneForMediator(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<RequestViewDto> {
    const user = req.user;

    if (!user || user.profile !== 'mediator') {
      throw new ForbiddenException(
        'Only mediator users can access this resource',
      );
    }

    return this.RequestsService.findOneForMediator(id);
  }

  @Get('helper/:id')
  async findOneForHelper(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<RequestHelperViewDto> {
    const user = req.user;

    if (!user || user.profile !== 'helper') {
      throw new ForbiddenException(
        'Only helper users can access this resource',
      );
    }

    return this.RequestsService.findOneForHelper(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Request> {
    return await this.RequestsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRequestDto,
  ): Promise<Request> {
    return await this.RequestsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.RequestsService.remove(id);
  }
}
