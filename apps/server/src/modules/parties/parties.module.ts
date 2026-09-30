import { Module } from '@nestjs/common';

import { PartiesController } from '@/modules/parties/parties.controller';
import { PartiesService } from '@/modules/parties/parties.service';

@Module({
  controllers: [PartiesController],
  providers: [PartiesService],
})
export class PartiesModule {}
