import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  ExpenseCadence,
  ExpenseCategory,
  Subscription,
  SubscriptionKind,
  SubscriptionStatus,
} from '@repo/contracts';
import { Prisma } from '@repo/database';

import {
  orUndefined,
  toOptIsoDate,
} from '@/modules/common/utils/serialization';
import { PaginationService } from '@/modules/pagination/pagination.service';
import type { OffsetPagination } from '@/modules/pagination/pagination.utils';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  type CreateSubscription,
  type UpdateSubscription,
} from '@/modules/subscriptions/models/subscription.dto';

type SubscriptionRow = Prisma.subscriptionGetPayload<Record<string, never>>;

function toSubscriptionDto(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    accountId: row.account_id,
    counterpartyId: row.counterparty_id,
    kind: row.kind as SubscriptionKind,
    mandateId: orUndefined(row.mandate_id),
    creditorId: orUndefined(row.creditor_id),
    status: row.status as SubscriptionStatus,
    category: orUndefined(row.category) as ExpenseCategory | undefined,
    cadence: row.cadence as ExpenseCadence,
    amount: Number(row.amount),
    currency: row.currency,
    nextPaymentDate: toOptIsoDate(row.next_payment_date),
    firstChargedAt: toOptIsoDate(row.first_charged_at),
    lastChargedAt: toOptIsoDate(row.last_charged_at),
    occurrenceCount: orUndefined(row.occurrence_count),
    cancellable: orUndefined(row.cancellable),
  };
}

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService
  ) {}

  async findAll(pagination: OffsetPagination) {
    const page = await this.paginationService.offsetPaginate<
      SubscriptionRow,
      'subscription'
    >({
      model: this.prisma.subscription,
      pagination,
      orderBy: 'createdAt',
    });
    return {
      ...page,
      data: (page.data as Array<SubscriptionRow>).map(toSubscriptionDto),
    };
  }

  async findOne(id: string): Promise<Subscription> {
    const row = await this.prisma.subscription.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Subscription ${id} not found`);
    }
    return toSubscriptionDto(row);
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
        next_payment_date: dto.nextPaymentDate
          ? new Date(dto.nextPaymentDate)
          : undefined,
        first_charged_at: dto.firstChargedAt
          ? new Date(dto.firstChargedAt)
          : undefined,
        last_charged_at: dto.lastChargedAt
          ? new Date(dto.lastChargedAt)
          : undefined,
        occurrence_count: dto.occurrenceCount,
        cancellable: dto.cancellable,
      },
    });
    return toSubscriptionDto(row);
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
        next_payment_date: dto.nextPaymentDate
          ? new Date(dto.nextPaymentDate)
          : undefined,
        first_charged_at: dto.firstChargedAt
          ? new Date(dto.firstChargedAt)
          : undefined,
        last_charged_at: dto.lastChargedAt
          ? new Date(dto.lastChargedAt)
          : undefined,
        occurrence_count: dto.occurrenceCount,
        cancellable: dto.cancellable,
      },
    });
    return toSubscriptionDto(row);
  }

  async remove(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    await this.prisma.subscription.delete({ where: { id } });
    return subscription;
  }
}
