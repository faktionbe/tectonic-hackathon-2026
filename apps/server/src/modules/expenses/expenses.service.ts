import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  Expense,
  ExpenseCategory,
  ExpenseChannel,
  ExpenseDirection,
  ExpenseEssentiality,
  ExpenseStatus,
  ExpenseType,
} from '@repo/contracts';
import { Prisma } from '@repo/database';

import {
  orUndefined,
  toIsoDate,
  toOptIsoDate,
  toOptIsoDateTime,
} from '@/modules/common/utils/serialization';
import {
  type CreateExpense,
  type UpdateExpense,
} from '@/modules/expenses/models/expense.dto';
import { PaginationService } from '@/modules/pagination/pagination.service';
import type { OffsetPagination } from '@/modules/pagination/pagination.utils';
import { PrismaService } from '@/modules/prisma/prisma.service';

type ExpenseRow = Prisma.expenseGetPayload<Record<string, never>>;

function toExpenseDto(row: ExpenseRow): Expense {
  return {
    id: row.id,
    accountId: row.account_id,
    iban: orUndefined(row.iban),
    amount: Number(row.amount),
    currency: row.currency,
    direction: row.direction as ExpenseDirection,
    bookingDate: toIsoDate(row.booking_date),
    valueDate: toOptIsoDate(row.value_date),
    transactionTimestamp: toOptIsoDateTime(row.transaction_timestamp),
    type: row.type as ExpenseType,
    status: row.status as ExpenseStatus,
    description: orUndefined(row.description),
    structuredReference: orUndefined(row.structured_reference),
    mcc: orUndefined(row.mcc),
    channel: orUndefined(row.channel) as ExpenseChannel | undefined,
    balanceAfter:
      row.balance_after === null ? undefined : Number(row.balance_after),
    city: orUndefined(row.city),
    countryCode: orUndefined(row.country_code),
    category: orUndefined(row.category) as ExpenseCategory | undefined,
    subCategory: orUndefined(row.sub_category),
    essentiality: orUndefined(row.essentiality) as
      | ExpenseEssentiality
      | undefined,
    counterpartyId: orUndefined(row.counterparty_id),
    subscriptionId: orUndefined(row.subscription_id),
  };
}

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService
  ) {}

  async findAll(pagination: OffsetPagination) {
    const page = await this.paginationService.offsetPaginate<
      ExpenseRow,
      'expense'
    >({
      model: this.prisma.expense,
      pagination,
      orderBy: 'createdAt',
    });
    return {
      ...page,
      data: (page.data as Array<ExpenseRow>).map(toExpenseDto),
    };
  }

  async findOne(id: string): Promise<Expense> {
    const row = await this.prisma.expense.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Expense ${id} not found`);
    }
    return toExpenseDto(row);
  }

  async create(dto: CreateExpense): Promise<Expense> {
    const row = await this.prisma.expense.create({
      data: {
        account_id: dto.accountId,
        iban: dto.iban,
        amount: dto.amount,
        currency: dto.currency,
        direction: dto.direction,
        booking_date: new Date(dto.bookingDate),
        value_date: dto.valueDate ? new Date(dto.valueDate) : undefined,
        transaction_timestamp: dto.transactionTimestamp
          ? new Date(dto.transactionTimestamp)
          : undefined,
        type: dto.type,
        status: dto.status,
        description: dto.description,
        structured_reference: dto.structuredReference,
        mcc: dto.mcc,
        channel: dto.channel,
        balance_after: dto.balanceAfter,
        city: dto.city,
        country_code: dto.countryCode,
        category: dto.category,
        sub_category: dto.subCategory,
        essentiality: dto.essentiality,
        counterparty_id: dto.counterpartyId,
        subscription_id: dto.subscriptionId,
      },
    });
    return toExpenseDto(row);
  }

  async update(id: string, dto: UpdateExpense): Promise<Expense> {
    await this.findOne(id);
    const row = await this.prisma.expense.update({
      where: { id },
      data: {
        account_id: dto.accountId,
        iban: dto.iban,
        amount: dto.amount,
        currency: dto.currency,
        direction: dto.direction,
        booking_date: dto.bookingDate ? new Date(dto.bookingDate) : undefined,
        value_date: dto.valueDate ? new Date(dto.valueDate) : undefined,
        transaction_timestamp: dto.transactionTimestamp
          ? new Date(dto.transactionTimestamp)
          : undefined,
        type: dto.type,
        status: dto.status,
        description: dto.description,
        structured_reference: dto.structuredReference,
        mcc: dto.mcc,
        channel: dto.channel,
        balance_after: dto.balanceAfter,
        city: dto.city,
        country_code: dto.countryCode,
        category: dto.category,
        sub_category: dto.subCategory,
        essentiality: dto.essentiality,
        counterparty_id: dto.counterpartyId,
        subscription_id: dto.subscriptionId,
      },
    });
    return toExpenseDto(row);
  }

  async remove(id: string): Promise<Expense> {
    const expense = await this.findOne(id);
    await this.prisma.expense.delete({ where: { id } });
    return expense;
  }
}
