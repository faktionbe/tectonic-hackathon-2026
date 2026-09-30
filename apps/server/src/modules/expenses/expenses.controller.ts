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
import { expenseDetailSchema, expenseSchema } from '@repo/contracts';

import { M2M } from '@/modules/auth/m2m.decorator';
import { ApiOffsetPagination } from '@/modules/common/decorators/api-offset-pagination.decorator';
import { ExpensesService } from '@/modules/expenses/expenses.service';
import {
  type CreateExpense,
  createExpenseSchema,
  expensesPageSchema,
  type ListExpensesQuery,
  listExpensesQuerySchema,
  type UpdateExpense,
  updateExpenseSchema,
} from '@/modules/expenses/models/expense.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @M2M()
  @ApiOperation({ operationId: 'getExpenses', summary: 'List expenses' })
  @ApiOffsetPagination()
  @ApiQuery({
    name: 'accountIds',
    required: false,
    type: String,
    description: 'Comma-separated account ids to filter by',
  })
  @ApiQuery({
    name: 'bookingDateFrom',
    required: false,
    type: String,
    description: 'Inclusive booking date lower bound (ISO date)',
  })
  @ApiQuery({
    name: 'bookingDateTo',
    required: false,
    type: String,
    description: 'Inclusive booking date upper bound (ISO date)',
  })
  @ApiOkResponse({ standardSchema: expensesPageSchema })
  @SerializeOptions({ schema: expensesPageSchema })
  async findAll(
    @Query({ schema: listExpensesQuerySchema }) query: ListExpensesQuery
  ) {
    return this.expensesService.findAll(query);
  }

  @Get(':id')
  @M2M()
  @ApiOperation({ operationId: 'getExpense', summary: 'Get an expense' })
  @ApiOkResponse({ standardSchema: expenseDetailSchema })
  @SerializeOptions({ schema: expenseDetailSchema })
  async findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Post()
  @M2M()
  @ApiOperation({ operationId: 'createExpense', summary: 'Create an expense' })
  @ApiOkResponse({ standardSchema: expenseSchema })
  @SerializeOptions({ schema: expenseSchema })
  async create(@Body({ schema: createExpenseSchema }) body: CreateExpense) {
    return this.expensesService.create(body);
  }

  @Patch(':id')
  @M2M()
  @ApiOperation({ operationId: 'updateExpense', summary: 'Update an expense' })
  @ApiOkResponse({ standardSchema: expenseSchema })
  @SerializeOptions({ schema: expenseSchema })
  async update(
    @Param('id') id: string,
    @Body({ schema: updateExpenseSchema }) body: UpdateExpense
  ) {
    return this.expensesService.update(id, body);
  }

  @Delete(':id')
  @M2M()
  @ApiOperation({ operationId: 'deleteExpense', summary: 'Delete an expense' })
  @ApiOkResponse({ standardSchema: expenseSchema })
  @SerializeOptions({ schema: expenseSchema })
  async remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
