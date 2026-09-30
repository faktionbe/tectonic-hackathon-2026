import { Injectable, NotFoundException } from '@nestjs/common';
import type { Expense, ExpenseDetail, ExpenseListItem } from '@repo/contracts';
import type { Prisma } from '@repo/database';

import {
  expenseDetailInclude,
  expenseListInclude,
  type ExpenseListRow,
  toExpense,
  toExpenseDetail,
  toExpenseListItem,
} from '@/modules/common/mappers/financial-records';
import {
  type CreateExpense,
  type ListExpensesQuery,
  type UpdateExpense,
} from '@/modules/expenses/models/expense.dto';
import { PaginationService } from '@/modules/pagination/pagination.service';
import type { OffsetPaginationResult } from '@/modules/pagination/pagination.utils';
import { PrismaService } from '@/modules/prisma/prisma.service';

const toExpenseDate = (value: string | undefined): Date | undefined =>
  value === undefined ? undefined : new Date(value);

function buildExpenseListWhere(
  query: ListExpensesQuery
): Prisma.expenseWhereInput | undefined {
  const where: Prisma.expenseWhereInput = {};

  if (query.accountIds !== undefined && query.accountIds.length > 0) {
    where.account_id = { in: query.accountIds };
  }

  if (
    query.bookingDateFrom !== undefined ||
    query.bookingDateTo !== undefined
  ) {
    where.booking_date = {
      ...(query.bookingDateFrom !== undefined
        ? { gte: new Date(query.bookingDateFrom) }
        : {}),
      ...(query.bookingDateTo !== undefined
        ? { lte: new Date(query.bookingDateTo) }
        : {}),
    };
  }

  return Object.keys(where).length > 0 ? where : undefined;
}

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService
  ) {}

  async findAll(
    query: ListExpensesQuery
  ): Promise<OffsetPaginationResult<ExpenseListItem>> {
    const page = await this.paginationService.offsetPaginate<
      ExpenseListRow,
      'expense'
    >({
      model: this.prisma.expense as never,
      pagination: query,
      orderBy: 'createdAt',
      include: expenseListInclude,
      where: buildExpenseListWhere(query),
    });
    return {
      ...page,
      data: (page.data as Array<ExpenseListRow>).map(toExpenseListItem),
    };
  }

  async findOne(id: string): Promise<ExpenseDetail> {
    const row = await this.prisma.expense.findUnique({
      where: { id },
      include: expenseDetailInclude,
    });
    if (!row) {
      throw new NotFoundException(`Expense ${id} not found`);
    }
    return toExpenseDetail(row);
  }

  async create(dto: CreateExpense): Promise<Expense> {
    const row = await this.prisma.expense.create({
      data: {
        account_id: dto.accountId,
        iban: dto.iban,
        amount: dto.amount,
        currency: dto.currency,
        direction: dto.direction,
        booking_date: toExpenseDate(dto.bookingDate),
        transaction_date: toExpenseDate(dto.transactionDate),
        value_date: toExpenseDate(dto.valueDate),
        transaction_timestamp: toExpenseDate(dto.transactionTimestamp),
        type: dto.type,
        status: dto.status,
        purpose: dto.purpose,
        failure_reason: dto.failureReason,
        original_expense_id: dto.originalExpenseId,
        counterparty_account_id: dto.counterpartyAccountId,
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
    return toExpense(row);
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
        booking_date: toExpenseDate(dto.bookingDate),
        transaction_date: toExpenseDate(dto.transactionDate),
        value_date: toExpenseDate(dto.valueDate),
        transaction_timestamp: toExpenseDate(dto.transactionTimestamp),
        type: dto.type,
        status: dto.status,
        purpose: dto.purpose,
        failure_reason: dto.failureReason,
        original_expense_id: dto.originalExpenseId,
        counterparty_account_id: dto.counterpartyAccountId,
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
    return toExpense(row);
  }

  async remove(id: string): Promise<Expense> {
    const expense = await this.findOne(id);
    await this.prisma.expense.delete({ where: { id } });
    return expense;
  }
}
