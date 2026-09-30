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
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { subscriptionDetailSchema, subscriptionSchema } from '@repo/contracts';

import { M2M } from '@/modules/auth/m2m.decorator';
import { ApiOffsetPagination } from '@/modules/common/decorators/api-offset-pagination.decorator';
import {
  type CreateSubscription,
  createSubscriptionSchema,
  type ListSubscriptionsQuery,
  listSubscriptionsQuerySchema,
  subscriptionsPageSchema,
  type UpdateSubscription,
  updateSubscriptionSchema,
} from '@/modules/subscriptions/models/subscription.dto';
import { SubscriptionsService } from '@/modules/subscriptions/subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @M2M()
  @ApiOperation({
    operationId: 'getSubscriptions',
    summary: 'List subscriptions',
  })
  @ApiOffsetPagination()
  @ApiQuery({
    name: 'accountIds',
    required: false,
    type: String,
    description: 'Comma-separated account ids to filter by',
  })
  @ApiOkResponse({ standardSchema: subscriptionsPageSchema })
  @SerializeOptions({ schema: subscriptionsPageSchema })
  async findAll(
    @Query({ schema: listSubscriptionsQuerySchema })
    query: ListSubscriptionsQuery
  ) {
    return this.subscriptionsService.findAll(query);
  }

  @Get(':id')
  @M2M()
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
  @M2M()
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
  @M2M()
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
  @M2M()
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
