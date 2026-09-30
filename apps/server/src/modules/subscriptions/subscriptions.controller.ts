import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  SerializeOptions,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { subscriptionDetailSchema, subscriptionSchema } from '@repo/contracts';

import { Auth } from '@/modules/auth/auth.decorator';
import { ApiOffsetPagination } from '@/modules/common/decorators/api-offset-pagination.decorator';
import {
  type OffsetPagination,
  offsetPaginationSchema,
} from '@/modules/pagination/pagination.utils';
import {
  type CreateSubscription,
  createSubscriptionSchema,
  subscriptionsPageSchema,
  type UpdateSubscription,
  updateSubscriptionSchema,
} from '@/modules/subscriptions/models/subscription.dto';
import { SubscriptionsService } from '@/modules/subscriptions/subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @Auth()
  @ApiOperation({
    operationId: 'getSubscriptions',
    summary: 'List subscriptions',
  })
  @ApiOffsetPagination()
  @ApiOkResponse({ standardSchema: subscriptionsPageSchema })
  @SerializeOptions({ schema: subscriptionsPageSchema })
  async findAll(
    @Query({ schema: offsetPaginationSchema }) pagination: OffsetPagination
  ) {
    return this.subscriptionsService.findAll(pagination);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({
    operationId: 'getSubscription',
    summary: 'Get a subscription',
  })
  @ApiOkResponse({ standardSchema: subscriptionDetailSchema })
  @SerializeOptions({ schema: subscriptionDetailSchema })
  async findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Post()
  @Auth()
  @ApiOperation({
    operationId: 'createSubscription',
    summary: 'Create a subscription',
  })
  @ApiOkResponse({ standardSchema: subscriptionSchema })
  @SerializeOptions({ schema: subscriptionSchema })
  async create(
    @Body({ schema: createSubscriptionSchema }) body: CreateSubscription
  ) {
    return this.subscriptionsService.create(body);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({
    operationId: 'updateSubscription',
    summary: 'Update a subscription',
  })
  @ApiOkResponse({ standardSchema: subscriptionSchema })
  @SerializeOptions({ schema: subscriptionSchema })
  async update(
    @Param('id') id: string,
    @Body({ schema: updateSubscriptionSchema }) body: UpdateSubscription
  ) {
    return this.subscriptionsService.update(id, body);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({
    operationId: 'deleteSubscription',
    summary: 'Delete a subscription',
  })
  @ApiOkResponse({ standardSchema: subscriptionSchema })
  @SerializeOptions({ schema: subscriptionSchema })
  async remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }
}
