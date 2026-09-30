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
import { expenseDetailSchema, expenseSchema } from '@repo/contracts';

import { Auth } from '@/modules/auth/auth.decorator';
import { ApiOffsetPagination } from '@/modules/common/decorators/api-offset-pagination.decorator';
import { ExpensesService } from '@/modules/expenses/expenses.service';
import {
  type CreateExpense,
  createExpenseSchema,
  expensesPageSchema,
  type UpdateExpense,
  updateExpenseSchema,
} from '@/modules/expenses/models/expense.dto';
import {
  type OffsetPagination,
  offsetPaginationSchema,
} from '@/modules/pagination/pagination.utils';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @Auth()
  @ApiOperation({ operationId: 'getExpenses', summary: 'List expenses' })
  @ApiOffsetPagination()
  @ApiOkResponse({ standardSchema: expensesPageSchema })
  @SerializeOptions({ schema: expensesPageSchema })
  async findAll(
    @Query({ schema: offsetPaginationSchema }) pagination: OffsetPagination
  ) {
    return this.expensesService.findAll(pagination);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ operationId: 'getExpense', summary: 'Get an expense' })
  @ApiOkResponse({ standardSchema: expenseDetailSchema })
  @SerializeOptions({ schema: expenseDetailSchema })
  async findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Post()
  @Auth()
  @ApiOperation({ operationId: 'createExpense', summary: 'Create an expense' })
  @ApiOkResponse({ standardSchema: expenseSchema })
  @SerializeOptions({ schema: expenseSchema })
  async create(@Body({ schema: createExpenseSchema }) body: CreateExpense) {
    return this.expensesService.create(body);
  }

  @Patch(':id')
  @Auth()
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
  @Auth()
  @ApiOperation({ operationId: 'deleteExpense', summary: 'Delete an expense' })
  @ApiOkResponse({ standardSchema: expenseSchema })
  @SerializeOptions({ schema: expenseSchema })
  async remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
