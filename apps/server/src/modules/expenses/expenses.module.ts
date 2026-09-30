import { Module } from '@nestjs/common';

import { ExpensesController } from '@/modules/expenses/expenses.controller';
import { ExpensesService } from '@/modules/expenses/expenses.service';

@Module({
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
