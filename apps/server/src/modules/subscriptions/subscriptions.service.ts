import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  Subscription,
  SubscriptionDetail,
  SubscriptionListItem,
} from '@repo/contracts';
import type { Prisma } from '@repo/database';

import {
  subscriptionDetailInclude,
  subscriptionListInclude,
  type SubscriptionListRow,
  toSubscription,
  toSubscriptionDetail,
  toSubscriptionListItem,
} from '@/modules/common/mappers/financial-records';
import { PaginationService } from '@/modules/pagination/pagination.service';
import type { OffsetPaginationResult } from '@/modules/pagination/pagination.utils';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  type CreateSubscription,
  type ListSubscriptionsQuery,
  type UpdateSubscription,
} from '@/modules/subscriptions/models/subscription.dto';

const toSubscriptionDate = (value: string | undefined): Date | undefined =>
  value === undefined ? undefined : new Date(value);

function buildSubscriptionListWhere(
  query: ListSubscriptionsQuery
): Prisma.subscriptionWhereInput | undefined {
  if (query.accountIds === undefined || query.accountIds.length === 0) {
    return undefined;
  }
  return { account_id: { in: query.accountIds } };
}

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService
  ) {}

  async findAll(
    query: ListSubscriptionsQuery
  ): Promise<OffsetPaginationResult<SubscriptionListItem>> {
    const page = await this.paginationService.offsetPaginate<
      SubscriptionListRow,
      'subscription'
    >({
      model: this.prisma.subscription as never,
      pagination: query,
      orderBy: 'createdAt',
      include: subscriptionListInclude,
      where: buildSubscriptionListWhere(query),
    });
    return {
      ...page,
      data: (page.data as Array<SubscriptionListRow>).map(
        toSubscriptionListItem
      ),
    };
  }

  async findOne(id: string): Promise<SubscriptionDetail> {
    const row = await this.prisma.subscription.findUnique({
      where: { id },
      include: subscriptionDetailInclude,
    });
    if (!row) {
      throw new NotFoundException(`Subscription ${id} not found`);
    }
    return toSubscriptionDetail(row);
  }

  async create(dto: CreateSubscription): Promise<Subscription> {
    const row = await this.prisma.subscription.create({
      data: {
        account_id: dto.accountId,
        counterparty_id: dto.counterpartyId,
        kind: dto.kind,
        mandate_id: dto.mandateId,
        creditor_id: dto.creditorId,
        status: dto.status,
        category: dto.category,
        cadence: dto.cadence,
        amount: dto.amount,
        currency: dto.currency,
        next_payment_date: toSubscriptionDate(dto.nextPaymentDate),
        first_charged_at: toSubscriptionDate(dto.firstChargedAt),
        last_charged_at: toSubscriptionDate(dto.lastChargedAt),
        occurrence_count: dto.occurrenceCount,
        cancellable: dto.cancellable,
      },
    });
    return toSubscription(row);
  }

  async update(id: string, dto: UpdateSubscription): Promise<Subscription> {
    await this.findOne(id);
    const row = await this.prisma.subscription.update({
      where: { id },
      data: {
        account_id: dto.accountId,
        counterparty_id: dto.counterpartyId,
        kind: dto.kind,
        mandate_id: dto.mandateId,
        creditor_id: dto.creditorId,
        status: dto.status,
        category: dto.category,
        cadence: dto.cadence,
        amount: dto.amount,
        currency: dto.currency,
        next_payment_date: toSubscriptionDate(dto.nextPaymentDate),
        first_charged_at: toSubscriptionDate(dto.firstChargedAt),
        last_charged_at: toSubscriptionDate(dto.lastChargedAt),
        occurrence_count: dto.occurrenceCount,
        cancellable: dto.cancellable,
      },
    });
    return toSubscription(row);
  }

  async remove(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    await this.prisma.subscription.delete({ where: { id } });
    return subscription;
  }
}
