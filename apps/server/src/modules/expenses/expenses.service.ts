import { Injectable, NotFoundException } from '@nestjs/common';
import type { Expense, ExpenseDetail, ExpenseListItem } from '@repo/contracts';

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
  type UpdateExpense,
} from '@/modules/expenses/models/expense.dto';
import { PaginationService } from '@/modules/pagination/pagination.service';
import type {
  OffsetPagination,
  OffsetPaginationResult,
} from '@/modules/pagination/pagination.utils';
import { PrismaService } from '@/modules/prisma/prisma.service';

const toExpenseDate = (value: string | undefined): Date | undefined =>
  value === undefined ? undefined : new Date(value);

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService
  ) {}

  async findAll(
    pagination: OffsetPagination
  ): Promise<OffsetPaginationResult<ExpenseListItem>> {
    const page = await this.paginationService.offsetPaginate<
      ExpenseListRow,
      'expense'
    >({
      model: this.prisma.expense as never,
      pagination,
      orderBy: 'createdAt',
      include: expenseListInclude,
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
